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
import { Loader2, Smile, Frown, Meh, Sparkles, Zap, Heart, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const MOOD_OPTIONS = [
  { value: 1, label: "Rough", emoji: "😫", color: "from-red-500/20 to-rose-500/20 text-rose-600 border-rose-200 dark:border-rose-900" },
  { value: 2, label: "Low", emoji: "😔", color: "from-orange-500/20 to-amber-500/20 text-amber-600 border-amber-200 dark:border-amber-900" },
  { value: 3, label: "Okay", emoji: "😐", color: "from-yellow-500/20 to-lime-500/20 text-yellow-600 border-yellow-200 dark:border-yellow-900" },
  { value: 4, label: "Good", emoji: "😊", color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 border-emerald-200 dark:border-emerald-900" },
  { value: 5, label: "Great", emoji: "🤩", color: "from-purple-500/20 to-indigo-500/20 text-purple-600 border-purple-200 dark:border-purple-900" },
];

export default function Checkin() {
  const { logMood, isLogging } = useMood();
  const { logHabit } = useHabits();
  const [_, setLocation] = useLocation();

  const [moodScore, setMoodScore] = useState<number>(4);
  const [stressScore, setStressScore] = useState<number[]>([2]);
  const [energyScore, setEnergyScore] = useState<number[]>([4]);
  const [sleepScore, setSleepScore] = useState<number[]>([7]);
  const [notes, setNotes] = useState("");
  
  const [habitRoutine, setHabitRoutine] = useState(true);
  const [habitPhysical, setHabitPhysical] = useState(true);
  const [screenTime, setScreenTime] = useState<number[]>([4]);

  const selectedMood = MOOD_OPTIONS.find(m => m.value === moodScore) || MOOD_OPTIONS[3];

  const handleSubmit = async () => {
    try {
      await logMood({
        moodScore: moodScore,
        moodLabel: selectedMood.label,
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

      toast({ title: "Check-in Complete! ✨", description: "Your mood and habits have been saved." });
      setLocation("/dashboard");
    } catch (e) {
      toast({ title: "Error", description: "Failed to save check-in.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 pb-28 lg:pb-8 max-w-2xl mx-auto w-full">
        <header className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
            <Heart className="w-3.5 h-3.5" /> Daily Reflection
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold">Daily Check-in</h2>
          <p className="text-sm text-muted-foreground">Take a moment to tune in to how you feel.</p>
        </header>

        <div className="space-y-5">
          {/* Mood Selector Card */}
          <Card className="border-none shadow-md bg-card/70 backdrop-blur-sm overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">How are you feeling right now?</CardTitle>
              <CardDescription>Tap an emoji that best matches your emotional state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                {MOOD_OPTIONS.map((option) => {
                  const isSelected = moodScore === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMoodScore(option.value)}
                      className={cn(
                        "flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all duration-200 active:scale-90",
                        isSelected 
                          ? "bg-gradient-to-b border-primary shadow-lg shadow-primary/20 scale-105 " + option.color
                          : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border"
                      )}
                    >
                      <span className="text-2xl sm:text-3xl filter drop-shadow-sm">{option.emoji}</span>
                      <span className="text-[11px] font-bold mt-1.5">{option.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Stress and Energy Quick Sliders */}
              <div className="pt-4 border-t border-border/50 space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <Label className="font-medium text-foreground">Stress Level</Label>
                    <span className={cn(
                      "font-bold px-2 py-0.5 rounded-lg text-xs",
                      stressScore[0] <= 2 ? "bg-emerald-500/10 text-emerald-600" :
                      stressScore[0] <= 3 ? "bg-amber-500/10 text-amber-600" : "bg-rose-500/10 text-rose-600"
                    )}>
                      {stressScore[0] === 1 ? "Very Low" : stressScore[0] === 2 ? "Mild" : stressScore[0] === 3 ? "Moderate" : stressScore[0] === 4 ? "High" : "Extreme"} ({stressScore[0]}/5)
                    </span>
                  </div>
                  <Slider value={stressScore} onValueChange={setStressScore} min={1} max={5} step={1} className="py-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <Label className="font-medium text-foreground">Energy Level</Label>
                    <span className="font-bold text-xs px-2 py-0.5 rounded-lg bg-yellow-500/10 text-yellow-600">
                      {energyScore[0]}/5
                    </span>
                  </div>
                  <Slider value={energyScore} onValueChange={setEnergyScore} min={1} max={5} step={1} className="py-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <Label className="font-medium text-foreground">Sleep Duration (Last Night)</Label>
                    <span className="font-bold text-xs px-2 py-0.5 rounded-lg bg-blue-500/10 text-blue-600">
                      {sleepScore[0]} hours
                    </span>
                  </div>
                  <Slider value={sleepScore} onValueChange={setSleepScore} min={2} max={12} step={0.5} className="py-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Habits & Screen Time Card */}
          <Card className="border-none shadow-md bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Habits & Routine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div 
                onClick={() => setHabitRoutine(!habitRoutine)}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer",
                  habitRoutine ? "bg-primary/5 border-primary/40" : "bg-muted/20 border-border/60"
                )}
              >
                <Checkbox 
                  id="routine" 
                  checked={habitRoutine} 
                  onCheckedChange={(c) => setHabitRoutine(!!c)} 
                />
                <div className="grid gap-0.5 leading-tight flex-1">
                  <span className="font-medium text-sm">Followed daily routine</span>
                  <span className="text-xs text-muted-foreground">Stuck to regular schedule & habits</span>
                </div>
              </div>

              <div 
                onClick={() => setHabitPhysical(!habitPhysical)}
                className={cn(
                  "flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer",
                  habitPhysical ? "bg-primary/5 border-primary/40" : "bg-muted/20 border-border/60"
                )}
              >
                <Checkbox 
                  id="physical" 
                  checked={habitPhysical} 
                  onCheckedChange={(c) => setHabitPhysical(!!c)} 
                />
                <div className="grid gap-0.5 leading-tight flex-1">
                  <span className="font-medium text-sm">Active movement</span>
                  <span className="text-xs text-muted-foreground">Walking, workout, or stretching</span>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <Label className="text-xs text-muted-foreground">Screen Time</Label>
                  <span className="font-bold text-xs">{screenTime[0]} hrs</span>
                </div>
                <Slider value={screenTime} onValueChange={setScreenTime} min={0} max={16} step={1} className="py-2" />
              </div>
            </CardContent>
          </Card>

          {/* Quick Journal Notes */}
          <Card className="border-none shadow-md bg-card/70 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Quick Note (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="What made you smile or stressed today?" 
                className="min-h-[90px] resize-none text-sm rounded-xl"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          <Button 
            onClick={handleSubmit} 
            className="w-full btn-primary h-12 text-base font-semibold rounded-2xl shadow-lg shadow-primary/25"
            disabled={isLogging}
          >
            {isLogging ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Save Check-in"}
          </Button>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
