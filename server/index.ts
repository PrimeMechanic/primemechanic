import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { seedDatabase } from "./storage";
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

const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:5000',
];

if (process.env.REPLIT_DEV_DOMAIN) {
  allowedOrigins.push(`https://${process.env.REPLIT_DEV_DOMAIN}`);
}
if (process.env.EXPO_PUBLIC_DOMAIN) {
  allowedOrigins.push(`https://${process.env.EXPO_PUBLIC_DOMAIN}`);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o)) || origin.includes('.replit.dev') || origin.includes('.replit.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));

(async () => {
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

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (req.path.startsWith("/api")) {
        log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
      }
    });
    next();
  });

  const getAppName = () => {
    try {
      const appJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'app.json'), 'utf-8'));
      return appJson.expo?.name || 'PrimeMechanic';
    } catch {
      return 'PrimeMechanic';
    }
  };

  app.get('/api/manifest/:platform', (req, res) => {
    const platform = req.params.platform;
    const domain = process.env.REPLIT_DEV_DOMAIN || process.env.EXPO_PUBLIC_DOMAIN || 'localhost:8081';
    const scheme = domain.includes('localhost') ? 'http' : 'https';
    const bundleUrl = `${scheme}://${domain}/index.bundle?platform=${platform}`;

    res.json({
      id: '@anonymous/prime-mechanic',
      name: getAppName(),
      slug: 'prime-mechanic',
      version: '1.0.0',
      orientation: 'portrait',
      platforms: ['ios', 'android', 'web'],
      bundleUrl,
      extra: { eas: { projectId: '' } },
    });
  });

  app.get('/', (req, res) => {
    const userAgent = req.headers['user-agent'] || '';
    const isExpoClient = userAgent.includes('Expo') || req.query.platform;
    if (isExpoClient) {
      return res.redirect('/api/manifest/ios');
    }
    const landingPath = path.join(process.cwd(), 'server', 'templates', 'landing-page.html');
    if (fs.existsSync(landingPath)) {
      return res.sendFile(landingPath);
    }
    res.json({ status: 'ok', app: getAppName() });
  });

  try {
    const stripeSync = await getStripeSync();
    if (stripeSync) {
      await runMigrations(stripeSync);
      log('Stripe migrations completed');
    }
  } catch (error: any) {
    log('Stripe init skipped:', error.message);
  }

  await seedDatabase();

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({ port, host: "0.0.0.0", reusePort: true }, () => {
    log(`express server serving on port ${port}`);
  });
})();
