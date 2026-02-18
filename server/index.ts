import express from "express";
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { db } from "./db"; 
import { users } from "./db/schema"; 
import { registerRoutes } from "./routes";
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import * as fs from "fs";
import * as path from "path";

const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// ... Keep your existing setupCors, setupBodyParsing, setupRequestLogging, 
// getAppName, serveExpoManifest, serveLandingPage, configureExpoAndLanding, 
// and setupErrorHandler functions exactly as they are ...

(async () => {
  setupCors(app);

  // 1. Stripe Webhook (Must be before general body parsing)
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const signature = req.headers['stripe-signature'];
      if (!signature) return res.status(400).json({ error: 'Missing signature' });
      try {
        const sig = Array.isArray(signature) ? signature[0] : signature;
        await WebhookHandlers.processWebhook(req.body as Buffer, sig);
        res.status(200).json({ received: true });
      } catch (error: any) {
        log('Webhook error:', error.message);
        res.status(400).json({ error: 'Webhook processing error' });
      }
    }
  );

  setupBodyParsing(app);
  setupRequestLogging(app);

  // 2. NEW: Registration API Route
  app.post("/api/register", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await db.insert(users).values({
        email,
        password: hashedPassword,
      });

      res.status(201).json({ message: "User created successfully!" });
    } catch (error: any) {
      log('Registration error:', error.message);
      res.status(500).json({ error: "User already exists or server error" });
    }
  });

  configureExpoAndLanding(app);
  await initStripe();
  const server = await registerRoutes(app);
  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`express server serving on port ${port}`);
  });
})();