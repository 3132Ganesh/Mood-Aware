import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { useMood, useHabits, useMoodSwings } from "@/hooks/use-tracking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Activity, Monitor, Smile, Sparkles, Zap, Laptop, Smartphone } from "lucide-react";
import { PredictiveInsights } from "@/components/PredictiveInsights";
import { cn } from "@/lib/utils";

export default function Analytics() {
  const { history: moodHistory, isLoading: moodLoading } = useMood();
  const { history: habitHistory, isLoading: habitLoading } = useHabits();
  const { swings: allSwings } = useMoodSwings();

  // Combine and process data for charts safely
  const moodData = (moodHistory || [])
    .slice()
    .reverse()
    .slice(-14)
    .map(log => {
      let dateLabel = "Today";
      try {
        dateLabel = format(new Date(log.date), "MMM d");
      } catch (e) {
        dateLabel = String(log.date);
      }
      return {
        date: dateLabel,
        mood: log.moodScore,
        stress: log.stressScore,
        energy: log.energyScore
      };
    });

  const habitData = (habitHistory || [])
    .slice()
    .reverse()
    .slice(-14)
    .map(log => {
      let dateLabel = "Today";
      try {
        dateLabel = format(new Date(log.date), "MMM d");
      } catch (e) {
        dateLabel = String(log.date);
      }
      return {
        date: dateLabel,
        screenTime: log.screenTimeHours || 0,
      };
    });

  const avgMood = moodHistory && moodHistory.length > 0 
    ? (moodHistory.reduce((a, b) => a + b.moodScore, 0) / moodHistory.length).toFixed(1) 
    : "—";

  const routineRate = habitHistory && habitHistory.length > 0
    ? Math.round((habitHistory.filter(h => h.routineFollowed).length / habitHistory.length) * 100)
    : 0;

  const avgScreenTime = habitHistory && habitHistory.length > 0
    ? (habitHistory.reduce((a, b) => a + (b.screenTimeHours || 0), 0) / habitHistory.length).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-28 lg:pb-12">

        {/* ========================================================================= */}
        {/* 1. LAPTOP SCREEN UI (Visible on screens >= 1024px)                        */}
        {/* ========================================================================= */}
        <div className="hidden lg:block p-8 max-w-7xl w-full mx-auto space-y-8">
          
          <header className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-blue-500/10 text-blue-600 border-blue-500/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  Laptop Analytics Center
                </Badge>
              </div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-1">
                Wellness Analytics & Trends
              </h1>
              <p className="text-sm text-muted-foreground">
                Detailed longitudinal patterns across your mood logs, energy levels, and lifestyle habits.
              </p>
            </div>
          </header>

          {/* Laptop 3 Stat Highlight Cards */}
          <div className="grid grid-cols-3 gap-6">
            <Card className="border-none shadow-md bg-card/85 backdrop-blur-md p-6 rounded-3xl border border-border/40 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                <Smile className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Average Mood Score</p>
                <p className="text-3xl font-bold font-display text-foreground mt-0.5">{avgMood} <span className="text-sm text-muted-foreground font-normal">/ 5.0</span></p>
              </div>
            </Card>

            <Card className="border-none shadow-md bg-card/85 backdrop-blur-md p-6 rounded-3xl border border-border/40 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Activity className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Routine Consistency</p>
                <p className="text-3xl font-bold font-display text-foreground mt-0.5">{routineRate}%</p>
              </div>
            </Card>

            <Card className="border-none shadow-md bg-card/85 backdrop-blur-md p-6 rounded-3xl border border-border/40 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <Monitor className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Avg Daily Screen Time</p>
                <p className="text-3xl font-bold font-display text-foreground mt-0.5">{avgScreenTime} <span className="text-sm text-muted-foreground font-normal">hrs</span></p>
              </div>
            </Card>
          </div>

          {/* Laptop 2-Column Charts */}
          <div className="grid grid-cols-2 gap-8">
            
            {/* Chart 1: Mood & Energy Trend */}
            <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40 p-6">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-lg font-bold">Mood & Energy Trajectory</CardTitle>
                <CardDescription className="text-xs">14-day history of self-reported baseline scores</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[280px]">
                {moodData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={moodData}>
                      <defs>
                        <linearGradient id="laptopMoodGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="laptopEnergyGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="date" stroke="#888" fontSize={11} />
                      <YAxis domain={[1, 5]} stroke="#888" fontSize={11} />
                      <Tooltip contentStyle={{ borderRadius: "1rem", backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                      <Area type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#laptopMoodGrad)" name="Mood" />
                      <Area type="monotone" dataKey="energy" stroke="#10b981" strokeWidth={2} fill="url(#laptopEnergyGrad)" name="Energy" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    Log at least 2 check-ins to view trajectory.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Chart 2: Daily Screen Time */}
            <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40 p-6">
              <CardHeader className="p-0 pb-6">
                <CardTitle className="text-lg font-bold">Screen Time Habit Log</CardTitle>
                <CardDescription className="text-xs">Daily hours spent on screen</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-[280px]">
                {habitData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={habitData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey="date" stroke="#888" fontSize={11} />
                      <YAxis stroke="#888" fontSize={11} />
                      <Tooltip contentStyle={{ borderRadius: "1rem", backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }} />
                      <Bar dataKey="screenTime" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} name="Screen Hours" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    Log habit entries to visualize screen time.
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Predictive Insights Component */}
          <PredictiveInsights 
            moods={moodHistory || []} 
            habits={habitHistory || []} 
          />

        </div>


        {/* ========================================================================= */}
        {/* 2. MOBILE SCREEN UI (Visible on screens < 1024px)                        */}
        {/* ========================================================================= */}
        <div className="lg:hidden p-4 space-y-4 max-w-lg mx-auto w-full">
          
          <div className="pb-1">
            <Badge variant="outline" className="rounded-full bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1 mb-0.5 w-fit">
              <Smartphone className="w-2.5 h-2.5" />
              Mobile Insights
            </Badge>
            <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Analytics & Trends
            </h1>
          </div>

          {/* Mobile 3 Mini Stat Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-sm">
              <p className="text-base font-bold font-display text-foreground">{avgMood}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Avg Mood</p>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-sm">
              <p className="text-base font-bold font-display text-emerald-600">{routineRate}%</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Routine</p>
            </div>
            <div className="p-3 rounded-2xl bg-card border border-border/70 shadow-sm">
              <p className="text-base font-bold font-display text-blue-600">{avgScreenTime}h</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Screen Time</p>
            </div>
          </div>

          {/* Mobile Mood Chart */}
          <Card className="border-none shadow-md bg-card/90 rounded-3xl p-4 space-y-3 border border-border/40">
            <div>
              <h3 className="text-sm font-bold text-foreground">Mood Trajectory</h3>
              <p className="text-[10px] text-muted-foreground">Past 14 check-in logs</p>
            </div>
            <div className="h-44 w-full">
              {moodData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moodData}>
                    <defs>
                      <linearGradient id="mobMoodGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" stroke="#888" fontSize={9} />
                    <YAxis domain={[1, 5]} stroke="#888" fontSize={9} />
                    <Tooltip />
                    <Area type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#mobMoodGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  Need more check-ins to render graph.
                </div>
              )}
            </div>
          </Card>

          {/* Predictive Insights */}
          <PredictiveInsights 
            moods={moodHistory || []} 
            habits={habitHistory || []} 
          />

        </div>

      </main>

      <MobileNav />
    </div>
  );
}
