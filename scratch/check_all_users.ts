import "dotenv/config";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://kwmebglwhypvmzzxskpm.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, key);

async function checkAllUsers() {
  console.log("=== CHECKING ALL USERS IN SUPABASE ===");

  // 1. Check public.users
  const dbUsers = await db.select().from(users);
  console.log(`\n1. public.users Table (${dbUsers.length} total):`);
  dbUsers.forEach(u => {
    console.log(`   - ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | CreatedAt: ${u.createdAt}`);
  });

  // 2. Check auth.users
  try {
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      console.log("\n2. auth.users (Admin API):", error.message);
    } else {
      console.log(`\n2. auth.users (${data.users.length} total):`);
      data.users.forEach(u => {
        console.log(`   - Auth ID: ${u.id} | Email: ${u.email} | CreatedAt: ${u.created_at}`);
      });
    }
  } catch (e: any) {
    console.log("\n2. auth.users error:", e.message);
  }

  process.exit(0);
}

checkAllUsers();
