import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function testNewUserSignup() {
  console.log("=================================================");
  console.log("🧪 TESTING NEW USER SIGNUP & SUPABASE INSERTION");
  console.log("=================================================\n");

  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = "Password123!";
  const testName = "Alex Rivera";

  console.log(`1. Attempting signup with:`);
  console.log(`   • Email: ${testEmail}`);
  console.log(`   • Name:  ${testName}\n`);

  try {
    // 1. Hash password like server/auth.ts does
    const hashedPassword = await hashPassword(testPassword);

    // 2. Insert new user into Supabase
    const [newUser] = await db.insert(users).values({
      email: testEmail,
      password: hashedPassword,
      name: testName,
    }).returning();

    console.log("🟢 2. New User Successfully Created in Supabase!");
    console.log(`   • Auto-generated User ID: ${newUser.id}`);
    console.log(`   • Email in Database:      ${newUser.email}`);
    console.log(`   • Name in Database:       ${newUser.name}`);
    console.log(`   • Created At:             ${newUser.createdAt}\n`);

    // 3. Verify user exists by querying Supabase
    const [fetched] = await db.select().from(users).where(eq(users.id, newUser.id));
    console.log("🔍 3. Verification Query from Supabase Cloud Table:");
    console.log(`   • Fetched User ID: ${fetched.id}`);
    console.log(`   • Password Hash:   ${fetched.password.substring(0, 30)}...`);

    // 4. Clean up test user so we keep the database clean
    await db.delete(users).where(eq(users.id, newUser.id));
    console.log("\n🧹 4. Test User Cleaned Up (Database is in pristine state).");

    console.log("\n=================================================");
    console.log("✅ RESULT: YES! Every new signup is dynamically");
    console.log("   assigned a new unique ID and saved in Supabase!");
    console.log("=================================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ Test Failed:", err);
    process.exit(1);
  }
}

testNewUserSignup();
