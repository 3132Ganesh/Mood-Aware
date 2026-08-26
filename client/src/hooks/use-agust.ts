/**
 * use-agust.ts
 * Central Agust state hook — persona, goals, and reactive updates.
 */
import { useState, useEffect, useCallback } from "react";
import {
  loadPersona,
  savePersona,
  defaultPersona,
  AgustPersona,
  AgustCharacter,
  CHARACTER_META,
} from "@/lib/agust-engine";

export function useAgust() {
  const [persona, setPersonaState] = useState<AgustPersona>(loadPersona);

  // Persist whenever persona changes
  useEffect(() => {
    savePersona(persona);
  }, [persona]);

  const setName = useCallback((name: string) => {
    setPersonaState((p) => ({ ...p, name: name.trim() || "Agust" }));
  }, []);

  const setCharacter = useCallback((character: AgustCharacter) => {
    const meta = CHARACTER_META[character];
    setPersonaState((p) => ({
      ...p,
      character,
      avatar: meta.avatar,
      color: meta.color,
    }));
  }, []);

  const addGoal = useCallback((goal: string) => {
    setPersonaState((p) => {
      if (p.goals.length >= 5) return p; // max 5 goals
      return { ...p, goals: [...p.goals, goal.trim()] };
    });
  }, []);

  const removeGoal = useCallback((index: number) => {
    setPersonaState((p) => ({
      ...p,
      goals: p.goals.filter((_, i) => i !== index),
    }));
  }, []);

  const updateGoal = useCallback((index: number, value: string) => {
    setPersonaState((p) => {
      const goals = [...p.goals];
      goals[index] = value.trim();
      return { ...p, goals };
    });
  }, []);

  const resetPersona = useCallback(() => {
    setPersonaState(defaultPersona());
  }, []);

  const meta = CHARACTER_META[persona.character];

  return {
    persona,
    meta,
    setName,
    setCharacter,
    addGoal,
    removeGoal,
    updateGoal,
    resetPersona,
  };
}
