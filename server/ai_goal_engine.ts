import OpenAI from "openai";

export interface GoalInput {
  title: string;
  category: string; // professional, personal, upskill, diet, health
  description?: string;
  targetDeadline?: string;
  skillLevel?: string; // scratch, intermediate, advanced
}

export interface GeneratedTool {
  name: string;
  category: string;
  purpose: string;
  speedMultiplier: string; // e.g. "⚡ 3x Speed"
  searchUrl: string;
  description: string;
}

export interface GeneratedSearchQuery {
  topic: string;
  query: string;
  url: string;
}

export interface RoadmapPhase {
  phaseIndex: number;
  title: string;
  timeframe: string;
  objective: string;
  zeroToHeroInstruction: string;
  checkpoints: {
    title: string;
    instruction: string;
    dueDateHint: string;
  }[];
  phaseTools: string[];
}

export interface GeneratedGoalRoadmapData {
  title: string;
  aiSelfTrainedSummary: string;
  phases: RoadmapPhase[];
  recommendedTools: GeneratedTool[];
  searchQueries: GeneratedSearchQuery[];
}

export async function generateMasterRoadmapWithAI(
  goal: GoalInput,
  customApiKey?: string,
  customModel?: string
): Promise<GeneratedGoalRoadmapData> {
  const apiKey = customApiKey || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const modelName = customModel || "google/gemini-2.5-flash-lite"; // default fast model via OpenRouter

  if (!apiKey) {
    console.warn("⚠️ No API key found for AI Goal Roadmap generation. Using rule-based generator.");
    return generateFallbackRoadmap(goal);
  }

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: apiKey,
    defaultHeaders: {
      "HTTP-Referer": "https://moodaware.app",
      "X-Title": "Mood-Aware Notion AI Goal Planner",
    },
  });

  const systemPrompt = `You are a Master AI Goal Planner & Accelerated Skill Architect inspired by Notion AI.
Your task is to take a user's goal (professional, career, upskilling, diet, health, personal) and create a comprehensive, highly actionable roadmap starting FROM SCRATCH.

Strict Requirements:
1. Provide an "aiSelfTrainedSummary" summarizing your synthesized domain knowledge and how to master this goal efficiently.
2. Break the roadmap down into 4 clear sequential PHASES (from beginner/scratch to advanced/mastery).
3. Each phase MUST contain:
   - title
   - timeframe (e.g. "Week 1-2" or "Days 1-7")
   - objective
   - zeroToHeroInstruction (detailed step-by-step guidance assuming 0 prior experience)
   - checkpoints (3-4 granular milestones with title, instruction, and dueDateHint)
   - phaseTools (list of tools useful in this phase)
4. Recommend 3-5 high-speed learning tools with a speedMultiplier (e.g. "⚡ 3x Acceleration", "⚡ 5x Productivity") that allow the user to learn 3x faster. Include a Google search query URL for each tool.
5. Provide 4-6 curated web search queries with topic, search query string, and direct Google search URL (https://www.google.com/search?q=...).

You MUST return ONLY valid JSON matching this exact structure:
{
  "title": "Master Roadmap for [Goal Title]",
  "aiSelfTrainedSummary": "Summary of AI domain analysis and strategic roadmap overview...",
  "phases": [
    {
      "phaseIndex": 1,
      "title": "Phase 1: Foundations & Setup from Scratch",
      "timeframe": "Week 1",
      "objective": "Objective statement...",
      "zeroToHeroInstruction": "Step 1: ... Step 2: ...",
      "checkpoints": [
        { "title": "Milestone 1", "instruction": "Clear action step...", "dueDateHint": "Day 2" }
      ],
      "phaseTools": ["Tool A", "Tool B"]
    }
  ],
  "recommendedTools": [
    {
      "name": "Tool Name",
      "category": "Software/Framework/App",
      "purpose": "Why to use this tool",
      "speedMultiplier": "⚡ 3x Speed",
      "searchUrl": "https://www.google.com/search?q=Tool+Name",
      "description": "Short explanation of how it accelerates progress"
    }
  ],
  "searchQueries": [
    {
      "topic": "Topic Name",
      "query": "exact search term",
      "url": "https://www.google.com/search?q=exact+search+term"
    }
  ]
}`;

  const userPrompt = `Goal Title: ${goal.title}
Category: ${goal.category}
Target Deadline / Duration: ${goal.targetDeadline || "Not specified"}
Current Skill Level: ${goal.skillLevel || "Starting from Scratch"}
Description / Aspirations: ${goal.description || "No extra context provided."}

Please train yourself on this domain and generate the complete Master Roadmap JSON now.`;

  try {
    const response = await client.chat.completions.create({
      model: modelName,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const rawContent = response.choices[0]?.message?.content;
    if (!rawContent) {
      throw new Error("Empty response from AI engine");
    }

    const parsed = JSON.parse(rawContent) as GeneratedGoalRoadmapData;
    if (!parsed.phases || !Array.isArray(parsed.phases) || parsed.phases.length === 0) {
      throw new Error("Invalid roadmap JSON structure received");
    }

    return parsed;
  } catch (error) {
    console.error("⚠️ AI Goal Roadmap generation error, using fallback generator:", error);
    return generateFallbackRoadmap(goal);
  }
}

/**
 * Intelligent Rule-Based Fallback Roadmap Generator
 * Guarantees zero downtime and instant roadmap delivery even without LLM connection.
 */
export function generateFallbackRoadmap(goal: GoalInput): GeneratedGoalRoadmapData {
  const title = goal.title;
  const isDietOrHealth = ["diet", "health", "personal"].includes(goal.category.toLowerCase());
  const deadlineStr = goal.targetDeadline || "30 Days";

  const encodedGoal = encodeURIComponent(title);

  if (isDietOrHealth) {
    return {
      title: `Master Health & Wellness Roadmap: ${title}`,
      aiSelfTrainedSummary: `AI domain synthesis for health & lifestyle: Establishing a structured ${deadlineStr} regime targeting sustainable nutritional balance, progressive physical conditioning, and automated habit triggers starting from absolute scratch.`,
      phases: [
        {
          phaseIndex: 1,
          title: "Phase 1: Baseline Assessment & Pantry Calibration",
          timeframe: "Days 1 - 7",
          objective: "Audit current dietary intake, calculate TDEE & macro targets, and eliminate inflammatory triggers.",
          zeroToHeroInstruction: "1. Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE). 2. Restock your kitchen with lean protein, whole grains, and leafy greens. 3. Log all liquid calories and switch to 3L daily hydration.",
          checkpoints: [
            { title: "Macro & TDEE Calculation", instruction: "Use a macro calculator to establish daily calorie baseline.", dueDateHint: "Day 1" },
            { title: "Kitchen & Pantry Purge", instruction: "Remove ultra-processed snacks and restock clean protein & complex carbs.", dueDateHint: "Day 2" },
            { title: "Hydration & Sleep Audit", instruction: "Track 3L daily water and establish a consistent 11 PM bed routine.", dueDateHint: "Day 5" }
          ],
          phaseTools: ["MyFitnessPal", "Water Llama", "Cronometer"]
        },
        {
          phaseIndex: 2,
          title: "Phase 2: Meal Preparation & Progressive Habit Stacking",
          timeframe: "Days 8 - 14",
          objective: "Automate batch meal cooking and establish 3x weekly progressive movement sessions.",
          zeroToHeroInstruction: "1. Prepare 3 days of balanced meals in advance every Sunday. 2. Integrate 20-30 minutes of brisk walking or light resistance training post-breakfast. 3. Track daily energy levels and digestion in your mood journal.",
          checkpoints: [
            { title: "Batch Meal Prep System", instruction: "Cook 6 balanced protein-first lunches for the week ahead.", dueDateHint: "Day 8" },
            { title: "3x Active Movement Sessions", instruction: "Complete three 30-minute cardio or strength workouts.", dueDateHint: "Day 11" },
            { title: "Mid-Goal Energy & Digestion Review", instruction: "Evaluate bloat, energy spikes, and adjust fiber intake.", dueDateHint: "Day 14" }
          ],
          phaseTools: ["Mealime", "Fitbit / Apple Health", "Mood-Aware Tracker"]
        },
        {
          phaseIndex: 3,
          title: "Phase 3: Deep Optimization & Progressive Overload",
          timeframe: "Days 15 - 22",
          objective: "Fine-tune nutrient timing around workouts and intensify physical conditioning.",
          zeroToHeroInstruction: "1. Consume 30g protein within 45 minutes of physical activity. 2. Increase workout resistance or daily steps by 15%. 3. Implement evening digital detox 60 mins before sleep to optimize HGH recovery.",
          checkpoints: [
            { title: "Post-Workout Protein Timing", instruction: "Ensure 30g lean protein post-training daily.", dueDateHint: "Day 16" },
            { title: "10,000 Step Daily Baseline", instruction: "Hit 10k steps 5 out of 7 days this week.", dueDateHint: "Day 19" },
            { title: "Sleep Architecture Check", instruction: "Achieve >80% alignment score on sleep tracking.", dueDateHint: "Day 22" }
          ],
          phaseTools: ["Whoop", "Strong App", "Notion Health Hub"]
        },
        {
          phaseIndex: 4,
          title: "Phase 4: Sustainable Maintenance & Long-Term Mastery",
          timeframe: "Days 23 - " + deadlineStr,
          objective: "Transition from rigid tracking to intuitive healthy lifestyle mastery.",
          zeroToHeroInstruction: "1. Establish 80/20 flexible dietary rule for long-term consistency. 2. Benchmark body composition and stamina improvements. 3. Document your personal health blueprint for future maintenance.",
          checkpoints: [
            { title: "Intuitive Eating Transition", instruction: "Practice mindful portion control without calorie apps for 3 days.", dueDateHint: "Day 25" },
            { title: "Final Physical Benchmark", instruction: "Measure weight, body measurements, and cardio endurance.", dueDateHint: "Day 28" },
            { title: "Long-Term Lifestyle Playbook", instruction: "Write your permanent dietary and fitness principles.", dueDateHint: deadlineStr }
          ],
          phaseTools: ["Notion", "Reflect App", "Mood-Aware Sanctuary"]
        }
      ],
      recommendedTools: [
        {
          name: "MyFitnessPal / Cronometer",
          category: "Nutrition & Macro Tracker",
          purpose: "Instant barcode scanning & micro-nutrient breakdowns",
          speedMultiplier: "⚡ 3x Speed",
          searchUrl: `https://www.google.com/search?q=Cronometer+vs+MyFitnessPal+macro+tracking`,
          description: "Eliminates guessing by giving real-time feedback on daily protein, fats, and net carbs."
        },
        {
          name: "Mealime",
          category: "Meal Prep Generator",
          purpose: "Automated grocery lists & quick 30-min healthy recipes",
          speedMultiplier: "⚡ 2x Speed",
          searchUrl: `https://www.google.com/search?q=Mealime+app+healthy+meal+planning`,
          description: "Generates step-by-step cooking plans with zero waste grocery lists."
        },
        {
          name: "Strong Workout Tracker",
          category: "Fitness & Resistance",
          purpose: "Track sets, reps, and progressive weight overload",
          speedMultiplier: "⚡ 4x Speed",
          searchUrl: `https://www.google.com/search?q=Strong+app+workout+gym+logger`,
          description: "Keeps a precise log of your physical progress so every workout builds on the last."
        }
      ],
      searchQueries: [
        {
          topic: "Nutritional Science Baseline",
          query: `${title} beginner nutrition guide TDEE macros`,
          url: `https://www.google.com/search?q=${encodedGoal}+beginner+nutrition+guide+TDEE+macros`
        },
        {
          topic: "Meal Prep Workflows",
          query: `high protein meal prep recipes 30 minutes`,
          url: `https://www.google.com/search?q=high+protein+meal+prep+recipes+30+minutes`
        },
        {
          topic: "Workout Routine",
          query: `${title} 4 week workout routine for beginners`,
          url: `https://www.google.com/search?q=${encodedGoal}+4+week+workout+routine+for+beginners`
        },
        {
          topic: "Recovery & Sleep Optimization",
          query: `huberman lab sleep protocol recovery optimization`,
          url: `https://www.google.com/search?q=huberman+lab+sleep+protocol+recovery+optimization`
        }
      ]
    };
  }

  // Default Professional / Career / Upskilling Fallback
  return {
    title: `Master Career & Upskilling Roadmap: ${title}`,
    aiSelfTrainedSummary: `AI domain synthesis for professional mastery: Systematic ${deadlineStr} curriculum engineered to take you from 0 knowledge to building real-world projects, mastering modern AI tools, and establishing industry authority.`,
    phases: [
      {
        phaseIndex: 1,
        title: "Phase 1: Core Fundamentals & Environment Setup (Scratch)",
        timeframe: "Days 1 - 7",
        objective: "Understand core concepts, set up developer/work tools, and complete 5 micro-hands-on exercises.",
        zeroToHeroInstruction: "1. Install recommended tooling & IDEs. 2. Complete introductory syntax/concepts overview. 3. Build your first 'Hello World' mini project to cement fundamentals.",
        checkpoints: [
          { title: "Tooling & Environment Setup", instruction: "Configure workspace, extensions, and essential software.", dueDateHint: "Day 1" },
          { title: "Core Concepts Deep-Dive", instruction: "Read core documentation and digest fundamental principles.", dueDateHint: "Day 3" },
          { title: "First Hands-On Exercise", instruction: "Complete 3 starter tutorials from scratch.", dueDateHint: "Day 6" }
        ],
        phaseTools: ["Cursor IDE", "Notion", "GitHub"]
      },
      {
        phaseIndex: 2,
        title: "Phase 2: Building Practical Projects & Speed Tool Integration",
        timeframe: "Days 8 - 14",
        objective: "Apply knowledge by building 2 real-world portfolio projects using AI acceleration tools.",
        zeroToHeroInstruction: "1. Leverage Cursor / Bolt / ChatGPT to accelerate boilerplate creation by 5x. 2. Implement core functional features step-by-step. 3. Commit code and write clear documentation.",
        checkpoints: [
          { title: "Project 1 Architecture Blueprint", instruction: "Outline data models and user flow for Project 1.", dueDateHint: "Day 8" },
          { title: "Core Feature Build", instruction: "Build functional MVP with error handling.", dueDateHint: "Day 11" },
          { title: "Code Audit & Refactoring", instruction: "Review code quality, add comments, and test edge cases.", dueDateHint: "Day 14" }
        ],
        phaseTools: ["Cursor", "Bolt.new", "Vite", "ChatGPT 4o"]
      },
      {
        phaseIndex: 3,
        title: "Phase 3: Advanced Optimization, System Design & Architecture",
        timeframe: "Days 15 - 22",
        objective: "Master industry best practices, performance tuning, and scalable design patterns.",
        zeroToHeroInstruction: "1. Study senior-level system design patterns and security standards. 2. Refate your project to support edge cases and production logging. 3. Perform benchmark testing.",
        checkpoints: [
          { title: "System Design Review", instruction: "Study top architectural patterns for scalable software.", dueDateHint: "Day 16" },
          { title: "Performance Optimization", instruction: "Reduce load times and optimize data queries by 40%.", dueDateHint: "Day 19" },
          { title: "Security & Validation Audit", instruction: "Enforce input sanitization, environment secrets, and strict types.", dueDateHint: "Day 22" }
        ],
        phaseTools: ["Postman", "Excalidraw", "Vercel / Supabase"]
      },
      {
        phaseIndex: 4,
        title: "Phase 4: Portfolio Polish, Industry Showcase & Mastery",
        timeframe: "Days 23 - " + deadlineStr,
        objective: "Package work into a public showcase, write technical breakdown articles, and prepare for career advancement.",
        zeroToHeroInstruction: "1. Deploy completed projects to production. 2. Record a 2-minute video walkthrough showcasing features. 3. Publish key learnings on LinkedIn/GitHub to position yourself as an authority.",
        checkpoints: [
          { title: "Production Deployment", instruction: "Deploy live web app / portfolio with custom domain.", dueDateHint: "Day 24" },
          { title: "Video Walkthrough & Readme", instruction: "Create clean README.md with screenshots and architecture diagram.", dueDateHint: "Day 27" },
          { title: "Industry Showcase Post", instruction: "Share your transformation journey on LinkedIn / X.", dueDateHint: deadlineStr }
        ],
        phaseTools: ["Loom", "LinkedIn", "GitHub Pages"]
      }
    ],
    recommendedTools: [
      {
        name: "Cursor AI Editor",
        category: "AI Code & Productivity",
        purpose: "AI-assisted pair programming & instant code refactoring",
        speedMultiplier: "⚡ 5x Speed",
        searchUrl: `https://www.google.com/search?q=Cursor+AI+editor+tutorial`,
        description: "Autocompletes multi-file codebases and answers questions in context, cutting dev time in half."
      },
      {
        name: "Anki / RemNote",
        category: "Spaced Repetition Learning",
        purpose: "Lock in complex technical concepts into long-term memory",
        speedMultiplier: "⚡ 3x Memory Retention",
        searchUrl: `https://www.google.com/search?q=Anki+spaced+repetition+for+coding`,
        description: "Uses cognitive flashcards to ensure you never forget fundamental syntax or commands."
      },
      {
        name: "Excalidraw",
        category: "System Design & Diagramming",
        purpose: "Rapid visual mapping of architecture and data flow",
        speedMultiplier: "⚡ 2x Speed",
        searchUrl: `https://www.google.com/search?q=Excalidraw+system+design+diagrams`,
        description: "Creates clean, beautiful diagrams to plan projects before writing line of code."
      }
    ],
    searchQueries: [
      {
        topic: "Complete Roadmap 2026",
        query: `${title} learning roadmap 2026 step by step`,
        url: `https://www.google.com/search?q=${encodedGoal}+learning+roadmap+2026+step+by+step`
      },
      {
        topic: "Zero-to-Hero Tutorials",
        query: `${title} tutorial for complete beginners scratch`,
        url: `https://www.google.com/search?q=${encodedGoal}+tutorial+for+complete+beginners+scratch`
      },
      {
        topic: "Portfolio Project Ideas",
        query: `top portfolio project ideas for ${title}`,
        url: `https://www.google.com/search?q=top+portfolio+project+ideas+for+${encodedGoal}`
      },
      {
        topic: "Interview & Career Questions",
        query: `${title} interview questions and answers 2026`,
        url: `https://www.google.com/search?q=${encodedGoal}+interview+questions+and+answers+2026`
      }
    ]
  };
}
