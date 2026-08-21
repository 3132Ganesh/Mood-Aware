import pg from "pg";

const { Pool } = pg;
const connectionString = "postgresql://postgres.kwmebglwhypvmzzxskpm:hfaX0IFJpn704NgT@aws-1-ap-south-1.pooler.supabase.com:5432/postgres";

async function testNewPooler() {
  console.log("Testing IPv4 Supabase Pooler (aws-1-ap-south-1):", connectionString);
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });

  try {
    const client = await pool.connect();
    const res = await client.query("SELECT current_database(), now(), inet_server_addr();");
    console.log("✅ SUCCESS! Connected to Supabase via IPv4 Session Pooler!");
    console.log("   Database:", res.rows[0].current_database);
    console.log("   Timestamp:", res.rows[0].now);
    console.log("   IPv4 Server Address:", res.rows[0].inet_server_addr);
    client.release();
    await pool.end();
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Pooler Connection Failed:", err);
    process.exit(1);
  }
}

testNewPooler();
