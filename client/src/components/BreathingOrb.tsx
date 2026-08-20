import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

type BreathingTechnique = "box" | "relax" | "balance";

interface PatternStep {
  name: "Inhale" | "Hold" | "Exhale";
  duration: number;
  color: string;
}

const TECHNIQUES: Record<BreathingTechnique, { name: string; desc: string; steps: PatternStep[] }> = {
  box: {
    name: "4-4-4-4 Box Breathing",
    desc: "Navy SEAL technique for immediate stress reduction and high mental focus.",
    steps: [
      { name: "Inhale", duration: 4, color: "from-blue-500/40 to-teal-500/40 text-teal-600 scale-125" },
      { name: "Hold", duration: 4, color: "from-teal-500/40 to-indigo-500/40 text-indigo-600 scale-125" },
      { name: "Exhale", duration: 4, color: "from-indigo-500/40 to-purple-500/40 text-purple-600 scale-75" },
      { name: "Hold", duration: 4, color: "from-purple-500/40 to-blue-500/40 text-blue-600 scale-75" },
    ],
  },
  relax: {
    name: "4-7-8 Deep Calm",
    desc: "Dr. Weil's natural nervous system tranquilizer for sleep and rapid peace.",
    steps: [
      { name: "Inhale", duration: 4, color: "from-emerald-500/40 to-teal-500/40 text-emerald-600 scale-130" },
      { name: "Hold", duration: 7, color: "from-teal-500/40 to-blue-500/40 text-blue-600 scale-130" },
      { name: "Exhale", duration: 8, color: "from-blue-500/40 to-purple-500/40 text-purple-600 scale-70" },
    ],
  },
  balance: {
    name: "Resonant Balance",
    desc: "Equal 5.5-second pacing for heart rate variability and mental clarity.",
    steps: [
      { name: "Inhale", duration: 5, color: "from-indigo-500/40 to-cyan-500/40 text-cyan-600 scale-125" },
      { name: "Exhale", duration: 5, color: "from-cyan-500/40 to-indigo-500/40 text-indigo-600 scale-80" },
    ],
  },
};

export function BreathingOrb({ standalone = false }: { standalone?: boolean }) {
  const [technique, setTechnique] = useState<BreathingTechnique>("box");
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(4);
  const [completedCycles, setCompletedCycles] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const currentPattern = TECHNIQUES[technique];
  const activeStep = currentPattern.steps[currentStepIndex];

  // Play gentle chime on phase transition
  const playTone = (freq = 432) => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch (e) {
      // Audio context might be restricted before interaction
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isActive) {
      timer = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Next step in cycle
            const nextIndex = (currentStepIndex + 1) % currentPattern.steps.length;
            if (nextIndex === 0) {
              setCompletedCycles((c) => c + 1);
            }
            setCurrentStepIndex(nextIndex);
            playTone(nextIndex === 0 ? 528 : 432);
            return currentPattern.steps[nextIndex].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [isActive, currentStepIndex, currentPattern, soundEnabled]);

  const handleToggle = () => {
    if (!isActive) {
      playTone(528);
    }
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setCurrentStepIndex(0);
    setSecondsRemaining(currentPattern.steps[0].duration);
    setCompletedCycles(0);
  };

  const handleTechniqueChange = (t: BreathingTechnique) => {
    setTechnique(t);
    setIsActive(false);
    setCurrentStepIndex(0);
    setSecondsRemaining(TECHNIQUES[t].steps[0].duration);
    setCompletedCycles(0);
  };

  return (
    <Card className={cn(
      "border-none shadow-xl bg-card/80 backdrop-blur-xl rounded-3xl overflow-hidden text-center",
      standalone ? "max-w-2xl mx-auto" : "w-full"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Breathwork Sanctuary
          </div>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
            title={soundEnabled ? "Mute audio" : "Enable chime"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-primary" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-display font-bold mt-1">
          {currentPattern.name}
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">{currentPattern.desc}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 flex flex-col items-center">
        {/* Technique Mode Selector */}
        <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border/50 max-w-md w-full">
          {(Object.keys(TECHNIQUES) as BreathingTechnique[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTechniqueChange(key)}
              className={cn(
                "flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all capitalize",
                technique === key
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Dynamic Glowing Breathing Orb */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
          {/* Ambient Glow */}
          <div 
            className={cn(
              "absolute inset-0 rounded-full blur-3xl opacity-40 transition-all duration-1000 bg-gradient-to-tr",
              activeStep.color
            )}
          />

          {/* Outer Pulsing Ring */}
          <div 
            className={cn(
              "absolute w-56 h-56 sm:w-64 sm:h-64 rounded-full border-2 border-primary/20 transition-all duration-1000 flex items-center justify-center",
              isActive && (activeStep.name === "Inhale" ? "scale-110 opacity-80" : "scale-90 opacity-40")
            )}
          />

          {/* Core Orb */}
          <div 
            className={cn(
              "w-44 h-44 sm:w-52 sm:h-52 rounded-full bg-gradient-to-br shadow-2xl flex flex-col items-center justify-center transition-all duration-1000 z-10 border border-white/20",
              activeStep.color,
              isActive && (activeStep.name === "Inhale" ? "scale-110 shadow-primary/40" : activeStep.name === "Exhale" ? "scale-85" : "scale-100")
            )}
          >
            <span className="text-xl sm:text-2xl font-display font-bold tracking-wider uppercase drop-shadow-sm">
              {activeStep.name}
            </span>
            <span className="text-4xl sm:text-5xl font-black mt-1 font-mono">
              {secondsRemaining}s
            </span>
          </div>
        </div>

        {/* Status and Cycles */}
        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
          <span className="px-3 py-1 bg-muted/40 rounded-full">
            {completedCycles} Cycles Completed
          </span>
          <span className="flex items-center gap-1 text-primary">
            <Heart className="w-3.5 h-3.5 fill-current" /> Mindful Pace
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full max-w-xs justify-center pt-2">
          <Button
            type="button"
            onClick={handleToggle}
            className={cn(
              "btn-primary h-12 flex-1 rounded-2xl text-base font-semibold shadow-lg transition-all",
              isActive && "bg-amber-600 hover:bg-amber-700 shadow-amber-600/30"
            )}
          >
            {isActive ? (
              <>
                <Pause className="w-5 h-5 mr-2 fill-current" /> Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2 fill-current" /> Begin Breathwork
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            className="h-12 w-12 rounded-2xl border-border/80 text-muted-foreground hover:text-foreground"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
