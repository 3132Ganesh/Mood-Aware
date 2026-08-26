/**
 * AgustNotificationCenter.tsx
 * Animated floating notification hub — bell icon with badge, slide-down panel,
 * ripple entry animations, toast-style popups, and per-type color coding.
 * UI-SAFE: rendered as an overlay — does NOT touch any existing page layout.
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Check, CheckCheck, Trash2, Droplets, Footprints, Sun, Moon, Target, BedDouble, Sparkles } from "lucide-react";
import { useNotificationManager } from "@/hooks/use-notification-manager";
import { AgustNotification, NotificationType } from "@/lib/notification-scheduler";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

// ------ Type-specific config ------
const TYPE_CONFIG: Record<NotificationType, { color: string; bg: string; Icon: any }> = {
  water:          { color: "text-blue-500",   bg: "bg-blue-500/10 border-blue-500/20",   Icon: Droplets },
  task:           { color: "text-amber-500",  bg: "bg-amber-500/10 border-amber-500/20", Icon: Check },
  activity_nudge: { color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20", Icon: Footprints },
  morning_brief:  { color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20", Icon: Sun },
  evening_recap:  { color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20", Icon: Moon },
  goal_checkin:   { color: "text-emerald-500",bg: "bg-emerald-500/10 border-emerald-500/20", Icon: Target },
  sleep_reminder: { color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20", Icon: BedDouble },
  agust_message:  { color: "text-pink-500",   bg: "bg-pink-500/10 border-pink-500/20",   Icon: Sparkles },
};

function timeAgo(ms: number): string {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ------ Toast Popup (auto-dismiss after 5s) ------
interface ToastProps { notif: AgustNotification; onClose: () => void }
function AgustToast({ notif, onClose }: ToastProps) {
  const cfg = TYPE_CONFIG[notif.type];
  const { Icon } = cfg;
  const [_, navigate] = useLocation();

  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -40, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={cn(
        "fixed top-4 right-4 z-[200] max-w-[320px] w-full",
        "rounded-2xl border shadow-2xl backdrop-blur-xl p-4 flex gap-3 items-start cursor-pointer",
        "bg-card/95",
        cfg.bg
      )}
      onClick={() => { if (notif.actionRoute) navigate(notif.actionRoute); onClose(); }}
    >
      {/* Animated icon */}
      <motion.div
        animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className={cn("flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center", cfg.bg)}
      >
        <Icon className={cn("w-5 h-5", cfg.color)} />
      </motion.div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground leading-tight truncate">{notif.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
        {notif.actionLabel && (
          <span className={cn("text-[11px] font-semibold mt-1 inline-block", cfg.color)}>
            {notif.actionLabel} →
          </span>
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="flex-shrink-0 w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center"
      >
        <X className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {/* Progress bar */}
      <motion.div
        className={cn("absolute bottom-0 left-0 h-1 rounded-b-2xl", cfg.color.replace("text-", "bg-"))}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 5, ease: "linear" }}
      />
    </motion.div>
  );
}

