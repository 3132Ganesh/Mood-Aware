import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, BarChart2, Heart, BookHeart, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Calendar, label: "My Plan", href: "/planner" },
    { icon: Heart, label: "Daily Check-in", href: "/checkin" },
    { icon: BookHeart, label: "Feelings Space", href: "/feelings" },
    { icon: BarChart2, label: "Analytics", href: "/analytics" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-card/95 backdrop-blur-md border-r border-border/70 fixed left-0 top-0 z-30">
      <div className="p-6 border-b border-border/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xl shadow-md shadow-primary/20 text-white">
          🌿
        </div>
        <div>
          <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            MoodAware
          </h1>
          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{user?.name || "Wellness Tracker"}</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex items-center gap-3 px-3.5 py-3 rounded-2xl transition-all duration-200 group text-sm font-medium",
                isActive 
                  ? "bg-primary/10 text-primary font-semibold shadow-sm" 
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground active:scale-98"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-primary fill-primary/10" : "text-muted-foreground group-hover:text-primary"
              )} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/40 space-y-2">
        <Link 
          href="/onboarding"
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
        >
          <UserIcon className="w-4 h-4 text-muted-foreground" />
          Profile Settings
        </Link>
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 px-3.5 py-2.5 w-full rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
