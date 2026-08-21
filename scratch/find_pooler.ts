import dns from "dns/promises";
import pg from "pg";

const { Pool } = pg;
const ref = "kwmebglwhypvmzzxskpm";
const password = "8hx8Xfwt5vBV7NMG";

const regions = [
  "ap-south-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "us-east-1",
  "us-west-1",
  "eu-central-1",
  "eu-west-1",
  "sa-east-1"
];

async function findWorkingPooler() {
  console.log("Checking direct host DNS resolution:");
  try {
    const addresses = await dns.resolve("db.kwmebglwhypvmzzxskpm.supabase.co");
    console.log("IPv4 addresses:", addresses);
  } catch (e) {
    console.log("Direct host has NO IPv4 address (IPv6-only direct connection):", e);
  }

  console.log("\nTesting Supabase IPv4 Poolers across regions...");
  for (const region of regions) {
    const host = `aws-0-${region}.pooler.supabase.com`;
    try {
      const ipv4 = await dns.resolve4(host);
      console.log(`Region ${region} (${host}) -> IPv4: ${ipv4[0]}`);

      // Try connection
      const connectionString = `postgresql://postgres.${ref}:${password}@${host}:6543/postgres`;
      const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 4000,
      });

      const client = await pool.connect();
      const res = await client.query("SELECT current_database(), now();");
      client.release();
      await pool.end();

      console.log(`\n🎉 SUCCESS! Found working IPv4 Supabase Pooler for your project:`);
      console.log(`Region: ${region}`);
      console.log(`Connection String: ${connectionString}`);
      console.log(`Database: ${res.rows[0].current_database}`);
      process.exit(0);
    } catch (err: any) {
      // console.log(`Region ${region} failed:`, err.message);
    }
  }

  console.log("Testing general pooler.supabase.com...");
  process.exit(1);
}

findWorkingPooler();
