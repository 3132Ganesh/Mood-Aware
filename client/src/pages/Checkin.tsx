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
import { Badge } from "@/components/ui/badge";
import { useMood, useHabits, useCapsules, useMoodSwings } from "@/hooks/use-tracking";
import { useLocation, Link } from "wouter";
import { 
  Loader2, Sparkles, Zap, Heart, CheckCircle2, 
  ArrowRight, BarChart3, Moon, Activity, Clock, Plus, TrendingUp, Compass,
  Laptop, Smartphone
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

  // Calculate 24-hour reset countdown
  useEffect(() => {
    if (!alreadyCheckedInToday || !todaysMoodLog) return;

    const calculateTimeRemaining = () => {
      const now = new Date();
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
        notes: notes.trim() || undefined,
        date: todayStr,
      });

      await logHabit({
        date: todayStr,
        routineFollowed: habitRoutine,
        extraPhysicalActivity: habitPhysical,
        screenTimeHours: screenTime[0],
      });

      if (saveCapsule && capsuleMessage.trim()) {
        await createCapsule({
          message: capsuleMessage.trim(),
          moodScore: moodScore,
        });
      }

      toast({ 
        title: "Daily Check-in Complete ✨", 
        description: "Your mood and habit baseline have been recorded!" 
      });
      setLocation("/dashboard");
    } catch (error: any) {
      toast({ 
        title: "Submission Error", 
        description: error.message || "Failed to save daily check-in.", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-28 lg:pb-12">

        {/* ========================================================================= */}
        {/* 1. LAPTOP SCREEN UI (Visible on screens >= 1024px)                        */}
        {/* ========================================================================= */}
        <div className="hidden lg:block p-8 max-w-7xl w-full mx-auto space-y-8">
          
          <header className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  Laptop Check-in Studio
                </Badge>
              </div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-1">
                Daily Reflection & Calibration
              </h1>
              <p className="text-sm text-muted-foreground">
                Calibrate your mood, sleep, stress levels, and habits for {format(new Date(), "EEEE, MMMM do yyyy")}.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="outline" className="rounded-2xl text-xs font-semibold h-11 px-4">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </header>

          {alreadyCheckedInToday ? (
            /* Laptop: Already Checked In State */
            <div className="grid grid-cols-12 gap-8 items-start">
              <div className="col-span-7 space-y-6">
                <Card className="border-none shadow-xl bg-card/85 backdrop-blur-md rounded-3xl p-6 border border-border/40 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-2xl">
                      {todaysMoodLog?.moodScore ? MOOD_OPTIONS.find(m => m.value === todaysMoodLog.moodScore)?.emoji : "✨"}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">Today's Daily Baseline Recorded</h3>
                      <p className="text-xs text-muted-foreground">Completed today at {todaysMoodLog?.createdAt ? format(new Date(todaysMoodLog.createdAt), "h:mm a") : "earlier"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-muted/30 rounded-2xl text-center">
                      <span className="text-xs text-muted-foreground">Mood Score</span>
                      <p className="text-lg font-bold mt-1 text-primary">{todaysMoodLog?.moodScore}/5</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-2xl text-center">
                      <span className="text-xs text-muted-foreground">Stress Level</span>
                      <p className="text-lg font-bold mt-1 text-amber-500">{todaysMoodLog?.stressScore}/5</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-2xl text-center">
                      <span className="text-xs text-muted-foreground">Sleep Score</span>
                      <p className="text-lg font-bold mt-1 text-indigo-500">{todaysMoodLog?.sleepScore} hrs</p>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-2xl text-center">
                      <span className="text-xs text-muted-foreground">Energy Index</span>
                      <p className="text-lg font-bold mt-1 text-emerald-500">{todaysMoodLog?.energyScore}/5</p>
                    </div>
                  </div>

                  {todaysMoodLog?.notes && (
                    <div className="p-4 rounded-2xl bg-card border border-border/60">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Your Reflection Note</span>
                      <p className="text-sm italic text-foreground leading-relaxed">"{todaysMoodLog.notes}"</p>
                    </div>
                  )}

                  {timeLeft && (
                    <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium">Next daily reflection unlocks in:</span>
                      <span className="font-bold font-mono text-primary">{timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s</span>
                    </div>
                  )}
                </Card>
              </div>

              {/* Right Column: Mood Shift Quick Trigger */}
              <div className="col-span-5 space-y-6">
                <Card className="border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card rounded-3xl p-6 shadow-md space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground">Track Intraday Mood Shift</h4>
                      <p className="text-xs text-muted-foreground">Log spontaneous feelings without replacing your morning baseline</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setSwingDialogOpen(true)}
                    className="w-full h-11 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-md gap-2"
                  >
                    <Plus className="w-4 h-4" /> Record Mood Shift
                  </Button>
                </Card>
              </div>
            </div>
          ) : (
            /* Laptop: Check-in Studio Split Form */
            <div className="grid grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Mood Selection & Vitality Sliders */}
              <div className="col-span-6 space-y-6">
                
                {/* Mood Selection Card */}
                <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40 p-6 space-y-4">
                  <CardTitle className="text-lg font-bold">How are you feeling right now?</CardTitle>
                  <div className="grid grid-cols-5 gap-3">
                    {MOOD_OPTIONS.map((option) => {
                      const isSelected = moodScore === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setMoodScore(option.value)}
                          className={cn(
                            "p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center h-28 active:scale-95",
                            isSelected 
                              ? "border-primary bg-primary/10 shadow-lg scale-105" 
                              : "border-border/60 bg-muted/20 hover:bg-muted/50"
                          )}
                        >
                          <span className="text-3xl">{option.emoji}</span>
                          <span className="text-xs font-bold mt-2 text-foreground">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </Card>

                {/* Energy & Stress Sliders */}
                <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40 p-6 space-y-5">
                  <CardTitle className="text-lg font-bold">Energy & Stress Balance</CardTitle>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="font-semibold flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" /> Energy Level
                      </Label>
                      <span className="font-bold text-foreground">{energyScore[0]}/5</span>
                    </div>
                    <Slider value={energyScore} onValueChange={setEnergyScore} min={1} max={5} step={1} className="py-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="font-semibold flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-rose-500" /> Stress Level
                      </Label>
                      <span className="font-bold text-foreground">{stressScore[0]}/5</span>
                    </div>
                    <Slider value={stressScore} onValueChange={setStressScore} min={1} max={5} step={1} className="py-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <Label className="font-semibold flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-indigo-500" /> Sleep Duration
                      </Label>
                      <span className="font-bold text-foreground">{sleepScore[0]} Hours</span>
                    </div>
                    <Slider value={sleepScore} onValueChange={setSleepScore} min={3} max={12} step={1} className="py-2" />
                  </div>
                </Card>

              </div>

              {/* Right Column: Habits, Voice Notes & Submission */}
              <div className="col-span-6 space-y-6">
                
                {/* Daily Reflection & Voice Note */}
                <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-bold">Reflection & Voice Journal</CardTitle>
                    <VoiceRecorder onTranscript={(text: string) => setNotes(prev => prev ? `${prev} ${text}` : text)} />
                  </div>

                  <Textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Write a few thoughts about your mindset, what's on your mind, or what you're grateful for today..."
                    className="min-h-[120px] rounded-2xl resize-none text-sm"
                  />
                </Card>

                {/* Submit Action */}
                <Button 
                  onClick={handleSubmit} 
                  disabled={isLogging}
                  className="w-full btn-primary rounded-2xl h-12 text-sm font-bold shadow-lg shadow-primary/25 gap-2"
                >
                  {isLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Complete Daily Reflection
                </Button>

              </div>

            </div>
          )}

        </div>


        {/* ========================================================================= */}
        {/* 2. MOBILE SCREEN UI (Visible on screens < 1024px)                        */}
        {/* ========================================================================= */}
        <div className="lg:hidden w-full px-4 py-3 space-y-4 max-w-lg mx-auto">
          
          <div className="flex items-center justify-between pb-1">
            <div>
              <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1 mb-0.5 w-fit">
                <Smartphone className="w-2.5 h-2.5" />
                Daily Calibration
              </Badge>
              <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Daily Check-in
              </h1>
            </div>
            <span className="text-xs font-semibold text-muted-foreground">{format(new Date(), "MMM d")}</span>
          </div>

          {alreadyCheckedInToday ? (
            /* Mobile Checked in */
            <Card className="border-none shadow-md bg-card/95 rounded-3xl p-5 space-y-4 border border-border/50 w-full">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
                  {todaysMoodLog?.moodScore ? MOOD_OPTIONS.find(m => m.value === todaysMoodLog.moodScore)?.emoji : "✓"}
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Completed for Today</h3>
                  <p className="text-xs text-muted-foreground">{todaysMoodLog?.moodScore}/5 Mood ({todaysMoodLog?.moodLabel || "Logged"})</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1 w-full">
                <div className="p-3 bg-muted/30 rounded-2xl">
                  <span className="text-[10px] font-semibold text-muted-foreground">⚡ Energy</span>
                  <p className="text-sm font-bold text-foreground mt-0.5">{todaysMoodLog?.energyScore}/5</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-2xl">
                  <span className="text-[10px] font-semibold text-muted-foreground">🌊 Stress</span>
                  <p className="text-sm font-bold text-amber-500 mt-0.5">{todaysMoodLog?.stressScore}/5</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-2xl">
                  <span className="text-[10px] font-semibold text-muted-foreground">🌙 Sleep</span>
                  <p className="text-sm font-bold text-indigo-500 mt-0.5">{todaysMoodLog?.sleepScore}h</p>
                </div>
              </div>

              {todaysMoodLog?.notes && (
                <div className="p-3 bg-card border border-border/60 rounded-2xl text-xs italic text-foreground leading-relaxed">
                  "{todaysMoodLog.notes}"
                </div>
              )}

              {timeLeft && (
                <div className="p-2.5 bg-primary/10 rounded-xl text-center text-[11px] text-primary font-medium">
                  Next daily check-in resets in {timeLeft.hours}h {timeLeft.minutes}m
                </div>
              )}

              <Button 
                onClick={() => setSwingDialogOpen(true)}
                className="w-full rounded-2xl h-11 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-md gap-1.5 active:scale-98"
              >
                <Zap className="w-4 h-4" /> Log Intraday Mood Shift
              </Button>
            </Card>
          ) : (
            /* Mobile Check-in Form */
            <div className="space-y-4 w-full">
              
              {/* Mood Grid */}
              <Card className="border-none shadow-md bg-card/95 rounded-3xl p-4 space-y-3 border border-border/50 w-full">
                <p className="text-xs font-bold text-foreground">1. How are you feeling?</p>
                <div className="grid grid-cols-5 gap-1.5 w-full">
                  {MOOD_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setMoodScore(option.value)}
                      className={cn(
                        "py-3 px-1 rounded-2xl border-2 transition-all flex flex-col items-center justify-center active:scale-90",
                        moodScore === option.value
                          ? "border-primary bg-primary/10 scale-105 shadow-xs"
                          : "border-border/60 bg-muted/20 hover:bg-muted/40"
                      )}
                    >
                      <span className="text-2xl">{option.emoji}</span>
                      <span className="text-[10px] font-bold mt-1 truncate">{option.label}</span>
                    </button>
                  ))}
                </div>
              </Card>

              {/* Sliders */}
              <Card className="border-none shadow-md bg-card/95 rounded-3xl p-4 space-y-4 border border-border/50 w-full">
                <p className="text-xs font-bold text-foreground">2. Energy & Vitality Sliders</p>
                
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground flex items-center gap-1">⚡ Energy Level</span>
                    <span className="font-bold text-foreground">{energyScore[0]}/5</span>
                  </div>
                  <Slider value={energyScore} onValueChange={setEnergyScore} min={1} max={5} step={1} className="py-2" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground flex items-center gap-1">🌊 Stress Level</span>
                    <span className="font-bold text-foreground">{stressScore[0]}/5</span>
                  </div>
                  <Slider value={stressScore} onValueChange={setStressScore} min={1} max={5} step={1} className="py-2" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-muted-foreground flex items-center gap-1">🌙 Sleep Duration</span>
                    <span className="font-bold text-foreground">{sleepScore[0]} Hours</span>
                  </div>
                  <Slider value={sleepScore} onValueChange={setSleepScore} min={3} max={12} step={1} className="py-2" />
                </div>
              </Card>

              {/* Voice & Notes */}
              <Card className="border-none shadow-md bg-card/95 rounded-3xl p-4 space-y-3 border border-border/50 w-full">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">3. Reflection & Voice Note</span>
                  <VoiceRecorder onTranscript={(text: string) => setNotes(prev => prev ? `${prev} ${text}` : text)} />
                </div>
                <Textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tap the mic to speak or type thoughts..."
                  className="min-h-[80px] rounded-2xl text-xs resize-none leading-relaxed"
                />
              </Card>

              <Button 
                onClick={handleSubmit} 
                disabled={isLogging}
                className="w-full btn-primary rounded-2xl h-12 text-xs font-bold shadow-md shadow-primary/25 gap-2 active:scale-98"
              >
                {isLogging ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Complete Daily Reflection
              </Button>

            </div>
          )}

        </div>

        {/* Mood Swing Modal */}
        <MoodSwingDialog 
          open={swingDialogOpen} 
          onOpenChange={setSwingDialogOpen}
          currentMoodScore={todaysMoodLog?.moodScore || 3}
        />
      </main>

      <MobileNav />
    </div>
  );
}
