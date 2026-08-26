import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Target, Sparkles, Utensils, Briefcase, Zap, Check, 
  ChevronRight, Shield, Dumbbell, Code2, LineChart, Layers, BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const CAREER_TRACKS = [
  { id: "software_engineer", label: "Software Engineer", icon: Code2, desc: "Full-Stack, Clean Code & Algorithms" },
  { id: "data_analytics", label: "Data Science & Analytics", icon: LineChart, desc: "SQL, Python, Visualization & Insights" },
  { id: "product_manager", label: "Product Management", icon: Layers, desc: "PRDs, User Stories & Product Strategy" },
  { id: "cybersecurity", label: "Cybersecurity & Cloud", icon: Shield, desc: "Network Defense, Security & Cloud Ops" },
  { id: "fitness_pro", label: "Fitness & Athletic Performance", icon: Dumbbell, desc: "Strength, Workouts & Muscle Recovery" },
  { id: "custom", label: "Custom Goal Track", icon: Target, desc: "Define your own custom personal goal" },
];

const DIET_GOALS = [
  { id: "muscle_gain", label: "Muscle Gain & High Protein", tip: "Target 1.6-2.2g protein/kg bodyweight" },
  { id: "fat_loss", label: "Fat Loss & Caloric Balance", tip: "High-fiber greens + hydration target" },
  { id: "balanced_energy", label: "Balanced Energy & Focus", tip: "Steady complex carbs & green tea/water" },
  { id: "endurance", label: "Active Athletic Endurance", tip: "Post-workout electrolyte recovery" },
];

interface AgustGoalWidgetProps {
  onPlanRegenerated?: () => void;
}