// ------ Notification Item ------
function NotifItem({ notif, onDismiss }: { notif: AgustNotification; onDismiss: (id: string) => void }) {
  const cfg = TYPE_CONFIG[notif.type];
  const { Icon } = cfg;
  const [_, navigate] = useLocation();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 30, scale: 0.9, height: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 26 }}
      className={cn(
        "flex gap-3 p-3 rounded-2xl border transition-all",
        notif.read ? "bg-muted/20 border-border/40 opacity-60" : cn("border", cfg.bg),
        "cursor-pointer hover:opacity-90"
      )}
      onClick={() => {
        onDismiss(notif.id);
        if (notif.actionRoute) navigate(notif.actionRoute);
      }}
    >
      {/* Ripple icon */}
      <div className="relative flex-shrink-0">
        <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", cfg.bg)}>
          <Icon className={cn("w-4 h-4", cfg.color)} />
        </div>
        {!notif.read && (
          <motion.span
            animate={{ scale: [1, 1.6, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={cn("absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full", cfg.color.replace("text-", "bg-"))}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground leading-tight">{notif.title}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
        <span className="text-[10px] text-muted-foreground/60 mt-1 block">{timeAgo(notif.timestamp)}</span>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(notif.id); }}
        className="flex-shrink-0 self-start w-6 h-6 rounded-full hover:bg-muted flex items-center justify-center"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>
    </motion.div>
  );
}

// ------ Main Component ------
export function AgustNotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [toasts, setToasts] = useState<AgustNotification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const { notifications, unread, dismiss, dismissAll, clearAll, requestPushPermission } =
    useNotificationManager();

  // Pop toasts on new notifications
  useEffect(() => {
    const handler = (e: Event) => {
      const notif = (e as CustomEvent<AgustNotification>).detail;
      setToasts((prev) => [notif, ...prev].slice(0, 3)); // max 3 toasts
    };
    window.addEventListener("agust_notification", handler);
    return () => window.removeEventListener("agust_notification", handler);
  }, []);

  const removeToast = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Close panel on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    setTimeout(() => document.addEventListener("mousedown", handler), 0);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <>
      {/* Toast Stack */}
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <AgustToast key={t.id} notif={t} onClose={() => removeToast(t.id)} />
        ))}
      </AnimatePresence>

      {/* Bell Button */}
      <div className="relative" ref={panelRef}>
        <motion.button
          id="agust-notification-bell"
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsOpen((o) => !o)}
          className="relative w-10 h-10 rounded-2xl bg-card/80 backdrop-blur-md border border-border/60 flex items-center justify-center shadow-sm hover:border-primary/50 hover:bg-card transition-all"
        >
          <motion.div
            animate={unread > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}}
            transition={{ repeat: unread > 0 ? Infinity : 0, repeatDelay: 4, duration: 0.6 }}
          >
            <Bell className="w-4.5 h-4.5 text-foreground" />
          </motion.div>
          <AnimatePresence>
            {unread > 0 && (
              <motion.span
                key="badge"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md"
              >
                {unread > 9 ? "9+" : unread}
                {/* Pulse ring */}
                <motion.span
                  className="absolute inset-0 rounded-full bg-red-400"
                  animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4 }}
                />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Notification Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="absolute right-0 top-12 w-[340px] max-h-[520px] bg-card/98 backdrop-blur-2xl border border-border/70 rounded-3xl shadow-2xl z-[100] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-foreground">Notifications</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {unread > 0 ? `${unread} unread` : "All caught up!"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {unread > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={dismissAll}
                      title="Mark all read"
                      className="w-7 h-7 rounded-xl hover:bg-muted flex items-center justify-center"
                    >
                      <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />
                    </motion.button>
                  )}
                  {notifications.length > 0 && (
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={clearAll}
                      title="Clear all"
                      className="w-7 h-7 rounded-xl hover:bg-destructive/10 flex items-center justify-center"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </motion.button>
                  )}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 rounded-xl hover:bg-muted flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </motion.button>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <AnimatePresence mode="popLayout">
                  {notifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col items-center justify-center py-12 text-center"
                    >
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className="text-4xl mb-3"
                      >
                        🔔
                      </motion.div>
                      <p className="text-sm font-medium text-foreground">No notifications yet</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Agust will remind you when it matters
                      </p>
                      {("Notification" in window) && Notification.permission !== "granted" && (
                        <motion.button
                          whileTap={{ scale: 0.96 }}
                          onClick={requestPushPermission}
                          className="mt-4 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                        >
                          Enable Push Notifications
                        </motion.button>
                      )}
                    </motion.div>
                  ) : (
                    notifications.map((n) => (
                      <NotifItem key={n.id} notif={n} onDismiss={dismiss} />
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="p-3 border-t border-border/40 bg-muted/10">
                  <p className="text-[10px] text-muted-foreground text-center">
                    Agust remembers so you don't have to
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
