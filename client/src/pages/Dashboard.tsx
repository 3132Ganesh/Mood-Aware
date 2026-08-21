import { useState } from "react";
import { useAuth, useProfile } from "@/hooks/use-auth";
import { useCurrentPlan } from "@/hooks/use-tasks";
import { useMood, useHabits, useCapsules, useMoodSwings } from "@/hooks/use-tracking";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { MoodGarden } from "@/components/MoodGarden";
import { PredictiveInsights } from "@/components/PredictiveInsights";
import { MoodSwingDialog } from "@/components/MoodSwingDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  ArrowRight, CheckCircle2, Circle, Sun, Music, Gamepad2, Brain, 
  Dumbbell, Sparkles, Heart, Plus, BookHeart, TrendingUp, Wind, Mail, X, Check, Zap,
  Laptop, Smartphone, SlidersHorizontal, Calendar as CalendarIcon, Flame, ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

const QUOTES = [
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "Peace comes from within. Do not seek it without.", author: "Buddha" },
  { text: "The greatest wealth is health.", author: "Virgil" },
  { text: "You don’t have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { plan, completeTask, isLoading: planLoading, generatePlan, isGenerating } = useCurrentPlan();
  const { history, isLoading: moodLoading } = useMood();
  const { history: habitHistory } = useHabits();
  const { undeliveredCapsule, markDelivered } = useCapsules();

  const [dismissedCapsule, setDismissedCapsule] = useState(false);
  const [swingDialogOpen, setSwingDialogOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"tasks" | "garden" | "insights">("tasks");

  const today = format(new Date(), "yyyy-MM-dd");
  const { swings: todaySwings } = useMoodSwings(today);
  const todaysMoodLog = history?.find(m => String(m.date).split('T')[0] === today);
  const hasCheckedInToday = Boolean(todaysMoodLog);
  
  // Filter tasks for today (timezone-safe)
  const todaysTasks = plan?.items.filter(item => {
    const itemDate = String(item.dayDate).split('T')[0];
    return itemDate === today;
  }) || [];

  const completedTodayCount = todaysTasks.filter(t => t.isCompleted).length;
  const progressPercent = todaysTasks.length > 0 ? Math.round((completedTodayCount / todaysTasks.length) * 100) : 0;

  const quote = QUOTES[new Date().getDate() % QUOTES.length];
  const totalLogs = history?.length || 0;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "mental": return <Brain className="w-4 h-4 text-purple-500" />;
      case "physical": return <Dumbbell className="w-4 h-4 text-emerald-500" />;
      case "music": return <Music className="w-4 h-4 text-pink-500" />;
      case "game": return <Gamepad2 className="w-4 h-4 text-blue-500" />;
      default: return <Sun className="w-4 h-4 text-amber-500" />;
    }
  };

  const handleDismissCapsule = (id: number) => {
    markDelivered(id);
    setDismissedCapsule(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Viewport Container with Percentage/Viewport Sizing */}
      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full pb-[12vh] lg:pb-[5vh]">

        {/* ========================================================================= */}
        {/* 1. LAPTOP SCREEN UI (CSS Grid rearranged panels + Flexbox text cards)    */}
        {/* ========================================================================= */}
        <div className="hidden lg:block w-full max-w-[min(100%,88rem)] mx-auto px-[3vw] py-[3vh] space-y-[3vh]">
          
          {/* Header - Flexbox Layout */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-[2vw] w-full min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  Laptop Dashboard
                </Badge>
              </div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-1 truncate">
                Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user?.name?.split(' ')[0] || "Friend"} 🌿
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                Your daily wellness overview, AI predictive guidance, and personalized action items.
              </p>
            </div>

            {/* Quick Action Buttons - Flexbox */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/breathing">
                <Button variant="outline" className="rounded-2xl text-xs font-semibold h-11 border-primary/30 text-primary hover:bg-primary/10 gap-2 px-4 shadow-xs">
                  <Wind className="w-4 h-4" /> Quick Calm
                </Button>
              </Link>
              {hasCheckedInToday && (
                <Button 
                  variant="outline" 
                  onClick={() => setSwingDialogOpen(true)}
                  className="rounded-2xl text-xs font-semibold h-11 flex items-center gap-1.5 border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 px-4 shadow-xs"
                >
                  <Zap className="w-4 h-4 text-amber-500" /> Log Mood Shift
                </Button>
              )}
              <Link href="/checkin">
                {hasCheckedInToday ? (
                  <Button variant="outline" className="rounded-2xl text-xs font-semibold h-11 flex items-center gap-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Checked In Today
                  </Button>
                ) : (
                  <Button className="btn-primary rounded-2xl text-xs font-semibold h-11 shadow-lg shadow-primary/25 flex items-center gap-2 px-5">
                    <Heart className="w-4 h-4" /> Complete Daily Check-in
                  </Button>
                )}
              </Link>
            </div>
          </header>

          {/* Time Capsule Banner (Flexbox) */}
          {undeliveredCapsule && !dismissedCapsule && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-primary/15 border-2 border-purple-300 dark:border-purple-800 shadow-xl backdrop-blur-md relative animate-in fade-in duration-300 w-full min-w-0">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
                      💌 Letter From Your Past Self ({undeliveredCapsule.moodScore}/5 Mood Day)
                    </span>
                    <p className="text-base font-semibold text-foreground mt-0.5 italic leading-relaxed truncate">
                      "{undeliveredCapsule.message}"
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismissCapsule(undeliveredCapsule.id)}
                  className="rounded-full h-8 px-3.5 text-xs text-muted-foreground hover:text-foreground flex-shrink-0"
                >
                  Thank You <Check className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          )}

          {/* Quick Metrics - CSS Grid layout (2x2 on tablet, 4x1 on laptop) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-[1.5vw] w-full">
            <Link href="/checkin" className="p-4 rounded-3xl bg-card border border-border/70 hover:border-primary/40 shadow-xs transition-all hover:shadow-md active:scale-98 group flex flex-col justify-between min-w-0 w-full">
              <div className="flex items-center justify-between mb-2">
                <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform", hasCheckedInToday ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-primary/10 text-primary")}>
                  {hasCheckedInToday ? <CheckCircle2 className="w-5 h-5" /> : <Heart className="w-5 h-5" />}
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">Today</span>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">Today's Mood Log</span>
              <p className="text-lg font-bold mt-0.5 text-foreground truncate">
                {hasCheckedInToday && todaysMoodLog
                  ? `${todaysMoodLog.moodScore}/5 (${todaysMoodLog.moodLabel || "Logged"})`
                  : "Pending Check-in"}
              </p>
            </Link>

            <Link href="/planner" className="p-4 rounded-3xl bg-card border border-border/70 hover:border-primary/40 shadow-xs transition-all hover:shadow-md active:scale-98 group flex flex-col justify-between min-w-0 w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-muted-foreground">{progressPercent}%</span>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">Today's Plan Focus</span>
              <p className="text-lg font-bold mt-0.5 text-foreground truncate">
                {todaysTasks.length > 0 ? `${completedTodayCount}/${todaysTasks.length} Completed` : "Plan Complete"}
              </p>
            </Link>

            <Link href="/breathing" className="p-4 rounded-3xl bg-card border border-border/70 hover:border-primary/40 shadow-xs transition-all hover:shadow-md active:scale-98 group flex flex-col justify-between min-w-0 w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wind className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-blue-600">Zen</span>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">Breathwork Sanctuary</span>
              <p className="text-lg font-bold mt-0.5 text-foreground truncate">Vagus Nerve Reset</p>
            </Link>

            <Link href="/feelings" className="p-4 rounded-3xl bg-card border border-border/70 hover:border-primary/40 shadow-xs transition-all hover:shadow-md active:scale-98 group flex flex-col justify-between min-w-0 w-full">
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookHeart className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold text-purple-600">AI</span>
              </div>
              <span className="text-xs text-muted-foreground font-semibold">Feelings Space</span>
              <p className="text-lg font-bold mt-0.5 text-foreground truncate">Sentiment Journal</p>
            </Link>
          </div>

          {/* Main Dashboard CSS Grid: 12 Columns (8 Col Left Main, 4 Col Right Companion) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[2vw] w-full items-start">
            
            {/* Left 8 Columns (Main Activities & Predictive Insights) */}
            <div className="lg:col-span-8 space-y-[2.5vh] w-full min-w-0">
              
              {/* Today's Activities Card (Flexbox inside) */}
              <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40 w-full min-w-0">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div className="min-w-0 flex-1">
                    <CardTitle className="text-xl font-bold truncate">Today's Wellness Activities</CardTitle>
                    <CardDescription className="text-xs truncate">
                      {todaysTasks.length > 0 ? `${completedTodayCount} of ${todaysTasks.length} tasks completed (${progressPercent}%)` : "Personalized daily action plan"}
                    </CardDescription>
                  </div>
                  <Link href="/planner">
                    <Button variant="ghost" size="sm" className="rounded-xl text-xs font-semibold text-primary hover:underline gap-1 flex-shrink-0">
                      Full 7-Day Plan <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {planLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-16 w-full rounded-2xl" />
                      <Skeleton className="h-16 w-full rounded-2xl" />
                    </div>
                  ) : todaysTasks.length > 0 ? (
                    <div className="space-y-3">
                      {todaysTasks.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => completeTask({ 
                            planId: item.planId, 
                            taskId: item.id, 
                            isCompleted: !item.isCompleted 
                          })}
                          className={cn(
                            "flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all duration-200 cursor-pointer min-w-0 w-full",
                            item.isCompleted 
                              ? "bg-muted/40 border-transparent opacity-60" 
                              : "bg-card border-border/80 hover:border-primary/50 hover:shadow-md active:scale-[0.99]"
                          )}
                        >
                          <div className="flex items-center gap-3.5 min-w-0 flex-1">
                            <button type="button" className="text-primary focus:outline-none flex-shrink-0">
                              {item.isCompleted ? (
                                <CheckCircle2 className="w-6 h-6 fill-primary/20 text-primary" />
                              ) : (
                                <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                              )}
                            </button>
                            
                            <div className="min-w-0 flex-1">
                              <h4 className={cn("font-bold text-base truncate", item.isCompleted && "line-through text-muted-foreground")}>
                                {item.task.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-1">{item.task.description}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={cn(
                              "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider",
                              item.task.category === 'mental' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                              item.task.category === 'physical' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                              item.task.category === 'music' && "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
                              item.task.category === 'game' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                            )}>
                              {item.task.category}
                            </span>
                            <span className="text-xs text-muted-foreground font-semibold">
                              {item.task.duration}m
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 space-y-3">
                      <p className="text-sm font-semibold text-foreground">All caught up for today!</p>
                      <p className="text-xs text-muted-foreground">You have finished your scheduled tasks or need to generate your weekly schedule.</p>
                      <Button onClick={() => generatePlan()} disabled={isGenerating} className="btn-primary rounded-xl text-xs font-semibold">
                        {isGenerating ? "Generating..." : "Generate Fresh Plan"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Predictive Insights AI Component */}
              <div className="w-full min-w-0">
                <PredictiveInsights 
                  moods={history || []} 
                  habits={habitHistory || []} 
                />
              </div>

            </div>

            {/* Right 4 Columns (Sticky Companion Widgets) */}
            <div className="lg:col-span-4 space-y-[2.5vh] w-full min-w-0 lg:sticky lg:top-6">
              
              {/* Mood Garden Interactive Component */}
              <div className="w-full min-w-0">
                <MoodGarden totalCheckins={totalLogs} currentStreak={Math.min(totalLogs, 7)} />
              </div>

              {/* Daily Quote Card (Flexbox Layout) */}
              <Card className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground border-none shadow-xl rounded-3xl w-full min-w-0">
                <CardContent className="p-6 flex flex-col justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold mb-3">
                      ✨ Daily Inspiration
                    </div>
                    <p className="text-sm font-medium opacity-95 italic leading-relaxed">
                      "{quote.text}"
                    </p>
                  </div>
                  <p className="text-xs mt-3 opacity-80 font-semibold text-right">— {quote.author}</p>
                </CardContent>
              </Card>

              {/* Wellness Preferences Snapshot (Flexbox item rows) */}
              <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40 w-full min-w-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold">Wellness Preferences</CardTitle>
                    <Link href="/profile" className="text-xs font-semibold text-primary hover:underline">
                      Edit
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl">
                    <span className="text-muted-foreground font-medium">Sleep Schedule</span>
                    <span className="font-bold text-foreground">{profile?.sleepTime || "22:30"} - {profile?.wakeTime || "07:00"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl">
                    <span className="text-muted-foreground font-medium">Activity Level</span>
                    <span className="font-bold text-foreground capitalize">{profile?.physicalActivity || "Moderate"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl">
                    <span className="text-muted-foreground font-medium">Music Sanctuary</span>
                    <span className="font-bold text-foreground capitalize">{profile?.musicApp || "Spotify"}</span>
                  </div>
                  <Link href="/profile" className="block w-full pt-1">
                    <Button variant="outline" className="w-full text-xs h-9 rounded-xl font-semibold">
                      Open Profile & Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>

            </div>

          </div>

        </div>


        {/* ========================================================================= */}
        {/* 2. MOBILE SCREEN UI (CSS Grid 1-column responsive layout)                 */}
        {/* ========================================================================= */}
        <div className="lg:hidden w-full px-[4vw] py-[2vh] space-y-[2vh] max-w-[min(100%,36rem)] mx-auto">
          
          {/* Mobile Top Status Card - Flexbox */}
          <div className="p-4 rounded-3xl bg-gradient-to-r from-primary/15 via-accent/10 to-primary/10 border border-primary/20 flex items-center justify-between shadow-xs w-full min-w-0">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Daily Sanctuary
              </span>
              <h2 className="text-lg font-display font-bold text-foreground truncate">
                Hi, {user?.name?.split(' ')[0] || "Friend"} ✨
              </h2>
            </div>

            <Link href="/checkin">
              <Button size="sm" className="btn-primary rounded-2xl text-xs font-semibold h-8 px-3.5 shadow-sm gap-1.5 active:scale-95 flex-shrink-0">
                <Heart className="w-3.5 h-3.5" />
                {hasCheckedInToday ? "Checked In" : "Check In"}
              </Button>
            </Link>
          </div>

          {/* Time Capsule Banner Mobile */}
          {undeliveredCapsule && !dismissedCapsule && (
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-400/40 shadow-sm space-y-2 w-full min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Past Self Letter
                </span>
                <button
                  onClick={() => handleDismissCapsule(undeliveredCapsule.id)}
                  className="text-[10px] text-muted-foreground hover:text-foreground font-semibold"
                >
                  Dismiss ✕
                </button>
              </div>
              <p className="text-xs font-semibold text-foreground italic leading-relaxed">
                "{undeliveredCapsule.message}"
              </p>
            </div>
          )}

          {/* Mobile Action Cards Row - CSS Grid */}
          <div className="grid grid-cols-2 gap-[2.5vw] w-full">
            <Link href="/checkin" className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-xs active:scale-95 transition-all flex flex-col justify-between h-20 min-w-0 w-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Daily Mood</span>
                {hasCheckedInToday ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Heart className="w-4 h-4 text-primary" />}
              </div>
              <p className="text-xs font-semibold text-muted-foreground truncate">
                {hasCheckedInToday && todaysMoodLog ? `${todaysMoodLog.moodScore}/5 (${todaysMoodLog.moodLabel || "Done"})` : "Not logged yet"}
              </p>
            </Link>

            <button 
              type="button"
              onClick={() => setSwingDialogOpen(true)}
              className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-left shadow-xs active:scale-95 transition-all flex flex-col justify-between h-20 min-w-0 w-full"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Mood Shift</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-xs font-semibold text-muted-foreground truncate">
                {todaySwings && todaySwings.length > 0 ? `${todaySwings.length} logged today` : "Log shift now"}
              </p>
            </button>
          </div>

          {/* Full-width Segmented Filter Tab Slider - CSS Grid */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/40 rounded-2xl border border-border/50 w-full">
            <button
              type="button"
              onClick={() => setMobileTab("tasks")}
              className={cn(
                "py-2 px-1 rounded-xl text-xs font-bold transition-all text-center truncate",
                mobileTab === "tasks" ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🎯 Tasks ({todaysTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("garden")}
              className={cn(
                "py-2 px-1 rounded-xl text-xs font-bold transition-all text-center truncate",
                mobileTab === "garden" ? "bg-emerald-500 text-white shadow-xs scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🌿 Garden
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("insights")}
              className={cn(
                "py-2 px-1 rounded-xl text-xs font-bold transition-all text-center truncate",
                mobileTab === "insights" ? "bg-purple-500 text-white shadow-xs scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              ✨ Insights
            </button>
          </div>

          {/* Animated Tab Content Slide Container */}
          <div className="w-full min-w-0">
            {mobileTab === "tasks" && (
              <Card className="border-none shadow-sm bg-card/95 rounded-3xl p-4 space-y-3 border border-border/50 w-full animate-in fade-in duration-200 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Today's Wellness Tasks</h3>
                    <p className="text-[11px] text-muted-foreground">{completedTodayCount} of {todaysTasks.length} done ({progressPercent}%)</p>
                  </div>
                  <Link href="/planner">
                    <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold h-7 px-2">
                      Full Week →
                    </Button>
                  </Link>
                </div>

                {todaysTasks.length > 0 ? (
                  <div className="space-y-2.5">
                    {todaysTasks.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => completeTask({ 
                          planId: item.planId, 
                          taskId: item.id, 
                          isCompleted: !item.isCompleted 
                        })}
                        className={cn(
                          "flex items-center gap-3.5 p-3.5 rounded-2xl border transition-all active:scale-98 cursor-pointer w-full min-w-0",
                          item.isCompleted ? "bg-muted/30 border-transparent opacity-60" : "bg-card border-border/70 shadow-xs"
                        )}
                      >
                        <button type="button" className="text-primary flex-shrink-0">
                          {item.isCompleted ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-xs font-bold truncate", item.isCompleted && "line-through text-muted-foreground")}>
                            {item.task.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{item.task.duration}m • {item.task.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-2">
                    <p className="text-xs font-semibold text-foreground">No tasks scheduled for today.</p>
                    <Link href="/planner">
                      <Button size="sm" className="btn-primary rounded-xl text-xs h-8 px-4">
                        Generate Plan
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            )}

            {mobileTab === "garden" && (
              <div className="w-full animate-in fade-in duration-200 min-w-0">
                <MoodGarden totalCheckins={totalLogs} currentStreak={Math.min(totalLogs, 7)} />
              </div>
            )}

            {mobileTab === "insights" && (
              <div className="w-full animate-in fade-in duration-200 min-w-0">
                <PredictiveInsights 
                  moods={history || []} 
                  habits={habitHistory || []} 
                />
              </div>
            )}
          </div>

          {/* Quick Breathwork Bar - Flexbox */}
          <Link href="/breathing" className="block w-full">
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-500/15 via-primary/10 to-blue-500/15 border border-blue-500/30 flex items-center justify-between active:scale-98 transition-all shadow-xs w-full min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Wind className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">Guided Breathwork Sanctuary</p>
                  <p className="text-[10px] text-muted-foreground truncate">Tap for 2-minute box breathing</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          </Link>

        </div>

        {/* Mood Swing Modal */}
        <MoodSwingDialog 
          open={swingDialogOpen} 
          onOpenChange={setSwingDialogOpen}
          currentMoodScore={todaysMoodLog?.moodScore || 3}
        />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
