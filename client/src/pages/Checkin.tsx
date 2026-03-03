import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMood, useHabits } from "@/hooks/use-tracking";
import { useLocation } from "wouter";
import { Loader2, Smile, Frown, Meh, Sun, Zap } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";

export default function Checkin() {
  const { logMood, isLogging } = useMood();
  const { logHabit } = useHabits();
  const [_, setLocation] = useLocation();

  const [moodScore, setMoodScore] = useState([3]);
  const [stressScore, setStressScore] = useState([3]);
  const [energyScore, setEnergyScore] = useState([3]);
  const [sleepScore, setSleepScore] = useState([7]); // hours of sleep roughly
  const [notes, setNotes] = useState("");
  
  const [habitRoutine, setHabitRoutine] = useState(false);
  const [habitPhysical, setHabitPhysical] = useState(false);
  const [screenTime, setScreenTime] = useState([4]);

  const handleSubmit = async () => {
    try {
      await logMood({
        moodScore: moodScore[0],
        stressScore: stressScore[0],
        energyScore: energyScore[0],
        sleepScore: sleepScore[0],
        notes: notes,
        date: format(new Date(), 'yyyy-MM-dd')
      });
      
      await logHabit({
        date: format(new Date(), 'yyyy-MM-dd'),
        routineFollowed: habitRoutine,
        extraPhysicalActivity: habitPhysical,
        screenTimeHours: screenTime[0]
      });

      toast({ title: "Check-in Complete!", description: "Your mood and habits have been logged." });
      setLocation("/dashboard");
    } catch (e) {
      toast({ title: "Error", description: "Failed to save check-in.", variant: "destructive" });
    }
  };

  const getMoodIcon = (val: number) => {
    if (val <= 2) return <Frown className="w-8 h-8 text-red-400" />;
    if (val === 3) return <Meh className="w-8 h-8 text-yellow-400" />;
    return <Smile className="w-8 h-8 text-green-400" />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 pb-24 lg:pb-6 max-w-3xl mx-auto w-full">
        <header className="mb-8">
          <h2 className="text-3xl font-display font-bold">Daily Check-in</h2>
          <p className="text-muted-foreground">Take a moment to reflect on your day.</p>
        </header>

        <div className="space-y-6">
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>How are you feeling?</CardTitle>
              <CardDescription>Rate your current state (1-5)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Mood</Label>
                  {getMoodIcon(moodScore[0])}
                </div>
                <Slider value={moodScore} onValueChange={setMoodScore} min={1} max={5} step={1} className="py-4" />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Awful</span>
                  <span>Okay</span>
                  <span>Great</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Stress Level</Label>
                  <span className="font-bold text-lg">{stressScore[0]}</span>
                </div>
                <Slider value={stressScore} onValueChange={setStressScore} min={1} max={5} step={1} className="py-4" />
                <div className="flex justify-between text-xs text-muted-foreground px-1">
                  <span>Relaxed</span>
                  <span>Stressed</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Energy Level</Label>
                  <Zap className={`w-6 h-6 ${energyScore[0] > 3 ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} />
                </div>
                <Slider value={energyScore} onValueChange={setEnergyScore} min={1} max={5} step={1} className="py-4" />
              </div>

            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Habits & Lifestyle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-center space-x-4 p-4 rounded-xl bg-muted/30">
                <Checkbox id="routine" checked={habitRoutine} onCheckedChange={(c) => setHabitRoutine(!!c)} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="routine" className="font-medium text-base cursor-pointer">Followed my routine</Label>
                  <p className="text-xs text-muted-foreground">Did you stick to your planned schedule?</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 rounded-xl bg-muted/30">
                <Checkbox id="physical" checked={habitPhysical} onCheckedChange={(c) => setHabitPhysical(!!c)} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="physical" className="font-medium text-base cursor-pointer">Physical Activity</Label>
                  <p className="text-xs text-muted-foreground">Did you move your body today?</p>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Screen Time (Hours)</Label>
                <div className="flex items-center gap-4">
                  <Slider value={screenTime} onValueChange={setScreenTime} min={0} max={16} step={1} className="flex-1" />
                  <span className="w-12 text-center font-bold text-lg">{screenTime[0]}h</span>
                </div>
              </div>

            </CardContent>
          </Card>

          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle>Journal Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Write down any thoughts or feelings..." 
                className="min-h-[120px] resize-none text-base"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          <Button 
            onClick={handleSubmit} 
            className="w-full btn-primary h-14 text-lg"
            disabled={isLogging}
          >
            {isLogging ? <Loader2 className="animate-spin mr-2" /> : "Complete Check-in"}
          </Button>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
