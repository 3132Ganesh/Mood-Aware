import OpenAI from "openai";

const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL;

const openai = apiKey
  ? new OpenAI({
      apiKey,
      baseURL: baseURL || undefined,
    })
  : null;

function generateRuleBasedPlan(userProfile: any, moodLog: any, tasks: any[]) {
  if (!tasks || tasks.length === 0) {
    return { days: [] };
  }

  const mentalTasks = tasks.filter(t => t.category === "mental");
  const physicalTasks = tasks.filter(t => t.category === "physical");
  const musicTasks = tasks.filter(t => t.category === "music");
  const gameTasks = tasks.filter(t => t.category === "game");
  const allAvailable = [...tasks];

  const pickFrom = (pool: any[], fallbackPool: any[]) => {
    if (pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)].id;
    }
    return fallbackPool[Math.floor(Math.random() * fallbackPool.length)].id;
  };

  const days = [];
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const taskIds: number[] = [];

    // Slot 1: Mental wellbeing or calming
    taskIds.push(pickFrom(mentalTasks, allAvailable));

    // Slot 2: Physical / movement or energy
    if (moodLog?.stressScore > 3) {
      taskIds.push(pickFrom(mentalTasks.length > 1 ? mentalTasks.slice(1) : mentalTasks, allAvailable));
    } else {
      taskIds.push(pickFrom(physicalTasks, allAvailable));
    }

    // Slot 3: Recreational / music / gaming
    if (userProfile?.playsGames && gameTasks.length > 0 && dayOffset % 2 === 0) {
      taskIds.push(pickFrom(gameTasks, allAvailable));
    } else if (userProfile?.musicApp !== "none" && musicTasks.length > 0) {
      taskIds.push(pickFrom(musicTasks, allAvailable));
    } else {
      taskIds.push(pickFrom(physicalTasks, allAvailable));
    }

    // Ensure 3 unique task IDs if possible
    const uniqueIds = Array.from(new Set(taskIds));
    while (uniqueIds.length < Math.min(3, allAvailable.length)) {
      const randomTask = allAvailable[Math.floor(Math.random() * allAvailable.length)];
      if (!uniqueIds.includes(randomTask.id)) {
        uniqueIds.push(randomTask.id);
      }
    }

    days.push({
      dayOffset,
      taskIds: uniqueIds,
    });
  }

  return { days };
}

function analyzeRuleBasedSentiment(text: string): number {
  if (!text || text.trim().length === 0) return 5;

  const positiveWords = ["happy", "great", "good", "excited", "energized", "calm", "grateful", "peaceful", "loved", "wonderful", "amazing", "productive", "motivated", "joy", "strong", "better"];
  const negativeWords = ["sad", "bad", "tired", "stressed", "anxious", "angry", "terrible", "awful", "rough", "overwhelmed", "exhausted", "depressed", "nervous", "lonely", "hopeless", "hurts"];

  const lower = text.toLowerCase();
  let score = 5;

  positiveWords.forEach(w => {
    if (lower.includes(w)) score += 1.2;
  });

  negativeWords.forEach(w => {
    if (lower.includes(w)) score -= 1.2;
  });

  return Math.min(10, Math.max(1, Math.round(score)));
}

export async function generatePlanWithAI(userProfile: any, moodLog: any, tasks: any[]) {
  if (!openai) {
    return generateRuleBasedPlan(userProfile, moodLog, tasks);
  }

  const prompt = `
    User Profile:
    - Occupation: ${userProfile.occupation || "General"}
    - Age Group: ${userProfile.ageGroup || "Adult"}
    - Sleep: ${userProfile.sleepTime || "22:00"} - ${userProfile.wakeTime || "07:00"}
    - Habits: Break freq: ${userProfile.breakFrequency || "Regular"}, Activity: ${userProfile.physicalActivity || "Moderate"}
    - Music: ${userProfile.musicApp ? 'Yes' : 'No'} (${Array.isArray(userProfile.musicMoods) ? userProfile.musicMoods.join(', ') : 'any'})
    - Games: ${userProfile.playsGames ? 'Yes' : 'No'} (${Array.isArray(userProfile.gameTypes) ? userProfile.gameTypes.join(', ') : 'none'})

    Current State:
    - Mood: ${moodLog.moodScore}/5 (${moodLog.moodLabel || "Normal"})
    - Stress: ${moodLog.stressScore}/5
    - Energy: ${moodLog.energyScore}/5
    - Notes: ${moodLog.notes || "None"}

    Available Tasks (JSON):
    ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, category: t.category, duration: t.duration })))}

    Generate a 7-day plan (Day 0 to 6). For each day, select 3 tasks from the available list that best suit the user's mood and profile.
    Return ONLY valid JSON in this format:
    {
      "days": [
        {
          "dayOffset": 0,
          "taskIds": [1, 5, 3]
        }
      ]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a wellness planner. Return JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    const parsed = JSON.parse(content || "{}");
    if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
      return parsed;
    }
    return generateRuleBasedPlan(userProfile, moodLog, tasks);
  } catch (e) {
    console.warn("AI Plan Generation failed, using rule-based generator", e);
    return generateRuleBasedPlan(userProfile, moodLog, tasks);
  }
}

export async function analyzeSentiment(text: string): Promise<number> {
  if (!openai || !text || text.trim().length === 0) {
    return analyzeRuleBasedSentiment(text);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Analyze sentiment of the text. Return a score from 1 (very negative) to 10 (very positive). Return JSON: {\"score\": 5}" },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    const json = JSON.parse(content || "{}");
    return json.score || analyzeRuleBasedSentiment(text);
  } catch (e) {
    console.warn("AI Sentiment Analysis failed, using rule-based analyzer", e);
    return analyzeRuleBasedSentiment(text);
  }
}
