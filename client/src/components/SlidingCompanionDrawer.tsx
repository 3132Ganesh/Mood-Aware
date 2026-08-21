import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { soundscape } from "@/lib/soundscape";
import { useMoodSwings } from "@/hooks/use-tracking";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { 
  X, Sparkles, Wind, Volume2, VolumeX, CloudRain, Waves, Trees, 
  Bell, Play, Pause, Zap, Check, ChevronLeft, ChevronRight, BookOpen, Heart
} from "lucide-react";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { cn } from "@/lib/utils";

export function SlidingCompanionDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [volume, setVolume] = useState<number[]>([50]);
  
  // Mini Breathwork State
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Inhale" | "Hold" | "Exhale">("Inhale");
  const [breathCount, setBreathCount] = useState(4);

  // Quick Mood Shift State
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const { logSwing, isLogging: isSwingLogging } = useMoodSwings(todayStr);
  const [selectedSwingScore, setSelectedSwingScore] = useState<number | null>(null);
  const [selectedTrigger, setSelectedTrigger] = useState<string>("");

  // Scratchpad
  const [scratchpad, setScratchpad] = useState(() => {
    return localStorage.getItem("moodaware_scratchpad") || "";
  });

  const handleScratchpadChange = (val: string) => {
    setScratchpad(val);
    localStorage.setItem("moodaware_scratchpad", val);
  };

  // Keyboard shortcut Ctrl/Cmd + B or K to toggle drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Mini breath cycle timer
  useEffect(() => {
    if (!isBreathing) return;

    let timer: NodeJS.Timeout;
    const runCycle = () => {
      setBreathPhase("Inhale");
      setBreathCount(4);

      let c = 4;
      const countInterval = setInterval(() => {
        c--;
        setBreathCount(Math.max(1, c));
      }, 1000);

      timer = setTimeout(() => {
        clearInterval(countInterval);
        setBreathPhase("Hold");
        setBreathCount(4);

        let h = 4;
        const holdInterval = setInterval(() => {
          h--;
          setBreathCount(Math.max(1, h));
        }, 1000);

        timer = setTimeout(() => {
          clearInterval(holdInterval);
          setBreathPhase("Exhale");
          setBreathCount(4);

          let ex = 4;
          const exInterval = setInterval(() => {
            ex--;
            setBreathCount(Math.max(1, ex));
          }, 1000);

          timer = setTimeout(() => {
            clearInterval(exInterval);
            if (isBreathing) runCycle();
          }, 4000);
        }, 4000);
      }, 4000);
    };

    runCycle();
    return () => clearTimeout(timer);
  }, [isBreathing]);

  const handleSoundToggle = (soundType: "rain" | "waves" | "wind" | "zen") => {
    if (activeSound === soundType) {
      soundscape.stop();
      setActiveSound(null);
    } else {
      soundscape.play(soundType);
      soundscape.setVolume(volume[0] / 100);
      setActiveSound(soundType);
    }
  };

  const handleVolumeChange = (newVal: number[]) => {
    setVolume(newVal);
    soundscape.setVolume(newVal[0] / 100);
  };

  const handleQuickShiftSubmit = async (score: number) => {
    const labelMap: Record<number, string> = { 1: "Rough", 2: "Low", 3: "Okay", 4: "Good", 5: "Great" };
    setSelectedSwingScore(score);
    try {
      await logSwing({
        date: todayStr,
        previousMoodScore: 3,
        newMoodScore: score,
        newMoodLabel: labelMap[score] || "Shift",
        trigger: selectedTrigger || "Spontaneous shift",
        intensity: 3,
        notes: "Logged via Quick Companion Drawer",
      });
      toast({
        title: "Mood Shift Recorded ⚡",
        description: `Logged level ${score}/5 (${labelMap[score]}) intraday fluctuation.`,
      });
      setTimeout(() => setSelectedSwingScore(null), 1500);
    } catch (e: any) {
      toast({ title: "Failed to record shift", description: e.message, variant: "destructive" });
      setSelectedSwingScore(null);
    }
  };

  return (
    <>
      {/* Floating Interactive Right Tab / Drawer Opener */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(true)}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        whileHover={{ scale: 1.06, x: -4 }}
        whileTap={{ scale: 0.94 }}
        className={cn(
          "fixed right-0 top-1/2 -translate-y-1/2 z-40 items-center gap-2 pl-3.5 pr-2 py-3 rounded-l-2xl shadow-2xl transition-all duration-300 border-y border-l",
          isOpen ? "hidden" : "hidden lg:flex",
          activeSound 
            ? "bg-gradient-to-l from-primary to-accent text-white border-primary/40 shadow-primary/30 animate-pulse" 
            : "bg-card/95 backdrop-blur-md text-foreground border-border/80 hover:bg-card hover:border-primary/50"
        )}
      >
        <div className="flex flex-col items-center gap-1">
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
            {activeSound ? <Volume2 className="w-3.5 h-3.5 animate-bounce" /> : <Sparkles className="w-3.5 h-3.5 text-primary" />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest [writing-mode:vertical-rl] rotate-180 py-1">
            Wellness Hub
          </span>
        </div>
      </motion.button>

      {/* Slide-out Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity"
          />
        )}
      </AnimatePresence>

      {/* Slide-out Companion Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[380px] bg-card/95 backdrop-blur-2xl border-l border-border/80 shadow-2xl z-50 flex flex-col justify-between overflow-hidden"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-border/60 flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-base shadow-sm">
                  🌿
                </div>
                <div>
                  <h3 className="font-display font-bold text-base text-foreground flex items-center gap-1.5">
                    Wellness Companion
                  </h3>
                  <p className="text-[11px] text-muted-foreground">Interactive audio & quick tools</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="rounded-full w-8 h-8 hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              
              {/* 1. Interactive Ambient Soundscape Engine */}
              <div className="p-4 rounded-3xl bg-muted/30 border border-border/70 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-foreground">Ambient Soundscapes</span>
                  </div>
                  {activeSound && (
                    <Badge variant="outline" className="text-[9px] bg-primary/10 text-primary border-primary/30 uppercase tracking-wider animate-pulse">
                      Playing
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSoundToggle("rain")}
                    className={cn(
                      "p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all active:scale-95",
                      activeSound === "rain"
                        ? "bg-blue-500 text-white border-blue-600 shadow-md shadow-blue-500/25"
                        : "bg-card border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <CloudRain className="w-4 h-4" />
                    Rain Shower
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSoundToggle("waves")}
                    className={cn(
                      "p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all active:scale-95",
                      activeSound === "waves"
                        ? "bg-teal-500 text-white border-teal-600 shadow-md shadow-teal-500/25"
                        : "bg-card border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Waves className="w-4 h-4" />
                    Ocean Waves
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSoundToggle("wind")}
                    className={cn(
                      "p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all active:scale-95",
                      activeSound === "wind"
                        ? "bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/25"
                        : "bg-card border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Trees className="w-4 h-4" />
                    Forest Wind
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSoundToggle("zen")}
                    className={cn(
                      "p-3 rounded-2xl border flex items-center gap-2.5 text-xs font-semibold transition-all active:scale-95",
                      activeSound === "zen"
                        ? "bg-purple-500 text-white border-purple-600 shadow-md shadow-purple-500/25"
                        : "bg-card border-border/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Bell className="w-4 h-4" />
                    432Hz Zen Bowl
                  </button>
                </div>

                {activeSound && (
                  <div className="pt-2 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                      <span>Volume</span>
                      <span className="font-bold">{volume[0]}%</span>
                    </div>
                    <Slider value={volume} onValueChange={handleVolumeChange} min={0} max={100} step={1} />
                  </div>
                )}
              </div>

              {/* 2. Interactive Mini Breathwork Companion */}
              <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-foreground">1-Minute Box Breathing</span>
                  </div>
                  <Button
                    size="sm"
                    variant={isBreathing ? "destructive" : "default"}
                    onClick={() => setIsBreathing(prev => !prev)}
                    className="rounded-full h-7 px-3 text-[11px] font-semibold"
                  >
                    {isBreathing ? "Stop" : "Start"}
                  </Button>
                </div>

                {isBreathing ? (
                  <div className="flex flex-col items-center justify-center py-4 space-y-2">
                    <motion.div
                      animate={{
                        scale: breathPhase === "Inhale" ? [1, 1.4] : breathPhase === "Hold" ? 1.4 : [1.4, 1],
                        opacity: [0.8, 1],
                      }}
                      transition={{ duration: 4, ease: "easeInOut" }}
                      className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-500/30 to-teal-400/30 border-2 border-blue-500 flex flex-col items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">{breathPhase}</span>
                      <span className="text-xl font-display font-extrabold text-blue-900 dark:text-blue-100">{breathCount}s</span>
                    </motion.div>
                    <p className="text-[11px] text-muted-foreground text-center">Follow the rhythm to center your mind</p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Tap Start to trigger a 4-4-4 second vagus nerve relaxation rhythm right inside this sidebar.
                  </p>
                )}
              </div>

              {/* 3. Interactive Quick Mood Shift Slider */}
              <div className="p-4 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold text-foreground">Instant Mood Shift</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">1-Tap Log</span>
                </div>

                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { score: 1, emoji: "😫", label: "Rough" },
                    { score: 2, emoji: "😔", label: "Low" },
                    { score: 3, emoji: "😐", label: "Okay" },
                    { score: 4, emoji: "😊", label: "Good" },
                    { score: 5, emoji: "🤩", label: "Great" },
                  ].map((item) => (
                    <button
                      key={item.score}
                      type="button"
                      onClick={() => handleQuickShiftSubmit(item.score)}
                      disabled={isSwingLogging}
                      className={cn(
                        "py-2.5 px-1 rounded-2xl border transition-all flex flex-col items-center justify-center active:scale-90",
                        selectedSwingScore === item.score
                          ? "bg-amber-500 text-white border-amber-600 shadow-md scale-105"
                          : "bg-card border-border/70 hover:bg-muted"
                      )}
                    >
                      <span className="text-xl">{item.emoji}</span>
                      <span className="text-[9px] font-semibold mt-0.5">{item.score}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Quick Scratchpad / Gratitude Note */}
              <div className="p-4 rounded-3xl bg-muted/30 border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-bold text-foreground">Quick Scratchpad</span>
                  </div>
                  <VoiceRecorder 
                    compact 
                    onTranscript={(text) => handleScratchpadChange(scratchpad ? `${scratchpad} ${text}` : text)} 
                  />
                </div>
                <Textarea
                  placeholder="Drop a quick thought, gratitude note, or reminder here..."
                  value={scratchpad}
                  onChange={(e) => handleScratchpadChange(e.target.value)}
                  className="min-h-[80px] rounded-2xl text-xs resize-none"
                />
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-border/60 text-center bg-muted/10">
              <span className="text-[11px] text-muted-foreground flex items-center justify-center gap-1 font-medium">
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono border">B</kbd> to toggle anytime
              </span>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
