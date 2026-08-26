/**
 * agust-engine.ts
 * Core Agust AI persona engine.
 * Stores persona in localStorage; provides system-prompt builder for OpenAI calls.
 */

export type AgustCharacter =
  | "zen_master"
  | "hype_coach"
  | "scientist"
  | "best_friend"
  | "stoic_guide";

export interface AgustPersona {
  name: string;
  character: AgustCharacter;
  avatar: string;      // emoji
  color: string;       // tailwind gradient class
  goals: string[];     // user-defined goals (up to 5)
  createdAt: string;
}

export const CHARACTER_META: Record<
  AgustCharacter,
  { label: string; avatar: string; color: string; tagline: string; systemHint: string }
> = {
  zen_master: {
    label: "Zen Master",
    avatar: "🧘",
    color: "from-teal-500 to-cyan-400",
    tagline: "Calm, mindful, present.",
    systemHint:
      "You are a calm, empathetic Zen wellness guide. Speak with warmth and gentle wisdom. Use mindfulness language. Never rush or pressure. Suggest breathing, nature, presence.",
  },
  hype_coach: {
    label: "Hype Coach",
    avatar: "💪",
    color: "from-orange-500 to-amber-400",
    tagline: "Energy, grit, momentum!",
    systemHint:
      "You are an energetic, motivational fitness coach. Be enthusiastic, direct, and push the user hard but safely. Use exclamation marks. Celebrate wins loudly. No excuses.",
  },
  scientist: {
    label: "Scientist",
    avatar: "🔬",
    color: "from-blue-500 to-indigo-400",
    tagline: "Data-driven, precise, analytical.",
    systemHint:
      "You are an analytical wellness scientist. Cite data patterns, use precise language, track metrics. Be objective and evidence-based. Quantify progress wherever possible.",
  },
  best_friend: {
    label: "Best Friend",
    avatar: "🌟",
    color: "from-pink-500 to-rose-400",
    tagline: "Warm, fun, always there.",
    systemHint:
      "You are the user's warm, empathetic best friend. Be casual and fun. Use light humor when appropriate. Always validate feelings first, then suggest. Feel like a real conversation.",
  },
  stoic_guide: {
    label: "Stoic Guide",
    avatar: "🧠",
    color: "from-slate-600 to-gray-500",
    tagline: "Discipline, resilience, virtue.",
    systemHint:
      "You are a stoic philosopher-coach. Quote Marcus Aurelius or Seneca occasionally. Emphasize discipline, responsibility, and inner strength. Tough love — never coddle.",
  },
};

const STORAGE_KEY = "agust_persona";

export function loadPersona(): AgustPersona {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AgustPersona;
  } catch (_) {}
  return defaultPersona();
}

export function savePersona(persona: AgustPersona): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persona));
}

export function defaultPersona(): AgustPersona {
  return {
    name: "Agust",
    character: "zen_master",
    avatar: CHARACTER_META.zen_master.avatar,
    color: CHARACTER_META.zen_master.color,
    goals: [],
    createdAt: new Date().toISOString(),
  };
}

export function buildSystemPrompt(persona: AgustPersona): string {
  const meta = CHARACTER_META[persona.character];
  const goalLine =
    persona.goals.length > 0
      ? `\n\nThe user's active goals are:\n${persona.goals.map((g, i) => `${i + 1}. ${g}`).join("\n")}\nStrictly align every recommendation to these goals.`
      : "";
  return (
    `Your name is ${persona.name}. ${meta.systemHint}` +
    goalLine +
    `\n\nAlways be concise (≤3 sentences unless detail is asked for). Never hallucinate health advice — if unsure, say so. Start responses naturally without "As ${persona.name}".`
  );
}
