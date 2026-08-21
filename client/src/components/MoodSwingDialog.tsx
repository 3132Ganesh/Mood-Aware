import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useMoodSwings } from "@/hooks/use-tracking";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Zap, Loader2, Sparkles, AlertCircle } from "lucide-react";

const MOOD_OPTIONS = [
  { value: 1, label: "Rough", emoji: "😫", color: "from-red-500/20 to-rose-500/20 text-rose-600 border-rose-200 dark:border-rose-900" },
  { value: 2, label: "Low", emoji: "😔", color: "from-orange-500/20 to-amber-500/20 text-amber-600 border-amber-200 dark:border-amber-900" },
  { value: 3, label: "Okay", emoji: "😐", color: "from-yellow-500/20 to-lime-500/20 text-yellow-600 border-yellow-200 dark:border-yellow-900" },
  { value: 4, label: "Good", emoji: "😊", color: "from-emerald-500/20 to-teal-500/20 text-emerald-600 border-emerald-200 dark:border-emerald-900" },
  { value: 5, label: "Great", emoji: "🤩", color: "from-purple-500/20 to-indigo-500/20 text-purple-600 border-purple-200 dark:border-purple-900" },
];

const COMMON_TRIGGERS = [
  "Work / Study",
  "Relationship / Social",
  "Fatigue / Lack of Sleep",
  "Unexpected News",
  "Physical Health / Pain",
  "Overthinking / Anxiety",
  "Accomplishment / Win",
  "Weather / Environment",
  "No Clear Trigger",
];

interface MoodSwingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentMoodScore?: number;
}

export function MoodSwingDialog({ open, onOpenChange, currentMoodScore = 3 }: MoodSwingDialogProps) {
  const { logSwing, isLogging } = useMoodSwings();
  
  const [newMoodScore, setNewMoodScore] = useState<number>(currentMoodScore);
  const [trigger, setTrigger] = useState<string>("Work / Study");
  const [intensity, setIntensity] = useState<number[]>([3]);
  const [notes, setNotes] = useState<string>("");

  const selectedOption = MOOD_OPTIONS.find(m => m.value === newMoodScore) || MOOD_OPTIONS[2];

  const handleSave = async () => {
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      await logSwing({
        date: today,
        previousMoodScore: currentMoodScore,
        newMoodScore: newMoodScore,
        newMoodLabel: selectedOption.label,
        trigger: trigger,
        intensity: intensity[0],
        notes: notes.trim() || undefined,
      });

      toast({
        title: "Mood Swing Recorded 🌊",
        description: `Logged shift to ${selectedOption.label} (${trigger}). We've updated your daily rhythm timeline.`,
      });

      setNotes("");
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Could not save mood swing",
        description: err?.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-6 overflow-hidden">
        <DialogHeader className="pb-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-semibold w-fit mb-1">
            <Zap className="w-3.5 h-3.5" /> In-The-Moment Mood Shift
          </div>
          <DialogTitle className="text-xl font-display font-bold">Record Mood Swing</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Feelings naturally fluctuate throughout the day. Track how your mood shifted right now without resetting your daily baseline.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* New Mood Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">How has your mood shifted?</Label>
            <div className="grid grid-cols-5 gap-2">
              {MOOD_OPTIONS.map((option) => {
                const isSelected = newMoodScore === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setNewMoodScore(option.value)}
                    className={cn(
                      "flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all active:scale-95",
                      isSelected 
                        ? "bg-gradient-to-b border-primary shadow-md shadow-primary/20 scale-105 " + option.color
                        : "border-border/60 bg-muted/20 hover:bg-muted/40 hover:border-border"
                    )}
                  >
                    <span className="text-2xl filter drop-shadow-sm select-none">{option.emoji}</span>
                    <span className="text-[11px] font-semibold mt-1">{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Trigger selector */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-foreground">What triggered this shift?</Label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {COMMON_TRIGGERS.map((t) => {
                const isSelected = trigger === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTrigger(t)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-full border transition-all",
                      isSelected 
                        ? "bg-primary text-primary-foreground border-primary font-semibold"
                        : "bg-card border-border/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <Label className="text-xs text-muted-foreground">Shift Intensity</Label>
              <span className="font-bold text-xs">{intensity[0]}/5 ({intensity[0] <= 2 ? "Mild" : intensity[0] <= 4 ? "Noticeable" : "Intense"})</span>
            </div>
            <Slider value={intensity} onValueChange={setIntensity} min={1} max={5} step={1} className="py-2" />
          </div>

          {/* Note with Voice Recorder */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">Notes / Thoughts (Optional)</Label>
              <VoiceRecorder 
                onTranscript={(text) => setNotes((prev) => prev ? `${prev} ${text}` : text)} 
              />
            </div>
            <Textarea
              placeholder="What caused this change or how does your body feel?"
              className="min-h-[75px] resize-none text-xs rounded-2xl leading-relaxed"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-2">
          <Button variant="outline" className="rounded-2xl text-xs h-10" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="btn-primary rounded-2xl text-xs h-10 px-5" onClick={handleSave} disabled={isLogging}>
            {isLogging ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Sparkles className="w-4 h-4 mr-1.5" />}
            Save Mood Shift
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
