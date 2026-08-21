import pg from "pg";

const { Pool } = pg;
const ref = "kwmebglwhypvmzzxskpm";
const password = "8hx8Xfwt5vBV7NMG";

async function testPooler(port: number, mode: string) {
  const host = "aws-0-ap-south-1.pooler.supabase.com";
  const connectionString = `postgresql://postgres.${ref}:${password}@${host}:${port}/postgres`;
  console.log(`Testing ${mode} on port ${port} -> ${connectionString}`);

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    const res = await client.query("SELECT current_database(), now(), inet_server_addr();");
    console.log(`✅ SUCCESS on port ${port}!`);
    console.log(`   Database: ${res.rows[0].current_database}`);
    console.log(`   Server IP (IPv4): ${res.rows[0].inet_server_addr}`);
    client.release();
    await pool.end();
    return true;
  } catch (err: any) {
    console.log(`❌ Failed on port ${port}:`, err.message);
    await pool.end();
    return false;
  }
}

async function run() {
  await testPooler(6543, "Transaction Pooler");
  await testPooler(5432, "Session Pooler");
  process.exit(0);
}

run();
