/**
 * AgustPersonaSelector.tsx
 * Character & name selector for Agust. Additive — renders inside Profile or Onboarding.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Pencil, Plus, X, Target } from "lucide-react";
import { useAgust } from "@/hooks/use-agust";
import { CHARACTER_META, AgustCharacter } from "@/lib/agust-engine";
import { cn } from "@/lib/utils";

export function AgustPersonaSelector() {
  const { persona, meta, setName, setCharacter, addGoal, removeGoal } = useAgust();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(persona.name);
  const [goalInput, setGoalInput] = useState("");

  const characters = Object.entries(CHARACTER_META) as [AgustCharacter, typeof CHARACTER_META[AgustCharacter]][];

  return (
    <div className="space-y-5">
      {/* AI Name */}
      <div className="p-4 rounded-3xl bg-muted/30 border border-border/60 space-y-3">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">Your AI Companion Name</p>
        {editingName ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setName(nameInput); setEditingName(false); } }}
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-card text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
              maxLength={20}
              placeholder="Name your AI..."
            />
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setName(nameInput); setEditingName(false); }} className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold">
              <Check className="w-4 h-4" />
            </motion.button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setEditingName(false)} className="px-3 py-2 rounded-xl border border-border text-xs">
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-xl", meta.color)}>
              {persona.avatar}
            </div>
            <div>
              <p className="text-base font-extrabold text-foreground">{persona.name}</p>
              <p className="text-xs text-muted-foreground">{meta.tagline}</p>
            </div>
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => { setNameInput(persona.name); setEditingName(true); }} className="ml-auto p-2 rounded-xl hover:bg-muted">
              <Pencil className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Character Picker */}
      <div className="p-4 rounded-3xl bg-muted/30 border border-border/60 space-y-3">
        <p className="text-xs font-bold text-foreground uppercase tracking-wider">AI Character</p>
        <div className="grid grid-cols-1 gap-2">
          {characters.map(([key, cfg]) => (
            <motion.button
              key={key}
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={() => setCharacter(key)}
              className={cn(
                "flex items-center gap-3 p-3 rounded-2xl border transition-all text-left",
                persona.character === key
                  ? "border-primary/60 bg-primary/5 shadow-sm"
                  : "border-border/50 hover:border-border hover:bg-muted/30"
              )}
            >
              <div className={cn("w-9 h-9 rounded-xl bg-gradient-to-tr flex items-center justify-center text-lg flex-shrink-0", cfg.color)}>
                {cfg.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-foreground">{cfg.label}</p>
                <p className="text-xs text-muted-foreground">{cfg.tagline}</p>
              </div>
              <AnimatePresence>
                {persona.character === key && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Goals */}
      <div className="p-4 rounded-3xl bg-muted/30 border border-border/60 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-primary" /> Your Goals ({persona.goals.length}/5)
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          {persona.name} will strictly align every plan to these goals.
        </p>

        <div className="space-y-2">
          <AnimatePresence>
            {persona.goals.map((g, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12, height: 0 }} className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/50">
                <span className="w-5 h-5 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                <span className="flex-1 text-sm text-foreground truncate">{g}</span>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => removeGoal(i)} className="w-6 h-6 rounded-lg hover:bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {persona.goals.length < 5 && (
          <div className="flex gap-2">
            <input
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && goalInput.trim()) { addGoal(goalInput); setGoalInput(""); } }}
              placeholder="Add a goal (e.g. Sleep 8hrs daily)"
              className="flex-1 px-3 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              maxLength={60}
            />
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => { if (goalInput.trim()) { addGoal(goalInput); setGoalInput(""); } }}
              className="px-3 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
