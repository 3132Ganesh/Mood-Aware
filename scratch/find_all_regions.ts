import pg from "pg";

const { Pool } = pg;
const ref = "kwmebglwhypvmzzxskpm";
const password = "8hx8Xfwt5vBV7NMG";

const allRegions = [
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-central-1",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ca-central-1",
  "sa-east-1",
  "af-south-1",
  "me-south-1"
];

async function findRegion() {
  for (const region of allRegions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    const connectionString = `postgresql://postgres.${ref}:${password}@${host}:6543/postgres`;
    // console.log(`Testing ${region}...`);

    const pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000,
    });

    try {
      const client = await pool.connect();
      const res = await client.query("SELECT current_database(), now();");
      console.log(`\n🎉 FOUND THE EXACT REGION: ${region}`);
      console.log(`Host: ${host}`);
      console.log(`Connection URL: postgresql://postgres.${ref}:${password}@${host}:6543/postgres`);
      console.log(`Database: ${res.rows[0].current_database}`);
      client.release();
      await pool.end();
      process.exit(0);
    } catch (e: any) {
      if (!e.message.includes("not found") && !e.message.includes("timeout") && !e.message.includes("ENOTFOUND")) {
        console.log(`Region ${region} error:`, e.message);
      }
      await pool.end();
    }
  }
  console.log("No region matched.");
  process.exit(1);
}

findRegion();
