// scripts/getGoogleToken.js
// Run this ONCE to get your refresh token

require("dotenv").config();
const { google } = require("googleapis");
const http       = require("http");
const url        = require("url");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "http://localhost:3000/oauth/callback"
);

// Scopes we need from Google Fit
const SCOPES = [
  "https://www.googleapis.com/auth/fitness.activity.read",
  "https://www.googleapis.com/auth/fitness.sleep.read",
  "https://www.googleapis.com/auth/fitness.body.read",
];

// Generate the auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type:  "offline",
  scope:        SCOPES,
  prompt:       "consent",
});

console.log("\n🔐 GOOGLE FIT AUTHORIZATION");
console.log("═".repeat(50));
console.log("\n1. Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n2. Sign in with your Google account");
console.log("3. Click Allow on the permissions screen");
console.log("4. Wait for the token to appear here\n");
console.log("═".repeat(50));

// Start a local server to catch the callback
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === "/oauth/callback") {
    const code = parsedUrl.query.code;

    if (code) {
      try {
        const { tokens } = await oauth2Client.getToken(code);

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html><body style="font-family:sans-serif;padding:40px;background:#111;color:#fff">
            <h2>✅ Authorization Successful!</h2>
            <p>You can close this tab and go back to your terminal.</p>
          </body></html>
        `);

        console.log("\n✅ SUCCESS! Add these to your .env file:");
        console.log("═".repeat(50));
        console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`);
        console.log("═".repeat(50));
        console.log("\n🔒 Save this refresh token — you only get it once!\n");

        server.close();
      } catch (err) {
        console.error("❌ Error getting token:", err.message);
        res.writeHead(500);
        res.end("Error getting token");
        server.close();
      }
    }
  }
});

server.listen(3000, () => {
  console.log("⏳ Waiting for Google authorization...");
  console.log("   (Local server running on port 3000)\n");
});