export function AgustGoalWidget({ onPlanRegenerated }: AgustGoalWidgetProps) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch current user profile
  const { data: profile, isLoading } = useQuery<any>({
    queryKey: ["/api/profile"],
  });

  const [selectedTrack, setSelectedTrack] = useState<string>(profile?.careerTrack || "software_engineer");
  const [customGoalText, setCustomGoalText] = useState<string>(profile?.targetGoal || "");
  const [selectedDiet, setSelectedDiet] = useState<string>(profile?.dietGoal || "balanced_energy");
  const [dietPrefText, setDietPrefText] = useState<string>(profile?.dietPreferences || "");

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const res = await apiRequest("POST", "/api/profile", updatedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
    },
  });

  // Generate Plan mutation
  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/plans/generate", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans/current"] });
      onPlanRegenerated?.();
    },
  });

  const handleSaveAndGenerate = async () => {
    await updateProfileMutation.mutateAsync({
      careerTrack: selectedTrack,
      targetGoal: customGoalText || CAREER_TRACKS.find(t => t.id === selectedTrack)?.label,
      dietGoal: selectedDiet,
      dietPreferences: dietPrefText || DIET_GOALS.find(d => d.id === selectedDiet)?.label,
    });

    await generatePlanMutation.mutateAsync();
    setIsOpen(false);
  };

  const activeTrackObj = CAREER_TRACKS.find(t => t.id === (profile?.careerTrack || "software_engineer")) || CAREER_TRACKS[0];
  const activeDietObj = DIET_GOALS.find(d => d.id === (profile?.dietGoal || "balanced_energy")) || DIET_GOALS[2];

  return (
    <div className="w-full space-y-4">
      {/* Premium Stitch Glassmorphic Banner */}
      <Card className="border border-primary/20 bg-gradient-to-r from-primary/10 via-card/90 to-accent/10 backdrop-blur-xl rounded-3xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary flex-shrink-0 shadow-md">
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="rounded-full bg-primary/15 text-primary border-primary/30 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5">
                  Agust Personalized Goal Engine
                </Badge>
                <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> 3-Tier AI Calibrated
                </span>
              </div>
              <h3 className="text-lg font-display font-bold text-foreground mt-1">
                {profile?.targetGoal || activeTrackObj.label} Track
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 font-semibold text-primary">
                  <Utensils className="w-3.5 h-3.5" /> Diet: {activeDietObj.label}
                </span>
                <span className="opacity-40">•</span>
                <span>{activeDietObj.tip}</span>
              </p>
            </div>
          </div>

          <Button
            onClick={() => setIsOpen(true)}
            className="btn-primary rounded-2xl text-xs font-semibold px-4 h-10 gap-2 shadow-md flex-shrink-0"
          >
            <Briefcase className="w-4 h-4" />
            Configure Goal & Diet
          </Button>
        </div>

        {/* 3-Tier Legend Bar */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-border/40 text-center">
          <div className="p-2 rounded-2xl bg-muted/40 border border-border/30 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">🟢 Easy Tier</span>
            <span className="text-[11px] font-medium text-muted-foreground mt-0.5">Daily Micro-Habits</span>
          </div>
          <div className="p-2 rounded-2xl bg-muted/40 border border-border/30 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">🟡 Medium Tier</span>
            <span className="text-[11px] font-medium text-muted-foreground mt-0.5">Weekday Applied Skills</span>
          </div>
          <div className="p-2 rounded-2xl bg-muted/40 border border-border/30 flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase">🔴 Hard Tier</span>
            <span className="text-[11px] font-medium text-muted-foreground mt-0.5">Weekend Milestones</span>
          </div>
        </div>
      </Card>

      {/* Goal & Diet Config Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-card text-foreground border border-border/70 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-display font-bold">Personalized Goal & Routine Configurator</h2>
              </div>
              <Button size="sm" variant="ghost" className="rounded-full w-8 h-8 p-0" onClick={() => setIsOpen(false)}>
                ✕
              </Button>
            </div>

            {/* 1. Career & Professional Track Selection */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-primary" /> 1. Select Professional Career Track
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {CAREER_TRACKS.map((track) => {
                  const Icon = track.icon;
                  const isSelected = selectedTrack === track.id;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setSelectedTrack(track.id)}
                      className={cn(
                        "p-3.5 rounded-2xl text-left border transition-all duration-200 flex items-start gap-3 relative",
                        isSelected 
                          ? "bg-primary/10 border-primary shadow-sm text-foreground" 
                          : "bg-muted/30 border-border/60 hover:bg-muted/70 text-muted-foreground"
                      )}
                    >
                      <div className={cn("p-2 rounded-xl flex-shrink-0", isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-foreground">{track.label}</h4>
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{track.desc}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-primary absolute right-3 top-3.5" />}
                    </button>
                  );
                })}
              </div>

              {selectedTrack === "custom" && (
                <div className="pt-2 space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Type Custom Career / Goal Title:</label>
                  <Input
                    value={customGoalText}
                    onChange={(e) => setCustomGoalText(e.target.value)}
                    placeholder="e.g., Become AWS Certified Cloud Architect"
                    className="rounded-2xl text-xs bg-muted/40 border-border/60 h-10"
                  />
                </div>
              )}
            </div>

            {/* 2. Fitness & Diet Goals */}
            <div className="space-y-3 pt-2 border-t border-border/50">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-emerald-500" /> 2. Select Personalized Fitness & Diet Plan
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DIET_GOALS.map((diet) => {
                  const isSelected = selectedDiet === diet.id;
                  return (
                    <button
                      key={diet.id}
                      type="button"
                      onClick={() => setSelectedDiet(diet.id)}
                      className={cn(
                        "p-3.5 rounded-2xl text-left border transition-all duration-200 flex items-start gap-3 relative",
                        isSelected 
                          ? "bg-emerald-500/10 border-emerald-500 shadow-sm text-foreground" 
                          : "bg-muted/30 border-border/60 hover:bg-muted/70 text-muted-foreground"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-foreground">{diet.label}</h4>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 line-clamp-1">{diet.tip}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-500 absolute right-3 top-3.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-muted-foreground">Dietary Preferences or Allergies (Optional):</label>
                <Input
                  value={dietPrefText}
                  onChange={(e) => setDietPrefText(e.target.value)}
                  placeholder="e.g., Vegetarian, High Protein, Whey Isolate, Hydration Goal: 3L"
                  className="rounded-2xl text-xs bg-muted/40 border-border/60 h-10"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
              <Button variant="ghost" onClick={() => setIsOpen(false)} className="rounded-2xl text-xs font-semibold">
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAndGenerate}
                disabled={updateProfileMutation.isPending || generatePlanMutation.isPending}
                className="btn-primary rounded-2xl text-xs font-semibold px-5 h-10 gap-2 shadow-lg"
              >
                <Sparkles className="w-4 h-4" />
                {generatePlanMutation.isPending ? "Generating AI 3-Tier Plan..." : "Save & Generate AI Plan"}
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
