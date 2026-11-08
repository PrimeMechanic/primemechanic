import express from "express";
import cors from "cors";
import path from "node:path";
import { WebhookHandlers } from "./webhookHandlers";
import { db } from "./db";
import { sql } from "drizzle-orm";

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  const hops = Number(process.env.TRUST_PROXY_HOPS || 0);
  if (![0, 1, 2].includes(hops))
    throw new Error("TRUST_PROXY_HOPS must be 0, 1, or 2");
  app.set("trust proxy", hops);
  const origins = new Set(
    [
      process.env.PUBLIC_APP_URL,
      ...(process.env.ALLOWED_ORIGINS || "").split(","),
    ]
      .filter(Boolean)
      .map((value) => new URL(value!).origin),
  );
  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:8081");
    origins.add("http://localhost:5000");
  }
  app.use(
    cors({
      origin: (origin, callback) =>
        callback(null, !origin || origins.has(origin)),
      credentials: false,
    }),
  );
  app.use((_req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    });
    next();
  });
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json", limit: "1mb" }),
    async (req, res) => {
      if (typeof req.headers["stripe-signature"] !== "string") {
        res.status(400).json({ error: "Missing signature" });
        return;
      }
      try {
        await WebhookHandlers.processWebhook(
          req.body,
          req.headers["stripe-signature"],
        );
        res.json({ received: true });
      } catch (error) {
        const status = (error as { status?: number }).status;
        res
          .status(status === 400 ? 400 : 503)
          .json({ error: "Webhook processing failed; retry required" });
      }
    },
  );
  app.use(express.json({ limit: "64kb" }));
  app.get("/health/ready", async (_req, res) => {
    try {
      await db.execute(sql`SELECT token_hash FROM sessions LIMIT 0`);
      await db.execute(sql`SELECT earnings_credited_at FROM bookings LIMIT 0`);
      res.json({ ready: true });
    } catch {
      res.status(503).json({ ready: false });
    }
  });
  // Public generated manifests must be registered before private API fallback.
  app.get(
    ["/mobile-manifest/:platform", "/api/manifest/:platform"],
    (req, res) => {
      const platform = String(req.params.platform);
      if (!["ios", "android"].includes(platform)) {
        res.sendStatus(404);
        return;
      }
      res.set({
        "Content-Type": "application/expo+json",
        "expo-protocol-version": "0",
        "expo-sfv-version": "0",
        "Cache-Control": "no-store",
      });
      res.sendFile(path.resolve("static-build", platform, "manifest.json"));
    },
  );
  for (const platform of ["ios", "android"])
    app.get(`/${platform}`, (_req, res) =>
      res.redirect(`/mobile-manifest/${platform}`),
    );
  return app;
}
