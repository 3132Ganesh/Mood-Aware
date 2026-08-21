import { useCurrentPlan } from "@/hooks/use-tasks";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addDays, startOfWeek } from "date-fns";
import { 
  Loader2, Plus, Calendar as CalendarIcon, ArrowRight, Clock, Sparkles, 
  CheckCircle2, Circle, Laptop, Smartphone, RefreshCw, Layers, Brain, Dumbbell, Music, Gamepad2
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Planner() {
  const { plan, isLoading, generatePlan, isGenerating, completeTask } = useCurrentPlan();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
    return d;
  });

  // Filter tasks for selected date (timezone-safe string comparison)
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const tasksForDay = plan?.items.filter(item => {
    const itemDate = String(item.dayDate).split('T')[0];
    const matchDate = itemDate === selectedDateStr;
    const matchCategory = selectedCategory === "all" || item.task.category === selectedCategory;
    return matchDate && matchCategory;
  }) || [];

  const totalWeekTasks = plan?.items?.length || 0;
  const completedWeekTasks = plan?.items?.filter(i => i.isCompleted)?.length || 0;
  const weekProgressPercent = totalWeekTasks > 0 ? Math.round((completedWeekTasks / totalWeekTasks) * 100) : 0;

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "mental": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "physical": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "music": return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300";
      case "game": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      default: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-28 lg:pb-12">

        {/* ========================================================================= */}
        {/* 1. LAPTOP SCREEN UI (Visible on screens >= 1024px)                        */}
        {/* ========================================================================= */}
        <div className="hidden lg:block p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Laptop Top Header */}
          <header className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  Laptop Weekly Planner
                </Badge>
              </div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-1">
                7-Day Wellness Schedule
              </h1>
              <p className="text-sm text-muted-foreground">
                Balanced daily mental, physical, music, and relaxation activities tailored to your profile.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => generatePlan()} 
                disabled={isGenerating} 
                className="btn-primary rounded-2xl shadow-lg shadow-primary/20 text-sm font-semibold h-11 px-5 gap-2"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {plan ? "Regenerate AI Plan" : "Generate Plan"}
              </Button>
            </div>
          </header>

          {/* Week Progress Overview Card */}
          <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40 p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold">Weekly Wellness Completion</h3>
                <p className="text-xs text-muted-foreground">{completedWeekTasks} of {totalWeekTasks} total scheduled activities completed</p>
              </div>
              <span className="text-xl font-bold font-display text-primary">{weekProgressPercent}%</span>
            </div>
            <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${weekProgressPercent}%` }}
              />
            </div>
          </Card>

          {/* 7-Day Horizontal Calendar Board Bar */}
          <div className="grid grid-cols-7 gap-3">
            {days.map((date, i) => {
              const isSelected = format(date, "yyyy-MM-dd") === selectedDateStr;
              const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              
              // Count completed for that day
              const dayStr = format(date, "yyyy-MM-dd");
              const dayTasks = plan?.items.filter(item => String(item.dayDate).split('T')[0] === dayStr) || [];
              const dayDone = dayTasks.filter(t => t.isCompleted).length;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "p-4 rounded-3xl transition-all duration-200 border text-center flex flex-col items-center justify-between h-28 relative group",
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-[1.03]" 
                      : "bg-card text-muted-foreground border-border/60 hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  {isToday && (
                    <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>
                      Today
                    </span>
                  )}
                  <span className="text-xs font-semibold uppercase">{format(date, "EEEE")}</span>
                  <span className="text-2xl font-display font-bold">{format(date, "d")}</span>
                  <span className="text-[11px] opacity-80 font-medium">
                    {dayDone}/{dayTasks.length} Done
                  </span>
                </button>
              );
            })}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-2">Filter Activity:</span>
            {["all", "mental", "physical", "music", "game"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all active:scale-95",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card border-border/70 text-muted-foreground hover:bg-muted"
                )}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>

          {/* Selected Day's Task Grid */}
          <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">
                      Activities for {format(selectedDate, "EEEE, MMMM do yyyy")}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {tasksForDay.length} planned activities scheduled
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : tasksForDay.length > 0 ? (
                <div className="grid grid-cols-3 gap-4">
                  {tasksForDay.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "p-5 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between h-48",
                        item.isCompleted 
                          ? "bg-muted/30 border-transparent opacity-60" 
                          : "bg-card border-border/80 hover:border-primary/40 hover:shadow-lg"
                      )}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider", getCategoryBadgeClass(item.task.category))}>
                            {item.task.category}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" /> {item.task.duration}m
                          </span>
                        </div>
                        <h4 className={cn("font-bold text-base line-clamp-1 mt-1", item.isCompleted && "line-through text-muted-foreground")}>
                          {item.task.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {item.task.description}
                        </p>
                      </div>

                      <Button 
                        onClick={() => completeTask({ planId: item.planId, taskId: item.id, isCompleted: !item.isCompleted })}
                        variant={item.isCompleted ? "outline" : "default"}
                        className={cn(
                          "w-full rounded-xl text-xs font-semibold h-9 mt-3 transition-all",
                          !item.isCompleted && "btn-primary"
                        )}
                      >
                        {item.isCompleted ? "✓ Completed" : "Mark Complete"}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <p className="text-sm font-semibold text-foreground">No tasks scheduled for this day</p>
                  <p className="text-xs text-muted-foreground">Relax and enjoy your free time, or regenerate a new plan.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>


        {/* ========================================================================= */}
        {/* 2. MOBILE SCREEN UI (Visible on screens < 1024px)                        */}
        {/* ========================================================================= */}
        <div className="lg:hidden p-4 space-y-4 max-w-lg mx-auto w-full">
          
          {/* Mobile Header */}
          <div className="flex items-center justify-between pb-1">
            <div>
              <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1 mb-0.5 w-fit">
                <Smartphone className="w-2.5 h-2.5" />
                Mobile Planner
              </Badge>
              <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Weekly Plan
              </h1>
            </div>

            <Button 
              size="sm" 
              onClick={() => generatePlan()} 
              disabled={isGenerating} 
              className="btn-primary rounded-xl text-xs font-semibold h-8 px-3 shadow-sm gap-1"
            >
              {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              Re-sync
            </Button>
          </div>

          {/* Mobile Horizontal Day Picker */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {days.map((date, i) => {
              const isSelected = format(date, "yyyy-MM-dd") === selectedDateStr;
              const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "flex flex-col items-center justify-center min-w-[3.6rem] h-16 rounded-2xl transition-all border flex-shrink-0 active:scale-95",
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/25 scale-105" 
                      : "bg-card text-muted-foreground border-border/70"
                  )}
                >
                  <span className="text-[10px] font-semibold uppercase">{format(date, "EEE")}</span>
                  <span className="text-base font-bold mt-0.5">{format(date, "d")}</span>
                  {isToday && <span className="w-1 h-1 bg-current rounded-full mt-0.5" />}
                </button>
              );
            })}
          </div>

          {/* Mobile Focused Day Card Stack */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                {format(selectedDate, "EEE, MMM d")}
              </span>
              <span className="text-[11px] text-muted-foreground">{tasksForDay.length} activities</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : tasksForDay.length > 0 ? (
              <div className="space-y-2.5">
                {tasksForDay.map((item) => (
                  <div 
                    key={item.id}
                    className={cn(
                      "p-3.5 rounded-2xl border transition-all space-y-2.5",
                      item.isCompleted 
                        ? "bg-muted/30 border-transparent opacity-60" 
                        : "bg-card border-border/80 shadow-sm"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider", getCategoryBadgeClass(item.task.category))}>
                          {item.task.category}
                        </span>
                        <h4 className={cn("font-bold text-sm mt-1.5", item.isCompleted && "line-through text-muted-foreground")}>
                          {item.task.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.task.description}</p>
                      </div>
                      <span className="text-xs text-muted-foreground font-semibold flex-shrink-0">
                        {item.task.duration}m
                      </span>
                    </div>

                    <Button 
                      onClick={() => completeTask({ planId: item.planId, taskId: item.id, isCompleted: !item.isCompleted })}
                      variant={item.isCompleted ? "outline" : "default"}
                      className={cn(
                        "w-full rounded-xl text-xs font-semibold h-9",
                        !item.isCompleted && "btn-primary"
                      )}
                    >
                      {item.isCompleted ? "✓ Completed" : "Mark Done"}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-2xl bg-card border border-border/40">
                <p className="text-xs text-muted-foreground">No tasks scheduled for this day.</p>
              </div>
            )}
          </div>

        </div>

      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
