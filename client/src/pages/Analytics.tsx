import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { useMood, useHabits } from "@/hooks/use-tracking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Analytics() {
  const { history: moodHistory, isLoading: moodLoading } = useMood();
  const { history: habitHistory, isLoading: habitLoading } = useHabits();

  // Combine or process data for charts
  const moodData = moodHistory?.map(log => ({
    date: format(new Date(log.date), "MMM d"),
    mood: log.moodScore,
    stress: log.stressScore,
    energy: log.energyScore
  })).slice(-14) || []; // Last 14 entries

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
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
