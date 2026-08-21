import { useState } from "react";
import { useSleepTracker } from "@/hooks/use-sleep-tracker";
import { useProfile } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { format, differenceInMinutes } from "date-fns";
import { 
  Moon, Sun, Smartphone, Sparkles, CheckCircle2, Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface SleepTrackerCardProps {
  compact?: boolean;
}

export function SleepTrackerCard({ compact = false }: SleepTrackerCardProps) {
  const { todaySession, isConfirmed, confirmSleep, isLogging } = useSleepTracker();
  const { profile } = useProfile();

  const [editOpen, setEditOpen] = useState(false);
  const [customBedTime, setCustomBedTime] = useState<string>("23:00");
  const [customWakeTime, setCustomWakeTime] = useState<string>("07:00");

  if (!todaySession) {
    return null;
  }

  const lastUseDate = new Date(todaySession.lastDeviceUse);
  const firstPickupDate = new Date(todaySession.firstDevicePickup);
  const durationMinutes = todaySession.durationMinutes || Math.max(60, differenceInMinutes(firstPickupDate, lastUseDate));

  const hours = Math.floor(durationMinutes / 60);
  const minutes = durationMinutes % 60;
  const alignmentScore = todaySession.alignmentScore ?? 92;

  const targetBedStr = profile?.sleepTime || "23:00";
  const targetWakeStr = profile?.wakeTime || "07:00";

  const handleOpenEdit = () => {
    setCustomBedTime(format(lastUseDate, "HH:mm"));
    setCustomWakeTime(format(firstPickupDate, "HH:mm"));
    setEditOpen(true);
  };

  const handleSaveAdjusted = () => {
    const today = new Date();
    const bedDate = new Date(today);
    bedDate.setDate(bedDate.getDate() - 1);
    const [bH, bM] = customBedTime.split(":").map(Number);
    bedDate.setHours(bH || 23, bM || 0, 0, 0);

    const wakeDate = new Date(today);
    const [wH, wM] = customWakeTime.split(":").map(Number);
    wakeDate.setHours(wH || 7, wM || 0, 0, 0);

    const newDuration = Math.max(60, differenceInMinutes(wakeDate, bedDate));

    confirmSleep({
      lastDeviceUse: bedDate,
      firstDevicePickup: wakeDate,
      durationMinutes: newDuration,
      isConfirmed: true,
    });

    setEditOpen(false);
    toast({
      title: "Sleep Log Calibrated ✨",
      description: `Updated sleep duration to ${Math.floor(newDuration / 60)}h ${newDuration % 60}m.`,
    });
  };

  const handleConfirm = () => {
    confirmSleep();
    toast({
      title: "Sleep Confirmed ✓",
      description: `Recorded ${hours}h ${minutes}m of rest for today.`,
    });
  };

  if (compact) {
    return (
      <div className="p-4 rounded-3xl bg-stitch-surface-container-lowest border border-border/40 shadow-xs flex flex-col justify-between space-y-3 w-full min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Moon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Sleep Duration</h4>
              <p className="text-[10px] text-muted-foreground">{hours}h {minutes}m recorded</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] bg-indigo-500/10 text-indigo-600 border-indigo-500/20">
            {alignmentScore}% Aligned
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs bg-muted/20 p-2 rounded-xl">
          <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
            <Smartphone className="w-3 h-3 text-primary" />
            <span>{format(lastUseDate, "h:mm a")} → {format(firstPickupDate, "h:mm a")}</span>
          </div>
          {!isConfirmed ? (
            <Button size="sm" onClick={handleConfirm} className="h-6 rounded-lg text-[10px] px-2 bg-stitch-primary text-white">
              Confirm ✓
            </Button>
          ) : (
            <span className="text-[10px] font-semibold text-emerald-600">✓ Logged</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-ambient bg-stitch-surface-container-lowest rounded-3xl p-6 border border-border/40 space-y-5 w-full min-w-0">
      
      {/* Header */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 text-white flex items-center justify-center shadow-xs">
            <Moon className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-headline font-bold text-stitch-on-surface">Sleep & Circadian Rhythm</h3>
              <Badge variant="outline" className={cn(
                "text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1",
                isConfirmed ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 border-amber-500/20"
              )}>
                {isConfirmed ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5 animate-pulse" />}
                {isConfirmed ? "Confirmed Baseline" : "Auto-Detected"}
              </Badge>
            </div>
            <p className="text-xs text-stitch-on-surface-variant">Measured from last night device usage to morning phone pick-up</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleOpenEdit}
            className="rounded-xl text-xs font-semibold gap-1.5 border-border/60 hover:bg-muted/40"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Adjust
          </Button>
          {!isConfirmed && (
            <Button 
              size="sm" 
              onClick={handleConfirm}
              disabled={isLogging}
              className="rounded-xl text-xs font-semibold gap-1.5 bg-stitch-primary hover:bg-stitch-primary/90 text-white shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirm
            </Button>
          )}
        </div>
      </div>

      {/* Main Sleep Timeline Track */}
      <div className="p-5 rounded-2xl bg-stitch-surface-container-low border border-border/40 space-y-4">
        
        <div className="flex items-center justify-between gap-2 flex-wrap">
          {/* Bedtime Node */}
          <div className="space-y-0.5">
            <span className="text-[10px] font-label uppercase tracking-widest text-muted-foreground flex items-center gap-1">
              <Moon className="w-3 h-3 text-indigo-500" /> Last Device Use
            </span>
            <p className="text-base font-bold text-foreground">
              {format(lastUseDate, "h:mm a")}
            </p>
            <span className="text-[10px] text-muted-foreground">Target: {targetBedStr}</span>
          </div>

          {/* Center Sleep Duration Metric */}
          <div className="flex flex-col items-center justify-center px-4 py-2 rounded-2xl bg-card border border-border/60 shadow-xs text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stitch-primary">Sleep Duration</span>
            <span className="text-2xl font-headline font-black text-foreground mt-0.5">
              {hours}h {minutes}m
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3" /> {alignmentScore}% Circadian Alignment
            </span>
          </div>

          {/* Wake Time Node */}
          <div className="space-y-0.5 text-right">
            <span className="text-[10px] font-label uppercase tracking-widest text-muted-foreground flex items-center justify-end gap-1">
              <Sun className="w-3 h-3 text-amber-500" /> First Phone Pick-Up
            </span>
            <p className="text-base font-bold text-foreground">
              {format(firstPickupDate, "h:mm a")}
            </p>
            <span className="text-[10px] text-muted-foreground">Target: {targetWakeStr}</span>
          </div>
        </div>

        {/* Visual Connecting Gradient Bar */}
        <div className="relative w-full h-2 rounded-full bg-muted/60 overflow-hidden">
          <div 
            className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-500 rounded-full"
            style={{ width: "100%" }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Smartphone className="w-3.5 h-3.5 text-stitch-primary" />
            Zero manual input required — recorded automatically when your phone went idle and was picked up this morning.
          </span>
        </div>

      </div>

      {/* Manual Sleep Calibration Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-headline text-stitch-primary">
              <Moon className="w-5 h-5 text-indigo-500" />
              Adjust Today's Sleep Window
            </DialogTitle>
            <DialogDescription className="text-xs">
              Did you read a book or wake up earlier before picking up your phone? Fine-tune your sleep duration below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5 p-3 rounded-2xl bg-muted/20 border border-border/50">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5 text-indigo-500" /> Bedtime
                </label>
                <Input 
                  type="time" 
                  value={customBedTime} 
                  onChange={(e) => setCustomBedTime(e.target.value)}
                  className="rounded-xl font-bold text-sm h-10"
                />
              </div>

              <div className="space-y-1.5 p-3 rounded-2xl bg-muted/20 border border-border/50">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" /> Wake Time
                </label>
                <Input 
                  type="time" 
                  value={customWakeTime} 
                  onChange={(e) => setCustomWakeTime(e.target.value)}
                  className="rounded-xl font-bold text-sm h-10"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setEditOpen(false)} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button onClick={handleSaveAdjusted} className="rounded-xl text-xs font-semibold bg-stitch-primary text-white">
              Save & Confirm Rest
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
}
