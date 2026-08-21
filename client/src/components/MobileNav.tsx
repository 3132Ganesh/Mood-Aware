import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Calendar, BarChart2, Heart, BookHeart, Wind, 
  LogOut, User as UserIcon, Menu, X, Sparkles, Volume2, CloudRain, Waves, Bell, Settings
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { soundscape } from "@/lib/soundscape";
import { Button } from "@/components/ui/button";

export function MobileNav() {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);

  const navItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: Calendar, label: "Plan", href: "/planner" },
    { icon: Heart, label: "Check-in", href: "/checkin", isHighlight: true },
    { icon: BarChart2, label: "Insights", href: "/analytics" },
    { icon: Settings, label: "Settings", href: "/profile" },
  ];

  const drawerLinks = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "7-Day Plan", href: "/planner" },
    { icon: Heart, label: "Daily Check-in", href: "/checkin" },
    { icon: Wind, label: "Breathwork Sanctuary", href: "/breathing" },
    { icon: BookHeart, label: "Feelings & Journal", href: "/feelings" },
    { icon: BarChart2, label: "Wellness Analytics", href: "/analytics" },
    { icon: UserIcon, label: "Profile & Settings", href: "/profile" },
  ];

  const toggleSound = (sound: "rain" | "waves" | "zen") => {
    if (activeSound === sound) {
      soundscape.stop();
      setActiveSound(null);
    } else {
      soundscape.play(sound);
      setActiveSound(sound);
    }
  };

  return (
    <>
      {/* Mobile Top Header with Interactive Slide Menu Trigger */}
      <header className="lg:hidden sticky top-0 left-0 right-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 -ml-1 rounded-xl hover:bg-muted active:scale-90 transition-all text-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xs font-bold text-white shadow-sm">
            🌿
          </div>
          <span className="font-display font-bold text-base bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MoodAware
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeSound && (
            <button
              onClick={() => { soundscape.stop(); setActiveSound(null); }}
              className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold flex items-center gap-1 animate-pulse"
            >
              <Volume2 className="w-3 h-3" /> Audio On
            </button>
          )}

          <Link href="/profile">
            <button className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs ring-2 ring-primary/20 active:scale-95 transition-all">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </button>
          </Link>
        </div>
      </header>

      {/* Mobile Slide-In Left Drawer Backdrop */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile Slide-In Left Drawer Content */}
      <AnimatePresence>
        {isDrawerOpen && (
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 bottom-0 w-[290px] bg-card/95 backdrop-blur-2xl border-r border-border/80 shadow-2xl z-50 flex flex-col justify-between p-5 lg:hidden"
          >
            <div className="space-y-6">
              {/* Drawer User Profile Banner */}
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white font-bold text-base shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || "🌿"}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-foreground truncate max-w-[150px]">{user?.name || "Friend"}</h4>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">{user?.email || ""}</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {drawerLinks.map((item) => {
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsDrawerOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all",
                        isActive
                          ? "bg-primary/10 text-primary font-bold shadow-xs"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground active:scale-98"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Ambient Sound Quick Switcher */}
              <div className="p-3 rounded-2xl bg-muted/30 border border-border/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-primary" /> Ambient Sound
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggleSound("rain")}
                    className={cn(
                      "py-2 px-1 rounded-xl text-[10px] font-bold border transition-all active:scale-95",
                      activeSound === "rain" ? "bg-blue-500 text-white border-blue-600 shadow-xs" : "bg-card border-border/70 text-muted-foreground"
                    )}
                  >
                    🌧️ Rain
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSound("waves")}
                    className={cn(
                      "py-2 px-1 rounded-xl text-[10px] font-bold border transition-all active:scale-95",
                      activeSound === "waves" ? "bg-teal-500 text-white border-teal-600 shadow-xs" : "bg-card border-border/70 text-muted-foreground"
                    )}
                  >
                    🌊 Waves
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleSound("zen")}
                    className={cn(
                      "py-2 px-1 rounded-xl text-[10px] font-bold border transition-all active:scale-95",
                      activeSound === "zen" ? "bg-purple-500 text-white border-purple-600 shadow-xs" : "bg-card border-border/70 text-muted-foreground"
                    )}
                  >
                    🔔 Zen
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Logout */}
            <div className="pt-4 border-t border-border/50">
              <Button
                variant="ghost"
                onClick={() => { logout(); setIsDrawerOpen(false); }}
                className="w-full justify-start text-xs text-destructive hover:bg-destructive/10 rounded-2xl h-10 gap-2 font-semibold"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Floating Navigation Dock */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border/60 z-40 px-3 py-1.5 shadow-2xl safe-area-bottom">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const isActive = location === item.href;

            if (item.isHighlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center -mt-5 focus:outline-none"
                >
                  <motion.div 
                    whileTap={{ scale: 0.88 }}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-primary/40 scale-105"
                        : "bg-gradient-to-tr from-primary to-accent text-white shadow-primary/30"
                    )}
                  >
                    <item.icon className="w-6 h-6" />
                  </motion.div>
                  <span className={cn(
                    "text-[10px] font-bold mt-1",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-12 py-1 transition-all duration-200 active:scale-90",
                  isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-5 h-5 transition-transform",
                  isActive && "scale-110"
                )} />
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
