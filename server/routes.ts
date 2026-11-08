import type { Express, Request, Response } from "express";
import { createServer } from "node:http";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { and, eq, or, sql, desc } from "drizzle-orm";
import { db } from "./db";
import * as t from "../shared/schema";
import { storage } from "./storage";
import {
  authenticate,
  bearer,
  issueSession,
  limitAuth,
  tokenHash,
} from "./auth";
import {
  cents,
  money,
  ensure,
  id,
  signup,
  email,
  publicUser,
  publicOrigin,
  transition,
  HttpError,
} from "./policy";
import { getUncachableStripeClient } from "./stripeClient";
import { ObjectStorageService } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";

type User = ReturnType<typeof publicUser>;
const text = z.string().trim().min(1).max(4000);
const objects = new ObjectStorageService();
const who = (res: Response): User => res.locals.user;
const route =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  async (req: Request, res: Response) => {
    await fn(req, res);
  };

export async function ownedBooking(
  user: User,
  bookingId: number,
  mechanicOnly = false,
) {
  const booking = await storage.getBooking(bookingId);
  ensure(booking, 404, "Booking not found");
  const mechanic = await storage.getMechanic(booking.mechanicId);
  ensure(
    mechanic &&
      (mechanic.userId === user.id ||
        (!mechanicOnly && booking.customerId === user.id)),
    404,
    "Booking not found",
  );
  return {
    booking,
    mechanic,
    actor:
      mechanic.userId === user.id
        ? ("mechanic" as const)
        : ("customer" as const),
  };
}
async function ownMechanic(user: User, mechanicId?: number) {
  const profile = await storage.getMechanicProfileByUserId(user.id);
  ensure(
    user.role === "mechanic" &&
      profile &&
      (!mechanicId || profile.id === mechanicId),
    403,
    "Mechanic account required",
  );
  return profile;
}
async function conversation(user: User, conversationId: number) {
  const [row] = await db
    .select()
    .from(t.conversations)
    .where(eq(t.conversations.id, conversationId));
  ensure(row, 404, "Conversation not found");
  const mechanic = await storage.getMechanic(row.mechanicId);
  ensure(
    row.customerId === user.id || mechanic?.userId === user.id,
    404,
    "Conversation not found",
  );
  return row;
}
export async function checkedObject(path: string, userId: string) {
  ensure(
    /^\/objects\/uploads\/[a-zA-Z0-9-]+\/[a-f0-9-]+$/.test(path),
    400,
    "A completed uploaded object is required",
  );
  const file = await objects.getObjectEntityFile(path);
  ensure(
    path.startsWith(`/objects/uploads/${userId}/`),
    403,
    "Upload does not belong to you",
  );
  const [meta] = await file.getMetadata();
  ensure(
    ["image/jpeg", "image/png", "image/webp", "application/pdf"].includes(
      meta.contentType || "",
    ) &&
      Number(meta.size) > 0 &&
      Number(meta.size) <= 10485760,
    400,
    "Use an image or PDF under 10 MB",
  );
  await objects.trySetObjectEntityAclPolicy(path, {
    owner: userId,
    visibility: "private",
  });
  return path;
}
async function details(booking: t.Booking) {
  const [service] = await db
    .select()
    .from(t.services)
    .where(eq(t.services.id, booking.serviceId));
  const [vehicle] = await db
    .select()
    .from(t.vehicles)
    .where(eq(t.vehicles.id, booking.vehicleId));
  const mechanic = await storage.getMechanic(booking.mechanicId);
  const customer = await storage.getUser(booking.customerId);
  return {
    ...booking,
    totalPrice: Number(booking.totalPrice),
    service,
    vehicle,
    mechanic: mechanic
      ? {
          id: mechanic.id,
          name: mechanic.user.name,
          rating: Number(mechanic.rating || 0),
          reviewCount: mechanic.reviewCount,
        }
      : null,
    customer: { name: customer?.name || "Customer" },
  };
}
export async function registerRoutes(app: Express) {
  app.post(
    "/api/auth/signup",
    limitAuth,
    route(async (req, res) => {
      const input = signup.parse(req.body);
      ensure(
        !(await storage.getUserByEmail(input.email)),
        409,
        "Unable to register this email",
      );
      const user = await storage.createUser({
        ...input,
        passwordHash: await bcrypt.hash(input.password, 12),
        avatarUrl: null,
      });
      res
        .status(201)
        .json({ user: publicUser(user), token: await issueSession(user.id) });
    }),
  );
  app.post(
    "/api/auth/signin",
    limitAuth,
    route(async (req, res) => {
      const input = z
        .object({ email, password: z.string().min(1).max(72) })
        .strict()
        .parse(req.body);
      const user = await storage.getUserByEmail(input.email);
      const valid = await bcrypt.compare(
        input.password,
        user?.passwordHash ||
          "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW",
      );
      ensure(
        user && valid && user.passwordHash,
        401,
        "Invalid email or password",
      );
      res.json({ user: publicUser(user), token: await issueSession(user.id) });
    }),
  );
  app.get("/api/payment-setup/:result", (_req, res) =>
    res
      .type("html")
      .send(
        "<p>Return to PrimeMechanic and refresh. Payment status is confirmed securely by the server.</p>",
      ),
  );
  app.get(
    "/api/services",
    route(async (_req, res) => {
      res.json(await storage.getServices());
    }),
  );
  const publicMechanic = (
    m: Awaited<ReturnType<typeof storage.getMechanics>>[number],
  ) => ({
    id: m.id,
    name: m.user.name,
    specialty: m.specialty,
    bio: m.bio,
    hourlyRate: Number(m.hourlyRate),
    rating: Number(m.rating || 0),
    reviewCount: m.reviewCount,
    completedJobs: m.completedJobs,
    isVerified: m.isVerified,
    isAvailable: m.isAvailable,
    services: m.offeredServices || [],
  });
  app.get(
    "/api/mechanics",
    route(async (_req, res) => {
      res.json(
        (await storage.getMechanics())
          .filter(
            (m) =>
              m.isVerified && m.screeningStatus === "approved" && m.isAvailable,
          )
          .map(publicMechanic),
      );
    }),
  );
  app.get(
    "/api/mechanics/:id",
    route(async (req, res) => {
      const m = await storage.getMechanic(id.parse(req.params.id));
      ensure(
        m?.isVerified && m.screeningStatus === "approved",
        404,
        "Mechanic not found",
      );
      res.json(publicMechanic(m));
    }),
  );
  app.get(
    "/api/shops",
    route(async (_req, res) => {
      res.json(
        (await storage.getShops()).map(
          ({
            stripeConnectId: _id,
            stripeConnectOnboarded: _onboarded,
            ...shop
          }) => shop,
        ),
      );
    }),
  );
  app.get(
    "/api/shops/:id",
    route(async (req, res) => {
      const shop = await storage.getShop(id.parse(req.params.id));
      ensure(shop, 404, "Shop not found");
      const {
        stripeConnectId: _id,
        stripeConnectOnboarded: _onboarded,
        ...safe
      } = shop;
      res.json(safe);
    }),
  );
  // Deny anonymous access to every private API, including future routes.
  app.use("/api", authenticate);
  app.get("/api/auth/me", (_req, res) => {
    res.json({ user: who(res) });
  });
  app.post(
    "/api/auth/signout",
    route(async (req, res) => {
      await db
        .delete(t.sessions)
        .where(eq(t.sessions.tokenHash, tokenHash(bearer(req)!)));
      res.json({ success: true });
    }),
  );
  app.use("/api/users/:userId", (req, res, next) => {
    ensure(req.params.userId === who(res).id, 404, "Account not found");
    next();
  });
  app.get("/api/users/:userId", (_req, res) => {
    res.json(who(res));
  });
  app.get(
    "/api/users/:userId/mechanic-profile",
    route(async (_req, res) => {
      const profile = await storage.getMechanicProfileByUserId(who(res).id);
      ensure(profile, 404, "Profile not found");
      res.json(profile);
    }),
  );
  app.get(
    "/api/users/:userId/vehicles",
    route(async (_req, res) => {
      res.json(await storage.getVehicles(who(res).id));
    }),
  );
  app.post(
    "/api/vehicles",
    route(async (req, res) => {
      const input = z
        .object({
          make: text.max(100),
          model: text.max(100),
          year: z
            .number()
            .int()
            .min(1900)
            .max(new Date().getFullYear() + 2),
          trim: z.string().max(100).nullable().optional(),
          licensePlate: z.string().max(20).nullable().optional(),
          vin: z.string().max(17).nullable().optional(),
          userId: z.string().optional(),
        })
        .strict()
        .parse(req.body);
      res
        .status(201)
        .json(await storage.createVehicle({ ...input, userId: who(res).id }));
    }),
  );
  app.delete(
    "/api/vehicles/:id",
    route(async (req, res) => {
      await db.transaction(async (tx) => {
        const vehicleId = id.parse(req.params.id);
        const [vehicle] = await tx
          .select()
          .from(t.vehicles)
          .where(
            and(
              eq(t.vehicles.id, vehicleId),
              eq(t.vehicles.userId, who(res).id),
            ),
          )
          .for("update");
        ensure(vehicle, 404, "Vehicle not found");
        const [booking] = await tx
          .select({ id: t.bookings.id })
          .from(t.bookings)
          .where(eq(t.bookings.vehicleId, vehicleId))
          .limit(1);
        ensure(
          !booking,
          409,
          "Vehicle has booking history and cannot be deleted",
        );
        await tx.delete(t.vehicles).where(eq(t.vehicles.id, vehicleId));
      });
      res.json({ success: true });
    }),
  );
  app.get(
    "/api/users/:userId/bookings",
    route(async (_req, res) => {
      res.json(
        await Promise.all(
          (await storage.getBookings(who(res).id)).map(details),
        ),
      );
    }),
  );
  app.get(
    "/api/mechanic/jobs",
    route(async (_req, res) => {
      const profile = await ownMechanic(who(res));
      const rows = await db
        .select()
        .from(t.bookings)
        .where(eq(t.bookings.mechanicId, profile.id))
        .orderBy(desc(t.bookings.scheduledDate));
      res.json(await Promise.all(rows.map(details)));
    }),
  );
  app.get(
    "/api/bookings/:id",
    route(async (req, res) => {
      const { booking } = await ownedBooking(who(res), id.parse(req.params.id));
      res.json(await details(booking));
    }),
  );
  app.post(
    "/api/bookings",
    route(async (req, res) => {
      const input = z
        .object({
          serviceId: id,
          mechanicId: id,
          vehicleId: id,
          scheduledDate: z.string().datetime({ offset: true }),
          location: text,
          notes: z.string().max(4000).optional(),
        })
        .strict()
        .parse(req.body);
      const scheduledDate = new Date(input.scheduledDate);
      ensure(
        scheduledDate > new Date() &&
          scheduledDate.getTime() < Date.now() + 180 * 86400000,
        400,
        "Choose a future appointment within 180 days",
      );
      const result = await db.transaction(async (tx) => {
        const [mechanic] = await tx
          .select()
          .from(t.mechanicProfiles)
          .where(eq(t.mechanicProfiles.id, input.mechanicId))
          .for("update");
        ensure(
          mechanic?.isVerified &&
            mechanic.screeningStatus === "approved" &&
            mechanic.isAvailable &&
            mechanic.userId !== who(res).id,
          409,
          "Mechanic is not eligible",
        );
        const [service] = await tx
          .select()
          .from(t.services)
          .where(
            and(
              eq(t.services.id, input.serviceId),
              eq(t.services.isActive, true),
            ),
          );
        ensure(
          service && mechanic.offeredServices?.includes(service.name),
          409,
          "Service is not offered by this mechanic",
        );
        const [vehicle] = await tx
          .select()
          .from(t.vehicles)
          .where(
            and(
              eq(t.vehicles.id, input.vehicleId),
              eq(t.vehicles.userId, who(res).id),
            ),
          )
          .for("update");
        ensure(vehicle, 404, "Vehicle not found");
        const reservations = await tx
          .select({
            start: t.bookings.scheduledDate,
            duration: t.services.duration,
          })
          .from(t.bookings)
          .innerJoin(t.services, eq(t.bookings.serviceId, t.services.id))
          .where(
            and(
              eq(t.bookings.mechanicId, mechanic.id),
              sql`${t.bookings.status} IN ('pending','accepted','upcoming','in_progress')`,
            ),
          );
        ensure(
          !reservations.some(
            (r) =>
              r.start.getTime() <
                scheduledDate.getTime() + service.duration * 60000 &&
              r.start.getTime() + r.duration * 60000 > scheduledDate.getTime(),
          ),
          409,
          "That appointment overlaps another booking",
        );
        const amount = cents(service.basePrice);
        const fee = Math.round(amount * 0.2);
        const [row] = await tx
          .insert(t.bookings)
          .values({
            ...input,
            scheduledDate,
            customerId: who(res).id,
            totalPrice: money(amount),
            platformFee: money(fee),
            mechanicPayout: money(amount - fee),
            status: "pending",
            paymentStatus: "pending",
          })
          .returning();
        return row;
      });
      res.status(201).json(await details(result));
    }),
  );
  app.patch(
    "/api/bookings/:id/status",
    route(async (req, res) => {
      const bookingId = id.parse(req.params.id);
      const { actor } = await ownedBooking(who(res), bookingId);
      const status = z
        .enum(["accepted", "declined", "in_progress", "completed", "cancelled"])
        .parse(req.body.status);
      const result = await db.transaction(async (tx) => {
        const [booking] = await tx
          .select()
          .from(t.bookings)
          .where(eq(t.bookings.id, bookingId))
          .for("update");
        if (
          !transition(
            booking.status,
            status,
            actor,
            booking.paymentStatus === "paid",
          )
        )
          return booking;
        ensure(
          !(
            ["cancelled", "declined"].includes(status) &&
            booking.checkoutSessionId
          ),
          409,
          "Payment started; contact support to cancel",
        );
        if (actor === "mechanic") {
          const [profile] = await tx
            .select()
            .from(t.mechanicProfiles)
            .where(
              and(
                eq(t.mechanicProfiles.id, booking.mechanicId),
                eq(t.mechanicProfiles.userId, who(res).id),
              ),
            );
          ensure(
            profile?.isVerified && profile.screeningStatus === "approved",
            403,
            "Approval required",
          );
        }
        if (status === "in_progress" || status === "completed") {
          const type = status === "in_progress" ? "before" : "after";
          const [photo] = await tx
            .select()
            .from(t.jobPhotos)
            .where(
              and(
                eq(t.jobPhotos.bookingId, bookingId),
                eq(t.jobPhotos.mechanicId, booking.mechanicId),
                eq(t.jobPhotos.photoType, type),
              ),
            )
            .limit(1);
          ensure(photo, 409, `Upload a ${type} photo first`);
        }
        const [row] = await tx
          .update(t.bookings)
          .set({
            status,
            updatedAt: new Date(),
            ...(status === "completed" ? { completedAt: new Date() } : {}),
          })
          .where(eq(t.bookings.id, bookingId))
          .returning();
        return row;
      });
      res.json(await details(result));
    }),
  );
  app.get(
    "/api/mechanics/dashboard/:userId",
    route(async (req, res) => {
      ensure(req.params.userId === who(res).id, 404, "Account not found");
      await ownMechanic(who(res));
      res.json(await storage.getMechanicDashboardStats(who(res).id));
    }),
  );
  const addressInput = z
    .object({
      label: text.max(50),
      street: text.max(255),
      apt: z.string().max(50).nullable().optional(),
      city: text.max(100),
      state: text.max(50),
      zipCode: text.max(20),
      isDefault: z.boolean().optional(),
      userId: z.string().optional(),
    })
    .strict();
  app.get(
    "/api/users/:userId/addresses",
    route(async (_req, res) => {
      res.json(await storage.getAddresses(who(res).id));
    }),
  );
  async function saveAddress(req: Request, res: Response, updating: boolean) {
    const { userId: _ignore, ...input } = addressInput.parse(req.body);
    const userId = who(res).id;
    const result = await db.transaction(async (tx) => {
      await tx
        .select()
        .from(t.users)
        .where(eq(t.users.id, userId))
        .for("update");
      if (input.isDefault)
        await tx
          .update(t.addresses)
          .set({ isDefault: false })
          .where(eq(t.addresses.userId, userId));
      const [row] = updating
        ? await tx
            .update(t.addresses)
            .set(input)
            .where(
              and(
                eq(t.addresses.id, id.parse(req.params.id)),
                eq(t.addresses.userId, userId),
              ),
            )
            .returning()
        : await tx
            .insert(t.addresses)
            .values({ ...input, userId })
            .returning();
      ensure(row, 404, "Address not found");
      return row;
    });
    res.json(result);
  }
  app.post(
    "/api/addresses",
    route((req, res) => saveAddress(req, res, false)),
  );
  app.patch(
    "/api/addresses/:id",
    route((req, res) => saveAddress(req, res, true)),
  );
  app.delete(
    "/api/addresses/:id",
    route(async (req, res) => {
      const rows = await db
        .delete(t.addresses)
        .where(
          and(
            eq(t.addresses.id, id.parse(req.params.id)),
            eq(t.addresses.userId, who(res).id),
          ),
        )
        .returning();
      ensure(rows.length, 404, "Address not found");
      res.json({ success: true });
    }),
  );
  app.post(
    "/api/addresses/:id/default",
    route(async (req, res) => {
      await db.transaction(async (tx) => {
        const userId = who(res).id;
        await tx
          .select()
          .from(t.users)
          .where(eq(t.users.id, userId))
          .for("update");
        const [row] = await tx
          .select()
          .from(t.addresses)
          .where(
            and(
              eq(t.addresses.id, id.parse(req.params.id)),
              eq(t.addresses.userId, userId),
            ),
          );
        ensure(row, 404, "Address not found");
        await tx
          .update(t.addresses)
          .set({ isDefault: false })
          .where(eq(t.addresses.userId, userId));
        await tx
          .update(t.addresses)
          .set({ isDefault: true })
          .where(eq(t.addresses.id, row.id));
      });
      res.json({ success: true });
    }),
  );
  app.post(
    "/api/mechanics/onboard",
    route(async (req, res) => {
      ensure(who(res).role === "mechanic", 403, "Mechanic account required");
      const input = z
        .object({
          specialty: text.max(255),
          bio: text,
          hourlyRate: z.coerce.number().positive().max(10000),
          serviceRadius: z.coerce.number().int().min(1).max(200),
          selectedServices: z.array(text.max(100)).min(1).max(30),
          backgroundCheckConsent: z.literal(true),
          agreementAccepted: z.literal(true),
          documents: z
            .object({ insurance: text, license: text, w9: text })
            .strict(),
        })
        .strict()
        .parse(req.body);
      for (const path of Object.values(input.documents))
        await checkedObject(path, who(res).id);
      const result = await db.transaction(async (tx) => {
        await tx
          .select()
          .from(t.users)
          .where(eq(t.users.id, who(res).id))
          .for("update");
        const [existing] = await tx
          .select()
          .from(t.mechanicProfiles)
          .where(eq(t.mechanicProfiles.userId, who(res).id));
        ensure(
          !existing?.isVerified,
          409,
          "Contact support to update an approved profile",
        );
        const fields = {
          specialty: input.specialty,
          bio: input.bio,
          hourlyRate: input.hourlyRate.toFixed(2),
          serviceRadius: input.serviceRadius,
          offeredServices: input.selectedServices,
          consentVersion: "contractor-and-background-v1",
          onboardingSubmittedAt: new Date(),
          isAvailable: false,
          screeningStatus: "pending",
          isVerified: false,
        };
        const [profile] = existing
          ? await tx
              .update(t.mechanicProfiles)
              .set(fields)
              .where(eq(t.mechanicProfiles.id, existing.id))
              .returning()
          : await tx
              .insert(t.mechanicProfiles)
              .values({ ...fields, userId: who(res).id })
              .returning();
        await tx
          .delete(t.mechanicDocuments)
          .where(eq(t.mechanicDocuments.mechanicId, profile.id));
        await tx.insert(t.mechanicDocuments).values(
          Object.entries(input.documents).map(([documentType, fileUrl]) => ({
            mechanicId: profile.id,
            documentType,
            fileUrl,
            status: "pending",
          })),
        );
        return profile;
      });
      res.status(201).json(result);
    }),
  );
  app.get(
    "/api/mechanics/:id/documents",
    route(async (req, res) => {
      const profile = await ownMechanic(who(res), id.parse(req.params.id));
      res.json(await storage.getMechanicDocuments(profile.id));
    }),
  );
  for (const resource of ["photos", "notes"] as const)
    app.get(
      `/api/bookings/:id/${resource}`,
      route(async (req, res) => {
        const { booking } = await ownedBooking(
          who(res),
          id.parse(req.params.id),
        );
        res.json(
          resource === "photos"
            ? await storage.getJobPhotos(booking.id)
            : await storage.getJobNotes(booking.id),
        );
      }),
    );
  app.post(
    "/api/bookings/:id/photos",
    route(async (req, res) => {
      const { booking } = await ownedBooking(
        who(res),
        id.parse(req.params.id),
        true,
      );
      const input = z
        .object({
          photoUrl: text,
          photoType: z.enum(["before", "after"]),
          caption: z.string().max(1000).nullable().optional(),
          mechanicId: id.optional(),
        })
        .strict()
        .parse(req.body);
      ensure(
        input.photoType === "before"
          ? ["pending", "accepted", "upcoming"].includes(booking.status)
          : booking.status === "in_progress",
        409,
        "Photo not allowed at this stage",
      );
      await checkedObject(input.photoUrl, who(res).id);
      res.status(201).json(
        await storage.createJobPhoto({
          bookingId: booking.id,
          mechanicId: booking.mechanicId,
          photoUrl: input.photoUrl,
          photoType: input.photoType,
          caption: input.caption || null,
        }),
      );
    }),
  );
  app.post(
    "/api/bookings/:id/notes",
    route(async (req, res) => {
      const { booking } = await ownedBooking(
        who(res),
        id.parse(req.params.id),
        true,
      );
      const input = z
        .object({ content: text, mechanicId: id.optional() })
        .strict()
        .parse(req.body);
      res.status(201).json(
        await storage.createJobNote({
          bookingId: booking.id,
          mechanicId: booking.mechanicId,
          content: input.content,
        }),
      );
    }),
  );
  app.post(
    "/api/objects/upload",
    route(async (_req, res) => {
      const uploadURL = await objects.getObjectEntityUploadURL(who(res).id);
      res.json({
        uploadURL,
        objectPath: objects.normalizeObjectEntityPath(uploadURL),
      });
    }),
  );
  app.get(
    "/api/mechanics/:id/portfolio",
    route(async (req, res) => {
      res.json(await storage.getPortfolioItems(id.parse(req.params.id)));
    }),
  );
  app.post(
    "/api/portfolio",
    route(async (req, res) => {
      const profile = await ownMechanic(
        who(res),
        id.parse(req.body.mechanicId),
      );
      const path = objects.normalizeObjectEntityPath(
        text.parse(req.body.uploadURL),
      );
      await checkedObject(path, who(res).id);
      res.status(201).json(
        await storage.createPortfolioItem({
          mechanicId: profile.id,
          imageUrl: path,
          caption:
            z
              .string()
              .max(1000)
              .nullable()
              .optional()
              .parse(req.body.caption) || null,
          serviceType:
            z
              .string()
              .max(100)
              .nullable()
              .optional()
              .parse(req.body.serviceType) || null,
        }),
      );
    }),
  );
  app.delete(
    "/api/portfolio/:id",
    route(async (req, res) => {
      const profile = await ownMechanic(who(res));
      const rows = await db
        .delete(t.portfolioItems)
        .where(
          and(
            eq(t.portfolioItems.id, id.parse(req.params.id)),
            eq(t.portfolioItems.mechanicId, profile.id),
          ),
        )
        .returning();
      ensure(rows.length, 404, "Item not found");
      res.json({ success: true });
    }),
  );
  app.get(
    "/api/users/:userId/conversations",
    route(async (_req, res) => {
      const user = who(res);
      const profile = await storage.getMechanicProfileByUserId(user.id);
      const rows = await db
        .select()
        .from(t.conversations)
        .where(
          profile
            ? or(
                eq(t.conversations.customerId, user.id),
                eq(t.conversations.mechanicId, profile.id),
              )
            : eq(t.conversations.customerId, user.id),
        )
        .orderBy(desc(t.conversations.lastMessageAt));
      res.json(
        await Promise.all(
          rows.map(async (row) => {
            const mechanic = await storage.getMechanic(row.mechanicId);
            const customer = await storage.getUser(row.customerId);
            return {
              ...row,
              title:
                row.customerId === user.id
                  ? mechanic?.user.name
                  : customer?.name,
            };
          }),
        ),
      );
    }),
  );
  app.post(
    "/api/conversations",
    route(async (req, res) => {
      const mechanicId = id.parse(req.body.mechanicId);
      const mechanic = await storage.getMechanic(mechanicId);
      ensure(
        mechanic?.isVerified && mechanic.userId !== who(res).id,
        404,
        "Mechanic not found",
      );
      const result = await db.transaction(async (tx) => {
        await tx
          .select()
          .from(t.users)
          .where(eq(t.users.id, who(res).id))
          .for("update");
        const [existing] = await tx
          .select()
          .from(t.conversations)
          .where(
            and(
              eq(t.conversations.customerId, who(res).id),
              eq(t.conversations.mechanicId, mechanicId),
            ),
          );
        if (existing) return existing;
        const [row] = await tx
          .insert(t.conversations)
          .values({ customerId: who(res).id, mechanicId })
          .returning();
        return row;
      });
      res.json(result);
    }),
  );
  app.get(
    "/api/conversations/:id/messages",
    route(async (req, res) => {
      const row = await conversation(who(res), id.parse(req.params.id));
      res.json(await storage.getMessages(row.id));
    }),
  );
  app.post(
    "/api/messages",
    route(async (req, res) => {
      const input = z
        .object({ conversationId: id, content: text })
        .strict()
        .parse(req.body);
      await conversation(who(res), input.conversationId);
      const row = await db.transaction(async (tx) => {
        const [message] = await tx
          .insert(t.messages)
          .values({ ...input, senderId: who(res).id })
          .returning();
        await tx
          .update(t.conversations)
          .set({ lastMessageAt: new Date() })
          .where(eq(t.conversations.id, input.conversationId));
        return message;
      });
      res.status(201).json(row);
    }),
  );
  app.post(
    "/api/reviews",
    route(async (req, res) => {
      const input = z
        .object({
          bookingId: id,
          rating: z.number().int().min(1).max(5),
          comment: z.string().max(4000).optional(),
        })
        .strict()
        .parse(req.body);
      const { booking } = await ownedBooking(who(res), input.bookingId);
      ensure(
        booking.customerId === who(res).id && booking.status === "completed",
        403,
        "Only completed bookings can be reviewed",
      );
      const row = await db.transaction(async (tx) => {
        await tx
          .select()
          .from(t.mechanicProfiles)
          .where(eq(t.mechanicProfiles.id, booking.mechanicId))
          .for("update");
        const [review] = await tx
          .insert(t.reviews)
          .values({
            ...input,
            mechanicId: booking.mechanicId,
            customerId: who(res).id,
          })
          .returning();
        await tx
          .update(t.mechanicProfiles)
          .set({
            rating: sql`(SELECT ROUND(AVG(rating),2) FROM reviews WHERE mechanic_id=${booking.mechanicId})`,
            reviewCount: sql`(SELECT COUNT(*) FROM reviews WHERE mechanic_id=${booking.mechanicId})`,
          })
          .where(eq(t.mechanicProfiles.id, booking.mechanicId));
        return review;
      });
      res.status(201).json(row);
    }),
  );
  app.post(
    "/api/mechanic/connect",
    route(async (_req, res) => {
      const profile = await ownMechanic(who(res));
      const stripe = await getUncachableStripeClient();
      const origin = publicOrigin();
      let accountId = profile.stripeConnectId;
      if (!accountId) {
        const account = await stripe.accounts.create(
          {
            type: "express",
            country: "US",
            email: who(res).email,
            capabilities: {
              card_payments: { requested: true },
              transfers: { requested: true },
            },
            metadata: { userId: who(res).id },
          },
          { idempotencyKey: `connect-${profile.id}` },
        );
        accountId = account.id;
        await db
          .update(t.mechanicProfiles)
          .set({ stripeConnectId: accountId })
          .where(eq(t.mechanicProfiles.id, profile.id));
      }
      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url: `${origin}/api/payment-setup/cancel`,
        return_url: `${origin}/api/payment-setup/success`,
        type: "account_onboarding",
      });
      res.json({ url: link.url });
    }),
  );
  app.post(
    "/api/mechanic/connect/refresh",
    route(async (_req, res) => {
      const profile = await ownMechanic(who(res));
      ensure(profile.stripeConnectId, 409, "Start payout setup first");
      const stripe = await getUncachableStripeClient();
      const account = await stripe.accounts.retrieve(profile.stripeConnectId);
      const ready = !!(account.charges_enabled && account.payouts_enabled);
      await db
        .update(t.mechanicProfiles)
        .set({ stripeConnectOnboarded: ready })
        .where(eq(t.mechanicProfiles.id, profile.id));
      res.json({ ready });
    }),
  );
  app.patch(
    "/api/mechanic/availability",
    route(async (req, res) => {
      const profile = await ownMechanic(who(res));
      const available = z.boolean().parse(req.body.isAvailable);
      ensure(
        profile.isVerified && profile.screeningStatus === "approved",
        403,
        "Approval required",
      );
      await db
        .update(t.mechanicProfiles)
        .set({ isAvailable: available })
        .where(eq(t.mechanicProfiles.id, profile.id));
      res.json({ isAvailable: available });
    }),
  );
  // Customer pays completed work. Prices and destination are determined by the server.
  app.post(
    "/api/bookings/:id/checkout",
    route(async (req, res) => {
      const { booking, mechanic } = await ownedBooking(
        who(res),
        id.parse(req.params.id),
      );
      ensure(
        booking.customerId === who(res).id &&
          booking.status === "completed" &&
          booking.paymentStatus !== "paid",
        409,
        "Booking is not payable",
      );
      ensure(
        mechanic.stripeConnectId && mechanic.stripeConnectOnboarded,
        409,
        "Mechanic payouts are not configured",
      );
      const stripe = await getUncachableStripeClient();
      const origin = publicOrigin();
      const account = await stripe.accounts.retrieve(mechanic.stripeConnectId);
      const customer = await storage.getUser(who(res).id);
      ensure(
        account.charges_enabled && account.payouts_enabled,
        409,
        "Mechanic account is not ready",
      );
      // Persist the attempt before contacting Stripe. Never create a second charge after
      // Stripe's 24-hour idempotency window if the first response could have been lost.
      await db
        .update(t.bookings)
        .set({ checkoutStartedAt: new Date() })
        .where(
          and(
            eq(t.bookings.id, booking.id),
            sql`${t.bookings.checkoutStartedAt} IS NULL`,
          ),
        );
      const result = await db.transaction(async (tx) => {
        const [locked] = await tx
          .select()
          .from(t.bookings)
          .where(eq(t.bookings.id, booking.id))
          .for("update");
        ensure(locked.paymentStatus !== "paid", 409, "Already paid");
        if (locked.checkoutSessionId) {
          const existing = await stripe.checkout.sessions.retrieve(
            locked.checkoutSessionId,
          );
          ensure(
            existing.status === "open" && existing.url,
            409,
            "Payment is processing or expired; contact support",
          );
          return existing;
        }
        ensure(
          locked.checkoutStartedAt &&
            Date.now() - locked.checkoutStartedAt.getTime() < 23 * 3600000,
          409,
          "Payment attempt needs support reconciliation before retry",
        );
        const amount = cents(locked.totalPrice);
        const session = await stripe.checkout.sessions.create(
          {
            mode: "payment",
            customer: customer?.stripeCustomerId || undefined,
            client_reference_id: String(locked.id),
            line_items: [
              {
                quantity: 1,
                price_data: {
                  currency: "usd",
                  unit_amount: amount,
                  product_data: { name: `PrimeMechanic booking #${locked.id}` },
                },
              },
            ],
            payment_intent_data: {
              metadata: {
                bookingId: String(locked.id),
                customerId: locked.customerId,
              },
              application_fee_amount: Math.round(amount * 0.2),
              transfer_data: { destination: mechanic.stripeConnectId! },
            },
            success_url: `${origin}/api/payment-setup/success`,
            cancel_url: `${origin}/api/payment-setup/cancel`,
          },
          { idempotencyKey: `booking-checkout-${locked.id}-v1` },
        );
        await tx
          .update(t.bookings)
          .set({ checkoutSessionId: session.id })
          .where(eq(t.bookings.id, locked.id));
        return session;
      });
      res.json({ url: result.url });
    }),
  );
  app.post("/api/payments/create-payment-intent", (_req, res) => {
    res.status(410).json({ error: "Use the booking Checkout endpoint" });
  });
  app.get(
    "/api/users/:userId/payment-methods",
    route(async (_req, res) => {
      const user = await storage.getUser(who(res).id);
      if (!user?.stripeCustomerId) {
        res.json([]);
        return;
      }
      const stripe = await getUncachableStripeClient();
      const methods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: "card",
      });
      const customer = await stripe.customers.retrieve(user.stripeCustomerId);
      const defaultId = !customer.deleted
        ? customer.invoice_settings.default_payment_method
        : null;
      res.json(
        methods.data.map((pm) => ({
          id: pm.id,
          brand: pm.card?.brand,
          last4: pm.card?.last4,
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
          isDefault: defaultId === pm.id,
        })),
      );
    }),
  );
  app.post(
    "/api/users/:userId/checkout-setup",
    route(async (_req, res) => {
      const stripe = await getUncachableStripeClient();
      const user = await storage.getUser(who(res).id);
      ensure(user, 401, "Please sign in");
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create(
          { email: user.email, name: user.name, metadata: { userId: user.id } },
          { idempotencyKey: `customer-${user.id}` },
        );
        customerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }
      const origin = publicOrigin();
      const session = await stripe.checkout.sessions.create({
        mode: "setup",
        customer: customerId,
        success_url: `${origin}/api/payment-setup/success`,
        cancel_url: `${origin}/api/payment-setup/cancel`,
      });
      res.json({ url: session.url });
    }),
  );
  async function ownedCard(res: Response, paymentMethodId: string) {
    const user = await storage.getUser(who(res).id);
    ensure(user?.stripeCustomerId, 404, "Payment method not found");
    const stripe = await getUncachableStripeClient();
    const method = await stripe.paymentMethods.retrieve(paymentMethodId);
    ensure(
      method.customer === user.stripeCustomerId,
      404,
      "Payment method not found",
    );
    return { stripe, customerId: user.stripeCustomerId };
  }
  app.delete(
    "/api/payment-methods/:id",
    route(async (req, res) => {
      const { stripe } = await ownedCard(res, String(req.params.id));
      await stripe.paymentMethods.detach(String(req.params.id));
      res.json({ success: true });
    }),
  );
  app.post(
    "/api/payment-methods/:id/default",
    route(async (req, res) => {
      const { stripe, customerId } = await ownedCard(
        res,
        String(req.params.id),
      );
      await stripe.customers.update(customerId, {
        invoice_settings: { default_payment_method: String(req.params.id) },
      });
      res.json({ success: true });
    }),
  );
  app.get(
    "/objects/{*path}",
    authenticate,
    route(async (req, res) => {
      const file = await objects.getObjectEntityFile(req.path);
      let allowed = await objects.canAccessObjectEntity({
        userId: who(res).id,
        objectFile: file,
        requestedPermission: ObjectPermission.READ,
      });
      if (!allowed) {
        const photos = await db
          .select()
          .from(t.jobPhotos)
          .where(eq(t.jobPhotos.photoUrl, req.path));
        for (const photo of photos) {
          const booking = await storage.getBooking(photo.bookingId);
          if (booking?.customerId === who(res).id) allowed = true;
        }
        const [portfolio] = await db
          .select()
          .from(t.portfolioItems)
          .where(eq(t.portfolioItems.imageUrl, req.path))
          .limit(1);
        if (portfolio) allowed = true;
      }
      ensure(allowed, 404, "Object not found");
      res.set({
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Content-Disposition": "inline",
      });
      await objects.downloadObject(file, res, 0);
    }),
  );
  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Endpoint not found" });
  });
  // Authenticated polling replaces the untrusted WebSocket registration endpoint.
  return createServer(app);
}
export function apiErrors(
  error: unknown,
  _req: Request,
  res: Response,
  _next: unknown,
) {
  const malformed = error as { type?: string; name?: string };
  if (malformed?.type === "entity.parse.failed") {
    res.status(400).json({ error: "Invalid JSON" });
    return;
  }
  if (malformed?.type === "entity.too.large") {
    res.status(413).json({ error: "Request too large" });
    return;
  }
  if (malformed?.name === "ObjectNotFoundError") {
    res.status(404).json({ error: "Object not found" });
    return;
  }
  if (error instanceof z.ZodError) {
    res.status(400).json({
      error: "Invalid request",
      fields: error.issues.map((i) => i.path.join(".")),
    });
    return;
  }
  if (error instanceof HttpError) {
    res.status(error.status).json({ error: error.message });
    return;
  }
  const code = (error as { code?: string })?.code;
  if (code === "23505" || code === "23503") {
    res
      .status(409)
      .json({ error: "Operation conflicts with existing records" });
    return;
  }
  console.error("API operation failed", (error as Error)?.name);
  res.status(500).json({ error: "Unable to complete this operation" });
}
