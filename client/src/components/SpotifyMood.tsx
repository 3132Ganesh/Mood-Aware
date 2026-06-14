import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Music, Zap, Smile, Info, Activity } from "lucide-react";
import { useSpotifyMood } from "@/hooks/use-spotify";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

export function SpotifyMood() {
  const { data, isLoading } = useSpotifyMood();

  if (isLoading) {
    return (
      <Card className="glass-card border-none overflow-hidden h-full">
        <CardHeader>
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-2 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If Notion is not configured or no Spotify data, show an empty state instead of hiding
  if (!data || data.inferredMood === "No data" || data.inferredMood === "Error") {
    return (
      <Card className="glass-card border-none overflow-hidden h-full shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <Music className="w-5 h-5 text-pink-500/50" />
              Music Intelligence
            </CardTitle>
          </div>
          <CardDescription>Musical resonance today</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-4 flex flex-col items-center justify-center text-center opacity-70">
          <Music className="w-12 h-12 text-muted-foreground/30 mb-2" />
          <p className="text-sm text-muted-foreground">
            Connect Spotify or play some tracks to see your musical mood inferred by AI.
          </p>
        </CardContent>
      </Card>
    );
  }

  const valenceValue = (data.valence || 0) * 100;
  const energyValue = (data.energy || 0) * 100;

  return (
    <Card className="glass-card border-none overflow-hidden h-full shadow-lg hover:shadow-primary/5 transition-shadow duration-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-display flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-500" />
            Music Intelligence
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 hover:bg-muted rounded-full transition-colors">
                  <Info className="w-4 h-4 text-muted-foreground" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" className="bg-popover/95 backdrop-blur-sm border-primary/10">
                <p className="w-48 text-xs leading-relaxed">
                  Mood inferred from your 20 most recently played tracks using Spotify's audio analysis API.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription>Musical resonance today</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6 pt-4">
        {/* Mood Badge */}
        <div className="text-center py-6 bg-primary/5 rounded-2xl relative overflow-hidden group">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 15 }}
            className="text-2xl font-bold text-primary relative z-10"
          >
            {data.inferredMood}
          </motion.div>
          <p className="text-[10px] uppercase tracking-widest text-primary/40 font-bold mt-1 relative z-10">
            Detected Vibe
          </p>
          
          {/* Animated Background Pulse */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.05, 0.1, 0.05]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary rounded-full blur-3xl pointer-events-none" 
          />
        </div>

        {/* Metrics */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Smile className="w-4 h-4 text-yellow-500" />
                Positivity (Valence)
              </span>
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-full">{valenceValue.toFixed(0)}%</span>
            </div>
            <div className="relative pt-1">
               <Progress value={valenceValue} className="h-1.5 bg-muted transition-all" />
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${valenceValue}%` }}
                 className="absolute top-1 left-0 h-1.5 bg-yellow-500/20 blur-sm pointer-events-none"
               />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Zap className="w-4 h-4 text-blue-500" />
                Intensity (Energy)
              </span>
              <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded-full">{energyValue.toFixed(0)}%</span>
            </div>
            <div className="relative pt-1">
              <Progress value={energyValue} className="h-1.5 bg-muted transition-all" />
              <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${energyValue}%` }}
                 className="absolute top-1 left-0 h-1.5 bg-blue-500/20 blur-sm pointer-events-none"
               />
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 flex items-center justify-between border-t border-border/40">
           <div className="flex items-center gap-2 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
              <Activity className="w-3 h-3 text-primary" />
              {data.tracksAnalyzed || 20} Tracks Analyzed
           </div>
           <div className="text-[10px] text-muted-foreground">
              Synced: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
