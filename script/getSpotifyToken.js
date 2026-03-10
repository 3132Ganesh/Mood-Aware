// scripts/getSpotifyToken.js — One time auth script

require("dotenv").config();
const https  = require("https");
const http   = require("http");
const url    = require("url");
const crypto = require("crypto");

const CLIENT_ID     = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI  = "https://localhost:8888/callback";

const SCOPES = [
  "user-read-recently-played",
  "user-top-read",
  "user-read-currently-playing",
  "user-read-playback-state",
].join(" ");

const authUrl = `https://accounts.spotify.com/authorize?` +
  `client_id=${CLIENT_ID}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPES)}`;

console.log("\n🎵 SPOTIFY AUTHORIZATION");
console.log("═".repeat(50));
console.log("\n1. Open this URL in your browser:\n");
console.log(authUrl);
console.log("\n2. Log in with your Spotify account");
console.log("3. Click Agree on the permissions screen");
console.log("4. You'll get redirected — copy the 'code' from the URL");
console.log("═".repeat(50) + "\n");

