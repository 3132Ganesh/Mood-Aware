/**
 * notification-scheduler.ts
 * Smart in-app + Web Push notification scheduler for Agust.
 * Handles water reminders, task nudges, activity alerts, and AI briefings.
 */

export type NotificationType =
  | "water"
  | "task"
  | "activity_nudge"
  | "morning_brief"
  | "evening_recap"
  | "goal_checkin"
  | "sleep_reminder"
  | "agust_message";

export interface AgustNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;       // emoji
  timestamp: number;   // ms
  read: boolean;
  actionLabel?: string;
  actionRoute?: string;
}

export interface NotificationSettings {
  waterEnabled: boolean;
  waterIntervalHours: number;  // default 2
  taskReminders: boolean;
  activityNudge: boolean;
  morningBriefTime: string;    // "HH:MM"
  eveningRecapTime: string;    // "HH:MM"
  goalCheckin: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  waterEnabled: true,
  waterIntervalHours: 2,
  taskReminders: true,
  activityNudge: true,
  morningBriefTime: "07:00",
  eveningRecapTime: "21:00",
  goalCheckin: true,
};

const SETTINGS_KEY = "agust_notification_settings";
const HISTORY_KEY = "agust_notifications";

export function loadSettings(): NotificationSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (_) {}
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(s: NotificationSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function loadHistory(): AgustNotification[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw) as AgustNotification[];
  } catch (_) {}
  return [];
}

function saveHistory(notifs: AgustNotification[]): void {
  // Keep last 50
  const trimmed = notifs.slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
}

export function pushNotification(notif: Omit<AgustNotification, "id" | "timestamp" | "read">): AgustNotification {
  const full: AgustNotification = {
    ...notif,
    id: `agust_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    read: false,
  };
  const history = loadHistory();
  history.unshift(full);
  saveHistory(history);

  // Fire Web Push if permission granted
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(`${full.icon ?? "🤖"} ${full.title}`, {
        body: full.body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: full.type,
        requireInteraction: full.type === "morning_brief" || full.type === "evening_recap",
      });
    } catch (_) {}
  }

  // Dispatch custom DOM event so AgustNotificationCenter can react
  window.dispatchEvent(new CustomEvent("agust_notification", { detail: full }));
  return full;
}

export function markRead(id: string): void {
  const history = loadHistory();
  const idx = history.findIndex((n) => n.id === id);
  if (idx !== -1) {
    history[idx] = { ...history[idx], read: true };
    saveHistory(history);
  }
}

export function markAllRead(): void {
  const history = loadHistory().map((n) => ({ ...n, read: true }));
  saveHistory(history);
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function unreadCount(): number {
  return loadHistory().filter((n) => !n.read).length;
}

// ---- Built-in notification templates ----

export function waterReminderNotif(): AgustNotification {
  return pushNotification({
    type: "water",
    icon: "💧",
    title: "Time to hydrate!",
    body: "You haven't had water recently. Drink a glass now to stay sharp.",
    actionLabel: "Log Water",
    actionRoute: "/dashboard",
  });
}

export function activityNudgeNotif(): AgustNotification {
  return pushNotification({
    type: "activity_nudge",
    icon: "🏃",
    title: "Move a little!",
    body: "You've been still for 2+ hours. A 5-minute walk resets your energy.",
    actionLabel: "Start Walk",
    actionRoute: "/checkin",
  });
}

export function morningBriefNotif(agustName: string, taskCount: number): AgustNotification {
  return pushNotification({
    type: "morning_brief",
    icon: "🌅",
    title: `Good morning! ${agustName} has your day ready.`,
    body: `${taskCount} task${taskCount !== 1 ? "s" : ""} planned for today. Let's make it count!`,
    actionLabel: "View Plan",
    actionRoute: "/planner",
  });
}

export function eveningRecapNotif(agustName: string, completedTasks: number, totalTasks: number): AgustNotification {
  const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  return pushNotification({
    type: "evening_recap",
    icon: "🌙",
    title: `${agustName}'s Evening Recap`,
    body: `You completed ${completedTasks}/${totalTasks} tasks today (${pct}%). Check in on your mood before sleep.`,
    actionLabel: "Check In",
    actionRoute: "/checkin",
  });
}

export function goalCheckinNotif(agustName: string, goalTitle: string): AgustNotification {
  return pushNotification({
    type: "goal_checkin",
    icon: "🎯",
    title: `${agustName}: Goal Check-in`,
    body: `How's your "${goalTitle}" progress today? Log it to keep ${agustName} on track.`,
    actionLabel: "Update Goal",
    actionRoute: "/goals",
  });
}

export function sleepReminderNotif(agustName: string, targetTime: string): AgustNotification {
  return pushNotification({
    type: "sleep_reminder",
    icon: "😴",
    title: `${agustName}: Wind-down time`,
    body: `Your target sleep time is ${targetTime}. Start winding down — put the screen away.`,
    actionLabel: "Start Wind-down",
    actionRoute: "/breathing",
  });
}
