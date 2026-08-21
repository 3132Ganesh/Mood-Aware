import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import * as chatSchema from "@shared/models/chat";

const { Pool } = pg;

const isLocalDb = (url?: string) => {
  if (!url) return true;
  return url.includes("localhost") || url.includes("127.0.0.1");
};

export const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isLocalDb(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false },
    })
  : null;

export const db = pool
  ? drizzle(pool, { schema: { ...schema, ...chatSchema } })
  : (null as any);
