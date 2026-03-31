// integrations/spotify.js

require("dotenv").config();
const https  = require("https");
const logger = require("../modules/logger");

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  return new Promise((resolve, reject) => {
    const body = "grant_type=client_credentials";
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
        if (json.access_token) resolve(json.access_token);
        else reject(new Error(JSON.stringify(json)));
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function getMyTopTracks() {
  try {
    const token = await getAccessToken();
    logger.ok("Spotify token obtained");

    // Search for mood-related playlists as a test
    return new Promise((resolve, reject) => {
      const options = {
        hostname: "api.spotify.com",
        path:     "/v1/search?q=mood&type=playlist&limit=3",
        method:   "GET",
        headers:  { "Authorization": `Bearer ${token}` },
      };

      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", chunk => data += chunk);
        res.on("end", () => {
          const json = JSON.parse(data);
          const playlists = json.playlists?.items?.map(p => p.name) || [];
          resolve(playlists);
        });
      });

      req.on("error", reject);
      req.end();
    });
  } catch (err) {
    logger.error("Spotify failed: " + err.message);
    return [];
  }
}

module.exports = { getAccessToken, getMyTopTracks };