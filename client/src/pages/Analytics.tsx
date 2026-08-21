import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { useMood, useHabits, useMoodSwings } from "@/hooks/use-tracking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Activity, Monitor, Smile, Sparkles, Zap, Laptop, Smartphone, Droplets, Sun, Heart, Flame } from "lucide-react";
import { PredictiveInsights } from "@/components/PredictiveInsights";
import { HydrationTracker } from "@/components/HydrationTracker";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const { history: moodHistory, isLoading: moodLoading } = useMood();
  const { history: habitHistory, isLoading: habitLoading } = useHabits();
  const { swings: allSwings } = useMoodSwings();
  const [chartView, setChartView] = useState<"weekly" | "monthly">("weekly");

  // Combine and process data for charts safely
  const rawMoods = moodHistory || [];
  const displayLogs = chartView === "weekly" ? rawMoods.slice(0, 7) : rawMoods.slice(0, 14);

  const moodData = displayLogs
    .slice()
    .reverse()
    .map(log => {
      let dateLabel = "Today";
      try {
        dateLabel = format(new Date(log.date), "EEE");
      } catch (e) {
        dateLabel = String(log.date);
      }
      return {
        date: dateLabel,
        mood: log.moodScore,
        stress: log.stressScore || 2,
        energy: log.energyScore || 4,
        hydration: 2.2
      };
    });

  const avgMood = moodHistory && moodHistory.length > 0 
    ? (moodHistory.reduce((a, b) => a + b.moodScore, 0) / moodHistory.length).toFixed(1) 
    : "4.2";

  const routineRate = habitHistory && habitHistory.length > 0
    ? Math.round((habitHistory.filter(h => h.routineFollowed).length / habitHistory.length) * 100)
    : 88;

  const avgStress = moodHistory && moodHistory.length > 0
    ? (moodHistory.reduce((a, b) => a + (b.stressScore || 3), 0) / moodHistory.length).toFixed(1)
    : "2.4";

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      <Sidebar />

      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full pb-[12vh] lg:pb-[5vh]">
        
        {/* ========================================================================= */}
        {/* 1. LAPTOP SCREEN UI (CSS Grid Bento + Vitality Charts + Flexbox Cards)    */}
        {/* ========================================================================= */}
        <div className="hidden lg:block w-full max-w-[min(100%,88rem)] mx-auto px-[3vw] py-[3vh] space-y-[3vh]">
          
          {/* Hero Summary Section with Stitch Zenith Styling */}
          <header className="space-y-3 w-full min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="rounded-full bg-stitch-primary/10 text-stitch-primary border-stitch-primary/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Zenith Insights Studio
              </Badge>
            </div>
            <h1 className="text-4xl md:text-5xl font-headline font-extrabold text-stitch-primary tracking-tight leading-tight">
              Your week in review.
            </h1>
            
            {/* High-Emotion Spark Badge */}
            <div className="inline-flex items-center gap-2.5 py-2 px-4 bg-stitch-secondary-container text-stitch-on-secondary-container rounded-full text-xs font-semibold shadow-xs">
              <Sparkles className="w-4 h-4 text-stitch-secondary" />
              <span>You've maintained steady emotional calm this week with 3 fewer stress spikes</span>
            </div>
          </header>

          {/* 3 Metric Highlight Bento Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-[1.5vw] w-full">
            
            <Card className="border-none shadow-ambient bg-stitch-surface-container-lowest p-6 rounded-3xl border border-border/40 flex items-center gap-4 min-w-0 w-full">
              <div className="w-14 h-14 rounded-2xl bg-stitch-secondary-container text-stitch-on-secondary-container flex items-center justify-center flex-shrink-0">
                <Droplets className="w-7 h-7 text-stitch-secondary" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs text-stitch-outline font-semibold uppercase tracking-wider">Hydration Level</span>
                <p className="text-2xl font-bold font-headline text-stitch-on-surface mt-0.5">2.2L Average</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">↑ +0.4L above hydration goal</p>
              </div>
            </Card>

            <Card className="border-none shadow-ambient bg-stitch-surface-container-lowest p-6 rounded-3xl border border-border/40 flex items-center gap-4 min-w-0 w-full">
              <div className="w-14 h-14 rounded-2xl bg-stitch-primary-fixed text-stitch-primary flex items-center justify-center flex-shrink-0">
                <Smile className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs text-stitch-outline font-semibold uppercase tracking-wider">Mindful Vitality</span>
                <p className="text-2xl font-bold font-headline text-stitch-on-surface mt-0.5">{avgMood} / 5.0</p>
                <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">Stable & Calm Trajectory</p>
              </div>
            </Card>

            <Card className="border-none shadow-ambient bg-stitch-surface-container-lowest p-6 rounded-3xl border border-border/40 flex items-center gap-4 min-w-0 w-full">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <Flame className="w-7 h-7" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs text-stitch-outline font-semibold uppercase tracking-wider">Habit Consistency</span>
                <p className="text-2xl font-bold font-headline text-stitch-on-surface mt-0.5">{routineRate}%</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Top 10% Mindfulness Streak</p>
              </div>
            </Card>

          </div>

          {/* Main Insights Bento Charts - CSS Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[2vw] w-full items-start">
            
            {/* Left 7 Columns: Mood & Energy Stability Area Chart */}
            <div className="lg:col-span-7 space-y-[2.5vh] w-full min-w-0">
              <Card className="border-none shadow-ambient bg-card/90 backdrop-blur-md rounded-3xl p-6 border border-border/40 w-full min-w-0">
                <div className="flex items-center justify-between gap-2 pb-4 flex-wrap">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-stitch-outline">Biometric Trends</span>
                    <h3 className="text-xl font-headline font-bold text-stitch-primary">Emotional Vitality & Calm</h3>
                  </div>
                  <div className="flex gap-1.5 p-1 bg-muted/40 rounded-xl border border-border/50">
                    <button
                      type="button"
                      onClick={() => setChartView("weekly")}
                      className={cn("px-3 py-1 text-xs font-bold rounded-lg transition-all", chartView === "weekly" ? "bg-stitch-primary text-white" : "text-muted-foreground")}
                    >
                      Weekly
                    </button>
                    <button
                      type="button"
                      onClick={() => setChartView("monthly")}
                      className={cn("px-3 py-1 text-xs font-bold rounded-lg transition-all", chartView === "monthly" ? "bg-stitch-primary text-white" : "text-muted-foreground")}
                    >
                      Monthly
                    </button>
                  </div>
                </div>

                <div className="h-[280px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodData}>
                      <defs>
                        <linearGradient id="stitchPrimary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#55624d" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#55624d" stopOpacity={0.0}/>
                        </linearGradient>
                        <linearGradient id="stitchSecondary" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#755754" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#755754" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis domain={[0, 5]} stroke="#888888" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="mood" name="Mood Score" stroke="#55624d" strokeWidth={3} fillOpacity={1} fill="url(#stitchPrimary)" />
                      <Area type="monotone" dataKey="energy" name="Energy Vitality" stroke="#755754" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#stitchSecondary)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Stress & Calm Bar Chart */}
              <Card className="border-none shadow-ambient bg-card/90 backdrop-blur-md rounded-3xl p-6 border border-border/40 w-full min-w-0">
                <div className="pb-4">
                  <span className="text-xs font-semibold uppercase tracking-widest text-stitch-outline">Daily Balance</span>
                  <h3 className="text-lg font-headline font-bold text-foreground">Stress Level vs Emotional Calm</h3>
                </div>

                <div className="h-[220px] w-full min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={moodData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} />
                      <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="stress" name="Stress Index (1-10)" fill="#fed7d2" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="energy" name="Vitality Energy" fill="#98a68e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Right 5 Columns: Predictive Insights & Hydration Telemetry */}
            <div className="lg:col-span-5 space-y-[2.5vh] w-full min-w-0">
              
              <div className="w-full min-w-0">
                <PredictiveInsights 
                  moods={moodHistory || []} 
                  habits={habitHistory || []} 
                />
              </div>

              {/* Sanctuary Takeaway Card */}
              <Card className="border-none shadow-sm bg-stitch-surface-container-low rounded-3xl p-6 space-y-3 w-full min-w-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-stitch-primary" />
                  <h4 className="text-sm font-bold text-stitch-primary">Sanctuary Rhythm Analysis</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your mood peaks at **4.8/5** on days when your morning breathwork is completed before 09:00 AM and hydration remains above 2.0L.
                </p>
                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-stitch-primary">
                  <span>Recommendation: 4-7-8 Breathing & Sip of Water</span>
                  <span>→</span>
                </div>
              </Card>

            </div>

          </div>

        </div>


        {/* ========================================================================= */}
        {/* 2. MOBILE SCREEN UI (CSS Grid Single Column Stacked Analytics)            */}
        {/* ========================================================================= */}
        <div className="lg:hidden w-full px-[4vw] py-[2vh] space-y-[2vh] max-w-[min(100%,36rem)] mx-auto">
          
          <div className="space-y-1">
            <Badge variant="outline" className="rounded-full bg-stitch-primary/10 text-stitch-primary border-stitch-primary/20 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1 w-fit">
              <Smartphone className="w-2.5 h-2.5" />
              Week in Review
            </Badge>
            <h1 className="text-2xl font-headline font-bold text-stitch-primary">
              Insights & Trends
            </h1>
            <p className="text-xs text-muted-foreground">Hydration, vitality, and mindfulness telemetry.</p>
          </div>

          {/* Mobile Spark Badge */}
          <div className="p-3.5 rounded-2xl bg-stitch-secondary-container text-stitch-on-secondary-container text-xs font-semibold flex items-center gap-2 shadow-xs w-full min-w-0">
            <Sparkles className="w-4 h-4 text-stitch-secondary flex-shrink-0" />
            <span className="leading-snug">Emotional calm maintained with consistent hydration.</span>
          </div>

          {/* Mobile 3 Quick Metric Boxes */}
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="p-3 rounded-2xl bg-card border border-border/60 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold">Water</span>
              <p className="text-sm font-bold text-foreground font-headline mt-0.5">2.2L</p>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/60 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold">Mood</span>
              <p className="text-sm font-bold text-foreground font-headline mt-0.5">{avgMood}</p>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/60 text-center">
              <span className="text-[10px] text-muted-foreground font-semibold">Habits</span>
              <p className="text-sm font-bold text-foreground font-headline mt-0.5">{routineRate}%</p>
            </div>
          </div>

          {/* Mobile Mood & Energy Chart Card */}
          <Card className="border-none shadow-xs bg-card/95 rounded-3xl p-4 space-y-3 border border-border/50 w-full min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-foreground">Mood & Vitality Trajectory</h3>
              <span className="text-[10px] font-semibold text-muted-foreground">7 Days</span>
            </div>
            <div className="h-44 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={moodData}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 5]} stroke="#888888" fontSize={10} tickLine={false} />
                  <Area type="monotone" dataKey="mood" stroke="#55624d" strokeWidth={2.5} fill="#55624d" fillOpacity={0.2} />
                  <Area type="monotone" dataKey="energy" stroke="#755754" strokeWidth={2} strokeDasharray="3 3" fill="#755754" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Mobile Predictive Insights */}
          <div className="w-full min-w-0">
            <PredictiveInsights 
              moods={moodHistory || []} 
              habits={habitHistory || []} 
            />
          </div>

        </div>

      </main>

      <MobileNav />
    </div>
  );
}
