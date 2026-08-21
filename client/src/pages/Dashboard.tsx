import { useState } from "react";
import { useAuth, useProfile } from "@/hooks/use-auth";
import { useCurrentPlan } from "@/hooks/use-tasks";
import { useMood, useHabits, useCapsules, useMoodSwings } from "@/hooks/use-tracking";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { MoodGarden } from "@/components/MoodGarden";
import { PredictiveInsights } from "@/components/PredictiveInsights";
import { MoodSwingDialog } from "@/components/MoodSwingDialog";
import { HydrationTracker } from "@/components/HydrationTracker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Link } from "wouter";
import { 
  ArrowRight, CheckCircle2, Circle, Sun, Music, Gamepad2, Brain, 
  Dumbbell, Sparkles, Heart, Plus, BookHeart, TrendingUp, Wind, Mail, X, Check, Zap,
  Laptop, Smartphone, SlidersHorizontal, Calendar as CalendarIcon, Flame, ChevronRight,
  Moon, Droplets, Footprints, Stars, Activity
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { history, isLoading: moodLoading, logMood } = useMood();
  const { history: habitHistory } = useHabits();
  const { undeliveredCapsule, markDelivered } = useCapsules();

  const [dismissedCapsule, setDismissedCapsule] = useState(false);
  const [swingDialogOpen, setSwingDialogOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"tasks" | "garden" | "insights">("tasks");
  const [quickStress, setQuickStress] = useState([3]);

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
        {/* 1. LAPTOP SCREEN UI (CSS Grid Bento + Vitality Rings + Flexbox Cards)     */}
        {/* ========================================================================= */}
        <div className="hidden lg:block w-full max-w-[min(100%,88rem)] mx-auto px-[3vw] py-[3vh] space-y-[3vh]">
          
          {/* Header - Flexbox Layout with Zenith Editorial Styling */}
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-[2vw] w-full min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-stitch-primary/10 text-stitch-primary border-stitch-primary/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Zenith Sanctuary
                </Badge>
              </div>
              <h1 className="text-4xl md:text-5xl font-headline font-light text-stitch-primary tracking-tight mt-1 leading-tight truncate">
                Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 18 ? "afternoon" : "evening"},<br className="hidden xl:inline" /> {user?.name?.split(' ')[0] || "Sarah"}
              </h1>
              <p className="text-sm text-stitch-on-surface-variant font-body mt-2 tracking-wide truncate">
                Take a moment to center yourself and cultivate daily calm.
              </p>
            </div>

            {/* Quick Action Buttons - Flexbox */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <Link href="/breathing">
                <Button variant="outline" className="rounded-2xl text-xs font-semibold h-11 border-stitch-primary/30 text-stitch-primary hover:bg-stitch-primary/10 gap-2 px-4 shadow-xs">
                  <Wind className="w-4 h-4" /> Quick Calm
                </Button>
              </Link>
              {hasCheckedInToday && (
                <Button 
                  variant="outline" 
                  onClick={() => setSwingDialogOpen(true)}
                  className="rounded-2xl text-xs font-semibold h-11 flex items-center gap-1.5 border-amber-500/40 text-amber-700 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-4 shadow-xs"
                >
                  <Zap className="w-4 h-4 text-amber-500" /> Log Mood Shift
                </Button>
              )}
              <Link href="/checkin">
                {hasCheckedInToday ? (
                  <Button variant="outline" className="rounded-2xl text-xs font-semibold h-11 flex items-center gap-2 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-4 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Checked In Today
                  </Button>
                ) : (
                  <Button className="btn-primary rounded-2xl text-xs font-semibold h-11 shadow-lg shadow-stitch-primary/25 flex items-center gap-2 px-5 bg-stitch-primary hover:bg-stitch-primary/90 text-white">
                    <Heart className="w-4 h-4" /> Daily Calibration
                  </Button>
                )}
              </Link>
            </div>
          </header>

          {/* Time Capsule Banner (Flexbox) */}
          {undeliveredCapsule && !dismissedCapsule && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-stitch-secondary-container/60 via-pink-500/10 to-stitch-primary-fixed/40 border border-stitch-secondary-container shadow-sm backdrop-blur-md relative animate-in fade-in duration-300 w-full min-w-0">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-2xl bg-stitch-secondary-container text-stitch-on-secondary-container flex items-center justify-center flex-shrink-0 shadow-xs">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-stitch-secondary">
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

          {/* Stitch Daily Check-In Bento Section (Breathing Focus + Stress Level Slider) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[1.5vw] w-full">
            
            {/* Breathing Widget Bento Card */}
            <Link href="/breathing" className="group block w-full">
              <Card className="border-none shadow-ambient bg-stitch-surface-container-lowest rounded-3xl p-7 flex flex-col items-center justify-center space-y-4 transition-all hover:scale-[1.01] hover:shadow-lg border border-border/40 w-full min-w-0 h-full">
                <div className="text-center">
                  <span className="text-xs font-label uppercase tracking-widest text-stitch-outline">Mindful Focus</span>
                  <p className="text-xl font-headline font-bold text-stitch-primary mt-0.5">Breathe & Recalibrate</p>
                </div>

                <div className="w-28 h-28 rounded-full bg-stitch-primary-fixed flex items-center justify-center breathing-circle border-4 border-stitch-surface group-hover:scale-105 transition-transform duration-700">
                  <div className="w-16 h-16 rounded-full bg-stitch-primary/25 animate-pulse flex items-center justify-center">
                    <Wind className="w-7 h-7 text-stitch-primary" />
                  </div>
                </div>

                <p className="text-xs text-stitch-on-surface-variant italic">Inhale deeply to silence stress...</p>
              </Card>
            </Link>

            {/* Stress Slider Widget Bento Card */}
            <Card className="border-none shadow-ambient bg-stitch-surface-container-low rounded-3xl p-7 flex flex-col justify-between border border-border/40 w-full min-w-0 h-full space-y-4">
              <div>
                <span className="text-xs font-label uppercase tracking-widest text-stitch-outline">Real-Time Check-In</span>
                <p className="text-xl font-headline font-bold text-stitch-on-surface mt-0.5">How is your stress level right now?</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-label font-bold text-stitch-outline">
                  <span className="text-emerald-600">Calm ({quickStress[0]}/10)</span>
                  <span className="text-amber-600">Elevated</span>
                </div>
                <Slider 
                  value={quickStress} 
                  onValueChange={setQuickStress} 
                  min={1} 
                  max={10} 
                  step={1} 
                  className="py-1"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2 text-stitch-secondary text-xs font-semibold">
                  <Heart className="w-4 h-4 fill-stitch-secondary text-stitch-secondary animate-pulse" />
                  <span>Listening to your natural rhythm</span>
                </div>
                <Button 
                  size="sm"
                  onClick={() => setSwingDialogOpen(true)}
                  className="rounded-xl text-xs font-bold h-8 px-3 bg-stitch-primary hover:bg-stitch-primary/90 text-white"
                >
                  Log State
                </Button>
              </div>
            </Card>

          </div>

          {/* Dedicated Hydration Tracker & Drink Water Notifications */}
          <div className="w-full min-w-0">
            <HydrationTracker />
          </div>

          {/* Weekly Ritual Highlight Banner */}
          <div className="bg-stitch-secondary-container rounded-3xl p-7 flex items-center justify-between overflow-hidden relative shadow-xs w-full min-w-0">
            <div className="z-10 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/40 text-stitch-on-secondary-container text-xs font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" /> Weekly Sanctuary Ritual
              </div>
              <h3 className="text-stitch-on-secondary-container font-headline text-2xl font-bold">Mindful Flow Unlocked</h3>
              <p className="text-stitch-on-secondary-container/85 max-w-md text-sm leading-relaxed">
                You've honored your mindfulness and breathing habits 4 days in a row this week.
              </p>
            </div>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none select-none">
              <Stars className="w-48 h-48 text-stitch-on-secondary-container" />
            </div>
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
              <Card className="bg-gradient-to-br from-stitch-primary via-stitch-primary/95 to-stitch-primary-container text-white border-none shadow-xl rounded-3xl w-full min-w-0">
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
                    <CardTitle className="text-base font-bold">Wellness Sanctuary</CardTitle>
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
                    <span className="text-muted-foreground font-medium">Activity Rhythm</span>
                    <span className="font-bold text-foreground capitalize">{profile?.physicalActivity || "Moderate"}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-muted/30 rounded-xl">
                    <span className="text-muted-foreground font-medium">Sound Sanctuary</span>
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
          <div className="p-4 rounded-3xl bg-gradient-to-r from-stitch-primary-fixed/40 via-stitch-surface-container-low to-stitch-secondary-container/40 border border-border/60 flex items-center justify-between shadow-xs w-full min-w-0">
            <div className="space-y-0.5 min-w-0">
              <span className="text-[10px] font-bold text-stitch-primary uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Zenith Sanctuary
              </span>
              <h2 className="text-lg font-headline font-bold text-foreground truncate">
                Good morning, {user?.name?.split(' ')[0] || "Sarah"} ✨
              </h2>
            </div>

            <Link href="/checkin">
              <Button size="sm" className="btn-primary rounded-2xl text-xs font-semibold h-8 px-3.5 shadow-sm gap-1.5 active:scale-95 flex-shrink-0 bg-stitch-primary hover:bg-stitch-primary/90 text-white">
                <Heart className="w-3.5 h-3.5" />
                {hasCheckedInToday ? "Checked In" : "Check In"}
              </Button>
            </Link>
          </div>

          {/* Time Capsule Banner Mobile */}
          {undeliveredCapsule && !dismissedCapsule && (
            <div className="p-4 rounded-2xl bg-stitch-secondary-container/60 border border-stitch-secondary-container shadow-sm space-y-2 w-full min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stitch-secondary flex items-center gap-1">
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

          {/* Mobile Hydration Tracker & Drink Water Notifications */}
          <div className="w-full min-w-0">
            <HydrationTracker compact />
          </div>

          {/* Mobile Action Cards Row - CSS Grid */}
          <div className="grid grid-cols-2 gap-[2.5vw] w-full">
            <Link href="/checkin" className="p-3.5 rounded-2xl bg-card border border-border/70 shadow-xs active:scale-95 transition-all flex flex-col justify-between h-20 min-w-0 w-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">Daily Mood</span>
                {hasCheckedInToday ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Heart className="w-4 h-4 text-stitch-primary" />}
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
                mobileTab === "tasks" ? "bg-stitch-primary text-white shadow-xs scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🎯 Tasks ({todaysTasks.length})
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("garden")}
              className={cn(
                "py-2 px-1 rounded-xl text-xs font-bold transition-all text-center truncate",
                mobileTab === "garden" ? "bg-emerald-600 text-white shadow-xs scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🌿 Garden
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("insights")}
              className={cn(
                "py-2 px-1 rounded-xl text-xs font-bold transition-all text-center truncate",
                mobileTab === "insights" ? "bg-purple-600 text-white shadow-xs scale-[1.02]" : "text-muted-foreground hover:text-foreground"
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
                          {item.isCompleted ? <CheckCircle2 className="w-5 h-5 text-stitch-primary" /> : <Circle className="w-5 h-5 text-muted-foreground" />}
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
                      <Button size="sm" className="btn-primary rounded-xl text-xs h-8 px-4 bg-stitch-primary text-white">
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
            <div className="p-3.5 rounded-2xl bg-stitch-surface-container-low border border-border/60 flex items-center justify-between active:scale-98 transition-all shadow-xs w-full min-w-0">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-xl bg-stitch-primary-fixed text-stitch-primary flex items-center justify-center flex-shrink-0">
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
