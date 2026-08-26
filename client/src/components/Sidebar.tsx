import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, Calendar, BarChart2, Heart, BookHeart, Wind, 
  LogOut, User as UserIcon, ChevronLeft, ChevronRight, Sparkles, Volume2, Target
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { soundscape } from "@/lib/soundscape";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", badge: "Live" },
    { icon: Target, label: "AI Goal Studio", href: "/goals", isSpecial: true },
    { icon: BarChart2, label: "Insights", href: "/analytics" },
    { icon: Calendar, label: "My Plan", href: "/planner" },
    { icon: Heart, label: "Daily Check-in", href: "/checkin" },
    { icon: Wind, label: "Breathwork", href: "/breathing" },
    { icon: BookHeart, label: "Feelings Space", href: "/feelings" },
  ];

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="hidden lg:flex flex-col h-screen bg-card/95 backdrop-blur-xl border-r border-border/70 fixed left-0 top-0 z-30 shadow-sm select-none"
    >
      {/* Brand Header & Interactive Collapse Toggle */}
      <div className={cn("p-4 border-b border-border/50 flex items-center justify-between", isCollapsed ? "justify-center" : "")}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xl shadow-md shadow-primary/20 text-white flex-shrink-0">
            🌿
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="min-w-0"
            >
              <h1 className="text-lg font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                MoodAware
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">{user?.name || "Wellness Sanctuary"}</p>
            </motion.div>
          )}
        </div>

        {/* Sliding Collapse Toggle Button */}
        <button
          type="button"
          onClick={() => setIsCollapsed(prev => !prev)}
          className={cn(
            "p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95",
            isCollapsed && "mt-2"
          )}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Item Stack */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;

          const content = (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex items-center rounded-2xl transition-all duration-200 group text-sm font-medium relative",
                isCollapsed ? "justify-center p-3" : "gap-3 px-3.5 py-3",
                isActive 
                  ? "bg-primary/10 text-primary font-bold shadow-xs" 
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-98"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeSidebarPill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-primary rounded-r-full"
                />
              )}
              <item.icon className={cn(
                "w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110",
                isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary"
              )} />
              
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}

              {!isCollapsed && item.isSpecial && (
                <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </Link>
          );

          if (isCollapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side="right" className="font-semibold text-xs">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return content;
        })}
      </nav>

      {/* Sidebar Footer User & Settings */}
      <div className="p-3 border-t border-border/50 space-y-1 bg-muted/10">
        
        {/* Profile Settings Link */}
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Link 
                href="/profile"
                className={cn(
                  "flex items-center justify-center p-3 rounded-2xl transition-all",
                  location === "/profile" || location === "/settings"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <UserIcon className="w-5 h-5" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-semibold text-xs">
              Profile & Preferences
            </TooltipContent>
          </Tooltip>
        ) : (
          <Link 
            href="/profile"
            className={cn(
              "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all",
              location === "/profile" || location === "/settings"
                ? "bg-primary/15 text-primary shadow-xs"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <UserIcon className="w-4 h-4 text-primary" />
            <span className="truncate">Profile & Preferences</span>
          </Link>
        )}

        {/* Sign Out Button */}
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button 
                type="button"
                onClick={() => logout()}
                className="w-full flex items-center justify-center p-3 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-semibold text-xs">
              Sign Out
            </TooltipContent>
          </Tooltip>
        ) : (
          <button 
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-2xl text-xs text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        )}
      </div>
    </motion.aside>
  );
}
