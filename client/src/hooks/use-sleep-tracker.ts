import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertSleepSession } from "@shared/routes";
import { type SleepSession } from "@shared/schema";
import { useProfile } from "@/hooks/use-auth";
import { format, differenceInMinutes, isAfter } from "date-fns";

const STORAGE_LAST_ACTIVE = "moodaware_last_active_ts";
const STORAGE_NIGHT_USE = "moodaware_night_use_ts";
const STORAGE_MORNING_PICKUP = "moodaware_morning_pickup_ts";
const STORAGE_RECORDED_DATE = "moodaware_sleep_recorded_date";

export interface SleepTelemetrySession {
  id?: number;
  date: string;
  lastDeviceUse: Date;
  firstDevicePickup: Date;
  durationMinutes: number;
  alignmentScore: number;
  isConfirmed: boolean;
  notes?: string | null;
}

export function useSleepTracker() {
  const queryClient = useQueryClient();
  const { profile } = useProfile();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const [localDetected, setLocalDetected] = useState<SleepTelemetrySession | null>(null);

  // 1. Fetch today's saved sleep session from backend
  const todaySessionQuery = useQuery<SleepSession | null>({
    queryKey: [api.sleep.today.path, todayStr],
    queryFn: async () => {
      const res = await fetch(`${api.sleep.today.path}?date=${todayStr}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });

  // 2. Fetch 30-day sleep history for analytics
  const historyQuery = useQuery<SleepSession[]>({
    queryKey: [api.sleep.history.path],
    queryFn: async () => {
      const res = await fetch(api.sleep.history.path, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // 3. Mutation to log or update sleep session
  const logSessionMutation = useMutation({
    mutationFn: async (data: InsertSleepSession) => {
      const res = await fetch(api.sleep.logSession.path, {
        method: api.sleep.logSession.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save sleep session");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.sleep.today.path] });
      queryClient.invalidateQueries({ queryKey: [api.sleep.history.path] });
    },
  });

  // 4. Circadian Alignment Calculator
  const calculateAlignment = (actualBedtime: Date, actualWakeTime: Date): number => {
    const targetBedStr = profile?.sleepTime || "23:00";
    const targetWakeStr = profile?.wakeTime || "07:00";

    const [tBedH, tBedM] = targetBedStr.split(":").map(Number);
    const [tWakeH, tWakeM] = targetWakeStr.split(":").map(Number);

    const actualBedH = actualBedtime.getHours() + actualBedtime.getMinutes() / 60;
    const actualWakeH = actualWakeTime.getHours() + actualWakeTime.getMinutes() / 60;

    const bedDiff = Math.abs((actualBedH - tBedH + 24) % 24);
    const wakeDiff = Math.abs(actualWakeH - tWakeH);

    const bedScore = Math.max(0, 100 - bedDiff * 20);
    const wakeScore = Math.max(0, 100 - wakeDiff * 20);

    return Math.round((bedScore + wakeScore) / 2);
  };

  // 5. Passive Telemetry Engine (Visibility, Focus, Touch Listeners)
  useEffect(() => {
    const recordTelemetry = () => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentTimestamp = now.getTime();

      // Save continuous active timestamp
      localStorage.setItem(STORAGE_LAST_ACTIVE, currentTimestamp.toString());

      // NIGHT PHASE: 8:00 PM (20) to 4:00 AM (4)
      if (currentHour >= 20 || currentHour < 4) {
        localStorage.setItem(STORAGE_NIGHT_USE, currentTimestamp.toString());
      }

      // MORNING PHASE: 4:00 AM to 12:00 PM (Noon)
      if (currentHour >= 4 && currentHour <= 12) {
        const recordedDate = localStorage.getItem(STORAGE_RECORDED_DATE);
        
        // If not yet recorded for today, capture first morning pickup!
        if (recordedDate !== todayStr) {
          localStorage.setItem(STORAGE_MORNING_PICKUP, currentTimestamp.toString());
          localStorage.setItem(STORAGE_RECORDED_DATE, todayStr);
        }
      }

      // Check if we have both night use and morning pickup to calculate sleep
      evaluateSleepWindow();
    };

    const evaluateSleepWindow = () => {
      const nightUseStr = localStorage.getItem(STORAGE_NIGHT_USE);
      const morningPickupStr = localStorage.getItem(STORAGE_MORNING_PICKUP);

      if (nightUseStr && morningPickupStr) {
        const lastNightDate = new Date(parseInt(nightUseStr, 10));
        const firstPickupDate = new Date(parseInt(morningPickupStr, 10));

        // Only compute if pickup is after last night use
        if (isAfter(firstPickupDate, lastNightDate)) {
          const diffMinutes = differenceInMinutes(firstPickupDate, lastNightDate);

          // Reasonable sleep window: 2 hrs (120 mins) to 16 hrs (960 mins)
          if (diffMinutes >= 120 && diffMinutes <= 960) {
            const alignment = calculateAlignment(lastNightDate, firstPickupDate);
            setLocalDetected({
              date: todayStr,
              lastDeviceUse: lastNightDate,
              firstDevicePickup: firstPickupDate,
              durationMinutes: diffMinutes,
              alignmentScore: alignment,
              isConfirmed: false,
            });

            // Auto-sync if not yet saved on backend
            if (!todaySessionQuery.data && !todaySessionQuery.isLoading && !logSessionMutation.isPending) {
              logSessionMutation.mutate({
                date: todayStr,
                lastDeviceUse: lastNightDate,
                firstDevicePickup: firstPickupDate,
                durationMinutes: diffMinutes,
                alignmentScore: alignment,
                isConfirmed: false,
              });
            }
            return;
          }
        }
      }

      // Default baseline fallback if user is using app for the first time
      if (!localDetected && !todaySessionQuery.data) {
        const defaultBed = new Date();
        defaultBed.setDate(defaultBed.getDate() - 1);
        const [bedH, bedM] = (profile?.sleepTime || "23:00").split(":").map(Number);
        defaultBed.setHours(bedH || 23, bedM || 0, 0, 0);

        const defaultWake = new Date();
        const [wakeH, wakeM] = (profile?.wakeTime || "07:00").split(":").map(Number);
        defaultWake.setHours(wakeH || 7, wakeM || 0, 0, 0);

        const diffMinutes = differenceInMinutes(defaultWake, defaultBed);
        const alignment = calculateAlignment(defaultBed, defaultWake);

        setLocalDetected({
          date: todayStr,
          lastDeviceUse: defaultBed,
          firstDevicePickup: defaultWake,
          durationMinutes: diffMinutes,
          alignmentScore: alignment,
          isConfirmed: false,
        });
      }
    };

    // Run initial evaluation
    recordTelemetry();

    // Event listeners
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        recordTelemetry();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", recordTelemetry);
    window.addEventListener("pointerdown", recordTelemetry, { passive: true });
    window.addEventListener("touchstart", recordTelemetry, { passive: true });

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", recordTelemetry);
      window.removeEventListener("pointerdown", recordTelemetry);
      window.removeEventListener("touchstart", recordTelemetry);
    };
  }, [profile?.sleepTime, profile?.wakeTime, todayStr, todaySessionQuery.data]);

  // Active session prioritizes backend confirmed session, then local detected
  const activeSession: SleepTelemetrySession | null = todaySessionQuery.data
    ? {
        id: todaySessionQuery.data.id,
        date: todaySessionQuery.data.date,
        lastDeviceUse: new Date(todaySessionQuery.data.lastDeviceUse),
        firstDevicePickup: new Date(todaySessionQuery.data.firstDevicePickup),
        durationMinutes: todaySessionQuery.data.durationMinutes,
        alignmentScore: todaySessionQuery.data.alignmentScore ?? 92,
        isConfirmed: Boolean(todaySessionQuery.data.isConfirmed),
        notes: todaySessionQuery.data.notes,
      }
    : localDetected;

  const confirmSleep = (customData?: Partial<InsertSleepSession>) => {
    if (!activeSession) return;

    const dataToSave: InsertSleepSession = {
      date: todayStr,
      lastDeviceUse: customData?.lastDeviceUse ? new Date(customData.lastDeviceUse) : activeSession.lastDeviceUse,
      firstDevicePickup: customData?.firstDevicePickup ? new Date(customData.firstDevicePickup) : activeSession.firstDevicePickup,
      durationMinutes: customData?.durationMinutes ?? activeSession.durationMinutes,
      alignmentScore: customData?.alignmentScore ?? activeSession.alignmentScore,
      isConfirmed: true,
      notes: customData?.notes ?? activeSession.notes,
    };

    logSessionMutation.mutate(dataToSave);
  };

  return {
    todaySession: activeSession,
    isConfirmed: Boolean(activeSession?.isConfirmed),
    history: historyQuery.data || [],
    isLoading: todaySessionQuery.isLoading || historyQuery.isLoading,
    isLogging: logSessionMutation.isPending,
    confirmSleep,
    logSession: logSessionMutation.mutate,
  };
}
