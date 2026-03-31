// integrations/googleFit.js — Fetch real data from Google Fit

require("dotenv").config();
const { google } = require("googleapis");
const logger     = require("../modules/logger");

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const fitness = google.fitness({ version: "v1", auth: oauth2Client });

async function getDailyActivity(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const startMs = start.getTime();
  const endMs   = end.getTime();

  try {
    const response = await fitness.users.dataset.aggregate({
      userId: "me",
      requestBody: {
        aggregateBy: [
          { dataTypeName: "com.google.step_count.delta" },
          { dataTypeName: "com.google.calories.expended" },
          { dataTypeName: "com.google.active_minutes" },
        ],
        bucketByTime: { durationMillis: 86400000 },
        startTimeMillis: startMs,
        endTimeMillis:   endMs,
      },
    });

    const bucket = response.data.bucket?.[0];

    const steps   = bucket?.dataset?.[0]?.point?.reduce((s, p) => s + (p.value?.[0]?.intVal ?? 0), 0) ?? 0;
    const calories= Math.round(bucket?.dataset?.[1]?.point?.reduce((s, p) => s + (p.value?.[0]?.fpVal ?? 0), 0) ?? 0);
    const active  = bucket?.dataset?.[2]?.point?.reduce((s, p) => s + (p.value?.[0]?.intVal ?? 0), 0) ?? 0;

    return {
      date:          start.toISOString().split("T")[0],
      steps,
      calories,
      activeMinutes: active,
      sleepHours:    0, // sleep needs separate API call
    };

  } catch (err) {
    logger.error("Google Fit fetch failed: " + err.message);
    return { date: new Date().toISOString().split("T")[0], steps: 0, calories: 0, activeMinutes: 0, sleepHours: 0 };
  }
}

module.exports = { getDailyActivity };