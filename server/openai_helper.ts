import OpenAI from "openai";

const DEFAULT_KEY = process.env.OPENROUTER_API_KEY || "";

export function getOpenAIClient(customKey?: string, customModel?: string) {
  const activeKey = customKey || process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY || DEFAULT_KEY;
  let activeBaseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || process.env.OPENAI_BASE_URL;

  if (!activeBaseURL && (activeKey?.startsWith("sk-or-v1-") || activeKey?.includes("or-v1"))) {
    activeBaseURL = "https://openrouter.ai/api/v1";
  }

  const isOR = (activeBaseURL?.includes("openrouter")) || (activeKey?.startsWith("sk-or-v1-"));
  const modelId = customModel || (isOR ? "openai/gpt-4o-mini" : "gpt-4o-mini");

  const client = activeKey
    ? new OpenAI({
        apiKey: activeKey,
        baseURL: activeBaseURL || undefined,
        defaultHeaders: isOR ? {
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "Mood-Aware Agust AI",
        } : undefined,
      })
    : null;

  return { client, modelId };
}

function generateRuleBasedPlan(userProfile: any, moodLog: any, tasks: any[]) {
  if (!tasks || tasks.length === 0) {
    return { days: [] };
  }

  const easyTasks = tasks.filter(t => t.difficulty === "easy");
  const mediumTasks = tasks.filter(t => t.difficulty === "medium");
  const hardTasks = tasks.filter(t => t.difficulty === "hard");
  const dietTasks = tasks.filter(t => t.category === "diet" || t.taskType === "diet");
  const careerTasks = tasks.filter(t => t.category === "career" || t.taskType === "career");
  const allAvailable = [...tasks];

  const pickFrom = (pool: any[]) => {
    if (pool.length > 0) {
      return pool[Math.floor(Math.random() * pool.length)].id;
    }
    return allAvailable[Math.floor(Math.random() * allAvailable.length)].id;
  };

  const days = [];
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const taskIds: number[] = [];
    const isWeekend = dayOffset === 5 || dayOffset === 6; // Sat or Sun

    // Slot 1: EASY Micro-Habit / Diet / Hydration (Daily Mon-Sun)
    if (dietTasks.length > 0 && dayOffset % 2 === 0) {
      taskIds.push(pickFrom(dietTasks));
    } else {
      taskIds.push(pickFrom(easyTasks));
    }

    // Slot 2: MEDIUM Skill & Workout Task (Weekdays) or HARD Weekend Milestone
    if (isWeekend) {
      taskIds.push(pickFrom(hardTasks.length > 0 ? hardTasks : mediumTasks));
    } else {
      taskIds.push(pickFrom(mediumTasks.length > 0 ? mediumTasks : easyTasks));
    }

    // Slot 3: Career Track / Mental Wellbeing / Personalization
    if (careerTasks.length > 0 && dayOffset % 2 === 1) {
      taskIds.push(pickFrom(careerTasks));
    } else {
      taskIds.push(pickFrom(allAvailable));
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

export async function generatePlanWithAI(userProfile: any, moodLog: any, tasks: any[], customKey?: string, customModel?: string) {
  const { client: openai, modelId } = getOpenAIClient(customKey, customModel);

  if (!openai) {
    return generateRuleBasedPlan(userProfile, moodLog, tasks);
  }

  const prompt = `
    User Goals & Profile:
    - Target Career Track: ${userProfile.careerTrack || userProfile.occupation || "Software Engineer / Data Professional"}
    - Specific Target Goal: ${userProfile.targetGoal || "Build core skills & career advancement"}
    - Fitness & Diet Goal: ${userProfile.dietGoal || "Balanced Energy & Active Lifestyle"}
    - Diet Preferences: ${userProfile.dietPreferences || "High Protein & Hydration"}
    - Occupation: ${userProfile.occupation || "General"}
    - Sleep: ${userProfile.sleepTime || "22:00"} - ${userProfile.wakeTime || "07:00"}

    Current Wellness State:
    - Mood: ${moodLog.moodScore}/5 (${moodLog.moodLabel || "Normal"})
    - Stress: ${moodLog.stressScore}/5
    - Energy: ${moodLog.energyScore}/5
    - Notes: ${moodLog.notes || "None"}

    Available Tasks (JSON):
    ${JSON.stringify(tasks.map(t => ({ 
      id: t.id, 
      title: t.title, 
      category: t.category, 
      duration: t.duration,
      difficulty: t.difficulty || "medium",
      taskType: t.taskType || "career",
      dietTip: t.dietTip || null
    })))}

    CRITICAL SCHEDULING RULES:
    1. Generate a 7-day plan (Day 0 to 6).
    2. 3-TIER DIFFICULTY RULE:
       - Every day (Days 0-6) MUST include at least 1 "easy" micro-habit or diet/hydration task.
       - Weekdays (Days 0-4, Mon-Fri) MUST emphasize "medium" skill building, career, & fitness workout tasks.
       - Weekends (Days 5-6, Sat-Sun) MUST include "hard" milestone projects, deep work, or full workout challenges.
    3. Make sure tasks reflect the user's Career Track (${userProfile.careerTrack || "Software Engineer"}) and Diet Goal (${userProfile.dietGoal || "Balanced Energy"}).

    Return ONLY valid JSON in this format:
    {
      "days": [
        {
          "dayOffset": 0,
          "taskIds": [1, 8, 3]
        }
      ]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: modelId,
      messages: [
        { role: "system", content: "You are an expert career, fitness, and wellness planner. Return JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    const parsed = JSON.parse(content || "{}");
    if (parsed && Array.isArray(parsed.days) && parsed.days.length > 0) {
      console.log(`[AI Plan Engine] OpenRouter AI plan generated successfully with model ${modelId}!`);
      return parsed;
    }
    return generateRuleBasedPlan(userProfile, moodLog, tasks);
  } catch (e: any) {
    console.warn("AI Plan Generation failed, using rule-based generator:", e?.message || e);
    return generateRuleBasedPlan(userProfile, moodLog, tasks);
  }
}

export async function analyzeSentiment(text: string, customKey?: string, customModel?: string): Promise<number> {
  const { client: openai, modelId } = getOpenAIClient(customKey, customModel);

  if (!openai || !text || text.trim().length === 0) {
    return analyzeRuleBasedSentiment(text);
  }

  try {
    const response = await openai.chat.completions.create({
      model: modelId,
      messages: [
        { role: "system", content: "Analyze sentiment of the text. Return a score from 1 (very negative) to 10 (very positive). Return JSON: {\"score\": 5}" },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    const json = JSON.parse(content || "{}");
    return json.score || analyzeRuleBasedSentiment(text);
  } catch (e: any) {
    console.warn("AI Sentiment Analysis failed, using rule-based analyzer:", e?.message || e);
    return analyzeRuleBasedSentiment(text);
  }
}
