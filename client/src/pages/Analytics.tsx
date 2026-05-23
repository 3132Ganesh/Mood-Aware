import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { useMood, useHabits } from "@/hooks/use-tracking";
import { useNotionReflections } from "@/hooks/use-notion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend, ScatterChart, Scatter, ZAxis } from "recharts";
import { format, parseISO, subDays, isSameDay } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Quote, Activity, CheckCircle2, Circle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function Analytics() {
  const { history: moodHistory, isLoading: moodLoading } = useMood();
  const { history: habitHistory, isLoading: habitLoading } = useHabits();
  const { reflections, isLoading: reflectionsLoading } = useNotionReflections();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  // Last 30 days for habit grid
  const last30Days = Array.from({ length: 30 }, (_, i) => subDays(new Date(), i)).reverse();

  // Combine or process data for charts
  const moodData = moodHistory?.map(log => {
    const logDate = log.date; 
    const reflection = reflections?.find(r => r.date === logDate);
    
    return {
      date: format(new Date(log.date), "MMM d"),
      fullDate: log.date,
      mood: log.moodScore,
      stress: log.stressScore,
      energy: log.energyScore,
      hasReflection: reflection ? 1 : 0,
      reflectionNotes: reflection?.notes || "",
      reflectionTags: reflection?.tags || [],
      notionMood: reflection?.mood || ""
    };
  }).reverse() || []; // Reverse to show chronological order

  const habitData = habitHistory?.map(log => ({
    date: format(new Date(log.date), "MMM d"),
    screenTime: log.screenTimeHours,
  })).reverse() || []; // Reverse to show chronological order

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 pb-24 lg:pb-6 max-w-[1600px] mx-auto w-full">
        <header className="mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-display font-bold">Your Insights</h2>
            <p className="text-muted-foreground">Visualize your journey to better health.</p>
          </motion.div>
        </header>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <motion.div variants={item} className="col-span-1 lg:col-span-2">
            <Card className="glass-card border-none overflow-hidden">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Mood & Energy Trends
                </CardTitle>
                <CardDescription>How you've been feeling over the last two weeks</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] lg:h-[400px] pt-6">
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
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'var(--card)', 
                          borderRadius: '12px', 
                          border: '1px solid var(--border)',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <Legend />
                      <Area type="monotone" dataKey="mood" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorMood)" strokeWidth={3} />
                      <Area type="monotone" dataKey="energy" stroke="#F59E0B" fillOpacity={1} fill="url(#colorEnergy)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-card border-none overflow-hidden">
              <CardHeader className="border-b border-border/50">
                <CardTitle>Screen Time Analysis</CardTitle>
                <CardDescription>Daily hours spent on screens</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] pt-6">
                {habitLoading ? (
                  <Skeleton className="w-full h-full rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={habitData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="date" tick={{fontSize: 12}} />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'var(--card)', 
                          borderRadius: '12px', 
                          border: '1px solid var(--border)',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }} 
                      />
                      <Bar dataKey="screenTime" name="Screen Time (hrs)" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item}>
            <Card className="glass-card border-none bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
              <CardHeader className="border-b border-border/50">
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-background/50 rounded-xl border border-border/50 shadow-sm hover:border-primary/20 transition-colors">
                    <span className="text-muted-foreground font-medium">Average Mood</span>
                    <span className="font-bold text-2xl text-primary">
                      {moodHistory && moodHistory.length > 0 
                        ? (moodHistory.reduce((a, b) => a + b.moodScore, 0) / moodHistory.length).toFixed(1) 
                        : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-background/50 rounded-xl border border-border/50 shadow-sm hover:border-green-500/20 transition-colors">
                    <span className="text-muted-foreground font-medium">Check-in Streak</span>
                    <span className="font-bold text-2xl text-green-500">
                      {moodHistory ? moodHistory.length : 0} Days
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-background/50 rounded-xl border border-border/50 shadow-sm hover:border-blue-500/20 transition-colors">
                    <span className="text-muted-foreground font-medium">Screen Time Avg</span>
                    <span className="font-bold text-2xl text-blue-500">
                      {habitHistory && habitHistory.length > 0
                        ? (habitHistory.reduce((a, b) => a + (b.screenTimeHours || 0), 0) / habitHistory.length).toFixed(1) + "h"
                        : "-"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={item} className="col-span-1 lg:col-span-2">
            <Card className="glass-card border-none overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Quote className="w-5 h-5 text-primary" />
                    Notion Reflection Correlation
                  </CardTitle>
                  <CardDescription>Correlation between journaling and reported mood scores</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="h-[300px] pt-6">
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
                              <div className="bg-card p-4 border border-border rounded-xl shadow-xl max-w-[300px]">
                                <p className="font-bold mb-1">{data.date}</p>
                                <p className="text-sm text-primary mb-2">Mood Score: {data.mood}</p>
                                {data.hasReflection === 1 ? (
                                  <div className="space-y-2">
                                    <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none rounded-full">
                                      Reflection Logged
                                    </Badge>
                                    {data.notionMood && (
                                      <p className="text-xs font-medium">Notion Mood: <span className="text-muted-foreground">{data.notionMood}</span></p>
                                    )}
                                    {data.reflectionNotes && (
                                      <p className="text-xs text-muted-foreground italic line-clamp-3">
                                        "{data.reflectionNotes}"
                                      </p>
                                    )}
                                    {data.reflectionTags.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1">
                                        {data.reflectionTags.map((tag: string) => (
                                          <span key={tag} className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <Badge variant="secondary" className="mt-2 rounded-full">No Reflection</Badge>
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
          </motion.div>

          <motion.div variants={item} className="col-span-1 lg:col-span-2">
            <Card className="glass-card border-none overflow-hidden">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Habit Consistency (Last 30 Days)
                </CardTitle>
                <CardDescription>Visualizing your routine follow-through and activity</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
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
          </motion.div>
        </motion.div>
      </main>
      <MobileNav />
    </div>
  );
}
