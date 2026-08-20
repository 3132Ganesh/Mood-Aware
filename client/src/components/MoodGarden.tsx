import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Droplets, Sun, Award, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface MoodGardenProps {
  totalCheckins: number;
  currentStreak: number;
}

const STAGES = [
  { level: 1, name: "Sprouting Seed", emoji: "🌱", minLogs: 0, desc: "Your wellness journey is taking root." },
  { level: 2, name: "Young Sapling", emoji: "🌿", minLogs: 3, desc: "Growing stronger with every check-in." },
  { level: 3, name: "Lush Plant", emoji: "🪴", minLogs: 7, desc: "Thriving with consistent daily mindfulness." },
  { level: 4, name: "Blooming Bonsai", emoji: "🌸", minLogs: 14, desc: "Radiating positive habits and balance." },
  { level: 5, name: "Serenity Tree", emoji: "🌳", minLogs: 30, desc: "A magnificent master of daily wellness." },
];

export function MoodGarden({ totalCheckins, currentStreak }: MoodGardenProps) {
  const [waterEffect, setWaterEffect] = useState(false);
  const [sunEffect, setSunEffect] = useState(false);

  // Determine current stage
  const currentStage = [...STAGES].reverse().find(s => totalCheckins >= s.minLogs) || STAGES[0];
  const nextStage = STAGES.find(s => s.level === currentStage.level + 1);

  const logsToNext = nextStage ? nextStage.minLogs - totalCheckins : 0;
  const progressPercent = nextStage 
    ? Math.min(100, Math.round(((totalCheckins - currentStage.minLogs) / (nextStage.minLogs - currentStage.minLogs)) * 100))
    : 100;

  const handleWater = () => {
    setWaterEffect(true);
    toast({ title: "Plant Watered! 💧", description: "You gave your Mood Garden mindful care." });
    setTimeout(() => setWaterEffect(false), 2000);
  };

  const handleSun = () => {
    setSunEffect(true);
    toast({ title: "Sunshine Absorbed! ☀️", description: "Brightening your wellness garden." });
    setTimeout(() => setSunEffect(false), 2000);
  };

  return (
    <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-500/10 via-card/80 to-teal-500/10 backdrop-blur-md rounded-3xl overflow-hidden relative">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Living Mood Garden
          </div>
          <span className="text-xs font-bold text-muted-foreground bg-card/80 px-2.5 py-1 rounded-full border border-border/50">
            Level {currentStage.level} / 5
          </span>
        </div>
        <CardTitle className="text-lg font-bold mt-1">{currentStage.name}</CardTitle>
        <CardDescription className="text-xs">{currentStage.desc}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Plant Display Frame */}
        <div className="relative flex flex-col items-center justify-center p-6 rounded-2xl bg-card/60 border border-border/50 overflow-hidden min-h-[140px]">
          {/* Animated visual effects */}
          {waterEffect && (
            <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center animate-pulse z-10">
              <span className="text-3xl animate-bounce">💧 💧 💧</span>
            </div>
          )}
          {sunEffect && (
            <div className="absolute inset-0 bg-amber-500/10 flex items-center justify-center animate-pulse z-10">
              <span className="text-4xl animate-spin">✨ ☀️ ✨</span>
            </div>
          )}

          <div className="text-6xl sm:text-7xl filter drop-shadow-md transition-transform duration-500 hover:scale-110 select-none">
            {currentStage.emoji}
          </div>

          <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">
            <Heart className="w-3.5 h-3.5 fill-current" /> {currentStreak} Day Streak
          </div>
        </div>

        {/* Growth Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-muted-foreground">
            <span>Growth Progress</span>
            <span>{nextStage ? `${logsToNext} more check-ins to ${nextStage.emoji}` : "Max Level Reached! 🌟"}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted/60 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Quick Garden Interactions */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleWater} 
            className="rounded-xl text-xs h-9 flex items-center gap-1.5 border-blue-200 dark:border-blue-900 text-blue-600 hover:bg-blue-500/10 active:scale-95"
          >
            <Droplets className="w-3.5 h-3.5" /> Water Garden
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSun} 
            className="rounded-xl text-xs h-9 flex items-center gap-1.5 border-amber-200 dark:border-amber-900 text-amber-600 hover:bg-amber-500/10 active:scale-95"
          >
            <Sun className="w-3.5 h-3.5" /> Give Sun
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
