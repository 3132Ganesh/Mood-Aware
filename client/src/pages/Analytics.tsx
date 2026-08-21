import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { useMood, useHabits, useMoodSwings } from "@/hooks/use-tracking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Activity, Monitor, Smile, Sparkles, Zap } from "lucide-react";
import { PredictiveInsights } from "@/components/PredictiveInsights";

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
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 pb-28 lg:pb-8 max-w-[1400px] mx-auto w-full">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" /> Data & Insights
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold">Wellness Analytics</h2>
          <p className="text-sm text-muted-foreground">Understand your emotional rhythm and daily habits.</p>
        </header>

        {/* Quick Stat Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="border-none shadow-md bg-card/80 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <Smile className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Average Mood</p>
              <p className="text-2xl font-bold text-foreground">{avgMood} <span className="text-xs text-muted-foreground">/ 5</span></p>
            </div>
          </Card>

          <Card className="border-none shadow-md bg-card/80 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Routine Consistency</p>
              <p className="text-2xl font-bold text-foreground">{routineRate}%</p>
            </div>
          </Card>

          <Card className="border-none shadow-md bg-card/80 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <Monitor className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Avg Screen Time</p>
              <p className="text-2xl font-bold text-foreground">{avgScreenTime} <span className="text-xs text-muted-foreground">hrs/day</span></p>
            </div>
          </Card>
        </div>

        {/* Predictive Insights Engine */}
        <div className="mb-6">
          <PredictiveInsights moods={moodHistory || []} habits={habitHistory || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mood Trend Chart */}
          <Card className="border-none shadow-md col-span-1 lg:col-span-2 bg-card/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Mood & Energy Progression</CardTitle>
              <CardDescription>Track emotional changes and physical vitality over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[280px] sm:h-[340px] pt-4">
              {moodLoading ? (
                <Skeleton className="w-full h-full rounded-2xl" />
              ) : moodData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={moodData}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" tick={{fontSize: 11, fill: 'var(--muted-foreground)'}} />
                    <YAxis domain={[1, 5]} tick={{fontSize: 11}} width={30} />
                    <Tooltip contentStyle={{backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '12px'}} />
                    <Legend wrapperStyle={{fontSize: '12px'}} />
                    <Area type="monotone" name="Mood" dataKey="mood" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorMood)" strokeWidth={3} />
                    <Area type="monotone" name="Energy" dataKey="energy" stroke="#F59E0B" fillOpacity={1} fill="url(#colorEnergy)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Log your daily check-ins to unlock trend analysis.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Screen Time Bar Chart */}
          <Card className="border-none shadow-md bg-card/80 backdrop-blur-sm rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold">Screen Time Trends</CardTitle>
              <CardDescription>Daily hours logged on devices</CardDescription>
            </CardHeader>
            <CardContent className="h-[260px] sm:h-[280px] pt-4">
              {habitLoading ? (
                <Skeleton className="w-full h-full rounded-2xl" />
              ) : habitData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" tick={{fontSize: 11, fill: 'var(--muted-foreground)'}} />
                    <YAxis tick={{fontSize: 11}} width={30} />
                    <Tooltip contentStyle={{backgroundColor: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '12px'}} />
                    <Bar dataKey="screenTime" name="Screen Time (hrs)" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  No habit data logged yet.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Habit Streak and Balance Summary */}
          <Card className="border-none shadow-md bg-gradient-to-br from-card to-muted/30 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Wellness Consistency</CardTitle>
              <CardDescription>Your habit adherence summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3.5 bg-card/90 border border-border/60 rounded-xl">
                  <span className="text-sm text-muted-foreground">Logged Check-ins</span>
                  <span className="font-bold text-foreground">
                    {moodHistory ? moodHistory.length : 0} Daily Logs
                  </span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-card/90 border border-border/60 rounded-xl">
                  <span className="text-sm text-muted-foreground">Mood Shifts Tracked</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {allSwings ? allSwings.length : 0} Intraday Swings
                  </span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-card/90 border border-border/60 rounded-xl">
                  <span className="text-sm text-muted-foreground">Active Physical Days</span>
                  <span className="font-bold text-emerald-600">
                    {habitHistory ? habitHistory.filter(h => h.extraPhysicalActivity).length : 0} Days
                  </span>
                </div>
                <div className="flex justify-between items-center p-3.5 bg-card/90 border border-border/60 rounded-xl">
                  <span className="text-sm text-muted-foreground">Routine Adherence</span>
                  <span className="font-bold text-primary">
                    {habitHistory ? habitHistory.filter(h => h.routineFollowed).length : 0} Days
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
