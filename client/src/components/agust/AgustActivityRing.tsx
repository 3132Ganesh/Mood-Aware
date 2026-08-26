/**
 * AgustActivityRing.tsx
 * Steps + activity ring widget. Uses useMotionTracker hook.
 * Additive — placed inside Dashboard as a new card.
 */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Footprints, Timer, Zap } from "lucide-react";
import { useMotionTracker } from "@/hooks/use-motion-tracker";
import { cn } from "@/lib/utils";

const DAILY_STEP_GOAL = 8000;

function RingSegment({ progress, color, size = 80, strokeWidth = 8 }: { progress: number; color: string; size?: number; strokeWidth?: number }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(progress, 1);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth={strokeWidth} className="text-muted/30" />
      <motion.circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        initial={{ strokeDasharray: `0 ${circ}` }}
        animate={{ strokeDasharray: `${dash} ${circ}` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </svg>
  );
}

export function AgustActivityRing() {
  const { steps, permission, requestPermission, summary } = useMotionTracker();
  const progress = steps / DAILY_STEP_GOAL;
  const pct = Math.min(Math.round(progress * 100), 100);

  return (
    <div className="p-4 rounded-3xl bg-muted/20 border border-border/60 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Footprints className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold text-foreground">Activity Today</span>
        </div>
        {permission !== "granted" && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={requestPermission}
            className="text-[10px] font-semibold text-primary border border-primary/30 px-2 py-1 rounded-lg hover:bg-primary/5"
          >
            Enable Tracking
          </motion.button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Ring */}
        <div className="relative flex-shrink-0">
          <RingSegment progress={progress} color="#10b981" size={72} strokeWidth={7} />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-extrabold text-foreground">{pct}%</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-2xl font-extrabold text-foreground leading-none">{steps.toLocaleString()}</p>
            <p className="text-[10px] text-muted-foreground">of {DAILY_STEP_GOAL.toLocaleString()} steps goal</p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <Timer className="w-3 h-3 text-blue-500" />
              <span className="text-[11px] text-muted-foreground">{summary?.activeMinutes ?? 0}m active</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-amber-500" />
              <span className="text-[11px] text-muted-foreground">{summary?.sedentaryMinutes ?? 0}m sedentary</span>
            </div>
          </div>
        </div>
      </div>

      {permission === "unavailable" && (
        <p className="text-[10px] text-muted-foreground text-center">Motion tracking unavailable on this device</p>
      )}
    </div>
  );
}
