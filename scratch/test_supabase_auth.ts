import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || "https://kwmebglwhypvmzzxskpm.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";

const supabase = createClient(supabaseUrl, key);

async function testAuth() {
  try {
    const email = `moodaware_user_${Date.now()}@gmail.com`;
    const password = "Password12345!";
    console.log("Trying supabase.auth.signUp for:", email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: "MoodAware User" }
      }
    });

    if (error) {
      console.error("Auth signUp error:", error);
    } else {
      console.log("✅ SUCCESS! User successfully created in Supabase Auth (auth.users)!");
      console.log("   • Auth User ID (UUID):", data.user?.id);
      console.log("   • Email:", data.user?.email);
    }
  } catch (err) {
    console.error("Caught error:", err);
  }
}

testAuth();
