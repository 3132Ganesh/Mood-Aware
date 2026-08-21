import { db } from "../server/db";
import { sql } from "drizzle-orm";
import { 
  users, userProfiles, moodLogs, moodSwings, 
  dailyHabits, plans, planItems, tasks, 
  feelingsNotes, timeCapsules, session 
} from "../shared/schema";

async function verifyLiveSupabase() {
  console.log("=================================================");
  console.log("🔍 SUPABASE LIVE CONNECTION & HEALTH AUDIT");
  console.log("=================================================\n");

  const start = Date.now();
  try {
    const rawResult = await db.execute(sql`
      SELECT 
        current_database() as database,
        current_user as user,
        inet_server_addr() as server_ip,
        version() as pg_version,
        now() as server_timestamp;
    `);
    const latency = Date.now() - start;
    const info = rawResult.rows[0];

    console.log("🟢 LIVE CONNECTION STATUS: CONNECTED & ONLINE");
    console.log(`⏱️  Ping Latency: ${latency} ms`);
    console.log(`🗄️  Connected Database: ${info.database}`);
    console.log(`👤 Database User: ${info.user}`);
    console.log(`🌐 Supabase Host: ${info.server_ip}`);
    console.log(`🕒 Supabase Clock: ${info.server_timestamp}`);
    console.log(`📦 PostgreSQL Version: ${String(info.pg_version).split(',')[0]}\n`);

    console.log("-------------------------------------------------");
    console.log("📊 LIVE TABLE & RECORD AUDIT (In Supabase Cloud)");
    console.log("-------------------------------------------------");

    const [
      usersList,
      profilesList,
      moodList,
      swingsList,
      habitsList,
      plansList,
      planItemsList,
      tasksList,
      notesList,
      capsulesList,
      sessionsList
    ] = await Promise.all([
      db.select().from(users),
      db.select().from(userProfiles),
      db.select().from(moodLogs),
      db.select().from(moodSwings),
      db.select().from(dailyHabits),
      db.select().from(plans),
      db.select().from(planItems),
      db.select().from(tasks),
      db.select().from(feelingsNotes),
      db.select().from(timeCapsules),
      db.select().from(session),
    ]);

    console.log(`1.  public.users:          ${usersList.length} rows`);
    console.log(`2.  public.user_profiles:  ${profilesList.length} rows`);
    console.log(`3.  public.mood_logs:      ${moodList.length} rows`);
    console.log(`4.  public.mood_swings:    ${swingsList.length} rows`);
    console.log(`5.  public.daily_habits:   ${habitsList.length} rows`);
    console.log(`6.  public.plans:          ${plansList.length} rows`);
    console.log(`7.  public.plan_items:     ${planItemsList.length} rows`);
    console.log(`8.  public.tasks:          ${tasksList.length} rows`);
    console.log(`9.  public.feelings_notes: ${notesList.length} rows`);
    console.log(`10. public.time_capsules:  ${capsulesList.length} rows`);
    console.log(`11. public.session:        ${sessionsList.length} active sessions\n`);

    if (usersList.length > 0) {
      console.log("👥 Registered Users in Supabase:");
      usersList.forEach(u => {
        console.log(`   • [ID: ${u.id}] Name: "${u.name}" | Email: "${u.email}" | Created: ${u.createdAt}`);
      });
    }

    console.log("\n=================================================");
    console.log("✅ SUMMARY: Backend is 100% connected to Supabase!");
    console.log("=================================================");
    process.exit(0);
  } catch (err) {
    console.error("❌ SUPABASE CONNECTION ERROR:", err);
    process.exit(1);
  }
}

verifyLiveSupabase();
