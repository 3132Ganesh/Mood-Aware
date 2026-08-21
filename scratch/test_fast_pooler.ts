import pg from "pg";

const { Pool } = pg;
const ref = "kwmebglwhypvmzzxskpm";
const password = "8hx8Xfwt5vBV7NMG";

const regions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3", "eu-north-1",
  "ap-south-1", "ap-southeast-1", "ap-southeast-2", "ap-northeast-1", "ap-northeast-2",
  "ca-central-1", "sa-east-1"
];

async function checkOne(region: string) {
  const host = `aws-0-${region}.pooler.supabase.com`;
  // Test both session (5432) and transaction (6543)
  for (const port of [6543, 5432]) {
    const connectionString = `postgresql://postgres.${ref}:${password}@${host}:${port}/postgres`;
    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 2500,
    });

    try {
      const client = await pool.connect();
      const res = await client.query("SELECT current_database();");
      client.release();
      await pool.end();
      console.log(`\n🎉 WORKING POOLER FOUND!`);
      console.log(`REGION: ${region}`);
      console.log(`PORT: ${port}`);
      console.log(`URL: ${connectionString}\n`);
      return connectionString;
    } catch (e: any) {
      await pool.end();
    }
  }
  return null;
}

async function run() {
  console.log("Searching for working Supabase Pooler across 16 AWS regions in parallel...");
  const results = await Promise.all(regions.map(r => checkOne(r)));
  const found = results.find(r => Boolean(r));
  if (!found) {
    console.log("No pooler host answered directly.");
  }
  process.exit(0);
}

run();
