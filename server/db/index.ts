import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
const { Pool } = pkg;
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export let db = drizzle(pool, { schema });

export function useTestDatabase(database: typeof db) {
  if (process.env.NODE_ENV !== "test")
    throw new Error("Test database injection is disabled");
  db = database;
}
