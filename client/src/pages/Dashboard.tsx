import { useState } from "react";
import { useAuth, useProfile } from "@/hooks/use-auth";
import { useCurrentPlan } from "@/hooks/use-tasks";
import { useMood, useHabits, useCapsules } from "@/hooks/use-tracking";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { MoodGarden } from "@/components/MoodGarden";
import { PredictiveInsights } from "@/components/PredictiveInsights";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "wouter";
import { 
  ArrowRight, CheckCircle2, Circle, Sun, Music, Gamepad2, Brain, 
  Dumbbell, Sparkles, Heart, Plus, BookHeart, TrendingUp, Wind, Mail, X, Check
} from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";

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

  const today = format(new Date(), "yyyy-MM-dd");
  
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
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 pb-28 lg:pb-8 max-w-[1400px] mx-auto w-full space-y-6">
        {/* Header with greeting & quick actions */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Welcome Back
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold">
              Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {user?.name?.split(' ')[0] || "Friend"}
            </h2>
            <p className="text-sm text-muted-foreground">Here is your daily wellness sanctuary.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/breathing">
              <Button variant="outline" className="rounded-2xl text-xs sm:text-sm font-semibold h-11 flex items-center gap-2 border-primary/30 text-primary hover:bg-primary/10">
                <Wind className="w-4 h-4" /> Quick Calm
              </Button>
            </Link>
            <Link href="/checkin">
              <Button className="btn-primary rounded-2xl text-xs sm:text-sm font-semibold h-11 shadow-md shadow-primary/25 flex items-center gap-2">
                <Heart className="w-4 h-4" /> Daily Check-in
              </Button>
            </Link>
          </div>
        </header>

        {/* Future Self Time Capsule Delivery Banner (Shows when a capsule is available) */}
        {undeliveredCapsule && !dismissedCapsule && (
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-purple-500/15 via-pink-500/10 to-primary/15 border-2 border-purple-300 dark:border-purple-800 shadow-xl backdrop-blur-md relative animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                    💌 Letter From Your Past Self ({undeliveredCapsule.moodScore}/5 Mood Day)
                  </span>
                  <p className="text-sm sm:text-base font-semibold text-foreground mt-0.5 italic leading-relaxed">
                    "{undeliveredCapsule.message}"
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleDismissCapsule(undeliveredCapsule.id)}
                className="rounded-full h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Thank You <Check className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Quick Summary Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <Link href="/checkin" className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 shadow-sm transition-all active:scale-95 group">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Today's Mood</span>
            <p className="text-base sm:text-lg font-bold mt-0.5 text-foreground truncate">
              {history && history.length > 0 ? `${history[0].moodScore}/5 (${history[0].moodLabel || "Logged"})` : "Not logged"}
            </p>
          </Link>

          <Link href="/planner" className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 shadow-sm transition-all active:scale-95 group">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Today's Focus</span>
            <p className="text-base sm:text-lg font-bold mt-0.5 text-foreground">
              {todaysTasks.length > 0 ? `${completedTodayCount}/${todaysTasks.length} Done` : "0 Tasks"}
            </p>
          </Link>

          <Link href="/breathing" className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 shadow-sm transition-all active:scale-95 group">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Wind className="w-4 h-4" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Breathwork</span>
            <p className="text-base sm:text-lg font-bold mt-0.5 text-foreground">Sanctuary</p>
          </Link>

          <Link href="/feelings" className="p-3.5 sm:p-4 rounded-2xl bg-card border border-border/70 hover:border-primary/40 shadow-sm transition-all active:scale-95 group">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <BookHeart className="w-4 h-4" />
            </div>
            <span className="text-xs text-muted-foreground font-medium">Feelings Space</span>
            <p className="text-base sm:text-lg font-bold mt-0.5 text-foreground">Journal</p>
          </Link>
        </div>

        {/* Main Grid: Left column (Tasks + Predictive Insights + Trends), Right Column (MoodGarden + Quote + Profile) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Focus Action Card */}
            <Card className="border-none shadow-md bg-card/80 backdrop-blur-sm rounded-3xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg sm:text-xl font-bold">Today's Wellness Activities</CardTitle>
                  <CardDescription>
                    {todaysTasks.length > 0 ? `${completedTodayCount} of ${todaysTasks.length} tasks completed (${progressPercent}%)` : "Personalized daily action plan"}
                  </CardDescription>
                </div>
                <Link href="/planner" className="text-xs sm:text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                  Full Week <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>
              <CardContent>
                {planLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full rounded-2xl" />
                    <Skeleton className="h-16 w-full rounded-2xl" />
                  </div>
                ) : todaysTasks.length > 0 ? (
                  <div className="space-y-2.5">
                    {todaysTasks.map((item) => (
                      <div 
                        key={item.id}
                        onClick={() => completeTask({ 
                          planId: item.planId, 
                          taskId: item.id, 
                          isCompleted: !item.isCompleted 
                        })}
                        className={`
                          flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer
                          ${item.isCompleted 
                            ? "bg-muted/40 border-transparent opacity-60" 
                            : "bg-card border-border/80 hover:border-primary/50 hover:shadow-md active:scale-[0.99]"
                          }
                        `}
                      >
                        <button 
                          type="button"
                          className="text-primary focus:outline-none"
                        >
                          {item.isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 fill-primary/20 text-primary" />
                          ) : (
                            <Circle className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground hover:text-primary transition-colors" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-sm sm:text-base truncate ${item.isCompleted && "line-through text-muted-foreground"}`}>
                            {item.task.title}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            {getCategoryIcon(item.task.category)}
                            <span className="capitalize">{item.task.category}</span>
                            <span>•</span>
                            <span>{item.task.duration} min</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-muted/20 rounded-2xl border border-dashed border-border/80 p-4">
                    <p className="text-sm text-muted-foreground mb-3">No active plan generated yet.</p>
                    <Button 
                      onClick={() => generatePlan()} 
                      disabled={isGenerating}
                      className="btn-primary rounded-xl text-xs sm:text-sm"
                    >
                      {isGenerating ? "Generating..." : "Generate AI Wellness Plan"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Predictive Insights Component */}
            <PredictiveInsights moods={history || []} habits={habitHistory || []} />

            {/* Mood Trends Mini Chart */}
            <Card className="border-none shadow-md bg-card/80 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl font-bold">Recent Mood Trend</CardTitle>
                <CardDescription>Visualizing emotional changes over time</CardDescription>
              </CardHeader>
              <CardContent className="h-52 sm:h-60 pt-2">
                {moodLoading ? (
                  <Skeleton className="w-full h-full rounded-2xl" />
                ) : history && history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history.slice(-7)}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(d) => format(new Date(d), 'EEE')}
                        tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          borderRadius: '12px', 
                          border: '1px solid var(--border)',
                          fontSize: '12px',
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="moodScore" 
                        name="Mood (1-5)"
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3} 
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                    <p>No check-in logs yet.</p>
                    <Link href="/checkin" className="mt-2 text-primary font-medium hover:underline">
                      Log your first check-in
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar Column: MoodGarden + Quote + Profile */}
          <div className="space-y-6">
            {/* Living Mood Garden Component */}
            <MoodGarden 
              totalCheckins={totalLogs} 
              currentStreak={totalLogs > 0 ? Math.min(totalLogs, 7) : 0} 
            />

            {/* Daily Quote Card */}
            <Card className="bg-gradient-to-br from-primary via-primary/90 to-accent text-primary-foreground border-none shadow-xl rounded-3xl">
              <CardContent className="p-5 sm:p-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold mb-3">
                  ✨ Daily Inspiration
                </div>
                <p className="text-sm sm:text-base font-medium opacity-95 italic leading-relaxed">
                  "{quote.text}"
                </p>
                <p className="text-xs mt-3 opacity-80 font-semibold">— {quote.author}</p>
              </CardContent>
            </Card>

            {/* Profile Snapshot Card */}
            <Card className="border-none shadow-md bg-card/80 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Wellness Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl text-sm">
                  <span className="text-muted-foreground">Sleep Goal</span>
                  <span className="font-semibold">{profile?.sleepTime || "22:30"}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl text-sm">
                  <span className="text-muted-foreground">Activity Level</span>
                  <span className="font-semibold capitalize">{profile?.physicalActivity || "Moderate"}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl text-sm">
                  <span className="text-muted-foreground">Music Therapy</span>
                  <span className="font-semibold capitalize">{profile?.musicApp || "Active"}</span>
                </div>
                <Link href="/onboarding">
                  <Button variant="outline" className="w-full text-xs h-9 mt-1 rounded-xl">
                    Update Preferences
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
