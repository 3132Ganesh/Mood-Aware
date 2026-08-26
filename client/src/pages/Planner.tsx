import { useState } from "react";
import { useCurrentPlan } from "@/hooks/use-tasks";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, addDays, startOfWeek } from "date-fns";
import { 
  Calendar as CalendarIcon, CheckCircle2, Clock, 
  Sparkles, RefreshCw, AlertCircle, Laptop, Smartphone,
  Brain, Dumbbell, Music, Gamepad2, Sun, ChevronRight, Check,
  Utensils, Target, Shield, Layers
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AgustGoalWidget } from "@/components/agust/AgustGoalWidget";

export default function Planner() {
  const { plan, completeTask, generatePlan, isGenerating, isLoading, refetch } = useCurrentPlan();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");

  // Filter tasks for selected day
  const tasksForDay = plan?.items.filter(item => {
    const itemDate = String(item.dayDate).split('T')[0];
    const matchesDate = itemDate === selectedDateStr;
    const matchesCategory = selectedCategory === "all" || item.task.category === selectedCategory || item.task.taskType === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "all" || item.task.difficulty === selectedDifficulty;
    return matchesDate && matchesCategory && matchesDifficulty;
  }) || [];

  const completedCount = plan?.items.filter(t => t.isCompleted).length || 0;
  const totalCount = plan?.items.length || 0;
  const weekProgressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case "mental": return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
      case "physical": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
      case "music": return "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300";
      case "game": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "career": return "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300";
      case "diet": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
      default: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    }
  };

  const getDifficultyPill = (difficulty?: string | null) => {
    switch (difficulty) {
      case "easy":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">🟢 Easy Habit</Badge>;
      case "medium":
        return <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]">🟡 Medium Skill</Badge>;
      case "hard":
        return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px]">🔴 Hard Milestone</Badge>;
      default:
        return <Badge variant="outline" className="text-[10px]">Standard</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row w-full">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Mobile Top App Bar & Navigation */}
      <MobileNav />

      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full pb-32 lg:pb-12">
        
        {/* ========================================================================= */}
        {/* 1. LAPTOP SCREEN UI (CSS Grid 7-day board + 3-col task grid + Flexbox)    */}
        {/* ========================================================================= */}
        <div className="hidden lg:block w-full max-w-[min(100%,88rem)] mx-auto px-[3vw] py-[3vh] space-y-[3vh]">
          
          {/* Header - Flexbox */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-[2vw] w-full min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  3-Tier Planner
                </Badge>
              </div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-1 truncate">
                AI Goal & Routine Schedule
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                Personalized 3-Tier plan: Daily Micro-Habits (Easy), Weekday Applied Skills (Medium), & Weekend Milestones (Hard).
              </p>
            </div>

            <Button 
              onClick={() => generatePlan()} 
              disabled={isGenerating}
              className="btn-primary rounded-2xl text-xs font-semibold gap-2 shadow-lg shadow-primary/25 h-11 px-5 flex-shrink-0"
            >
              <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
              {isGenerating ? "Synthesizing AI Plan..." : "Regenerate AI Week"}
            </Button>
          </header>

          {/* Agust Goal & Diet Configurator Widget */}
          <AgustGoalWidget onPlanRegenerated={() => refetch()} />

          {/* Weekly Progress Banner - Flexbox */}
          <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl p-5 border border-border/40 w-full min-w-0">
            <div className="flex items-center justify-between gap-4 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">Weekly Goal Completion Progress</span>
              </div>
              <span className="text-xs font-bold text-primary">
                {completedCount} of {totalCount} completed ({weekProgressPercent}%)
              </span>
            </div>
            <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all duration-500"
                style={{ width: `${weekProgressPercent}%` }}
              />
            </div>
          </Card>

          {/* 7-Day CSS Grid Bar */}
          <div className="grid grid-cols-7 gap-[1vw] w-full">
            {days.map((date, i) => {
              const isSelected = format(date, "yyyy-MM-dd") === selectedDateStr;
              const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
              const isWeekend = i === 5 || i === 6; // Sat or Sun
              
              const dayStr = format(date, "yyyy-MM-dd");
              const dayTasks = plan?.items.filter(item => String(item.dayDate).split('T')[0] === dayStr) || [];
              const dayDone = dayTasks.filter(t => t.isCompleted).length;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "p-4 rounded-3xl transition-all duration-200 border text-center flex flex-col items-center justify-between h-28 relative group min-w-0 w-full",
                    isSelected 
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-[1.03]" 
                      : "bg-card text-muted-foreground border-border/60 hover:bg-muted/40 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-1">
                    {isToday && (
                      <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full", isSelected ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>
                        Today
                      </span>
                    )}
                    {isWeekend && (
                      <span className={cn("text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full", isSelected ? "bg-rose-400/30 text-white" : "bg-rose-500/10 text-rose-500")}>
                        Milestone
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold uppercase">{format(date, "EEEE")}</span>
                  <span className="text-2xl font-display font-bold">{format(date, "d")}</span>
                  <span className="text-[11px] opacity-80 font-medium truncate">
                    {dayDone}/{dayTasks.length} Done
                  </span>
                </button>
              );
            })}
          </div>

          {/* Difficulty & Category Filter Chips */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full bg-card/60 p-3 rounded-2xl border border-border/50">
            {/* Category Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Category:</span>
              {["all", "career", "fitness", "diet", "mental"].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold capitalize border transition-all active:scale-95",
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card border-border/70 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Difficulty Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-muted-foreground mr-1">Difficulty Tier:</span>
              {[
                { id: "all", label: "All Tiers" },
                { id: "easy", label: "🟢 Easy" },
                { id: "medium", label: "🟡 Medium" },
                { id: "hard", label: "🔴 Hard" },
              ].map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setSelectedDifficulty(diff.id)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-semibold border transition-all active:scale-95",
                    selectedDifficulty === diff.id
                      ? "bg-foreground text-background border-foreground shadow-xs"
                      : "bg-card border-border/70 text-muted-foreground hover:bg-muted"
                  )}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Day's Task Grid */}
          <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40 w-full min-w-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
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
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : tasksForDay.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[1.5vw] w-full">
                  {tasksForDay.map((item) => (
                    <div 
                      key={item.id}
                      className={cn(
                        "p-5 rounded-3xl border transition-all duration-300 relative flex flex-col justify-between min-h-[13rem] min-w-0 w-full",
                        item.isCompleted 
                          ? "bg-muted/30 border-transparent opacity-60" 
                          : "bg-card border-border/80 hover:border-primary/40 hover:shadow-lg"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex justify-between items-start mb-2 gap-2 flex-wrap">
                          <span className={cn("text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider", getCategoryBadgeClass(item.task.category))}>
                            {item.task.category}
                          </span>
                          {getDifficultyPill(item.task.difficulty)}
                        </div>

                        <h4 className={cn("font-bold text-base line-clamp-1 mt-1", item.isCompleted && "line-through text-muted-foreground")}>
                          {item.task.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {item.task.description}
                        </p>

                        {/* Nutrition & Diet Tip Banner */}
                        {item.task.dietTip && (
                          <div className="mt-3 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                            <Utensils className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
                            <span className="line-clamp-2">{item.task.dietTip}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 flex items-center justify-between gap-2 border-t border-border/40 mt-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                          <Clock className="w-3.5 h-3.5" /> {item.task.duration}m
                        </span>
                        <Button 
                          onClick={() => completeTask({ planId: item.planId, taskId: item.id, isCompleted: !item.isCompleted })}
                          variant={item.isCompleted ? "outline" : "default"}
                          className={cn(
                            "rounded-xl text-xs font-semibold h-8 px-4 transition-all",
                            !item.isCompleted && "btn-primary shadow-xs"
                          )}
                        >
                          {item.isCompleted ? "✓ Done" : "Mark Done"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 space-y-3">
                  <p className="text-sm font-semibold text-foreground">No tasks scheduled for this filter/day</p>
                  <p className="text-xs text-muted-foreground">Relax and enjoy your free time, or regenerate a new AI plan.</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>


        {/* ========================================================================= */}
        {/* 2. MOBILE SCREEN UI (Responsive CSS Grid day strip + Full-width cards)   */}
        {/* ========================================================================= */}
        <div className="lg:hidden w-full px-[4vw] py-[2vh] space-y-[2vh] max-w-[min(100%,36rem)] mx-auto">
          
          <div className="flex items-center justify-between pb-1">
            <div>
              <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1 mb-0.5 w-fit">
                <Smartphone className="w-2.5 h-2.5" />
                Mobile Goal Planner
              </Badge>
              <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                My 7-Day Plan
              </h1>
            </div>

            <Button 
              size="sm" 
              onClick={() => generatePlan()} 
              disabled={isGenerating}
              className="btn-primary rounded-xl text-xs font-semibold h-8 px-3 shadow-sm gap-1"
            >
              <RefreshCw className={cn("w-3 h-3", isGenerating && "animate-spin")} />
              Sync AI
            </Button>
          </div>

          {/* Agust Goal & Diet Configurator Widget */}
          <AgustGoalWidget onPlanRegenerated={() => refetch()} />

          {/* Mobile 7-Day Grid */}
          <div className="grid grid-cols-7 gap-1.5 p-1.5 bg-muted/40 rounded-2xl border border-border/50 w-full">
            {days.map((date, i) => {
              const isSelected = format(date, "yyyy-MM-dd") === selectedDateStr;
              const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    "py-2 rounded-xl flex flex-col items-center justify-center transition-all text-center min-w-0 w-full",
                    isSelected 
                      ? "bg-primary text-primary-foreground font-bold shadow-xs scale-105" 
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className="text-[9px] uppercase font-semibold">{format(date, "EEE")}</span>
                  <span className="text-sm font-bold mt-0.5">{format(date, "d")}</span>
                  {isToday && (
                    <span className={cn("w-1 h-1 rounded-full mt-1", isSelected ? "bg-white" : "bg-primary")} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Category Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full">
            {["all", "career", "fitness", "diet", "mental"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-semibold capitalize flex-shrink-0 transition-all",
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted/50 text-muted-foreground"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Mobile Day Task List */}
          <div className="space-y-2.5 w-full min-w-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : tasksForDay.length > 0 ? (
              tasksForDay.map((item) => (
                <Card 
                  key={item.id} 
                  className={cn(
                    "border-none shadow-xs bg-card/95 rounded-3xl p-4 space-y-2 border border-border/50 transition-all active:scale-98 w-full min-w-0",
                    item.isCompleted && "opacity-60 bg-muted/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase", getCategoryBadgeClass(item.task.category))}>
                          {item.task.category}
                        </span>
                        {getDifficultyPill(item.task.difficulty)}
                      </div>
                      <h4 className={cn("font-bold text-sm text-foreground mt-1.5 truncate", item.isCompleted && "line-through text-muted-foreground")}>
                        {item.task.title}
                      </h4>
                    </div>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" /> {item.task.duration}m
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {item.task.description}
                  </p>

                  {item.task.dietTip && (
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-[10px] text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                      <Utensils className="w-3 h-3 text-emerald-500" />
                      <span className="line-clamp-1">{item.task.dietTip}</span>
                    </div>
                  )}

                  <Button
                    size="sm"
                    onClick={() => completeTask({ planId: item.planId, taskId: item.id, isCompleted: !item.isCompleted })}
                    className={cn(
                      "w-full rounded-2xl text-xs font-semibold h-9 mt-1",
                      item.isCompleted ? "bg-muted/80 text-foreground" : "btn-primary shadow-xs"
                    )}
                  >
                    {item.isCompleted ? "✓ Completed" : "Mark as Done"}
                  </Button>
                </Card>
              ))
            ) : (
              <div className="text-center py-10 rounded-3xl bg-card/60 border border-border/40 p-6">
                <p className="text-xs text-muted-foreground">No tasks scheduled for this day.</p>
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
