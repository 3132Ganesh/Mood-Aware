// script/testSpotify.js

require("dotenv").config();
const { getMyTopArtists, getRecentlyPlayed } = require("../integrations/spotify");

async function test() {
  console.log("\n🎵 YOUR SPOTIFY DATA\n" + "═".repeat(40));

  const artists = await getMyTopArtists(5);
  console.log("\n🏆 YOUR TOP ARTISTS (last 4 weeks):");
  artists.forEach(a => console.log(`  ${a.rank}. ${a.name} — ${a.genres[0] || "various"}`));

  const recent = await getRecentlyPlayed(20);
  console.log("\n⏱️  RECENT LISTENING:");
  console.log(`  Total time: ${recent.totalHrs} hours`);

  console.log("\n🎤 MOST PLAYED ARTISTS (recent):");
  recent.topArtists.forEach(a => {
    console.log(`  ${a.rank}. ${a.artist} — ${a.tracks} tracks (~${a.estMins} mins)`);
  });

  console.log("\n✅ Spotify integration working!\n");
}

test().catch(console.error);
