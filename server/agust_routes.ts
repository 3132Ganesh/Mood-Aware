/**
 * agust_routes.ts — fixed: uses OpenRouter integration & inline persona types with dynamic key support.
 */
import type { Express } from "express";
import OpenAI from "openai";
import { checkLocalLLMAvailability, generateWithLocalLLM } from "./local_llm_engine";

export interface AgustPersona {
  name: string;
  character: string;
  avatar: string;
  color: string;
  goals: string[];
  createdAt: string;
}

const CHARACTER_HINTS: Record<string, string> = {
  zen_master:  "You are a calm, empathetic Zen wellness guide. Speak with warmth and gentle wisdom. Never rush. Suggest breathing, nature, presence.",
  hype_coach:  "You are an energetic, motivational fitness coach. Be enthusiastic and direct. Celebrate wins loudly. No excuses.",
  scientist:   "You are an analytical wellness scientist. Use precise language, track metrics, be evidence-based. Quantify progress.",
  best_friend: "You are the user's warm best friend. Be casual, fun, validate feelings first, then suggest.",
  stoic_guide: "You are a stoic philosopher-coach. Emphasize discipline and inner strength. Tough love — never coddle.",
};

function buildSystemPrompt(persona: AgustPersona): string {
  const hint = CHARACTER_HINTS[persona.character] ?? CHARACTER_HINTS.zen_master;
  const goalLine = persona.goals.length > 0
    ? `\n\nUser goals:\n${persona.goals.map((g, i) => `${i + 1}. ${g}`).join("\n")}\nStrictly align every recommendation to these goals.`
    : "";
  return `Your name is ${persona.name}. ${hint}${goalLine}\n\nBe concise (≤3 sentences unless detail is asked for). Never hallucinate health advice.`;
}

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

function getFallbackReply(persona: AgustPersona, userMsg: string): string {
  const name = persona.name;
  const char = persona.character;
  const msgLower = userMsg.toLowerCase();

  if (msgLower.includes("hello") || msgLower.includes("hi") || msgLower.includes("hey")) {
    if (char === "hype_coach") return `YES! ${name} is here and pumped! What goal are we crushing today? 💪`;
    if (char === "scientist") return `Greetings. ${name} system online. How can I assist with your metrics today? 🔬`;
    if (char === "best_friend") return `Heyyy! So glad you checked in! What's on your mind? 🌟`;
    if (char === "stoic_guide") return `Welcome. Focus your mind on what you can control today. 🧠`;
    return `Peace and warm greetings from ${name}. Take a deep breath — I am here with you. 🧘`;
  }

  if (char === "hype_coach") {
    return `${name} says: Stay focused on your goals! Keep pushing forward step by step! 💪`;
  } else if (char === "scientist") {
    return `${name} observation: Consistency yields optimal physiological and psychological results. Keep going! 🔬`;
  } else if (char === "best_friend") {
    return `I'm right here with you! You've got this, and I'm super proud of your effort today! 🌟`;
  } else if (char === "stoic_guide") {
    return `Remember: You cannot control external events, only your response to them. Stay steadfast. 🧠`;
  }
  return `${name} is listening. Take a gentle moment to center yourself and focus on one mindful step at a time. 🧘`;
}

// In-memory stores (production: add DB tables via drizzle)
const motionStore = new Map<number, any>();
const personaStore = new Map<number, AgustPersona>();

export function registerAgustRoutes(app: Express): void {
  const requireAuth = (req: any, res: any, next: any) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized" });
  };

  // Motion sync
  app.post("/api/agust/motion", requireAuth, (req: any, res: any) => {
    motionStore.set(req.user!.id, { ...req.body, syncedAt: new Date().toISOString() });
    res.json({ ok: true });
  });

  app.get("/api/agust/motion/today", requireAuth, (req: any, res: any) => {
    res.json(motionStore.get(req.user!.id) || null);
  });

  // Persona
  app.get("/api/agust/persona", requireAuth, (req: any, res: any) => {
    res.json(personaStore.get(req.user!.id) || null);
  });

  app.post("/api/agust/persona", requireAuth, (req: any, res: any) => {
    personaStore.set(req.user!.id, req.body as AgustPersona);
    res.json({ ok: true });
  });

  // AI Chat
  app.post("/api/agust/chat", requireAuth, async (req: any, res: any) => {
    try {
      const { message, history = [] } = req.body;
      const customKey = req.headers["x-openrouter-key"] as string | undefined;
      const customModel = req.headers["x-openrouter-model"] as string | undefined;

      const persona: AgustPersona = personaStore.get(req.user!.id) ?? {
        name: "Agust", character: "zen_master", avatar: "🧘",
        color: "from-teal-500 to-cyan-400", goals: [], createdAt: new Date().toISOString(),
      };

      const { client: openai, modelId } = getOpenAIClient(customKey, customModel);

      if (!openai) {
        return res.json({
          reply: getFallbackReply(persona, message || ""),
          persona: { name: persona.name, avatar: persona.avatar },
        });
      }

      const completion = await openai.chat.completions.create({
        model: modelId,
        messages: [
          { role: "system", content: buildSystemPrompt(persona) },
          ...history.slice(-10),
          { role: "user", content: message },
        ],
        max_tokens: 300,
        temperature: 0.75,
      });

      // If user selected local model or custom local provider header is present
      const useLocal = req.headers["x-llm-provider"] === "local";
      if (useLocal) {
        try {
          const reply = await generateWithLocalLLM(message, buildSystemPrompt(persona));
          console.log("[Agust AI Chat] Live response generated via Local Model!");
          return res.json({
            reply,
            persona: { name: persona.name, avatar: persona.avatar },
            provider: "local",
          });
        } catch (e: any) {
          console.warn("[Local LLM Fallback to Cloud]", e?.message);
        }
      }

      console.log(`[Agust AI Chat] Live OpenRouter response generated with model ${modelId}!`);
      res.json({
        reply: completion.choices[0]?.message?.content ?? getFallbackReply(persona, message || ""),
        persona: { name: persona.name, avatar: persona.avatar },
        provider: "cloud",
      });
    } catch (err: any) {
      console.error("[Agust Chat Error]", err?.message || err);
      const persona: AgustPersona = personaStore.get(req.user!.id) ?? {
        name: "Agust", character: "zen_master", avatar: "🧘",
        color: "from-teal-500 to-cyan-400", goals: [], createdAt: new Date().toISOString(),
      };
      res.json({
        reply: getFallbackReply(persona, req.body?.message || ""),
        persona: { name: persona.name, avatar: persona.avatar },
      });
    }
  });

  // GET /api/agust/llm-status - Check status of Local Ollama / Fine-Tuned Model
  app.get("/api/agust/llm-status", async (_req, res) => {
    try {
      const status = await checkLocalLLMAvailability();
      res.json({
        isLocalAvailable: status.isAvailable,
        availableModels: status.models,
        defaultModel: process.env.OLLAMA_MODEL || "moodaware-llm",
        datasetCount: 500,
      });
    } catch (err) {
      res.json({ isLocalAvailable: false, availableModels: [], defaultModel: "moodaware-llm", datasetCount: 0 });
    }
  });
}
