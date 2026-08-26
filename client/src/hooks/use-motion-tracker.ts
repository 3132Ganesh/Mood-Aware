/**
 * use-motion-tracker.ts
 * Requests DeviceMotion permission, runs step detection, tracks inactivity
 * for sleep inference, and syncs daily summary to server every 5 minutes.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  processSample,
  getStepCount,
  getDailySummary,
  isStationary,
  resetDailyCounters,
  DailyMotionSummary,
} from "@/lib/motion-processor";

export type MotionPermission = "unknown" | "granted" | "denied" | "unavailable";

const SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const SLEEP_INACTIVITY_MS = 45 * 60 * 1000; // 45 min
const SLEEP_HOUR_START = 21; // 9 PM

export function useMotionTracker() {
  const [permission, setPermission] = useState<MotionPermission>("unknown");
  const [steps, setSteps] = useState(0);
  const [summary, setSummary] = useState<DailyMotionSummary | null>(null);
  const [inferredSleepStart, setInferredSleepStart] = useState<string | null>(null);
  const lastSyncRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  const todayStr = () => new Date().toISOString().split("T")[0];

  // DeviceMotion listener
  const handleMotion = useCallback((e: DeviceMotionEvent) => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    processSample(acc.x ?? 0, acc.y ?? 0, acc.z ?? 0);
  }, []);

  // Request permission (iOS 13+ requires user gesture)
  const requestPermission = useCallback(async () => {
    if (typeof DeviceMotionEvent === "undefined") {
      setPermission("unavailable");
      return;
    }
    // iOS 13+ requires explicit permission
    if (typeof (DeviceMotionEvent as any).requestPermission === "function") {
      try {
        const result = await (DeviceMotionEvent as any).requestPermission();
        if (result === "granted") {
          setPermission("granted");
          window.addEventListener("devicemotion", handleMotion);
        } else {
          setPermission("denied");
        }
      } catch {
        setPermission("denied");
      }
    } else {
      // Android / desktop — no explicit permission needed
      setPermission("granted");
      window.addEventListener("devicemotion", handleMotion);
    }
  }, [handleMotion]);

  // Polling loop: update steps display + check sleep inference
  useEffect(() => {
    if (permission !== "granted") return;

    const interval = setInterval(() => {
      const s = getStepCount();
      setSteps(s);

      // Sleep inference: if after 9 PM and stationary for 45 min
      const hour = new Date().getHours();
      if (hour >= SLEEP_HOUR_START && isStationary(SLEEP_INACTIVITY_MS) && !inferredSleepStart) {
        const sleepTime = new Date(Date.now() - SLEEP_INACTIVITY_MS).toISOString();
        setInferredSleepStart(sleepTime);
      }

      // Server sync every 5 minutes
      const now = Date.now();
      if (now - lastSyncRef.current >= SYNC_INTERVAL_MS) {
        lastSyncRef.current = now;
        const daily = getDailySummary(todayStr());
        setSummary(daily);
        // Fire-and-forget server sync
        syncToServer(daily);
      }
    }, 2000); // poll every 2s

    return () => clearInterval(interval);
  }, [permission, inferredSleepStart]);

  // Reset counters at midnight
  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(() => {
      resetDailyCounters();
      setSteps(0);
      setSummary(null);
      setInferredSleepStart(null);
    }, msUntilMidnight);
    return () => clearTimeout(timer);
  }, []);

  return {
    permission,
    steps,
    summary,
    inferredSleepStart,
    requestPermission,
    getSummaryNow: () => getDailySummary(todayStr()),
  };
}

async function syncToServer(summary: DailyMotionSummary): Promise<void> {
  try {
    await fetch("/api/agust/motion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(summary),
      credentials: "include",
    });
  } catch (_) {
    // Silently fail — next sync will retry
  }
}
