import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import * as chatSchema from "@shared/models/chat";

const { Pool } = pg;

// Supabase PostgreSQL Production IPv4 Pooler Connection String (Session mode - port 5432)
const SUPABASE_DEFAULT_URL = "postgresql://postgres.kwmebglwhypvmzzxskpm:hfaX0IFJpn704NgT@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

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

/**
 * Auto-ensures all new schema columns exist in PostgreSQL database on boot.
 */
export async function ensureDbSchema(): Promise<void> {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS career_track TEXT;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS target_goal TEXT;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS diet_goal TEXT;
        ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS diet_preferences TEXT;

        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS task_type TEXT;
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS diet_tip TEXT;
        ALTER TABLE tasks ADD COLUMN IF NOT EXISTS difficulty TEXT;
      `);
      console.log("[DB] Postgres schema synced successfully.");
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn("[DB] Schema auto-sync warning (will proceed):", err);
  }
}
