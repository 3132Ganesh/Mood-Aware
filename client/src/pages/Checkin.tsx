import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { MoodSwingDialog } from "@/components/MoodSwingDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useMood, useHabits, useCapsules, useMoodSwings } from "@/hooks/use-tracking";
import { useLocation, Link } from "wouter";
import { 
  Loader2, Sparkles, Zap, Heart, CheckCircle2, 
  ArrowRight, BarChart3, Moon, Activity, Clock, Plus, TrendingUp, Compass
} from "lucide-react";
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
  const { history: moodHistory, logMood, isLogging, isLoading: isMoodLoading } = useMood();
  const { history: habitHistory, logHabit, isLogging: isHabitLogging } = useHabits();
  const { createCapsule, isCreating: isCapsuleCreating } = useCapsules();
  const [_, setLocation] = useLocation();

  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const todaysMoodLog = moodHistory?.find(m => String(m.date).split('T')[0] === todayStr);
  const todaysHabitLog = habitHistory?.find(h => String(h.date).split('T')[0] === todayStr);
  const alreadyCheckedInToday = Boolean(todaysMoodLog);

  const { swings: todaySwings, isLoading: isSwingsLoading } = useMoodSwings(todayStr);

  const [swingDialogOpen, setSwingDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  const [moodScore, setMoodScore] = useState<number>(4);
  const [stressScore, setStressScore] = useState<number[]>([2]);
  const [energyScore, setEnergyScore] = useState<number[]>([4]);
  const [sleepScore, setSleepScore] = useState<number[]>([7]);
  const [notes, setNotes] = useState("");
  
  const [habitRoutine, setHabitRoutine] = useState(true);
  const [habitPhysical, setHabitPhysical] = useState(true);
  const [screenTime, setScreenTime] = useState<number[]>([4]);

  // Future self time capsule
  const [capsuleMessage, setCapsuleMessage] = useState("");
  const [saveCapsule, setSaveCapsule] = useState(false);

  const selectedMood = MOOD_OPTIONS.find(m => m.value === moodScore) || MOOD_OPTIONS[3];

  // Calculate 24-hour reset countdown from check-in creation time or until midnight
  useEffect(() => {
    if (!alreadyCheckedInToday || !todaysMoodLog) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
      // Target: 24 hours after check-in, or next day midnight
      const checkinDate = todaysMoodLog.createdAt ? new Date(todaysMoodLog.createdAt) : new Date();
      const targetTime = new Date(checkinDate.getTime() + 24 * 60 * 60 * 1000);
      
      const diffMs = targetTime.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, [alreadyCheckedInToday, todaysMoodLog]);

  const handleSubmit = async () => {
    if (alreadyCheckedInToday || isLogging || isHabitLogging) {
      toast({ title: "Already Checked In", description: "You have already completed your reflection for today." });
      return;
    }

    try {
      await logMood({
        moodScore: moodScore,
        moodLabel: selectedMood.label,
        stressScore: stressScore[0],
        energyScore: energyScore[0],
        sleepScore: sleepScore[0],
        notes: notes,
        date: todayStr
      });
      
      await logHabit({
        date: todayStr,
        routineFollowed: habitRoutine,
        extraPhysicalActivity: habitPhysical,
        screenTimeHours: screenTime[0]
      });

      // Save time capsule if written
      if (saveCapsule && capsuleMessage.trim()) {
        createCapsule({
          message: capsuleMessage.trim(),
          moodScore: moodScore,
        });
      }

      toast({ title: "Check-in Complete! ✨", description: "Your baseline mood, habits, and reflections have been recorded." });
      setLocation("/dashboard");
    } catch (e: any) {
      toast({ title: "Check-in Notice", description: e?.message || "Failed to save check-in.", variant: "destructive" });
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
          <p className="text-sm text-muted-foreground">Take a moment to tune in to your mental and emotional state.</p>
        </header>

        {isMoodLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : alreadyCheckedInToday ? (
          /* Already Checked In View with 24-Hour Reset Countdown & Mood Swing Logger */
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Primary Status Card */}
            <Card className="border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-card to-primary/10 shadow-xl rounded-3xl overflow-hidden backdrop-blur-sm">
              <CardContent className="p-6 sm:p-8 text-center space-y-5">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-2">
                    ✓ Daily Check-in Saved for {format(new Date(), "MMM d")}
                  </div>
                  <h3 className="text-2xl font-display font-bold text-foreground">
                    You're All Checked In!
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    Your daily baseline is securely recorded. Check-in unlocks automatically every 24 hours.
                  </p>
                </div>

                {/* Live 24-Hour Reset Countdown Timer */}
                {timeLeft && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border border-border/80 shadow-sm text-xs font-medium text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary animate-pulse" />
                    <span>Next fresh check-in resets in:</span>
                    <span className="font-bold text-foreground font-mono">
                      {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                    </span>
                  </div>
                )}

                {/* Today's Recorded Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-1">
                  <div className="p-3.5 rounded-2xl bg-card/80 border border-border/80 shadow-sm">
                    <span className="text-[11px] text-muted-foreground font-medium block">Baseline Mood</span>
                    <p className="text-base font-bold mt-1 text-foreground flex items-center gap-1.5">
                      <span className="text-xl">
                        {MOOD_OPTIONS.find(m => m.value === todaysMoodLog?.moodScore)?.emoji || "😊"}
                      </span>
                      {todaysMoodLog?.moodLabel || `${todaysMoodLog?.moodScore}/5`}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-card/80 border border-border/80 shadow-sm">
                    <span className="text-[11px] text-muted-foreground font-medium block">Energy</span>
                    <p className="text-base font-bold mt-1 text-foreground flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" /> {todaysMoodLog?.energyScore ?? "—"}/5
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-card/80 border border-border/80 shadow-sm">
                    <span className="text-[11px] text-muted-foreground font-medium block">Sleep</span>
                    <p className="text-base font-bold mt-1 text-foreground flex items-center gap-1.5">
                      <Moon className="w-4 h-4 text-blue-500" /> {todaysMoodLog?.sleepScore ?? "—"} hrs
                    </p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-card/80 border border-border/80 shadow-sm">
                    <span className="text-[11px] text-muted-foreground font-medium block">Routine</span>
                    <p className="text-base font-bold mt-1 text-foreground flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-500" /> 
                      {todaysHabitLog?.routineFollowed ? "Followed" : "Flexible"}
                    </p>
                  </div>
                </div>

                {todaysMoodLog?.notes && (
                  <div className="p-4 rounded-2xl bg-card/60 border border-border/60 text-left">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                      Today's Reflection Note
                    </span>
                    <p className="text-sm text-foreground italic">"{todaysMoodLog.notes}"</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Mood Swing Shift Card */}
            <Card className="border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-card to-orange-500/10 rounded-3xl shadow-md backdrop-blur-sm overflow-hidden">
              <CardContent className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5" /> Experienced a Mood Swing?
                  </div>
                  <h4 className="text-base font-bold text-foreground">Track In-The-Moment Mood Shifts</h4>
                  <p className="text-xs text-muted-foreground max-w-sm">
                    Did something happen later today? Log quick emotional fluctuations without altering your daily baseline.
                  </p>
                </div>
                <Button 
                  onClick={() => setSwingDialogOpen(true)}
                  className="rounded-2xl h-11 px-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/25 flex items-center gap-2 flex-shrink-0"
                >
                  <Plus className="w-4 h-4" /> Record Mood Swing
                </Button>
              </CardContent>
            </Card>

            {/* Today's Recorded Mood Swings Timeline */}
            {todaySwings && todaySwings.length > 0 && (
              <Card className="border-none shadow-md bg-card/70 backdrop-blur-sm rounded-3xl">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-primary" /> Today's Mood Swings & Shifts ({todaySwings.length})
                      </CardTitle>
                      <CardDescription className="text-xs">Recorded intraday emotional shifts</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-0">
                  {todaySwings.map((swing) => {
                    const moodObj = MOOD_OPTIONS.find(m => m.value === swing.newMoodScore) || MOOD_OPTIONS[2];
                    return (
                      <div key={swing.id} className="p-3.5 rounded-2xl bg-card border border-border/70 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="text-2xl filter drop-shadow-sm">{moodObj.emoji}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">{moodObj.label}</span>
                              {swing.trigger && (
                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                  {swing.trigger}
                                </span>
                              )}
                              <span className="text-[11px] text-muted-foreground">Intensity: {swing.intensity}/5</span>
                            </div>
                            {swing.notes && (
                              <p className="text-xs text-muted-foreground mt-1 italic leading-relaxed">
                                "{swing.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                          {swing.timestamp ? format(new Date(swing.timestamp), "h:mm a") : "Today"}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            {/* Navigation Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/dashboard">
                <Button className="w-full sm:w-auto btn-primary rounded-2xl h-11 px-6 shadow-md shadow-primary/20">
                  Go to Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="w-full sm:w-auto rounded-2xl h-11 px-6 border-border">
                  <BarChart3 className="w-4 h-4 mr-2" /> View Analytics
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          /* Check-in Form */
          <div className="space-y-5">
            {/* Mood Selector Card */}
            <Card className="border-none shadow-md bg-card/70 backdrop-blur-sm overflow-hidden rounded-3xl">
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
                        <span className="text-2xl sm:text-3xl filter drop-shadow-sm select-none">{option.emoji}</span>
                        <span className="text-xs font-semibold mt-1.5">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Sliders Card: Stress, Energy, Sleep */}
            <Card className="border-none shadow-md bg-card/70 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Energy & Vitality</CardTitle>
                <CardDescription>Calibrate your physical and mental levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Zap className="w-3.5 h-3.5 text-amber-500" /> Energy Level
                    </Label>
                    <span className="font-bold text-xs">{energyScore[0]}/5 ({energyScore[0] <= 2 ? "Drained" : energyScore[0] <= 4 ? "Good" : "Vibrant"})</span>
                  </div>
                  <Slider value={energyScore} onValueChange={setEnergyScore} min={1} max={5} step={1} className="py-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" /> Stress Level
                    </Label>
                    <span className="font-bold text-xs">{stressScore[0]}/5 ({stressScore[0] <= 2 ? "Calm" : stressScore[0] <= 3 ? "Moderate" : "Elevated"})</span>
                  </div>
                  <Slider value={stressScore} onValueChange={setStressScore} min={1} max={5} step={1} className="py-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Moon className="w-3.5 h-3.5 text-blue-500" /> Sleep Duration
                    </Label>
                    <span className="font-bold text-xs">{sleepScore[0]} hours</span>
                  </div>
                  <Slider value={sleepScore} onValueChange={setSleepScore} min={2} max={12} step={0.5} className="py-2" />
                </div>
              </CardContent>
            </Card>

            {/* Habits Check */}
            <Card className="border-none shadow-md bg-card/70 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Habits & Routine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div 
                  onClick={() => setHabitRoutine(!habitRoutine)}
                  className={cn(
                    "flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer",
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
                    "flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer",
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

            {/* Quick Journal Notes with Voice Dictation */}
            <Card className="border-none shadow-md bg-card/70 backdrop-blur-sm rounded-3xl">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Quick Note (Optional)</CardTitle>
                  <CardDescription>Type or speak your thoughts</CardDescription>
                </div>
                <VoiceRecorder 
                  onTranscript={(spokenText) => setNotes((prev) => prev ? `${prev} ${spokenText}` : spokenText)} 
                />
              </CardHeader>
              <CardContent>
                <Textarea 
                  placeholder="What made you smile or stressed today? (Or tap Voice Record to speak)" 
                  className="min-h-[90px] resize-none text-sm rounded-2xl leading-relaxed"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </CardContent>
            </Card>

            <Button 
              onClick={handleSubmit} 
              className="w-full btn-primary h-12 text-base font-semibold rounded-2xl shadow-lg shadow-primary/25"
              disabled={isLogging || isHabitLogging || alreadyCheckedInToday}
            >
              {isLogging || isHabitLogging ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : "Save Check-in 🌿"}
            </Button>
          </div>
        )}

        {/* Mood Swing Dialog Modal */}
        <MoodSwingDialog 
          open={swingDialogOpen} 
          onOpenChange={setSwingDialogOpen}
          currentMoodScore={todaysMoodLog?.moodScore || moodScore}
        />
      </main>
      <MobileNav />
    </div>
  );
}
