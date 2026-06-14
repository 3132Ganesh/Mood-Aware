import { useAuth, useProfile } from "@/hooks/use-auth";
import { useCurrentPlan, useTasks } from "@/hooks/use-tasks";
import { useMood } from "@/hooks/use-tracking";
import { useNotionReflections } from "@/hooks/use-notion";
import { SpotifyMood } from "@/components/SpotifyMood";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Circle, Sun, Moon, Music, Gamepad2, Brain, Dumbbell, Sparkles, Quote } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { plan, completeTask, isLoading: planLoading } = useCurrentPlan();
  const { history, isLoading: moodLoading } = useMood();
  const { reflections, isLoading: reflectionsLoading } = useNotionReflections();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const today = format(new Date(), "yyyy-MM-dd");
  
  // Filter tasks for today
  const todaysTasks = plan?.items.filter(item => {
    const itemDate = new Date(item.dayDate).toISOString().split('T')[0];
    return itemDate === today;
  }) || [];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "mental": return <Brain className="w-4 h-4 text-purple-500" />;
      case "physical": return <Dumbbell className="w-4 h-4 text-green-500" />;
      case "music": return <Music className="w-4 h-4 text-pink-500" />;
      case "game": return <Gamepad2 className="w-4 h-4 text-blue-500" />;
      default: return <Sun className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-6 pb-24 lg:pb-6 max-w-[1600px] mx-auto w-full">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">Good {new Date().getHours() < 12 ? "Morning" : "Evening"}, {user?.name?.split(' ')[0]}</h2>
            <p className="text-base md:text-lg text-muted-foreground font-medium mt-1">Ready to find your balance today?</p>
          </motion.div>
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap gap-2 md:gap-4 items-center w-full sm:w-auto"
          >
            <Link href="/immersive" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full h-12 px-6 rounded-xl font-bold uppercase tracking-wide border-2 border-black dark:border-white hover:bg-black/5 dark:hover:bg-white/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,1)] transition-all">
                <Sparkles className="w-5 h-5 mr-2" />
                Immersive & Aura AI
              </Button>
            </Link>
            <Link href="/checkin" className="flex-1 sm:flex-none">
              <Button className="w-full h-12 px-8 rounded-xl font-bold uppercase tracking-wide bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all">Check-in</Button>
            </Link>
          </motion.div>
        </header>

        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Today's Plan Column */}
          <motion.div variants={item} className="md:col-span-2 space-y-6">
            <Card className="bg-white dark:bg-card border-2 border-black/10 dark:border-white/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b-2 border-black/10 dark:border-white/10 bg-muted/20">
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Today's Focus</CardTitle>
                <Link href="/planner" className="text-sm font-bold uppercase tracking-wider text-primary hover:underline flex items-center gap-1">
                  View Full Week <ArrowRight className="w-4 h-4" />
                </Link>
              </CardHeader>
              <CardContent className="pt-6">
                {planLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : todaysTasks.length > 0 ? (
                  <div className="space-y-4">
                    {todaysTasks.map((item) => (
                      <div 
                        key={item.id}
                        className={`
                          group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300
                          ${item.isCompleted 
                            ? "bg-muted/50 border-black/5 dark:border-white/5 opacity-60" 
                            : "bg-card border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.05)] dark:hover:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] cursor-pointer"
                          }
                        `}
                      >
                        <button 
                          onClick={() => completeTask({ 
                            planId: item.planId, 
                            taskId: item.taskId, 
                            isCompleted: !item.isCompleted 
                          })}
                          className="text-primary focus:outline-none"
                        >
                          {item.isCompleted ? (
                            <CheckCircle2 className="w-8 h-8 fill-black dark:fill-white text-white dark:text-black" />
                          ) : (
                            <Circle className="w-8 h-8 text-black/40 dark:text-white/40 group-hover:text-black dark:group-hover:text-white transition-colors border-2 border-transparent rounded-full" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg ${item.isCompleted && "line-through text-muted-foreground"}`}>
                            {item.task.title}
                          </h4>
                          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 mt-1">
                            {getCategoryIcon(item.task.category)}
                            <span className="uppercase tracking-wider text-xs">{item.task.category}</span>
                            <span>•</span>
                            <span>{item.task.duration} min</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed border-border">
                    <p className="text-muted-foreground mb-4">No plan generated for today.</p>
                    <Link href="/planner">
                      <Button variant="outline">Generate Plan</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mood Trends Mini Chart */}
            <Card className="bg-white dark:bg-card border-2 border-black/10 dark:border-white/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b-2 border-black/10 dark:border-white/10 bg-muted/20">
                <CardTitle className="text-2xl font-black uppercase tracking-tight">Mood Trends</CardTitle>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <div className="w-3 h-3 rounded-full bg-primary border-2 border-black/20 dark:border-white/20" /> Mood
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <div className="w-3 h-3 rounded-full bg-primary/30 border-2 border-black/20 dark:border-white/20" /> Reflection
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-64 pt-6">
                {moodLoading || reflectionsLoading ? (
                  <Skeleton className="w-full h-full rounded-xl" />
                ) : history && history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history.slice(0, 7).reverse().map(log => ({
                      ...log,
                      hasReflection: reflections?.some(r => r.date === log.date)
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(d) => format(new Date(d), 'EEE')}
                        tick={{ fontSize: 12, fill: 'var(--muted-foreground)', fontWeight: 'bold' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          borderRadius: '12px', 
                          border: '2px solid var(--border)',
                          boxShadow: '4px 4px 0px 0px rgba(0,0,0,0.1)'
                        }} 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-card p-4 border-2 border-border rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)]">
                                <p className="font-black uppercase tracking-wider text-sm mb-2">{format(new Date(data.date), 'MMM d, yyyy')}</p>
                                <p className="text-lg font-bold text-primary">Score: {data.moodScore}/10</p>
                                {data.hasReflection && (
                                  <Badge className="mt-2 bg-black text-white dark:bg-white dark:text-black border-none text-[10px] h-6 uppercase tracking-wider font-bold">
                                    Reflection Logged
                                  </Badge>
                                )}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="moodScore" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={4} 
                        dot={(props: any) => {
                          const { cx, cy, payload } = props;
                          if (payload.hasReflection) {
                            return (
                              <g key={payload.id}>
                                <circle cx={cx} cy={cy} r={6} fill="hsl(var(--primary))" />
                                <circle cx={cx} cy={cy} r={10} stroke="hsl(var(--primary))" strokeWidth={2} fill="none" opacity={0.5} />
                              </g>
                            );
                          }
                          return <circle key={payload.id} cx={cx} cy={cy} r={5} fill="hsl(var(--primary))" stroke="var(--background)" strokeWidth={2} />;
                        }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-muted/10 rounded-xl border-2 border-dashed border-border m-2">
                    <p className="font-medium">No mood data yet.</p>
                    <Link href="/checkin" className="mt-2 font-bold uppercase tracking-wider text-xs text-primary hover:underline bg-primary/10 px-4 py-2 rounded-lg">Log your first check-in</Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Quick Actions / Stats */}
          <motion.div variants={item} className="space-y-6">
            <Card className="bg-black text-white dark:bg-white dark:text-black border-2 border-black dark:border-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] rounded-2xl overflow-hidden relative group hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[10px_10px_0px_0px_rgba(255,255,255,0.2)] transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
                <Quote className="w-16 h-16" />
              </div>
              <CardContent className="p-8 relative z-10">
                <h3 className="text-sm font-black uppercase tracking-widest mb-4 opacity-70">Daily Focus</h3>
                <p className="text-xl font-bold leading-tight">"The greatest wealth is health."</p>
                <p className="text-sm mt-4 font-bold opacity-70 uppercase tracking-widest">— Virgil</p>
              </CardContent>
            </Card>

            <SpotifyMood />

            <Card className="bg-white dark:bg-card border-2 border-black/10 dark:border-white/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
              <CardHeader className="border-b-2 border-black/10 dark:border-white/10 bg-muted/20">
                <CardTitle className="text-xl font-black uppercase tracking-tight">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-4 bg-card rounded-xl border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sleep Goal</span>
                  <span className="font-black text-lg">{profile?.sleepTime || "--:--"}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-card rounded-xl border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Activity</span>
                  <span className="font-bold capitalize">{profile?.physicalActivity || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-card rounded-xl border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.05)]">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notion</span>
                  <Badge variant={profile?.notionToken ? "default" : "secondary"} className={`h-6 text-[10px] font-bold uppercase tracking-wider ${profile?.notionToken ? 'bg-black text-white dark:bg-white dark:text-black' : ''}`}>
                    {profile?.notionToken ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <Link href="/onboarding">
                  <Button variant="outline" className="w-full h-12 mt-4 rounded-xl font-bold uppercase tracking-wider border-2 hover:bg-muted">Update Profile</Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Notion Reflections Row */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-white dark:bg-card border-2 border-black/10 dark:border-white/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b-2 border-black/10 dark:border-white/10 bg-muted/20 p-6">
              <CardTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-3">
                <Quote className="w-6 h-6 text-primary" />
                Notion Reflections
              </CardTitle>
              {reflections && reflections.length > 0 && (
                <Badge variant="outline" className="font-bold uppercase tracking-wider rounded-full bg-background border-2 py-1 px-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">Last 5 Entries</Badge>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {reflectionsLoading ? (
                <div className="p-6 space-y-4 bg-card">
                  <Skeleton className="h-24 w-full rounded-xl" />
                  <Skeleton className="h-24 w-full rounded-xl" />
                </div>
              ) : reflections && reflections.length > 0 ? (
                <div className="divide-y-2 divide-border">
                  {reflections.map((reflection) => (
                    <div key={reflection.id} className="p-6 md:p-8 hover:bg-muted/10 transition-colors bg-card">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4">
                        <div className="flex items-center gap-4">
                          <span className="text-base font-black uppercase tracking-widest text-primary border-2 border-primary/20 px-3 py-1 rounded-lg bg-primary/5">
                            {format(new Date(reflection.date), 'MMM d, yyyy')}
                          </span>
                          <Badge variant="secondary" className="capitalize font-bold text-sm h-8 px-3">
                            {reflection.mood}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {reflection.tags.map(tag => (
                            <span key={tag} className="text-xs bg-black text-white dark:bg-white dark:text-black px-3 py-1 rounded-md uppercase font-bold tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)]">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-base md:text-lg text-foreground leading-relaxed font-medium">
                        "{reflection.notes || "No reflection notes for this entry."}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 px-6 bg-card">
                  <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                    <Quote className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-bold text-foreground mb-2">
                    {!profile?.notionToken 
                      ? "Notion is not connected." 
                      : "No reflections found yet."}
                  </p>
                  {!profile?.notionToken ? (
                    <Link href="/onboarding">
                      <Button className="mt-4 h-12 px-8 rounded-xl font-bold uppercase tracking-wider bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] transition-all">
                        Configure Notion
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Reflections logged during check-in will appear here.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </main>
      <MobileNav />
    </div>
  );
}
