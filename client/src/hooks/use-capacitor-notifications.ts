/**
 * use-capacitor-notifications.ts
 * Schedules Agust reminders natively on Android via @capacitor/local-notifications.
 * Web-safe: uses dynamic import bypass and falls back seamlessly to Web Notification API in browser.
 */
import { useCallback, useEffect, useRef } from "react";
import { loadPersona } from "@/lib/agust-engine";
import { loadSettings } from "@/lib/notification-scheduler";

function isNativePlatform(): boolean {
  try {
    return !!(window as any)?.Capacitor?.isNativePlatform?.();
  } catch {
    return false;
  }
}

async function getLocalNotificationsPlugin() {
  if (!isNativePlatform()) return null;
  try {
    const globalPlugins = (window as any)?.Capacitor?.Plugins;
    if (globalPlugins?.LocalNotifications) return globalPlugins.LocalNotifications;
    const importFn = new Function("mod", "return import(mod)");
    const mod = await importFn("@capacitor/local-notifications");
    return mod?.LocalNotifications ?? null;
  } catch {
    return null;
  }
}

const NOTIF_IDS = {
  WATER:          1001,
  MORNING_BRIEF:  1002,
  EVENING_RECAP:  1003,
  ACTIVITY_NUDGE: 1004,
};

function minutesUntil(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return Math.round((target.getTime() - now.getTime()) / 60_000);
}

async function scheduleNative() {
  if (!isNativePlatform()) return;
  try {
    const LocalNotifications = await getLocalNotificationsPlugin();
    if (!LocalNotifications) return;

    const persona = loadPersona();
    const settings = loadSettings();
    const now = Date.now();
    const pending: any[] = [];

    if (settings.waterEnabled) {
      pending.push({
        id: NOTIF_IDS.WATER,
        title: `💧 ${persona.name}: Time to hydrate!`,
        body: "Drink a glass of water to stay sharp and energized.",
        schedule: { repeats: true, every: "hour", count: settings.waterIntervalHours },
        channelId: "agust-water",
        iconColor: "#3B82F6",
      });
    }

    const morningMins = minutesUntil(settings.morningBriefTime);
    pending.push({
      id: NOTIF_IDS.MORNING_BRIEF,
      title: `🌅 Good morning! ${persona.name} has your day ready.`,
      body: "Tap to see your personalized plan for today.",
      schedule: { at: new Date(now + morningMins * 60_000), repeats: true, every: "day" },
      channelId: "agust-daily",
      iconColor: "#F59E0B",
    });

    const eveningMins = minutesUntil(settings.eveningRecapTime);
    pending.push({
      id: NOTIF_IDS.EVENING_RECAP,
      title: `🌙 ${persona.name}'s Evening Recap`,
      body: "How did your day go? Log your mood before sleep.",
      schedule: { at: new Date(now + eveningMins * 60_000), repeats: true, every: "day" },
      channelId: "agust-daily",
      iconColor: "#6366F1",
    });

    if (settings.activityNudge) {
      pending.push({
        id: NOTIF_IDS.ACTIVITY_NUDGE,
        title: `🏃 ${persona.name}: Move a little!`,
        body: "You've been still too long. A 5-min walk resets your energy.",
        schedule: { repeats: true, every: "hour", count: 2 },
        channelId: "agust-activity",
        iconColor: "#10B981",
      });
    }

    await LocalNotifications.cancel({
      notifications: Object.values(NOTIF_IDS).map((id) => ({ id })),
    });
    await LocalNotifications.schedule({ notifications: pending });
  } catch (e) {
    console.warn("[CapNotif] schedule error:", e);
  }
}

export function useCapacitorNotifications() {
  const scheduledRef = useRef(false);

  useEffect(() => {
    if (scheduledRef.current) return;
    scheduledRef.current = true;
    scheduleNative();
  }, []);

  const reschedule = useCallback(() => {
    scheduledRef.current = false;
    scheduleNative();
  }, []);

  const fireNow = useCallback(async (title: string, body: string) => {
    if (!isNativePlatform()) {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
      }
      return;
    }
    try {
      const LocalNotifications = await getLocalNotificationsPlugin();
      if (!LocalNotifications) return;
      await LocalNotifications.schedule({
        notifications: [{
          id: Math.floor(Math.random() * 90_000) + 10_000,
          title,
          body,
          schedule: { at: new Date(Date.now() + 500) },
          channelId: "agust-general",
          iconColor: "#7C3AED",
        }],
      });
    } catch (_) {}
  }, []);

  return { reschedule, fireNow };
}
