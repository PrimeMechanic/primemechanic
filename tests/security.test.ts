import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { db, useTestDatabase } from "../server/db";
import * as schema from "../shared/schema";
import { createApp } from "../server/app";
import { registerRoutes, apiErrors } from "../server/routes";
import { useTestStripe } from "../server/stripeClient";
import { tokenHash } from "../server/auth";
import { cents, publicUser, transition } from "../server/policy";
import { ObjectStorageService } from "../server/objectStorage";
import type { Server } from "node:http";

process.env.NODE_ENV = "test";
process.env.PUBLIC_APP_URL = "https://mechanic.example";
process.env.STRIPE_WEBHOOK_SECRET = "whsec_local_test_only";
const pg = new PGlite();
let server: Server;
let base: string;
let a: { id: string; token: string };
let b: { id: string; token: string };
let m: { id: string; token: string };
let mechanicId: number;
let vehicleId: number;
let bookingId: number;
let checkoutCount = 0;
let cardDetached = false;
const sdk = new Stripe("sk_test_local_mock_only");
let intent: Record<string, any> = {
  id: "pi_test",
  status: "succeeded",
  currency: "usd",
  amount_received: 7500,
  application_fee_amount: 1500,
  transfer_data: { destination: "acct_test" },
  metadata: {},
  latest_charge: {
    id: "ch_test",
    object: "charge",
    amount_refunded: 0,
    disputed: false,
    transfer: "tr_test",
  },
};
const mockStripe = {
  webhooks: sdk.webhooks,
  accounts: {
    create: async () => ({ id: "acct_new" }),
    retrieve: async () => ({ charges_enabled: true, payouts_enabled: true }),
  },
  accountLinks: {
    create: async () => ({ url: "https://connect.stripe.com/test" }),
  },
  checkout: {
    sessions: {
      create: async (params: any) => {
        checkoutCount++;
        assert.equal(params.line_items[0].price_data.unit_amount, 7500);
        return {
          id: "cs_test",
          url: "https://checkout.stripe.com/test",
          status: "open",
        };
      },
      retrieve: async () => ({
        id: "cs_test",
        url: "https://checkout.stripe.com/test",
        mode: "payment",
        payment_status: "paid",
        payment_intent: "pi_test",
        status: "open",
      }),
    },
  },
  paymentIntents: { retrieve: async () => intent },
  charges: {
    retrieve: async () => ({
      ...intent.latest_charge,
      payment_intent: "pi_test",
    }),
  },
  paymentMethods: {
    retrieve: async () => ({ customer: "cus_other" }),
    detach: async () => {
      cardDetached = true;
    },
  },
};
async function request(
  path: string,
  token?: string,
  body?: unknown,
  method?: string,
) {
  const response = await fetch(base + path, {
    method: method || (body ? "POST" : "GET"),
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();
  return { status: response.status, data };
}
async function account(email: string, role = "customer") {
  const r = await request("/api/auth/signup", undefined, {
    email,
    password: "safe-test-password-123",
    name: email,
    role,
  });
  assert.equal(r.status, 201, JSON.stringify(r.data));
  return { id: r.data.user.id, token: r.data.token };
}
before(async () => {
  await pg.exec(await readFile("migrations/0000_fresh_database.sql", "utf8"));
  await pg.exec(await readFile("migrations/0001_security.sql", "utf8"));
  useTestDatabase(drizzle(pg, { schema }) as unknown as typeof db);
  useTestStripe(mockStripe as unknown as Stripe);
  const app = createApp();
  server = await registerRoutes(app);
  app.use(apiErrors);
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  a = await account("a@example.com");
  b = await account("b@example.com");
  m = await account("m@example.com", "mechanic");
  const [profile] = await db
    .insert(schema.mechanicProfiles)
    .values({
      userId: m.id,
      hourlyRate: "75",
      isVerified: true,
      isAvailable: true,
      screeningStatus: "approved",
      offeredServices: ["Oil change"],
      stripeConnectId: "acct_test",
      stripeConnectOnboarded: true,
    })
    .returning();
  mechanicId = profile.id;
  await db.insert(schema.services).values({
    name: "Oil change",
    basePrice: "75",
    duration: 60,
    icon: "tool",
  });
  const v = await request("/api/vehicles", a.token, {
    make: "Honda",
    model: "Civic",
    year: 2024,
    userId: b.id,
  });
  assert.equal(v.status, 201);
  vehicleId = v.data.id;
  assert.equal(v.data.userId, a.id);
  ObjectStorageService.prototype.getObjectEntityUploadURL = async (userId) =>
    `https://storage.googleapis.com/a/private/uploads/${userId}/00000000-0000-0000-0000-000000000000`;
  ObjectStorageService.prototype.normalizeObjectEntityPath = (p) =>
    p.startsWith("/objects/")
      ? p
      : p.replace("https://storage.googleapis.com/a/private", "/objects");
  ObjectStorageService.prototype.getObjectEntityFile = async () =>
    ({
      getMetadata: async () => [{ contentType: "image/jpeg", size: 200 }],
    }) as any;
  ObjectStorageService.prototype.trySetObjectEntityAclPolicy = async (p) => p;
  ObjectStorageService.prototype.canAccessObjectEntity = async () => false;
});
after(async () => {
  if (server) {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
  await pg.close();
});
test("safe monetary conversion, state transitions, and user projection", () => {
  assert.equal(cents("75.01"), 7501);
  for (const bad of ["-1", "NaN", "1e3", "0.01"])
    assert.throws(() => cents(bad));
  assert.equal(transition("completed", "completed", "mechanic", false), false);
  assert.throws(() => transition("completed", "in_progress", "mechanic", true));
  assert.throws(() => transition("accepted", "completed", "customer", false));
  assert.equal(
    "passwordHash" in
      publicUser({
        id: "x",
        name: "x",
        email: "x",
        phone: null,
        role: "customer",
        avatarUrl: null,
        passwordHash: "hash",
      } as any),
    false,
  );
});
test("anonymous private routes and forged identity are rejected", async () => {
  for (const path of [
    `/api/users/${a.id}`,
    `/api/users/${a.id}/vehicles`,
    `/api/users/${a.id}/payment-methods`,
    "/api/bookings/1",
    "/api/conversations/1/messages",
    "/objects/uploads/private",
  ])
    assert.equal((await request(path)).status, 401);
  assert.equal(
    (await request(`/api/users/${a.id}`, "f".repeat(64))).status,
    401,
  );
});
test("session expires and logout revokes it in the database", async () => {
  const x = await account("expire@example.com");
  await db
    .update(schema.sessions)
    .set({ expiresAt: new Date(0) })
    .where(eq(schema.sessions.tokenHash, tokenHash(x.token)));
  assert.equal((await request("/api/auth/me", x.token)).status, 401);
  const y = await account("logout@example.com");
  assert.equal((await request("/api/auth/signout", y.token, {})).status, 200);
  assert.equal((await request("/api/auth/me", y.token)).status, 401);
});
test("user lookup omits password and denies a different account", async () => {
  const own = await request(`/api/users/${a.id}`, a.token);
  assert.equal(own.status, 200);
  assert.equal("passwordHash" in own.data, false);
  assert.equal((await request(`/api/users/${a.id}`, b.token)).status, 404);
});
test("signup rejects arbitrary role and weak password; signin checks password", async () => {
  assert.equal(
    (
      await request("/api/auth/signup", undefined, {
        email: "bad@example.com",
        name: "bad",
        role: "admin",
        password: "safe-password-test",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/auth/signup", undefined, {
        email: "bad@example.com",
        name: "bad",
        password: "short",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/auth/signin", undefined, {
        email: "a@example.com",
        password: "wrong",
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/api/auth/signin", undefined, {
        email: " A@EXAMPLE.COM ",
        password: "safe-test-password-123",
      })
    ).status,
    200,
  );
});
test("vehicle ownership is derived, not supplied", async () => {
  assert.equal(
    (await request(`/api/vehicles/${vehicleId}`, b.token, undefined, "DELETE"))
      .status,
    404,
  );
  const rows = await db.select().from(schema.vehicles);
  assert.equal(rows[0].userId, a.id);
});
test("booking rejects client price and reserves server-priced appointment", async () => {
  const body = {
    serviceId: 1,
    mechanicId,
    vehicleId,
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    location: "Test address",
  };
  assert.equal(
    (await request("/api/bookings", a.token, { ...body, totalPrice: "0.01" }))
      .status,
    400,
  );
  assert.equal((await request("/api/bookings", b.token, body)).status, 404);
  const result = await request("/api/bookings", a.token, body);
  assert.equal(result.status, 201, JSON.stringify(result.data));
  assert.equal(result.data.totalPrice, 75);
  bookingId = result.data.id;
  intent.metadata = { bookingId: String(bookingId), customerId: a.id };
  assert.equal((await request("/api/bookings", a.token, body)).status, 409);
});
test("booking read/write denies unrelated users and arbitrary transitions", async () => {
  assert.equal(
    (await request(`/api/bookings/${bookingId}`, b.token)).status,
    404,
  );
  assert.equal(
    (
      await request(
        `/api/bookings/${bookingId}/status`,
        a.token,
        { status: "completed" },
        "PATCH",
      )
    ).status,
    409,
  );
  assert.equal(
    (
      await request(
        `/api/bookings/${bookingId}/status`,
        m.token,
        { status: "anything" },
        "PATCH",
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await request(
        `/api/bookings/${bookingId}/status`,
        m.token,
        { status: "accepted" },
        "PATCH",
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await request(
        `/api/bookings/${bookingId}/status`,
        m.token,
        { status: "in_progress" },
        "PATCH",
      )
    ).status,
    409,
  );
});
test("photos reject local URIs and uploads belonging to another user", async () => {
  for (const path of [
    "file:///phone/image.jpg",
    `/objects/uploads/${b.id}/00000000-0000-0000-0000-000000000000`,
  ])
    assert.ok(
      [400, 403].includes(
        (
          await request(`/api/bookings/${bookingId}/photos`, m.token, {
            photoType: "before",
            photoUrl: path,
          })
        ).status,
      ),
    );
  const upload = await request("/api/objects/upload", m.token, {});
  assert.equal(upload.status, 200);
  assert.ok(upload.data.uploadURL);
  assert.ok(upload.data.objectPath.includes(m.id));
  assert.equal(
    (
      await request(`/api/bookings/${bookingId}/photos`, m.token, {
        photoType: "before",
        photoUrl: upload.data.objectPath,
      })
    ).status,
    201,
  );
});
test("completion replay cannot credit unpaid earnings", async () => {
  assert.equal(
    (
      await request(
        `/api/bookings/${bookingId}/status`,
        m.token,
        { status: "in_progress" },
        "PATCH",
      )
    ).status,
    200,
  );
  const upload = await request("/api/objects/upload", m.token, {});
  assert.equal(
    (
      await request(`/api/bookings/${bookingId}/photos`, m.token, {
        photoType: "after",
        photoUrl: upload.data.objectPath,
      })
    ).status,
    201,
  );
  for (let i = 0; i < 2; i++)
    assert.equal(
      (
        await request(
          `/api/bookings/${bookingId}/status`,
          m.token,
          { status: "completed" },
          "PATCH",
        )
      ).status,
      200,
    );
  const [p] = await db
    .select()
    .from(schema.mechanicProfiles)
    .where(eq(schema.mechanicProfiles.id, mechanicId));
  assert.equal(Number(p.totalEarnings), 0);
  assert.equal(p.completedJobs, 0);
});
test("retired arbitrary-payment API and foreign Stripe cards cannot be used", async () => {
  assert.equal(
    (
      await request("/api/payments/create-payment-intent", a.token, {
        amount: 0.01,
        bookingId,
      })
    ).status,
    410,
  );
  await db
    .update(schema.users)
    .set({ stripeCustomerId: "cus_a" })
    .where(eq(schema.users.id, a.id));
  assert.equal(
    (
      await request(
        "/api/payment-methods/pm_other",
        a.token,
        undefined,
        "DELETE",
      )
    ).status,
    404,
  );
  assert.equal(cardDetached, false);
});
test("Checkout uses server amount, approved destination, and one stored session", async () => {
  assert.equal(
    (await request(`/api/bookings/${bookingId}/checkout`, b.token, {})).status,
    404,
  );
  for (let i = 0; i < 2; i++)
    assert.equal(
      (await request(`/api/bookings/${bookingId}/checkout`, a.token, {}))
        .status,
      200,
    );
  assert.equal(checkoutCount, 1);
});
async function webhook(eventId: string, type = "checkout.session.completed") {
  const payload = JSON.stringify({
    id: eventId,
    type,
    data: {
      object: {
        id: type.startsWith("checkout.") ? "cs_test" : "ch_test",
        object: type.startsWith("checkout.") ? "checkout.session" : "charge",
      },
    },
  });
  const signature = sdk.webhooks.generateTestHeaderString({
    payload,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });
  return fetch(base + "/api/stripe/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": signature,
    },
    body: payload,
  });
}
test("webhook requires valid signature and reconciles one credit despite duplicate events", async () => {
  const invalid = await fetch(base + "/api/stripe/webhook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "stripe-signature": "invalid",
    },
    body: "{}",
  });
  assert.equal(invalid.status, 400);
  for (const event of ["evt_1", "evt_1", "evt_2"])
    assert.equal((await webhook(event)).status, 200);
  const [p] = await db
    .select()
    .from(schema.mechanicProfiles)
    .where(eq(schema.mechanicProfiles.id, mechanicId));
  assert.equal(Number(p.totalEarnings), 60);
  assert.equal(p.completedJobs, 1);
  const [row] = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId));
  assert.equal(row.paymentStatus, "paid");
  assert.equal(row.stripePaymentIntentId, "pi_test");
});
test("refund reconciliation reverses earnings once, including late success events", async () => {
  intent.latest_charge.amount_refunded = 7500;
  assert.equal((await webhook("evt_refund", "charge.refunded")).status, 200);
  assert.equal((await webhook("evt_late")).status, 200);
  const [p] = await db
    .select()
    .from(schema.mechanicProfiles)
    .where(eq(schema.mechanicProfiles.id, mechanicId));
  assert.equal(Number(p.totalEarnings), 0);
  assert.equal(p.completedJobs, 0);
});
test("vehicle with booking history cannot destroy financial records", async () => {
  assert.equal(
    (await request(`/api/vehicles/${vehicleId}`, a.token, undefined, "DELETE"))
      .status,
    409,
  );
  assert.equal((await db.select().from(schema.bookings)).length, 1);
});
test("address defaults enforce ownership and preserve existing default on invalid request", async () => {
  const addr = {
    label: "Home",
    street: "Test",
    city: "City",
    state: "GA",
    zipCode: "12345",
    isDefault: true,
  };
  const x = await request("/api/addresses", a.token, addr);
  const y = await request("/api/addresses", b.token, addr);
  assert.equal(
    (
      await request(`/api/addresses/${y.data.id}/default`, a.token, {
        userId: b.id,
      })
    ).status,
    404,
  );
  const [own] = await db
    .select()
    .from(schema.addresses)
    .where(eq(schema.addresses.id, x.data.id));
  assert.equal(own.isDefault, true);
  assert.equal(
    (await request(`/api/addresses/${x.data.id}`, b.token, undefined, "DELETE"))
      .status,
    404,
  );
});
test("conversations bind participants and reject sender impersonation", async () => {
  const c = await request("/api/conversations", a.token, { mechanicId });
  assert.equal(c.status, 200);
  assert.equal(
    (await request(`/api/conversations/${c.data.id}/messages`, b.token)).status,
    404,
  );
  assert.equal(
    (
      await request("/api/messages", b.token, {
        conversationId: c.data.id,
        content: "attack",
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await request("/api/messages", a.token, {
        conversationId: c.data.id,
        content: "hi",
        senderId: m.id,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/messages", a.token, {
        conversationId: c.data.id,
        content: "hi",
      })
    ).status,
    201,
  );
  const messages = await request(
    `/api/conversations/${c.data.id}/messages`,
    m.token,
  );
  assert.equal(messages.data[0].senderId, a.id);
});
test("private object access denies unrelated users even with a known path", async () => {
  assert.equal(
    (
      await request(
        `/objects/uploads/${m.id}/00000000-0000-0000-0000-000000000000`,
        b.token,
      )
    ).status,
    404,
  );
});
test("onboarding requires server-side consent, service selection, and all documents", async () => {
  assert.equal(
    (await request("/api/mechanics/onboard", a.token, {})).status,
    403,
  );
  assert.equal(
    (await request("/api/mechanics/onboard", m.token, { hourlyRate: 75 }))
      .status,
    400,
  );
});
test("CORS does not authorize arbitrary origins", async () => {
  const response = await fetch(base + "/api/services", {
    headers: { Origin: "https://mechanic.example.evil.test" },
  });
  assert.equal(response.headers.get("access-control-allow-origin"), null);
});

test("onboarding submission is atomic, resumable, and not automatic approval", async () => {
  const n = await account("new-mechanic@example.com", "mechanic");
  const path = `/objects/uploads/${n.id}/00000000-0000-0000-0000-000000000000`;
  const body = {
    specialty: "General Repair",
    bio: "Experienced mechanic",
    hourlyRate: "75",
    serviceRadius: 10,
    selectedServices: ["Oil change"],
    backgroundCheckConsent: true,
    agreementAccepted: true,
    documents: { insurance: path, license: path, w9: path },
  };
  for (let i = 0; i < 2; i++)
    assert.equal(
      (await request("/api/mechanics/onboard", n.token, body)).status,
      201,
    );
  const profiles = await db
    .select()
    .from(schema.mechanicProfiles)
    .where(eq(schema.mechanicProfiles.userId, n.id));
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].isVerified, false);
  assert.equal(profiles[0].isAvailable, false);
  assert.ok(profiles[0].onboardingSubmittedAt);
  assert.equal(
    (
      await db
        .select()
        .from(schema.mechanicDocuments)
        .where(eq(schema.mechanicDocuments.mechanicId, profiles[0].id))
    ).length,
    3,
  );
  assert.equal(
    (await request(`/api/mechanics/${profiles[0].id}/documents`, b.token))
      .status,
    403,
  );
  assert.equal(
    (
      await request(
        "/api/mechanic/availability",
        n.token,
        { isAvailable: true },
        "PATCH",
      )
    ).status,
    403,
  );
});
test("payout onboarding is restricted to mechanic identity", async () => {
  assert.equal(
    (await request("/api/mechanic/connect", a.token, {})).status,
    403,
  );
  const result = await request("/api/mechanic/connect", m.token, {});
  assert.equal(result.status, 200);
  assert.ok(result.data.url.startsWith("https://connect.stripe.com/"));
  assert.equal(
    (await request("/api/mechanic/connect/refresh", m.token, {})).data.ready,
    true,
  );
});
test("payment amount mismatch cannot rewrite the booking or ledger", async () => {
  intent.amount_received = 1;
  assert.equal((await webhook("evt_wrong_amount")).status, 503);
  intent.amount_received = 7500;
  const [row] = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId));
  assert.equal(row.paymentStatus, "refunded");
  assert.equal(
    (
      await db
        .select()
        .from(schema.paymentEvents)
        .where(eq(schema.paymentEvents.id, "evt_wrong_amount"))
    ).length,
    0,
  );
});
test("lost Checkout responses beyond the idempotency window fail closed", async () => {
  await db
    .update(schema.bookings)
    .set({
      paymentStatus: "pending",
      checkoutSessionId: null,
      checkoutStartedAt: new Date(Date.now() - 25 * 3600000),
    })
    .where(eq(schema.bookings.id, bookingId));
  assert.equal(
    (await request(`/api/bookings/${bookingId}/checkout`, a.token, {})).status,
    409,
  );
  assert.equal(checkoutCount, 1);
});
