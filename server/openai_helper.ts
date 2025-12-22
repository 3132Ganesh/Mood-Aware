import OpenAI from "openai";

// The integration sets these env vars automatically
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function generatePlanWithAI(userProfile: any, moodLog: any, tasks: any[]) {
  const prompt = `
    User Profile:
    - Occupation: ${userProfile.occupation}
    - Age Group: ${userProfile.ageGroup}
    - Sleep: ${userProfile.sleepTime} - ${userProfile.wakeTime}
    - Habits: Break freq: ${userProfile.breakFrequency}, Activity: ${userProfile.physicalActivity}
    - Music: ${userProfile.musicApp ? 'Yes' : 'No'} (${userProfile.musicMoods?.join(', ')})
    - Games: ${userProfile.playsGames ? 'Yes' : 'No'} (${userProfile.gameTypes?.join(', ')})

    Current State:
    - Mood: ${moodLog.moodScore}/5 (${moodLog.moodLabel})
    - Stress: ${moodLog.stressScore}/5
    - Energy: ${moodLog.energyScore}/5
    - Notes: ${moodLog.notes}

    Available Tasks (JSON):
    ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, category: t.category, duration: t.duration })))}

    Generate a 7-day plan (Day 1 to 7). For each day, select 3 tasks from the available list that best suit the user's mood and profile.
    Return ONLY valid JSON in this format:
    {
      "days": [
        {
          "dayOffset": 0, // 0 for today/tomorrow, 1 for next day, etc.
          "taskIds": [1, 5, 3]
        },
        ... (7 days total)
      ]
    }
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: [
      { role: "system", content: "You are a wellness planner. Return JSON only." },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
  });

  try {
    const content = response.choices[0].message.content;
    return JSON.parse(content || "{}");
  } catch (e) {
    console.error("AI Plan Generation failed", e);
    // Fallback: Random plan
    return null;
  }
}

export async function analyzeSentiment(text: string): Promise<number> {
  const response = await openai.chat.completions.create({
    model: "gpt-5.1",
    messages: [
      { role: "system", content: "Analyze sentiment of the text. Return a score from 1 (very negative) to 10 (very positive). Return JSON: {\"score\": 5}" },
      { role: "user", content: text }
    ],
    response_format: { type: "json_object" },
  });

  try {
    const content = response.choices[0].message.content;
    const json = JSON.parse(content || "{}");
    return json.score || 5;
  } catch (e) {
    return 5; // Neutral default
  }
}
