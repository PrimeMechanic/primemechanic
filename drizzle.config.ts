import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // This points to where your tables are defined
  schema: "./server/db/schema.ts", 
  // This is where Drizzle saves your migration files
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    // Ensure you have DATABASE_URL in your Replit Secrets!
    url: process.env.DATABASE_URL!,
  },
});