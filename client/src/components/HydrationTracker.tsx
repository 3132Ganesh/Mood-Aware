import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Droplets, Bell, BellRing, Sparkles, Plus, RotateCcw, Volume2, CheckCircle2, ShieldAlert } from "lucide-react";
import { soundscape } from "@/lib/soundscape";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const DEFAULT_GOAL = 2000; // 2,000 ml = 2.0 Liters

export function HydrationTracker({ compact = false }: { compact?: boolean }) {
  const todayKey = `moodaware_hydration_${format(new Date(), "yyyy-MM-dd")}`;
  const settingsKey = "moodaware_hydration_settings";

  // Hydration amount in milliliters (ml)
  const [intakeMl, setIntakeMl] = useState<number>(() => {
    const saved = localStorage.getItem(todayKey);
    return saved ? parseInt(saved, 10) || 0 : 750;
  });

  // Settings
  const [remindersEnabled, setRemindersEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem(settingsKey);
    return saved ? JSON.parse(saved).enabled ?? true : true;
  });

  const [intervalMinutes, setIntervalMinutes] = useState<number>(() => {
    const saved = localStorage.getItem(settingsKey);
    return saved ? JSON.parse(saved).interval ?? 60 : 60;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [goalMl, setGoalMl] = useState<number>(DEFAULT_GOAL);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setPermissionStatus(Notification.permission);
    }
  }, []);

  // Save intake to local storage
  useEffect(() => {
    localStorage.setItem(todayKey, intakeMl.toString());
  }, [intakeMl, todayKey]);

  // Save settings
  useEffect(() => {
    localStorage.setItem(settingsKey, JSON.stringify({
      enabled: remindersEnabled,
      interval: intervalMinutes,
      goal: goalMl,
    }));
  }, [remindersEnabled, intervalMinutes, goalMl]);

  // Handle Hydration Notification Trigger
  const triggerHydrationAlert = () => {
    if (soundEnabled) {
      soundscape.playWaterDroplet();
    }

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("💧 Time for a Sip of Water!", {
          body: "Stay hydrated to keep your mind clear and your energy high. Take a gentle sip now.",
          icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💧</text></svg>",
        });
      } catch (e) {
        // Fallback to in-app toast
      }
    }

    toast({
      title: "💧 Hydration Reminder",
      description: "Time to drink a glass of fresh water and rejuvenate your body!",
    });
  };

  // Schedule recurring interval
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (remindersEnabled && intervalMinutes > 0) {
      const ms = intervalMinutes * 60 * 1000;
      timerRef.current = setInterval(() => {
        triggerHydrationAlert();
      }, ms);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [remindersEnabled, intervalMinutes, soundEnabled]);

  const requestNotificationAccess = async () => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support system notifications, but in-app chimes are active.",
      });
      return;
    }

    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);
    if (permission === "granted") {
      toast({
        title: "Notifications Enabled 🔔",
        description: "You'll receive gentle water reminders at your selected intervals.",
      });
      triggerHydrationAlert();
    } else {
      toast({
        title: "Permission Denied",
        description: "System notifications were blocked. In-app alerts will continue to work.",
      });
    }
  };

  const addWater = (amount: number) => {
    soundscape.playWaterDroplet();
    setIntakeMl(prev => Math.min(5000, prev + amount));
    toast({
      title: `Added +${amount}ml Water 💧`,
      description: `Total today: ${(intakeMl + amount) / 1000} Liters`,
    });
  };

  const resetWater = () => {
    setIntakeMl(0);
    toast({
      title: "Water Intake Reset",
      description: "Starting fresh for today.",
    });
  };

  const progressPercent = Math.min(100, Math.round((intakeMl / goalMl) * 100));
  const currentLiters = (intakeMl / 1000).toFixed(1);
  const goalLiters = (goalMl / 1000).toFixed(1);

  if (compact) {
    return (
      <div className="p-4 rounded-3xl bg-stitch-surface-container-lowest border border-border/40 shadow-xs flex flex-col justify-between space-y-3 w-full min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-stitch-secondary-container text-stitch-on-secondary-container flex items-center justify-center">
              <Droplets className="w-4 h-4 text-stitch-secondary" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground">Hydration</h4>
              <p className="text-[10px] text-muted-foreground">{currentLiters}L / {goalLiters}L Goal</p>
            </div>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setSettingsOpen(true)}
            className="h-7 px-2 text-[10px] text-stitch-secondary hover:bg-stitch-secondary-container/40"
          >
            <Bell className="w-3 h-3 mr-1" />
            {remindersEnabled ? `${intervalMinutes}m` : "Off"}
          </Button>
        </div>

        <div className="w-full bg-muted/40 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-stitch-primary to-stitch-secondary h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-1.5 pt-1">
          <Button 
            size="sm" 
            onClick={() => addWater(250)}
            className="h-7 rounded-xl text-[11px] font-semibold bg-stitch-primary/10 text-stitch-primary hover:bg-stitch-primary/20 border border-stitch-primary/20"
          >
            +250ml Glass
          </Button>
          <Button 
            size="sm" 
            onClick={() => addWater(500)}
            className="h-7 rounded-xl text-[11px] font-semibold bg-stitch-secondary-container/40 text-stitch-on-secondary-container hover:bg-stitch-secondary-container/70 border border-stitch-secondary-container"
          >
            +500ml Bottle
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="border-none shadow-ambient bg-stitch-surface-container-lowest rounded-3xl p-6 border border-border/40 space-y-6 w-full min-w-0">
      
      {/* Header & Reminder Settings Trigger */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-stitch-secondary to-stitch-secondary-container text-white flex items-center justify-center shadow-xs">
            <Droplets className="w-6 h-6 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-headline font-bold text-stitch-on-surface">Hydration Sanctuary</h3>
              {remindersEnabled && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1">
                  <BellRing className="w-2.5 h-2.5 animate-pulse text-emerald-600" />
                  Active ({intervalMinutes}m)
                </Badge>
              )}
            </div>
            <p className="text-xs text-stitch-on-surface-variant">Daily water goal & gentle chime notifications</p>
          </div>
        </div>

        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1.5 border-stitch-secondary/30 text-stitch-secondary hover:bg-stitch-secondary-container/30">
              <Bell className="w-3.5 h-3.5" />
              Reminder Alerts
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md rounded-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-headline text-stitch-primary">
                <Droplets className="w-5 h-5 text-stitch-secondary" />
                Drink Water Reminder Settings
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure smart hydration reminders to notify you periodically to take a sip of water.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              
              {/* Permission Banner */}
              {permissionStatus !== "granted" && (
                <div className="p-3 rounded-2xl bg-stitch-secondary-container/40 border border-stitch-secondary-container flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-stitch-secondary flex-shrink-0" />
                    <span className="text-[11px] font-medium">Enable system popup notifications</span>
                  </div>
                  <Button size="sm" onClick={requestNotificationAccess} className="rounded-xl text-xs h-7 px-3 bg-stitch-primary text-white">
                    Allow
                  </Button>
                </div>
              )}

              {/* Master Reminder Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/40">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Hydration Reminders</h4>
                  <p className="text-[10px] text-muted-foreground">Receive sound chimes & push alerts</p>
                </div>
                <Switch checked={remindersEnabled} onCheckedChange={setRemindersEnabled} />
              </div>

              {/* Frequency Interval */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Reminder Frequency</label>
                <Select 
                  value={intervalMinutes.toString()} 
                  onValueChange={(val) => setIntervalMinutes(parseInt(val, 10))}
                  disabled={!remindersEnabled}
                >
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">Every 30 Minutes (High Activity)</SelectItem>
                    <SelectItem value="45">Every 45 Minutes</SelectItem>
                    <SelectItem value="60">Every 1 Hour (Recommended)</SelectItem>
                    <SelectItem value="90">Every 1.5 Hours</SelectItem>
                    <SelectItem value="120">Every 2 Hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Daily Target Goal */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Daily Target</label>
                <Select 
                  value={goalMl.toString()} 
                  onValueChange={(val) => setGoalMl(parseInt(val, 10))}
                >
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue placeholder="Daily target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1500">1.5 Liters (6 glasses)</SelectItem>
                    <SelectItem value="2000">2.0 Liters (8 glasses - Optimal)</SelectItem>
                    <SelectItem value="2500">2.5 Liters (10 glasses)</SelectItem>
                    <SelectItem value="3000">3.0 Liters (Active Athlete)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sound Chime Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-primary" />
                  <div>
                    <h4 className="text-xs font-bold text-foreground">Droplet Sound Chime</h4>
                    <p className="text-[10px] text-muted-foreground">Pleasant procedural water chime</p>
                  </div>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>

            </div>

            <DialogFooter className="flex items-center justify-between sm:justify-between">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={triggerHydrationAlert} 
                className="text-xs text-stitch-secondary"
              >
                🔊 Test Chime & Alert
              </Button>
              <Button onClick={() => setSettingsOpen(false)} className="rounded-xl text-xs font-semibold bg-stitch-primary text-white">
                Save & Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Hydration Progress Display */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        
        {/* Large Visual Progress SVG Ring */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90">
              <circle 
                className="text-stitch-surface-container-highest" 
                cx="72" 
                cy="72" 
                fill="transparent" 
                r="58" 
                stroke="currentColor" 
                strokeWidth="12" 
              />
              <circle 
                cx="72" 
                cy="72" 
                fill="transparent" 
                r="58" 
                stroke="#755754" 
                strokeWidth="12" 
                strokeDasharray="364.4" 
                strokeDashoffset={364.4 - (364.4 * (progressPercent / 100))} 
                strokeLinecap="round" 
                className="transition-all duration-700 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <Droplets className="w-6 h-6 text-stitch-secondary fill-stitch-secondary animate-bounce" />
              <span className="text-xl font-headline font-extrabold text-stitch-on-surface mt-0.5">
                {currentLiters}L
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">
                {progressPercent}% of {goalLiters}L
              </span>
            </div>
          </div>
        </div>

        {/* Quick-Log Intake Buttons */}
        <div className="sm:col-span-7 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider">Quick Intake Logger</span>
            <button 
              type="button"
              onClick={resetWater} 
              className="text-[10px] text-muted-foreground hover:text-rose-500 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              onClick={() => addWater(150)}
              variant="outline"
              className="rounded-2xl h-16 flex flex-col items-center justify-center p-2 border-border/70 hover:border-stitch-secondary hover:bg-stitch-secondary-container/20 active:scale-95 transition-all"
            >
              <span className="text-base">☕</span>
              <span className="text-xs font-bold text-foreground mt-0.5">+150ml</span>
              <span className="text-[9px] text-muted-foreground">Cup</span>
            </Button>

            <Button
              type="button"
              onClick={() => addWater(250)}
              variant="outline"
              className="rounded-2xl h-16 flex flex-col items-center justify-center p-2 border-stitch-primary/30 bg-stitch-primary/5 hover:bg-stitch-primary/15 active:scale-95 transition-all"
            >
              <span className="text-base">🥛</span>
              <span className="text-xs font-bold text-stitch-primary mt-0.5">+250ml</span>
              <span className="text-[9px] text-muted-foreground">Glass</span>
            </Button>

            <Button
              type="button"
              onClick={() => addWater(500)}
              variant="outline"
              className="rounded-2xl h-16 flex flex-col items-center justify-center p-2 border-stitch-secondary/40 bg-stitch-secondary-container/30 hover:bg-stitch-secondary-container/60 active:scale-95 transition-all"
            >
              <span className="text-base">🍶</span>
              <span className="text-xs font-bold text-stitch-secondary mt-0.5">+500ml</span>
              <span className="text-[9px] text-muted-foreground">Bottle</span>
            </Button>
          </div>

          <div className="p-3 rounded-2xl bg-stitch-surface-container-low border border-border/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-stitch-on-surface-variant text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-stitch-secondary flex-shrink-0" />
              <span>Next reminder alert in {intervalMinutes} mins</span>
            </div>
            <Button 
              size="sm"
              variant="ghost" 
              onClick={triggerHydrationAlert}
              className="h-6 text-[10px] font-semibold text-stitch-secondary px-2 hover:bg-stitch-secondary-container/40"
            >
              Test 💧
            </Button>
          </div>

        </div>

      </div>

    </Card>
  );
}
