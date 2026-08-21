import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://kwmebglwhypvmzzxskpm.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, key);

async function syncJohn() {
  console.log("Syncing hello@gmail.com (john) to Supabase auth.users...");
  const { data, error } = await supabase.auth.signUp({
    email: "hello@gmail.com",
    password: "Password12345!",
    options: {
      data: { name: "john" }
    }
  });

  if (error) {
    console.log("Sync notice:", error.message);
  } else {
    console.log("✅ Synced hello@gmail.com to auth.users! Auth ID:", data.user?.id);
  }
  process.exit(0);
}

syncJohn();
