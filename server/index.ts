import express from "express";
import path from "node:path";
import fs from "node:fs";
import { createApp } from "./app";
import { registerRoutes, apiErrors } from "./routes";
import { seedDatabase } from "./storage";
import { publicOrigin } from "./policy";

async function main() {
  if (process.env.NODE_ENV === "production") {
    for (const key of [
      "DATABASE_URL",
      "PUBLIC_APP_URL",
      "STRIPE_WEBHOOK_SECRET",
    ])
      if (!process.env[key]) throw new Error(`${key} is required`);
    publicOrigin();
  }
  const app = createApp();
  if (process.env.SEED_DEMO_DATA === "true") {
    if (process.env.NODE_ENV === "production")
      throw new Error("Demo seeding is forbidden in production");
    await seedDatabase();
  }
  const server = await registerRoutes(app);
  const root = path.resolve("static-build");
  app.use(express.static(root, { index: false, dotfiles: "deny" }));
  app.get("/", (req, res) => {
    const platform = req.query.platform || req.get("expo-platform");
    if (platform === "ios" || platform === "android") {
      res.redirect(`/mobile-manifest/${platform}`);
      return;
    }
    const landing = path.resolve("server/templates/landing-page.html");
    if (fs.existsSync(landing)) res.sendFile(landing);
    else res.json({ app: "PrimeMechanic" });
  });
  app.use(apiErrors);
  server.listen(Number(process.env.PORT || 5000), "0.0.0.0", () =>
    console.log("PrimeMechanic server ready"),
  );
}
main().catch((error) => {
  console.error("Startup failed:", error.message);
  process.exitCode = 1;
});
