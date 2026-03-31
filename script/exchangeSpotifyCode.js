// scripts/exchangeSpotifyCode.js
// Run: node scripts/exchangeSpotifyCode.js YOUR_CODE_HERE

require("dotenv").config();
const https = require("https");

const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI  = "https://localhost:8888/callback";
const CODE          = process.argv[2];

if (!CODE) {
  console.log("❌ Usage: node scripts/exchangeSpotifyCode.js YOUR_CODE_HERE");
  process.exit(1);
}

const body = new URLSearchParams({
  grant_type:   "authorization_code",
  code:         CODE,
  redirect_uri: REDIRECT_URI,
}).toString();

const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

const options = {
  hostname: "accounts.spotify.com",
  path:     "/api/token",
  method:   "POST",
  headers:  {
    "Authorization": `Basic ${credentials}`,
    "Content-Type":  "application/x-www-form-urlencoded",
    "Content-Length": body.length,
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", chunk => data += chunk);
  res.on("end", () => {
    const json = JSON.parse(data);
    if (json.refresh_token) {
      console.log("\n✅ SUCCESS! Add this to your .env file:");
      console.log("═".repeat(50));
      console.log(`SPOTIFY_REFRESH_TOKEN=${json.refresh_token}`);
      console.log("═".repeat(50));
    } else {
      console.log("❌ Error:", json);
    }
  });
});

req.on("error", console.error);
req.write(body);
req.end();
