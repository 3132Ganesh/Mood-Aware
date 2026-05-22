import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, BarChart2, Heart, BookHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: Calendar, label: "Plan", href: "/planner" },
    { icon: Heart, label: "Log", href: "/checkin" },
    { icon: BookHeart, label: "Mood", href: "/feelings" },
    { icon: BarChart2, label: "Stats", href: "/analytics" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border z-50 px-6 pb-6 pt-3 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className="relative">
              <div className={cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-primary -translate-y-1" : "text-muted-foreground"
              )}>
                <div className={cn(
                  "p-1 rounded-xl transition-colors",
                  isActive && "bg-primary/10"
                )}>
                  <item.icon className={cn("w-6 h-6", isActive && "fill-current/10")} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                
                {isActive && (
                  <motion.div 
                    layoutId="mobile-active"
                    className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
