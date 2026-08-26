/**
 * use-capacitor-motion.ts
 * Native step/motion tracking using @capacitor/motion on Android.
 * Web-safe: uses dynamic import bypass and falls back seamlessly in browser mode.
 */
import { useState, useEffect, useCallback } from "react";
import { processSample, getStepCount, getDailySummary } from "@/lib/motion-processor";

function isNativePlatform(): boolean {
  try {
    return !!(window as any)?.Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

async function getMotionPlugin() {
  if (!isNativePlatform()) return null;
  try {
    const globalPlugins = (window as any)?.Capacitor?.Plugins;
    if (globalPlugins?.Motion) return globalPlugins.Motion;
    const importFn = new Function("mod", "return import(mod)");
    const mod = await importFn("@capacitor/motion");
    return mod?.Motion ?? null;
  } catch {
    return null;
  }
}

export function useCapacitorMotion() {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);

  const startTracking = useCallback(async () => {
    if (!isNativePlatform()) return;

    try {
      const Motion = await getMotionPlugin();
      if (!Motion) return;

      await Motion.addListener("accel", (event: any) => {
        const { x = 0, y = 0, z = 0 } = event.acceleration ?? {};
        processSample(x, y, z);
      });
      setIsTracking(true);

      const poll = setInterval(() => {
        setSteps(getStepCount());
      }, 2000);

      return () => {
        clearInterval(poll);
        Motion.removeAllListeners?.().catch(() => {});
      };
    } catch (e) {
      console.warn("[CapMotion]", e);
    }
  }, []);

  useEffect(() => {
    const cleanup = startTracking();
    return () => {
      cleanup?.then?.((fn: any) => fn?.());
    };
  }, [startTracking]);

  const today = new Date().toISOString().split("T")[0];

  return {
    steps,
    isTracking,
    getSummaryNow: () => getDailySummary(today),
  };
}
