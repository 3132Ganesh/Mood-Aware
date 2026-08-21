import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://kwmebglwhypvmzzxskpm.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, key);

async function syncExistingUser() {
  console.log("Syncing ganeshpixel03@gmail.com to Supabase Auth...");
  const { data, error } = await supabase.auth.signUp({
    email: "ganeshpixel03@gmail.com",
    password: "Password123!", // Temp initial password if needed
    options: {
      data: { name: "ganesh" }
    }
  });

  if (error) {
    console.log("Sync notice:", error.message);
  } else {
    console.log("✅ Synced ganeshpixel03@gmail.com to auth.users! Auth ID:", data.user?.id);
  }
  process.exit(0);
}

syncExistingUser();
