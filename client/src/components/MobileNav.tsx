import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, BarChart2, Heart, BookHeart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function MobileNav() {
  const [location] = useLocation();
  const { logout } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "My Plan", href: "/planner" },
    { icon: Heart, label: "Check-in", href: "/checkin" },
    { icon: BookHeart, label: "Feelings", href: "/feelings" },
    { icon: BarChart2, label: "Analytics", href: "/analytics" },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 px-4 pb-safe pt-2">
      <div className="flex justify-between items-center">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex flex-col items-center p-2 rounded-lg transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )}>
              <item.icon className={cn("w-6 h-6", isActive && "fill-current/20")} />
              <span className="text-[10px] mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
