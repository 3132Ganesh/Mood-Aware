import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { useMood, useHabits } from "@/hooks/use-tracking";
import { useNotionReflections } from "@/hooks/use-notion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, ScatterChart, Scatter, ZAxis } from "recharts";
import { format, parseISO, subDays, isSameDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Quote, Activity, CheckCircle2, Circle } from "lucide-react";

export default function Analytics() {
  const { history: moodHistory, isLoading: moodLoading } = useMood();
  const { history: habitHistory, isLoading: habitLoading } = useHabits();
  const { reflections, isLoading: reflectionsLoading } = useNotionReflections();

  // Last 30 days for habit grid
  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i)).reverse();

  // Combine or process data for charts
  const moodData = moodHistory?.map(log => {
    const logDate = log.date; 
    const hasReflection = reflections?.some(r => r.date === logDate);
    
    return {
      date: format(new Date(log.date), "MMM d"),
      mood: log.moodScore,
      stress: log.stressScore,
      energy: log.energyScore,
      hasReflection: hasReflection ? 1 : 0
    };
  }).slice(-14) || [];

  const habitData = habitHistory?.map(log => ({
    date: format(new Date(log.date), "MMM d"),
    screenTime: log.screenTimeHours,
  })).slice(-14) || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 pb-24 lg:pb-6 max-w-[1600px] mx-auto w-full">
        <header className="mb-8">
          <h2 className="text-3xl font-display font-bold">Your Insights</h2>
          <p className="text-muted-foreground">Visualize your journey to better health.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-none shadow-lg col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Mood & Energy Trends</CardTitle>
              <CardDescription>How you've been feeling over the last two weeks</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] lg:h-[400px]">
              {moodLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
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
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis domain={[0, 5]} />
                    <Tooltip contentStyle={{backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)'}} />
                    <Legend />
                    <Area type="monotone" dataKey="mood" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorMood)" strokeWidth={3} />
                    <Area type="monotone" dataKey="energy" stroke="#F59E0B" fillOpacity={1} fill="url(#colorEnergy)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Screen Time Analysis</CardTitle>
              <CardDescription>Daily hours spent on screens</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {habitLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={habitData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" tick={{fontSize: 12}} />
                    <YAxis />
                    <Tooltip contentStyle={{backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)'}} />
                    <Bar dataKey="screenTime" name="Screen Time (hrs)" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-secondary/20 to-secondary/5">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-card rounded-xl shadow-sm">
                  <span className="text-muted-foreground">Average Mood</span>
                  <span className="font-bold text-xl text-primary">
                    {moodHistory && moodHistory.length > 0 
                      ? (moodHistory.reduce((a, b) => a + b.moodScore, 0) / moodHistory.length).toFixed(1) 
                      : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-card rounded-xl shadow-sm">
                  <span className="text-muted-foreground">Check-in Streak</span>
                  <span className="font-bold text-xl text-green-500">
                    {moodHistory ? moodHistory.length : 0} Days
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-card rounded-xl shadow-sm">
                  <span className="text-muted-foreground">Screen Time Avg</span>
                  <span className="font-bold text-xl text-blue-500">
                    {habitHistory && habitHistory.length > 0
                      ? (habitHistory.reduce((a, b) => a + (b.screenTimeHours || 0), 0) / habitHistory.length).toFixed(1) + "h"
                      : "-"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg col-span-1 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="w-5 h-5 text-primary" />
                  Notion Reflection Correlation
                </CardTitle>
                <CardDescription>Correlation between journaling and reported mood scores</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {reflectionsLoading ? (
                <Skeleton className="w-full h-full rounded-xl" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis 
                      type="category" 
                      dataKey="date" 
                      name="Date" 
                      tick={{fontSize: 10}}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="mood" 
                      name="Mood Score" 
                      domain={[0, 5]}
                      label={{ value: 'Mood', angle: -90, position: 'insideLeft' }}
                    />
                    <ZAxis type="number" dataKey="hasReflection" range={[50, 400]} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-card p-3 border border-border rounded-lg shadow-xl">
                              <p className="font-bold mb-1">{data.date}</p>
                              <p className="text-sm text-primary">Mood: {data.mood}</p>
                              {data.hasReflection === 1 ? (
                                <Badge className="mt-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none">
                                  Reflection Logged
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="mt-2">No Reflection</Badge>
                              )}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      name="Mood vs Journaling" 
                      data={moodData} 
                      fill="hsl(var(--primary))"
                      shape={(props: any) => {
                        const { cx, cy, payload } = props;
                        if (payload.hasReflection === 1) {
                          return <path d={`M${cx},${cy-10} L${cx+10},${cy+10} L${cx-10},${cy+10} Z`} fill="hsl(var(--primary))" />;
                        }
                        return <circle cx={cx} cy={cy} r={6} fill="#94a3b8" />;
                      }}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Habit Consistency (Last 30 Days)
              </CardTitle>
              <CardDescription>Visualizing your routine follow-through and activity</CardDescription>
            </CardHeader>
            <CardContent>
              {habitLoading ? (
                <Skeleton className="h-48 w-full rounded-xl" />
              ) : (
                <div className="space-y-8">
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center justify-between">
                      Routine Followed
                      <span className="text-xs text-muted-foreground">
                        {habitHistory?.filter(h => h.routineFollowed).length || 0} / 30 days
                      </span>
                    </h4>
                    <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-2">
                      {last30Days.map((day, i) => {
                        const habit = habitHistory?.find(h => isSameDay(new Date(h.date), day));
                        const active = habit?.routineFollowed;
                        return (
                          <div 
                            key={i}
                            title={format(day, 'MMM d, yyyy')}
                            className={`aspect-square rounded-sm border ${
                              active 
                                ? "bg-primary border-primary shadow-[0_0_10px_rgba(var(--primary),0.3)]" 
                                : "bg-muted/30 border-border"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium flex items-center justify-between">
                      Physical Activity
                      <span className="text-xs text-muted-foreground">
                        {habitHistory?.filter(h => h.extraPhysicalActivity).length || 0} / 30 days
                      </span>
                    </h4>
                    <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-30 gap-2">
                      {last30Days.map((day, i) => {
                        const habit = habitHistory?.find(h => isSameDay(new Date(h.date), day));
                        const active = habit?.extraPhysicalActivity;
                        return (
                          <div 
                            key={i}
                            title={format(day, 'MMM d, yyyy')}
                            className={`aspect-square rounded-sm border ${
                              active 
                                ? "bg-green-500 border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" 
                                : "bg-muted/30 border-border"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-6 pt-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded-sm bg-primary" /> Routine
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded-sm bg-green-500" /> Physical
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <div className="w-3 h-3 rounded-sm bg-muted/30 border border-border" /> Inactive
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
