import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import * as chatSchema from "@shared/models/chat";

const { Pool } = pg;

// Supabase PostgreSQL Production Connection String (with SSL)
const SUPABASE_DEFAULT_URL = "postgresql://postgres:8hx8Xfwt5vBV7NMG@db.kwmebglwhypvmzzxskpm.supabase.co:5432/postgres";

const databaseUrl = process.env.DATABASE_URL || SUPABASE_DEFAULT_URL;

const isLocalDb = (url?: string) => {
  if (!url) return false;
  return url.includes("localhost") || url.includes("127.0.0.1");
};

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: isLocalDb(databaseUrl) ? false : { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
  idleTimeoutMillis: 30000,
  max: 20,
});

export const db = drizzle(pool, { schema: { ...schema, ...chatSchema } });
