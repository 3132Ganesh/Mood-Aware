/**
 * AgustOrb.tsx
 * Floating animated AI avatar orb — lives globally in App.tsx.
 * UI-SAFE: fixed position overlay, doesn't affect page layout.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { loadPersona, CHARACTER_META } from "@/lib/agust-engine";
import { unreadCount } from "@/lib/notification-scheduler";
import { cn } from "@/lib/utils";

interface AgustOrbProps {
  onClick?: () => void;
  compact?: boolean;
}

export function AgustOrb({ onClick, compact = false }: AgustOrbProps) {
  const [persona, setPersona] = useState(loadPersona);
  const [unread, setUnread] = useState(unreadCount);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPersona(loadPersona());
      setUnread(unreadCount());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = () => {
      setPulse(true);
      setTimeout(() => setPulse(false), 2000);
    };
    window.addEventListener("agust_notification", handler);
    return () => window.removeEventListener("agust_notification", handler);
  }, []);

  const meta = CHARACTER_META[persona.character];

  if (compact) {
    return (
      <motion.button type="button" whileHover={{ scale: 1.12 }} whileTap={{ scale: 0.88 }} onClick={onClick} id="agust-orb-compact" className="relative flex flex-col items-center gap-0.5">
        <div className={cn("w-7 h-7 rounded-xl bg-gradient-to-tr flex items-center justify-center text-sm shadow-sm", meta.color)}>
          {persona.avatar}
        </div>
        {unread > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{unread > 9 ? "9+" : unread}</span>}
        <span className="text-[9px] font-semibold text-muted-foreground truncate max-w-[40px]">{persona.name}</span>
      </motion.button>
    );
  }

  return (
    <motion.button type="button" id="agust-orb-float" whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={onClick} className="relative">
      <AnimatePresence>
        {pulse && [0, 1].map((i) => (
          <motion.span key={i} className={cn("absolute inset-0 rounded-2xl bg-gradient-to-tr opacity-40", meta.color)} initial={{ scale: 1, opacity: 0.4 }} animate={{ scale: 2.2 + i * 0.5, opacity: 0 }} exit={{}} transition={{ duration: 0.8 + i * 0.3 }} />
        ))}
      </AnimatePresence>
      <motion.div animate={{ boxShadow: pulse ? "0 0 24px 8px rgba(99,102,241,0.35)" : "0 4px 20px rgba(0,0,0,0.15)" }} className={cn("w-10 h-10 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-lg shadow-lg", meta.color)}>
        <motion.span animate={{ rotate: pulse ? [0, -15, 15, 0] : 0 }} transition={{ duration: 0.5 }}>{persona.avatar}</motion.span>
      </motion.div>
      <AnimatePresence>
        {unread > 0 && (
          <motion.span key="badge" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md z-10">
            {unread > 9 ? "9+" : unread}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
