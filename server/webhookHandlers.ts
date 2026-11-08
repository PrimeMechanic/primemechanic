import type Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { db } from "./db";
import { bookings, paymentEvents, mechanicProfiles } from "../shared/schema";
import { getUncachableStripeClient } from "./stripeClient";
import { cents, ensure, money } from "./policy";

export class WebhookHandlers {
  static async processWebhook(payload: Buffer, signature: string) {
    ensure(Buffer.isBuffer(payload), 400, "Raw webhook body required");
    ensure(process.env.STRIPE_WEBHOOK_SECRET, 503, "Webhook is not configured");
    const stripe = await getUncachableStripeClient();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      throw Object.assign(new Error("Invalid webhook signature"), {
        status: 400,
      });
    }
    if (
      ![
        "checkout.session.completed",
        "checkout.session.async_payment_succeeded",
        "charge.refunded",
        "charge.dispute.created",
        "charge.dispute.closed",
      ].includes(event.type)
    )
      return;
    // Retrieve current Stripe truth rather than letting event arrival order determine balances.
    let checkoutId: string | undefined;
    let intentId: string | undefined;
    if (event.type.startsWith("checkout.session.")) {
      const session = await stripe.checkout.sessions.retrieve(
        (event.data.object as Stripe.Checkout.Session).id,
      );
      if (session.mode !== "payment" || session.payment_status !== "paid")
        return;
      checkoutId = session.id;
      intentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id;
    } else {
      const object = event.data.object as Stripe.Charge | Stripe.Dispute;
      const chargeId =
        object.object === "charge"
          ? object.id
          : typeof object.charge === "string"
            ? object.charge
            : object.charge?.id;
      ensure(chargeId, 400, "Missing charge");
      const charge = await stripe.charges.retrieve(chargeId);
      intentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;
    }
    ensure(intentId, 400, "Missing payment intent");
    const intent = await stripe.paymentIntents.retrieve(intentId, {
      expand: ["latest_charge"],
    });
    const charge = intent.latest_charge as Stripe.Charge | null;
    ensure(
      intent.status === "succeeded" && charge && typeof charge !== "string",
      409,
      "Payment is not settled",
    );
    await db.transaction(async (tx) => {
      const condition = checkoutId
        ? eq(bookings.checkoutSessionId, checkoutId)
        : eq(bookings.stripePaymentIntentId, intent.id);
      const [booking] = await tx
        .select()
        .from(bookings)
        .where(condition)
        .for("update");
      // Unrelated Stripe charges are not application bookings.
      if (!booking) return;
      const duplicate = await tx
        .select()
        .from(paymentEvents)
        .where(eq(paymentEvents.id, event.id));
      if (duplicate.length) return;
      const [mechanic] = await tx
        .select()
        .from(mechanicProfiles)
        .where(eq(mechanicProfiles.id, booking.mechanicId))
        .for("update");
      ensure(
        intent.metadata.bookingId === String(booking.id) &&
          intent.metadata.customerId === booking.customerId &&
          intent.currency === "usd" &&
          intent.amount_received === cents(booking.totalPrice),
        409,
        "Payment does not match booking",
      );
      const destination =
        typeof intent.transfer_data?.destination === "string"
          ? intent.transfer_data.destination
          : intent.transfer_data?.destination.id;
      ensure(
        destination &&
          destination === mechanic.stripeConnectId &&
          intent.application_fee_amount ===
            Math.round(cents(booking.totalPrice) * 0.2),
        409,
        "Payment destination or fee mismatch",
      );
      const blocked = charge.amount_refunded > 0 || charge.disputed;
      const paid = !blocked;
      const eligible = paid && booking.status === "completed";
      const amount = money(
        cents(booking.totalPrice) - Math.round(cents(booking.totalPrice) * 0.2),
      );
      if (eligible && !booking.earningsCreditedAt)
        await tx
          .update(mechanicProfiles)
          .set({
            totalEarnings: sql`COALESCE(${mechanicProfiles.totalEarnings},0)+${amount}::numeric`,
            completedJobs: sql`COALESCE(${mechanicProfiles.completedJobs},0)+1`,
          })
          .where(eq(mechanicProfiles.id, booking.mechanicId));
      if (blocked && booking.earningsCreditedAt)
        await tx
          .update(mechanicProfiles)
          .set({
            totalEarnings: sql`COALESCE(${mechanicProfiles.totalEarnings},0)-${amount}::numeric`,
            completedJobs: sql`GREATEST(COALESCE(${mechanicProfiles.completedJobs},0)-1,0)`,
          })
          .where(eq(mechanicProfiles.id, booking.mechanicId));
      await tx
        .update(bookings)
        .set({
          stripePaymentIntentId: intent.id,
          stripeTransferId:
            typeof charge.transfer === "string"
              ? charge.transfer
              : charge.transfer?.id || null,
          paymentStatus: blocked
            ? charge.disputed
              ? "disputed"
              : "refunded"
            : "paid",
          earningsCreditedAt: eligible
            ? booking.earningsCreditedAt || new Date()
            : null,
          updatedAt: new Date(),
        })
        .where(eq(bookings.id, booking.id));
      await tx.insert(paymentEvents).values({ id: event.id });
    });
  }
}
