import { useAuth, useProfile } from "@/hooks/use-auth";
import { useCurrentPlan, useTasks } from "@/hooks/use-tasks";
import { useMood } from "@/hooks/use-tracking";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, Circle, Sun, Moon, Music, Gamepad2, Brain, Dumbbell } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, LineChart, Line, XAxis, Tooltip, CartesianGrid } from "recharts";

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { plan, completeTask, isLoading: planLoading } = useCurrentPlan();
  const { history, isLoading: moodLoading } = useMood();

  const today = format(new Date(), "yyyy-MM-dd");
  
  // Filter tasks for today
  const todaysTasks = plan?.items.filter(item => {
    // Basic date comparison logic
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
          <div>
            <h2 className="text-3xl font-display font-bold">Good {new Date().getHours() < 12 ? "Morning" : "Evening"}, {user?.name?.split(' ')[0]}</h2>
            <p className="text-muted-foreground">Ready to find your balance today?</p>
          </div>
          <Link href="/checkin">
            <Button className="btn-primary">Daily Check-in</Button>
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Today's Plan Column */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Today's Focus</CardTitle>
                <Link href="/planner" className="text-sm text-primary hover:underline flex items-center gap-1">
                  View Full Week <ArrowRight className="w-4 h-4" />
                </Link>
              </CardHeader>
              <CardContent>
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
            <Card className="border-none shadow-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl">Mood Trends</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                {moodLoading ? (
                  <Skeleton className="w-full h-full rounded-xl" />
                ) : history && history.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history.slice(-7)}>
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
                          borderRadius: '8px', 
                          border: '1px solid var(--border)' 
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="moodScore" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3} 
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }} 
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
          </div>

          {/* Right Column - Quick Actions / Stats */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-2">Daily Inspiration</h3>
                <p className="text-sm opacity-90 italic">"The greatest wealth is health."</p>
                <p className="text-xs mt-2 opacity-70">— Virgil</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Sleep Goal</span>
                  <span className="font-medium">{profile?.sleepTime || "--:--"}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">Activity Level</span>
                  <span className="font-medium capitalize">{profile?.physicalActivity || "Not set"}</span>
                </div>
                <Link href="/onboarding">
                  <Button variant="outline" className="w-full text-xs h-8 mt-2">Update Profile</Button>
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
