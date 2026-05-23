import { useAuth, useProfile } from "@/hooks/use-auth";
import { useCurrentPlan, useTasks } from "@/hooks/use-tasks";
import { useMood } from "@/hooks/use-tracking";
import { useNotionReflections } from "@/hooks/use-notion";
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
      <main className="flex-1 lg:ml-64 p-6 pb-24 lg:pb-6 max-w-[1600px] mx-auto w-full">
        <header className="mb-8 flex justify-between items-center">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-display font-bold">Good {new Date().getHours() < 12 ? "Morning" : "Evening"}, {user?.name?.split(' ')[0]}</h2>
            <p className="text-muted-foreground">Ready to find your balance today?</p>
          </motion.div>
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex gap-4 items-center"
          >
            <Link href="/immersive">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 transition-colors">
                <Sparkles className="w-4 h-4 mr-2" />
                Immersive View
              </Button>
            </Link>
            <Link href="/checkin">
              <Button className="btn-primary">Daily Check-in</Button>
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
            <Card className="glass-card border-none overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-border/50">
                <CardTitle className="text-xl">Today's Focus</CardTitle>
                <Link href="/planner" className="text-sm text-primary hover:underline flex items-center gap-1">
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
                  <div className="space-y-3">
                    {todaysTasks.map((item) => (
                      <div 
                        key={item.id}
                        className={`
                          group flex items-center gap-4 p-4 rounded-xl border transition-all duration-300
                          ${item.isCompleted 
                            ? "bg-muted/50 border-transparent opacity-60" 
                            : "bg-card border-border hover:border-primary/50 hover:shadow-md"
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
                            <CheckCircle2 className="w-6 h-6 fill-primary/20" />
                          ) : (
                            <Circle className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          )}
                        </button>
                        
                        <div className="flex-1">
                          <h4 className={`font-medium ${item.isCompleted && "line-through"}`}>
                            {item.task.title}
                          </h4>
                          <p className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
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
            <Card className="glass-card border-none overflow-hidden">
              <CardHeader className="border-b border-border/50 flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Mood Trends</CardTitle>
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary" /> Mood
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary/30" /> Reflection
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
                        tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--card)', 
                          borderRadius: '12px', 
                          border: '1px solid var(--border)',
                          boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                        }} 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-card p-3 border border-border rounded-xl shadow-xl">
                                <p className="font-bold text-sm mb-1">{format(new Date(data.date), 'MMM d, yyyy')}</p>
                                <p className="text-sm text-primary">Mood: {data.moodScore}</p>
                                {data.hasReflection && (
                                  <Badge className="mt-2 bg-primary/10 text-primary border-none text-[10px] h-5">
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
                                <circle cx={cx} cy={cy} r={10} stroke="hsl(var(--primary))" strokeWidth={1} fill="none" opacity={0.3} />
                              </g>
                            );
                          }
                          return <circle key={payload.id} cx={cx} cy={cy} r={4} fill="hsl(var(--primary))" />;
                        }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <p>No mood data yet.</p>
                    <Link href="/checkin" className="mt-2 text-primary hover:underline">Log your first check-in</Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Right Column - Quick Actions / Stats */}
          <motion.div variants={item} className="space-y-6">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-xl shadow-primary/20 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Quote className="w-12 h-12" />
              </div>
              <CardContent className="p-6 relative z-10">
                <h3 className="text-lg font-bold mb-2">Daily Inspiration</h3>
                <p className="text-sm opacity-90 italic">"The greatest wealth is health."</p>
                <p className="text-xs mt-4 font-medium opacity-70">— Virgil</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-none overflow-hidden">
              <CardHeader className="border-b border-border/50">
                <CardTitle className="text-lg">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-transparent hover:border-primary/20 transition-colors">
                  <span className="text-sm text-muted-foreground">Sleep Goal</span>
                  <span className="font-medium">{profile?.sleepTime || "--:--"}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-transparent hover:border-primary/20 transition-colors">
                  <span className="text-sm text-muted-foreground">Activity Level</span>
                  <span className="font-medium capitalize">{profile?.physicalActivity || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-transparent hover:border-primary/20 transition-colors">
                  <span className="text-sm text-muted-foreground">Notion</span>
                  <Badge variant={profile?.notionToken ? "default" : "secondary"} className="h-5 text-[10px]">
                    {profile?.notionToken ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <Link href="/onboarding">
                  <Button variant="outline" className="w-full text-xs h-9 mt-2 rounded-xl">Update Profile</Button>
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
          <Card className="glass-card border-none overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-muted/20">
              <CardTitle className="text-xl flex items-center gap-2">
                <Quote className="w-5 h-5 text-primary" />
                Notion Reflections
              </CardTitle>
              {reflections && reflections.length > 0 && (
                <Badge variant="outline" className="font-normal rounded-full bg-background/50">Last 5 Entries</Badge>
              )}
            </CardHeader>
            <CardContent className="p-0">
              {reflectionsLoading ? (
                <div className="p-6 space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : reflections && reflections.length > 0 ? (
                <div className="divide-y divide-border/50">
                  {reflections.map((reflection) => (
                    <div key={reflection.id} className="p-6 hover:bg-muted/30 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-primary">
                            {format(new Date(reflection.date), 'MMM d, yyyy')}
                          </span>
                          <Badge variant="secondary" className="capitalize">
                            {reflection.mood}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          {reflection.tags.map(tag => (
                            <span key={tag} className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed italic">
                        "{reflection.notes || "No reflection notes for this entry."}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-6">
                  <Quote className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                  <p className="text-muted-foreground mb-2">
                    {!profile?.notionToken 
                      ? "Notion integration is not set up yet." 
                      : "No reflections found in your Notion database."}
                  </p>
                  {!profile?.notionToken ? (
                    <Link href="/onboarding">
                      <Button variant="outline" size="sm" className="mt-2">
                        Configure Notion
                      </Button>
                    </Link>
                  ) : (
                    <p className="text-xs text-muted-foreground">Reflections logged during check-in will appear here.</p>
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
