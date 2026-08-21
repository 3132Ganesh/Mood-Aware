import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calendar, BarChart2, Heart, BookHeart, Wind, LogOut, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MobileNav() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const navItems = [
    { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
    { icon: Calendar, label: "Plan", href: "/planner" },
    { icon: Heart, label: "Check-in", href: "/checkin", isHighlight: true },
    { icon: BookHeart, label: "Feelings", href: "/feelings" },
    { icon: BarChart2, label: "Insights", href: "/analytics" },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/50 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-sm font-bold shadow-md shadow-primary/20 text-white">
            🌿
          </div>
          <div>
            <span className="font-display font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MoodAware
            </span>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1.5 rounded-full bg-muted/60 hover:bg-muted active:scale-95 transition-all">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-xl border-border">
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <p className="text-sm font-bold text-foreground">{user?.name || "User"}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/breathing" className="flex items-center gap-2 px-2 py-2 rounded-xl text-sm cursor-pointer text-primary font-medium">
                <Wind className="w-4 h-4 text-primary" />
                Breathwork Sanctuary
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 px-2 py-2 rounded-xl text-sm cursor-pointer">
                <UserIcon className="w-4 h-4 text-muted-foreground" />
                Profile Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => logout()}
              className="flex items-center gap-2 px-2 py-2 rounded-xl text-sm text-destructive hover:bg-destructive/10 focus:text-destructive cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-xl border-t border-border/60 z-50 px-3 py-1.5 shadow-2xl safe-area-bottom">
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
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90",
                    isActive
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-primary/40 scale-105"
                      : "bg-gradient-to-tr from-primary to-accent text-white shadow-primary/30"
                  )}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className={cn(
                    "text-[10px] mt-1 font-semibold",
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
                  "flex flex-col items-center py-1.5 px-2.5 rounded-xl transition-all duration-200 active:scale-95",
                  isActive
                    ? "text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <div className={cn(
                  "p-1 rounded-xl transition-colors",
                  isActive && "bg-primary/10"
                )}>
                  <item.icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
                </div>
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
