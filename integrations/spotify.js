// integrations/spotify.js — Real personal Spotify data

require("dotenv").config();
const https  = require("https");
const logger = require("../modules/logger");

async function getAccessToken() {
  const credentials = Buffer.from(
    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const body = new URLSearchParams({
    grant_type:    "refresh_token",
    refresh_token: process.env.SPOTIFY_REFRESH_TOKEN,
  }).toString();

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "accounts.spotify.com",
      path:     "/api/token",
      method:   "POST",
      headers:  {
        "Authorization":  `Basic ${credentials}`,
        "Content-Type":   "application/x-www-form-urlencoded",
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

function spotifyGet(token, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.spotify.com",
      path,
      method:  "GET",
      headers: { "Authorization": `Bearer ${token}` },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve(JSON.parse(data)));
    });

    req.on("error", reject);
    req.end();
  });
}

// YOUR top artists
async function getMyTopArtists(limit = 10) {
  try {
    const token = await getAccessToken();
    const data  = await spotifyGet(token, `/v1/me/top/artists?limit=${limit}&time_range=short_term`);

    return data.items?.map((artist, i) => ({
      rank:       i + 1,
      name:       artist.name,
      genres:     artist.genres.slice(0, 3),
      popularity: artist.popularity,
    })) || [];
  } catch (err) {
    logger.error("getMyTopArtists failed: " + err.message);
    return [];
  }
}

// YOUR recently played tracks
async function getRecentlyPlayed(limit = 20) {
  try {
    const token = await getAccessToken();
    const data  = await spotifyGet(token, `/v1/me/player/recently-played?limit=${limit}`);

    const tracks = data.items?.map(item => ({
      track:    item.track.name,
      artist:   item.track.artists[0].name,
      playedAt: item.played_at,
      duration: Math.round(item.track.duration_ms / 60000 * 10) / 10,
    })) || [];

    // Calculate total listening time
    const totalMins = tracks.reduce((s, t) => s + t.duration, 0);
    const totalHrs  = Math.round(totalMins / 60 * 10) / 10;

    // Group by artist and count
    const artistCounts = {};
    tracks.forEach(t => {
      artistCounts[t.artist] = (artistCounts[t.artist] || 0) + 1;
    });

    const topArtists = Object.entries(artistCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([artist, count], i) => ({
        rank:   i + 1,
        artist,
        tracks: count,
        estMins: Math.round(count * 3.5),
      }));

    return { tracks, totalMins: Math.round(totalMins), totalHrs, topArtists };
  } catch (err) {
    logger.error("getRecentlyPlayed failed: " + err.message);
    return { tracks: [], totalMins: 0, totalHrs: 0, topArtists: [] };
  }
}

module.exports = { getAccessToken, getMyTopArtists, getRecentlyPlayed };