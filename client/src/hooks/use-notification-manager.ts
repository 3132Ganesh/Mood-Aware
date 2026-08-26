/**
 * use-notification-manager.ts
 * Manages Web Push permission, schedules timed Agust notifications,
 * and exposes the in-app notification history for AgustNotificationCenter.
 */
import { useState, useEffect, useCallback, useRef } from "react";
import {
  loadHistory,
  loadSettings,
  saveSettings,
  markRead,
  markAllRead,
  clearHistory,
  unreadCount,
  waterReminderNotif,
  activityNudgeNotif,
  morningBriefNotif,
  eveningRecapNotif,
  sleepReminderNotif,
  AgustNotification,
  NotificationSettings,
} from "@/lib/notification-scheduler";
import { loadPersona } from "@/lib/agust-engine";

export type PushPermission = "default" | "granted" | "denied";

const TICK_INTERVAL_MS = 60_000; // check every 1 minute

export function useNotificationManager() {
  const [permission, setPermission] = useState<PushPermission>(
    () => (("Notification" in window ? Notification.permission : "default") as PushPermission)
  );
  const [settings, setSettingsState] = useState<NotificationSettings>(loadSettings);
  const [notifications, setNotifications] = useState<AgustNotification[]>(loadHistory);
  const [unread, setUnread] = useState<number>(unreadCount);

  // Last water reminder time ref
  const lastWaterRef = useRef<number>(Date.now() - 60_000); // allow first one quickly
  const lastActivityNudgeRef = useRef<number>(Date.now());
  const morningSentRef = useRef<string>("");
  const eveningSentRef = useRef<string>("");
  const sleepSentRef = useRef<string>("");

  // Re-read history when a notification fires
  useEffect(() => {
    const handler = () => {
      setNotifications(loadHistory());
      setUnread(unreadCount());
    };
    window.addEventListener("agust_notification", handler);
    return () => window.removeEventListener("agust_notification", handler);
  }, []);

  // Request Web Push permission
  const requestPushPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as PushPermission);
  }, []);

  // Update settings
  const updateSettings = useCallback((partial: Partial<NotificationSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...partial };
      saveSettings(next);
      return next;
    });
  }, []);

  // Mark single read
  const dismiss = useCallback((id: string) => {
    markRead(id);
    setNotifications(loadHistory());
    setUnread(unreadCount());
  }, []);

  const dismissAll = useCallback(() => {
    markAllRead();
    setNotifications(loadHistory());
    setUnread(0);
  }, []);

  const clearAll = useCallback(() => {
    clearHistory();
    setNotifications([]);
    setUnread(0);
  }, []);

  // ---- Scheduling tick ----
  useEffect(() => {
    const tick = () => {
      const now = Date.now();
      const persona = loadPersona();
      const currentSettings = loadSettings();
      const timeStr = new Date().toTimeString().slice(0, 5); // "HH:MM"
      const todayKey = new Date().toISOString().split("T")[0];

      // Water reminder
      if (currentSettings.waterEnabled) {
        const intervalMs = currentSettings.waterIntervalHours * 3600_000;
        if (now - lastWaterRef.current >= intervalMs) {
          lastWaterRef.current = now;
          waterReminderNotif();
        }
      }

      // Activity nudge (if no motion for 2h — approximated by sedentary time)
      if (currentSettings.activityNudge) {
        if (now - lastActivityNudgeRef.current >= 2 * 3600_000) {
          lastActivityNudgeRef.current = now;
          activityNudgeNotif();
        }
      }

      // Morning brief (once per day at configured time)
      if (
        currentSettings.morningBriefTime === timeStr &&
        morningSentRef.current !== todayKey
      ) {
        morningSentRef.current = todayKey;
        morningBriefNotif(persona.name, 3); // task count placeholder — real count injected from Planner
      }

      // Evening recap
      if (
        currentSettings.eveningRecapTime === timeStr &&
        eveningSentRef.current !== todayKey
      ) {
        eveningSentRef.current = todayKey;
        eveningRecapNotif(persona.name, 2, 3); // placeholders
      }

      // Sleep reminder (30 min before profile sleep time if set)
      const profileSleepTime = localStorage.getItem("agust_sleep_target");
      if (profileSleepTime && sleepSentRef.current !== todayKey) {
        const [sh, sm] = profileSleepTime.split(":").map(Number);
        const sleepMs = sh * 3600_000 + sm * 60_000;
        const now30 = new Date();
        const nowMs = now30.getHours() * 3600_000 + now30.getMinutes() * 60_000;
        if (Math.abs(nowMs - (sleepMs - 30 * 60_000)) < 60_000) {
          sleepSentRef.current = todayKey;
          sleepReminderNotif(persona.name, profileSleepTime);
        }
      }
    };

    const interval = setInterval(tick, TICK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return {
    permission,
    settings,
    notifications,
    unread,
    requestPushPermission,
    updateSettings,
    dismiss,
    dismissAll,
    clearAll,
  };
}
