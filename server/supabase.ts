import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://kwmebglwhypvmzzxskpm.supabase.co";
const supabaseKey = 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3bWViZ2x3aHlwdm16enhza3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNzI0NTIsImV4cCI6MjA5NDk0ODQ1Mn0.W__LiikXvwngbj9b0zeHFWjOhsAhPv0-j8eYSyRf2s4";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
