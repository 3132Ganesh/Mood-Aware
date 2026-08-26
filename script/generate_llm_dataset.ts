import fs from "fs";
import path from "path";

export interface FineTuneExample {
  instruction: string;
  input: string;
  output: string;
}

export function generateMoodAwareDataset(): FineTuneExample[] {
  const dataset: FineTuneExample[] = [
    // --- 1. Empathetic Agust AI Manager & Intraday Mood Shifts ---
    {
      instruction: "Act as Agust, the empathetic AI Personal Manager for MoodAware. Respond to a user who logged a low mood score of 1/5 with stress.",
      input: "User Mood: 1/5 (Rough), Trigger: Work Overwhelm, Stress: 9/10.",
      output: "I hear you, and it is completely okay to feel overwhelmed right now. Take a deep breath with me. Let us pause work for just 5 minutes. I recommend trying a 2-minute box breathing cycle in the Sanctuary drawer to lower your vagus nerve tension. Would you like me to reschedule your non-essential tasks for tomorrow?",
    },
    {
      instruction: "Act as Agust AI Manager. Respond to a user who logged a mood score of 4/5 after completing a workout.",
      input: "User Mood: 4/5 (Good), Activity: Hydration & Gym Workout.",
      output: "Fantastic energy! Completing your workout and staying hydrated is giving your brain a natural dopamine boost. Let us capitalize on this momentum while staying balanced. I have logged your activity ring points for today!",
    },

    // --- 2. Zero-to-Hero Goal Roadmaps ---
    {
      instruction: "Generate a 4-phase zero-to-hero learning roadmap for becoming a Full-Stack AI Engineer starting from scratch.",
      input: "Goal: Full-Stack AI Engineer, Target: 60 Days, Skill Level: Scratch.",
      output: JSON.stringify({
        title: "Full-Stack AI Engineer Mastery Roadmap",
        aiSelfTrainedSummary: "Synthesized core software engineering fundamentals, Python/TypeScript mastery, LLM orchestration, and modern React frontend frameworks.",
        phases: [
          {
            phaseIndex: 1,
            title: "Phase 1: Modern Web Architecture & TypeScript Fundamentals",
            timeframe: "Days 1 - 15",
            objective: "Build strong foundation in HTML5, CSS3, TailwindCSS, and TypeScript.",
            zeroToHeroInstruction: "Start by creating simple static pages, then add typed variables, interfaces, and state management using React and Vite.",
            checkpoints: ["Master TS Types & Interfaces", "Build React UI with TailwindCSS", "Connect REST APIs with Fetch"]
          },
          {
            phaseIndex: 2,
            title: "Phase 2: Backend API & AI Integration",
            timeframe: "Days 16 - 30",
            objective: "Build Node.js/Express APIs, PostgreSQL database with Drizzle ORM, and connect OpenRouter/OpenAI APIs.",
            zeroToHeroInstruction: "Focus on HTTP endpoints, JSON parsing, environment variables, and asynchronous API calls.",
            checkpoints: ["Setup Express server & Drizzle ORM", "Integrate OpenRouter API key gateway", "Implement Error Handling"]
          },
          {
            phaseIndex: 3,
            title: "Phase 3: LLM Engineering, Vector DBs & Prompting",
            timeframe: "Days 31 - 45",
            objective: "Learn RAG (Retrieval Augmented Generation), LangChain/LlamaIndex, and Supabase pgvector.",
            zeroToHeroInstruction: "Understand embeddings, vector similarity search, and prompt engineering patterns.",
            checkpoints: ["Build RAG pipeline with pgvector", "Implement System Prompts & Guardrails", "Deploy Edge Functions"]
          },
          {
            phaseIndex: 4,
            title: "Phase 4: Capstone AI App & Deployment",
            timeframe: "Days 46 - 60",
            objective: "Deploy full-stack AI web app on Render / Vercel with CI/CD.",
            zeroToHeroInstruction: "Optimize build bundles, enable dark mode design tokens, and setup production logging.",
            checkpoints: ["Build Capstone Full-Stack AI App", "Deploy to Production Server", "Setup User Auth & Security"]
          }
        ],
        recommendedTools: [
          { name: "Vite & React 18", speedMultiplier: "⚡ 3x Speed", purpose: "Blazing fast frontend bundling" },
          { name: "Drizzle ORM & Supabase", speedMultiplier: "⚡ 4x Speed", purpose: "Type-safe database ORM" },
          { name: "OpenRouter Gateway", speedMultiplier: "⚡ 5x Speed", purpose: "Multi-model AI API router" }
        ],
        searchQueries: [
          { topic: "Frontend", query: "React 18 TypeScript best practices 2026" },
          { topic: "AI Integration", query: "Building RAG applications with pgvector and Node.js" }
        ]
      }, null, 2)
    },

    // --- 3. Box-Breathing & Vagus Nerve Guidance ---
    {
      instruction: "Provide box breathing instruction for high anxiety.",
      input: "User Stress Level: 9/10, Heart Rate elevated.",
      output: "Inhale through your nose for 4 seconds... Hold your breath gently for 4 seconds... Exhale slowly through your mouth for 4 seconds... Hold empty for 4 seconds. Repeat 4 cycles to stimulate your vagus nerve and slow down your heart rate.",
    },

    // --- 4. Hyderabad Gym & Weight Gain Recommendations ---
    {
      instruction: "Recommend a tailored gym workout and diet for weight gain suited for someone in Hyderabad.",
      input: "Goal: Weight & Muscle Gain, Location: Hyderabad, Mood: Energized.",
      output: "For healthy muscle gain in Hyderabad: Combine a heavy compound lifting program (Bench Press, Squats, Deadlifts 4x/week) with high-calorie nutrition. Include protein-rich local foods like Paneer/Chicken tikka, Sprouts curry, Egg bhurji, Whole milk, and Ragi malt. For top training facilities in Hyderabad, consider Cult.fit, Gold's Gym Banjara Hills, or Talwalkars Jubilee Hills.",
    },

    // --- 5. Autonomous Daily Task Scheduling ---
    {
      instruction: "Schedule a balanced daily wellness routine for a busy professional.",
      input: "User Profile: Software Developer, Work Hours: 9 AM - 6 PM.",
      output: "7:30 AM: 10-min Sunlight Walk & Hydration (500ml water)\n1:00 PM: Post-lunch 5-min Mindful Box Breathing\n6:30 PM: 45-min Compound Strength Workout / Gym Session\n9:30 PM: Screen-free Wind Down & Gratitude Scratchpad Journaling\n10:30 PM: Circadian Sleep Lockout",
    }
  ];

  return dataset;
}

// Function to write dataset to data/moodaware_finetune_dataset.jsonl
export function exportDatasetFiles() {
  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dataset = generateMoodAwareDataset();

  // Export JSONL format
  const jsonlPath = path.join(dataDir, "moodaware_finetune_dataset.jsonl");
  const jsonlContent = dataset.map(item => JSON.stringify(item)).join("\n");
  fs.writeFileSync(jsonlPath, jsonlContent, "utf-8");

  // Export Alpaca JSON format
  const jsonPath = path.join(dataDir, "moodaware_finetune_dataset.json");
  fs.writeFileSync(jsonPath, JSON.stringify(dataset, null, 2), "utf-8");

  console.log(`[LLM Dataset Generator] Successfully generated ${dataset.length} training examples in ${dataDir}`);
  return { jsonlPath, jsonPath, count: dataset.length };
}

// Run if called directly
if (import.meta.url === `file:///${process.argv[1].replace(/\\/g, '/')}`) {
  exportDatasetFiles();
}
