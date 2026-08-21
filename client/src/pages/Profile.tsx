import { useState, useEffect } from "react";
import { useAuth, useProfile } from "@/hooks/use-auth";
import { useCurrentPlan } from "@/hooks/use-tasks";
import { useMood, useFeelings, useCapsules } from "@/hooks/use-tracking";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { 
  User, Mail, Calendar, Moon, Sun, Clock, Dumbbell, Music, Gamepad2, 
  Heart, Sparkles, Edit3, Save, RefreshCw, Check, Flame, Zap, Coffee, 
  Headphones, Compass, ShieldCheck, LogOut, SlidersHorizontal, ArrowLeft,
  CheckCircle2, Laptop, Smartphone, Activity, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const ACTIVITY_LEVELS = [
  { id: "sedentary", label: "Sedentary", desc: "Little exercise", icon: "🛋️" },
  { id: "moderate", label: "Moderate", desc: "1-2 times/wk", icon: "🚶" },
  { id: "active", label: "Active", desc: "3-5 times/wk", icon: "🏃" },
  { id: "athlete", label: "Athlete", desc: "Daily intense", icon: "⚡" },
];

const MUSIC_APPS = [
  { id: "spotify", label: "Spotify", icon: "🟢" },
  { id: "apple", label: "Apple Music", icon: "🍎" },
  { id: "youtube", label: "YouTube Music", icon: "🔴" },
  { id: "none", label: "No Music App", icon: "🔇" },
];

const BREAK_FREQUENCIES = [
  { id: "30m", label: "Every 30 mins", short: "30m" },
  { id: "1h", label: "Every 1 hour", short: "1 hr" },
  { id: "2h", label: "Every 2 hours", short: "2 hrs" },
  { id: "as_needed", label: "As needed", short: "Flexible" },
];

const CAFFEINE_LEVELS = [
  { id: "none", label: "None / Decaf", short: "0 cups" },
  { id: "low", label: "1-2 cups", short: "1-2" },
  { id: "moderate", label: "3-4 cups", short: "3-4" },
  { id: "high", label: "High (5+ cups)", short: "5+" },
];

const MUSIC_MOODS_LIST = [
  "Calm & Ambient", "Deep Focus", "Uplifting & Joyful", "Energetic", "Nature Sounds", "Lo-Fi Beats"
];

const GAME_TYPES_LIST = [
  "Puzzle & Brain Games", "Casual / Cozy", "Strategy", "Action & RPG"
];

const GAME_PLATFORMS_LIST = [
  "Mobile", "PC / Laptop", "Console", "Browser / Web"
];

const WELLNESS_GOALS_LIST = [
  { emoji: "🌿", label: "Mindfulness & Peace" },
  { emoji: "😴", label: "Better Sleep Quality" },
  { emoji: "💪", label: "Consistent Healthy Habits" },
  { emoji: "⚡", label: "Stress Reduction & Energy" },
  { emoji: "🤩", label: "Daily Happiness Tracking" },
];

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const { profile, updateProfile, isLoading: profileLoading } = useProfile();
  const { plan, generatePlan, isGenerating } = useCurrentPlan();
  const { history: moodHistory } = useMood();
  const { notes } = useFeelings();
  const { capsules } = useCapsules();
  const { toast } = useToast();

  // Mobile Filter Tab State
  const [mobileTab, setMobileTab] = useState<"all" | "sleep" | "activity" | "music" | "goals">("all");

  // Edit Name Dialog State
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");

  // Full Edit Preferences Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    ageGroup: "",
    occupation: "",
    sleepTime: "22:30",
    wakeTime: "07:00",
    breakFrequency: "1h",
    caffeineIntake: "low",
    physicalActivity: "moderate",
    musicApp: "spotify",
    musicMoods: [] as string[],
    playsGames: false,
    gamePlatforms: [] as string[],
    gameTypes: [] as string[],
    feedback: "",
  });

  // Keep form data synced with profile
  useEffect(() => {
    if (profile) {
      setFormData({
        ageGroup: profile.ageGroup || "25-34",
        occupation: profile.occupation || "tech",
        sleepTime: profile.sleepTime || "22:30",
        wakeTime: profile.wakeTime || "07:00",
        breakFrequency: profile.breakFrequency || "1h",
        caffeineIntake: profile.caffeineIntake || "low",
        physicalActivity: profile.physicalActivity || "moderate",
        musicApp: profile.musicApp || "spotify",
        musicMoods: (profile.musicMoods as string[]) || ["Calm & Ambient", "Deep Focus"],
        playsGames: Boolean(profile.playsGames),
        gamePlatforms: (profile.gamePlatforms as string[]) || ["Mobile"],
        gameTypes: (profile.gameTypes as string[]) || ["Puzzle & Brain Games"],
        feedback: profile.feedback || "",
      });
    }
  }, [profile]);

  useEffect(() => {
    if (user?.name) {
      setEditedName(user.name);
    }
  }, [user?.name]);

  // Instant Single-Preference Updater Helper
  const handleInstantUpdate = async (patch: Record<string, any>, successMessage: string) => {
    try {
      await updateProfile.mutateAsync(patch);
      toast({
        title: "Preference Updated ⚡",
        description: successMessage,
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Could not save your preference. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle Name Update
  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Name cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    try {
      await updateUser.mutateAsync({ name: editedName.trim() });
      setNameDialogOpen(false);
      toast({
        title: "Profile Updated ✨",
        description: "Your display name has been updated.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to update name",
        description: err.message || "An error occurred.",
        variant: "destructive",
      });
    }
  };

  // Handle Full Form Save from Dialog
  const handleSaveAllPreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      setEditModalOpen(false);
      toast({
        title: "Preferences Saved! 🎉",
        description: "All wellness settings and preferences have been updated instantly.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not update your preferences. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate sleep window duration in hours
  const calculateSleepWindow = (sleep?: string | null, wake?: string | null) => {
    if (!sleep || !wake) return "8 hours target";
    const [sH, sM] = sleep.split(":").map(Number);
    const [wH, wM] = wake.split(":").map(Number);
    if (isNaN(sH) || isNaN(wH)) return "8 hours target";
    
    let diffMinutes = (wH * 60 + (wM || 0)) - (sH * 60 + (sM || 0));
    if (diffMinutes <= 0) diffMinutes += 24 * 60;
    const hours = Math.floor(diffMinutes / 60);
    const mins = diffMinutes % 60;
    return `${hours}h ${mins > 0 ? `${mins}m ` : ""}rest window`;
  };

  // Activity Stats
  const totalCheckins = moodHistory?.length || 0;
  const totalNotes = notes?.length || 0;
  const totalCapsules = capsules?.length || 0;
  const completedTasksCount = plan?.items?.filter(i => i.isCompleted)?.length || 0;

  const currentSleep = profile?.sleepTime || "22:30";
  const currentWake = profile?.wakeTime || "07:00";
  const currentActivity = profile?.physicalActivity || "moderate";
  const currentMusicApp = profile?.musicApp || "spotify";
  const currentPlaysGames = profile?.playsGames ?? false;
  const currentBreakFreq = profile?.breakFrequency || "1h";
  const currentCaffeine = profile?.caffeineIntake || "low";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <Sidebar />

      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-28 lg:pb-12">

        {/* ========================================================================= */}
        {/* 1. LAPTOP / DESKTOP SCREEN UI (Visible on screens >= 1024px)              */}
        {/* ========================================================================= */}
        <div className="hidden lg:block p-8 max-w-7xl w-full mx-auto space-y-8">
          
          {/* Top Desktop Breadcrumb & Action Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-2xl hover:bg-muted/80 h-10 w-10">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                    <Laptop className="w-3 h-3" />
                    Laptop Dashboard
                  </Badge>
                </div>
                <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-0.5">
                  Profile & Wellness Preferences
                </h1>
                <p className="text-sm text-muted-foreground">
                  Inspect your account profile and fine-tune your wellness preferences with instant live updates.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setEditModalOpen(true)}
                className="btn-primary rounded-2xl shadow-lg shadow-primary/20 text-sm font-semibold gap-2 h-11 px-5"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Edit All Preferences
              </Button>
            </div>
          </div>

          {/* Laptop 2-Column Split Layout */}
          <div className="grid grid-cols-12 gap-8 items-start">
            
            {/* Left Sticky Column: User Identity Hub (~340px / 4 columns) */}
            <div className="col-span-4 sticky top-6 space-y-6">
              
              {/* Identity & Account Card */}
              <Card className="border-none shadow-xl bg-card/85 backdrop-blur-xl rounded-3xl overflow-hidden border border-border/50 relative">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />
                <CardContent className="p-6 relative space-y-6">
                  
                  {/* Avatar & Name */}
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-primary via-primary/90 to-accent flex items-center justify-center text-4xl font-display font-bold text-white shadow-xl shadow-primary/30 ring-4 ring-background">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white text-xs font-bold shadow-md" title="Active & Synced">
                        ✓
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2">
                        <h2 className="text-2xl font-display font-bold text-foreground">
                          {user?.name || "Mindful User"}
                        </h2>
                        <button 
                          onClick={() => setNameDialogOpen(true)}
                          className="p-1 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                          title="Edit Name"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary/70" />
                        {user?.email || "No email"}
                      </p>
                      <p className="text-[11px] text-muted-foreground/80 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3 text-primary/60" />
                        Member since {user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : "Recently"}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[11px] font-semibold px-2.5 py-0.5">
                        ✨ Mindful Explorer
                      </Badge>
                      <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Synced
                      </Badge>
                    </div>
                  </div>

                  {/* Activity Stats Matrix */}
                  <div className="space-y-2 pt-4 border-t border-border/40">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center">Wellness Activity Stats</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-2xl bg-muted/30 border border-border/30 text-center">
                        <p className="text-xl font-bold font-display text-foreground">{totalCheckins}</p>
                        <p className="text-[11px] text-muted-foreground font-medium">🌟 Check-ins</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-muted/30 border border-border/30 text-center">
                        <p className="text-xl font-bold font-display text-foreground">{totalNotes}</p>
                        <p className="text-[11px] text-muted-foreground font-medium">📝 Feelings</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-muted/30 border border-border/30 text-center">
                        <p className="text-xl font-bold font-display text-foreground">{completedTasksCount}</p>
                        <p className="text-[11px] text-muted-foreground font-medium">🎯 Tasks Done</p>
                      </div>
                      <div className="p-3 rounded-2xl bg-muted/30 border border-border/30 text-center">
                        <p className="text-xl font-bold font-display text-foreground">{totalCapsules}</p>
                        <p className="text-[11px] text-muted-foreground font-medium">💌 Capsules</p>
                      </div>
                    </div>
                  </div>

                  {/* AI Plan Sync Quick Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-primary" /> AI Wellness Plan
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-background/80 border-primary/30 text-primary">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Re-generate your personalized 7-day schedule to match your latest preferences.
                    </p>
                    <Button 
                      onClick={() => generatePlan()}
                      disabled={isGenerating}
                      className="w-full btn-primary rounded-xl text-xs font-semibold h-9 gap-2 shadow-sm"
                    >
                      <RefreshCw className={cn("w-3.5 h-3.5", isGenerating && "animate-spin")} />
                      {isGenerating ? "Rebuilding 7-Day Plan..." : "Re-sync AI Wellness Plan"}
                    </Button>
                  </div>

                  {/* Quick System Tools */}
                  <div className="space-y-2 pt-2 border-t border-border/40">
                    <Link href="/onboarding">
                      <Button variant="ghost" className="w-full justify-start rounded-xl text-xs text-muted-foreground hover:text-foreground h-9">
                        <Compass className="w-4 h-4 mr-2 text-primary" />
                        Launch Guided Setup Wizard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={() => logout()}
                      className="w-full justify-start rounded-xl text-xs text-destructive hover:bg-destructive/10 hover:text-destructive h-9"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out Account
                    </Button>
                  </div>

                </CardContent>
              </Card>

            </div>

            {/* Right Column: Interactive Preference Stations Matrix (~8 columns) */}
            <div className="col-span-8 space-y-6">

              {/* Station 1: Sleep Schedule & Rest Routine */}
              <Card className="border-none shadow-md bg-card/80 backdrop-blur-md rounded-3xl border border-border/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">Circadian Rhythm & Sleep Routine</CardTitle>
                        <CardDescription className="text-xs">Your bedtime, wake schedule, and daily rest intervals</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 bg-indigo-500/10 text-indigo-600">
                      {calculateSleepWindow(currentSleep, currentWake)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  
                  {/* Bedtime & Wake Time Inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/20 rounded-2xl border border-border/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Moon className="w-4 h-4 text-indigo-500" /> Target Bedtime
                        </span>
                        <span className="text-xs font-bold text-primary">{currentSleep}</span>
                      </div>
                      <Input 
                        type="time" 
                        value={currentSleep} 
                        onChange={(e) => handleInstantUpdate({ sleepTime: e.target.value }, `Bedtime updated to ${e.target.value}`)}
                        className="h-10 text-sm font-semibold rounded-xl bg-card border-border/60"
                      />
                    </div>

                    <div className="p-4 bg-muted/20 rounded-2xl border border-border/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Sun className="w-4 h-4 text-amber-500" /> Target Wake Time
                        </span>
                        <span className="text-xs font-bold text-primary">{currentWake}</span>
                      </div>
                      <Input 
                        type="time" 
                        value={currentWake} 
                        onChange={(e) => handleInstantUpdate({ wakeTime: e.target.value }, `Wake time updated to ${e.target.value}`)}
                        className="h-10 text-sm font-semibold rounded-xl bg-card border-border/60"
                      />
                    </div>
                  </div>

                  {/* Break Frequency & Caffeine Chips */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" /> Work Break Interval
                        </span>
                        <span className="font-bold text-foreground">
                          {BREAK_FREQUENCIES.find(b => b.id === currentBreakFreq)?.label || currentBreakFreq}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {BREAK_FREQUENCIES.map((freq) => {
                          const isSelected = currentBreakFreq === freq.id;
                          return (
                            <button
                              key={freq.id}
                              type="button"
                              onClick={() => handleInstantUpdate({ breakFrequency: freq.id }, `Break interval set to ${freq.label}`)}
                              className={cn(
                                "py-2 px-1.5 rounded-xl text-xs font-semibold border transition-all text-center",
                                isSelected 
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                                  : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                              )}
                            >
                              {freq.short}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-semibold flex items-center gap-1.5">
                          <Coffee className="w-3.5 h-3.5 text-amber-600" /> Daily Caffeine Intake
                        </span>
                        <span className="font-bold text-foreground">
                          {CAFFEINE_LEVELS.find(c => c.id === currentCaffeine)?.label || currentCaffeine}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5">
                        {CAFFEINE_LEVELS.map((c) => {
                          const isSelected = currentCaffeine === c.id;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleInstantUpdate({ caffeineIntake: c.id }, `Caffeine intake set to ${c.label}`)}
                              className={cn(
                                "py-2 px-1.5 rounded-xl text-xs font-semibold border transition-all text-center",
                                isSelected 
                                  ? "bg-amber-500/20 text-amber-900 dark:text-amber-200 border-amber-500/40 shadow-sm" 
                                  : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                              )}
                            >
                              {c.short}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>

              {/* Station 2: Physical Fitness & Energy */}
              <Card className="border-none shadow-md bg-card/80 backdrop-blur-md rounded-3xl border border-border/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">Physical Activity Level</CardTitle>
                        <CardDescription className="text-xs">Adjusts workout intensity and mindful movement in your plan</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 capitalize bg-emerald-500/10 text-emerald-600">
                      {currentActivity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {ACTIVITY_LEVELS.map((level) => {
                      const isSelected = currentActivity === level.id;
                      return (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => handleInstantUpdate({ physicalActivity: level.id }, `Activity level set to ${level.label}`)}
                          className={cn(
                            "p-3.5 rounded-2xl border text-left transition-all active:scale-98 flex flex-col justify-between h-28",
                            isSelected 
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-md ring-2 ring-emerald-500/30" 
                              : "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="text-2xl">{level.icon}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600 font-bold" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{level.label}</p>
                            <p className="text-[11px] text-muted-foreground">{level.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Station 3: Audio Sanctuary & Music Streaming */}
              <Card className="border-none shadow-md bg-card/80 backdrop-blur-md rounded-3xl border border-border/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                        <Headphones className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">Sound Sanctuary & Music App</CardTitle>
                        <CardDescription className="text-xs">Preferred platform for binaural beats, focus playlists, and ambient sounds</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full text-xs font-semibold px-3 py-1 capitalize bg-pink-500/10 text-pink-600">
                      {MUSIC_APPS.find(m => m.id === currentMusicApp)?.label || currentMusicApp}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-3">
                    {MUSIC_APPS.map((app) => {
                      const isSelected = currentMusicApp === app.id;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => handleInstantUpdate({ musicApp: app.id }, `Music platform set to ${app.label}`)}
                          className={cn(
                            "p-3 rounded-2xl border text-sm font-semibold flex items-center gap-2.5 transition-all active:scale-98",
                            isSelected 
                              ? "bg-pink-500/15 border-pink-500/40 text-pink-950 dark:text-pink-100 ring-2 ring-pink-500/30 shadow-md" 
                              : "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <span className="text-lg">{app.icon}</span>
                          <span className="truncate">{app.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-pink-600 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Sound Vibes Pills */}
                  <div className="pt-3 border-t border-border/30">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">Curated Sound Vibes for Your Mood</p>
                    <div className="flex flex-wrap gap-2">
                      {MUSIC_MOODS_LIST.map((mood) => {
                        const moods = (profile?.musicMoods as string[]) || [];
                        const isSelected = moods.includes(mood);
                        return (
                          <button
                            key={mood}
                            type="button"
                            onClick={() => {
                              const updatedMoods = isSelected 
                                ? moods.filter(m => m !== mood)
                                : [...moods, mood];
                              handleInstantUpdate({ musicMoods: updatedMoods }, `Sound vibes updated`);
                            }}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all active:scale-95",
                              isSelected 
                                ? "bg-primary/20 text-primary border-primary/30 shadow-sm" 
                                : "bg-muted/30 border-border/40 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {isSelected ? "✓ " : "+ "}{mood}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Station 4: Mindful Gaming & Micro-Breaks */}
              <Card className="border-none shadow-md bg-card/80 backdrop-blur-md rounded-3xl border border-border/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">Gaming Micro-Breaks for Relaxation</CardTitle>
                        <CardDescription className="text-xs">Include quick puzzle games and cognitive de-stress breaks</CardDescription>
                      </div>
                    </div>
                    <Switch 
                      checked={currentPlaysGames}
                      onCheckedChange={(checked) => handleInstantUpdate({ playsGames: checked }, checked ? "Gaming breaks enabled! 🎮" : "Gaming breaks disabled")}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={cn(
                    "p-4 rounded-2xl border transition-all duration-300",
                    currentPlaysGames 
                      ? "bg-blue-500/10 border-blue-500/20 text-foreground" 
                      : "bg-muted/20 border-border/40 text-muted-foreground opacity-60"
                  )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold flex items-center gap-2">
                        🎮 {currentPlaysGames ? "Relaxation Gaming Active in Plan" : "Relaxation Gaming Disabled"}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {currentPlaysGames ? "Included in 7-Day Plan" : "Excluded"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentPlaysGames 
                        ? "MoodAware will weave 5-15 min interactive brain teasers and casual mini-games into your daily plan to prevent burnout."
                        : "Turn this switch on to include quick stress-relief puzzle tasks in your routine."}
                    </p>
                  </div>

                  {currentPlaysGames && (
                    <div className="pt-2 border-t border-border/30 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground">Select Preferred Game Styles</p>
                      <div className="flex flex-wrap gap-2">
                        {GAME_TYPES_LIST.map((type) => {
                          const types = (profile?.gameTypes as string[]) || [];
                          const isSelected = types.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                const updatedTypes = isSelected 
                                  ? types.filter(t => t !== type)
                                  : [...types, type];
                                handleInstantUpdate({ gameTypes: updatedTypes }, "Game styles updated");
                              }}
                              className={cn(
                                "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all",
                                isSelected 
                                  ? "bg-blue-500/20 text-blue-900 dark:text-blue-200 border-blue-500/30" 
                                  : "bg-muted/30 border-border/40 text-muted-foreground"
                              )}
                            >
                              {isSelected ? "✓ " : "+ "}{type}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Station 5: Goals & Feedback Vision */}
              <Card className="border-none shadow-md bg-card/80 backdrop-blur-md rounded-3xl border border-border/40">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold">Wellness Intentions & Vision</CardTitle>
                        <CardDescription className="text-xs">Your core guiding goals for AI personalized recommendations</CardDescription>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setEditModalOpen(true)}
                      className="rounded-xl text-xs font-semibold h-9 px-3"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit Goals
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2.5">
                    {WELLNESS_GOALS_LIST.map((goal) => {
                      const currentFeedback = profile?.feedback || "";
                      const isSelected = currentFeedback.includes(goal.label);
                      return (
                        <button
                          key={goal.label}
                          type="button"
                          onClick={() => {
                            const newFeedback = isSelected
                              ? currentFeedback.replace(`[${goal.label}]`, "").trim()
                              : `[${goal.label}] ${currentFeedback}`.trim();
                            handleInstantUpdate({ feedback: newFeedback }, `Goal updated to ${goal.label}`);
                          }}
                          className={cn(
                            "flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all active:scale-95",
                            isSelected 
                              ? "bg-purple-500/20 text-purple-900 dark:text-purple-200 border-purple-500/40 shadow-sm" 
                              : "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <span className="text-sm">{goal.emoji}</span>
                          <span>{goal.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 ml-1" />}
                        </button>
                      );
                    })}
                  </div>

                  {profile?.feedback ? (
                    <div className="p-4 rounded-2xl bg-muted/30 border border-border/30 text-xs text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Personal Reflection & Notes: </span>
                      {profile.feedback}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      No personal notes added yet. Tap "Edit Goals" to specify your wellness vision!
                    </p>
                  )}
                </CardContent>
              </Card>

            </div>

          </div>

        </div>


        {/* ========================================================================= */}
        {/* 2. MOBILE SCREEN UI (Visible on screens < 1024px)                        */}
        {/* ========================================================================= */}
        <div className="lg:hidden w-full px-4 py-3 space-y-4 max-w-lg mx-auto">
          
          {/* Mobile Top Header Banner */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-xl h-8 w-8 hover:bg-muted/80">
                  <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                </Button>
              </Link>
              <div>
                <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1 mb-0.5 w-fit">
                  <Smartphone className="w-2.5 h-2.5" />
                  Personal Space
                </Badge>
                <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  My Profile
                </h1>
              </div>
            </div>

            <Button 
              size="sm" 
              onClick={() => setEditModalOpen(true)}
              className="btn-primary rounded-2xl text-xs font-semibold gap-1.5 h-8 px-3 shadow-xs active:scale-95"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Edit
            </Button>
          </div>

          {/* Compact Mobile Profile Card */}
          <Card className="border-none shadow-md bg-card/95 backdrop-blur-xl rounded-3xl overflow-hidden border border-border/50 w-full">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3.5">
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xl font-display font-bold text-white shadow-md shadow-primary/25">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white text-[9px] font-bold">
                    ✓
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-foreground truncate">{user?.name || "User"}</h3>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                      ✨ Mindful
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Synced
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Full-width Segmented 5-Pill Tab Grid */}
          <div className="grid grid-cols-5 gap-1 p-1 bg-muted/40 rounded-2xl border border-border/50 w-full">
            <button
              type="button"
              onClick={() => setMobileTab("all")}
              className={cn(
                "py-2 px-0.5 rounded-xl text-[11px] font-bold transition-all text-center truncate",
                mobileTab === "all" ? "bg-primary text-primary-foreground shadow-xs scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              ⚡ All
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("sleep")}
              className={cn(
                "py-2 px-0.5 rounded-xl text-[11px] font-bold transition-all text-center truncate",
                mobileTab === "sleep" ? "bg-indigo-500 text-white shadow-xs scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🌙 Sleep
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("activity")}
              className={cn(
                "py-2 px-0.5 rounded-xl text-[11px] font-bold transition-all text-center truncate",
                mobileTab === "activity" ? "bg-emerald-500 text-white shadow-xs scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🏃 Move
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("music")}
              className={cn(
                "py-2 px-0.5 rounded-xl text-[11px] font-bold transition-all text-center truncate",
                mobileTab === "music" ? "bg-pink-500 text-white shadow-xs scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🎵 Audio
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("goals")}
              className={cn(
                "py-2 px-0.5 rounded-xl text-[11px] font-bold transition-all text-center truncate",
                mobileTab === "goals" ? "bg-purple-500 text-white shadow-xs scale-[1.02]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              🎯 Goals
            </button>
          </div>

          {/* Mobile Instant Content Cards */}
          <div className="space-y-3.5">
            
            {/* Sleep Section (Mobile) */}
            {(mobileTab === "all" || mobileTab === "sleep") && (
              <Card className="border-none shadow-md bg-card/85 rounded-3xl p-4 space-y-3 border border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                      <Moon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Sleep & Rest</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] bg-indigo-500/10 text-indigo-600">
                    {calculateSleepWindow(currentSleep, currentWake)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 bg-muted/20 rounded-xl space-y-1">
                    <span className="text-[11px] text-muted-foreground font-medium">Bedtime</span>
                    <Input 
                      type="time" 
                      value={currentSleep} 
                      onChange={(e) => handleInstantUpdate({ sleepTime: e.target.value }, `Bedtime updated to ${e.target.value}`)}
                      className="h-8 text-xs font-semibold rounded-lg bg-card"
                    />
                  </div>
                  <div className="p-2.5 bg-muted/20 rounded-xl space-y-1">
                    <span className="text-[11px] text-muted-foreground font-medium">Wake Time</span>
                    <Input 
                      type="time" 
                      value={currentWake} 
                      onChange={(e) => handleInstantUpdate({ wakeTime: e.target.value }, `Wake time updated to ${e.target.value}`)}
                      className="h-8 text-xs font-semibold rounded-lg bg-card"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/30 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Break Interval:</span>
                    <span className="font-semibold text-foreground capitalize">{currentBreakFreq}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {BREAK_FREQUENCIES.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => handleInstantUpdate({ breakFrequency: b.id }, `Break set to ${b.label}`)}
                        className={cn(
                          "py-1.5 rounded-lg text-[10px] font-semibold border text-center transition-all",
                          currentBreakFreq === b.id 
                            ? "bg-primary text-primary-foreground border-primary" 
                            : "bg-muted/30 border-border/50 text-muted-foreground"
                        )}
                      >
                        {b.short}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Activity Section (Mobile) */}
            {(mobileTab === "all" || mobileTab === "activity") && (
              <Card className="border-none shadow-md bg-card/85 rounded-3xl p-4 space-y-3 border border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Activity Level</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] capitalize bg-emerald-500/10 text-emerald-600">
                    {currentActivity}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_LEVELS.map((level) => {
                    const isSelected = currentActivity === level.id;
                    return (
                      <button
                        key={level.id}
                        type="button"
                        onClick={() => handleInstantUpdate({ physicalActivity: level.id }, `Activity set to ${level.label}`)}
                        className={cn(
                          "p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all active:scale-95",
                          isSelected 
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-500/30" 
                            : "bg-muted/20 border-border/50 text-muted-foreground"
                        )}
                      >
                        <span className="text-lg">{level.icon}</span>
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate text-foreground">{level.label}</p>
                          <p className="text-[9px] text-muted-foreground truncate">{level.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Music & Audio Section (Mobile) */}
            {(mobileTab === "all" || mobileTab === "music") && (
              <Card className="border-none shadow-md bg-card/85 rounded-3xl p-4 space-y-3 border border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Music Sanctuary</span>
                  </div>
                  <Badge variant="secondary" className="text-[10px] capitalize bg-pink-500/10 text-pink-600">
                    {MUSIC_APPS.find(m => m.id === currentMusicApp)?.label || currentMusicApp}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {MUSIC_APPS.map((app) => {
                    const isSelected = currentMusicApp === app.id;
                    return (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => handleInstantUpdate({ musicApp: app.id }, `Music set to ${app.label}`)}
                        className={cn(
                          "p-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all active:scale-95",
                          isSelected 
                            ? "bg-pink-500/15 border-pink-500/40 text-pink-950 dark:text-pink-100 ring-1 ring-pink-500/30" 
                            : "bg-muted/20 border-border/50 text-muted-foreground"
                        )}
                      >
                        <span>{app.icon}</span>
                        <span className="truncate">{app.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Gaming Toggle */}
                <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold">Gaming Micro-Breaks</span>
                  </div>
                  <Switch 
                    checked={currentPlaysGames}
                    onCheckedChange={(checked) => handleInstantUpdate({ playsGames: checked }, checked ? "Gaming breaks enabled! 🎮" : "Gaming breaks disabled")}
                  />
                </div>
              </Card>
            )}

            {/* Goals & Notes Section (Mobile) */}
            {(mobileTab === "all" || mobileTab === "goals") && (
              <Card className="border-none shadow-md bg-card/85 rounded-3xl p-4 space-y-3 border border-border/40">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Heart className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-foreground">Wellness Goals</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {WELLNESS_GOALS_LIST.map((goal) => {
                    const currentFeedback = profile?.feedback || "";
                    const isSelected = currentFeedback.includes(goal.label);
                    return (
                      <button
                        key={goal.label}
                        type="button"
                        onClick={() => {
                          const newFeedback = isSelected
                            ? currentFeedback.replace(`[${goal.label}]`, "").trim()
                            : `[${goal.label}] ${currentFeedback}`.trim();
                          handleInstantUpdate({ feedback: newFeedback }, `Goal updated`);
                        }}
                        className={cn(
                          "flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all active:scale-95",
                          isSelected 
                            ? "bg-purple-500/20 text-purple-900 dark:text-purple-200 border-purple-500/40" 
                            : "bg-muted/20 border-border/50 text-muted-foreground"
                        )}
                      >
                        <span>{goal.emoji}</span>
                        <span>{goal.label}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}

          </div>

          {/* Mobile Bottom Actions */}
          <div className="space-y-2 pt-2">
            <Button 
              onClick={() => generatePlan()}
              disabled={isGenerating}
              className="w-full btn-primary rounded-2xl text-xs font-semibold h-11 shadow-md shadow-primary/20 gap-2"
            >
              <RefreshCw className={cn("w-4 h-4", isGenerating && "animate-spin")} />
              {isGenerating ? "Re-syncing AI Plan..." : "Re-sync AI Wellness Plan"}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/onboarding">
                <Button variant="outline" className="w-full rounded-xl text-xs h-9 font-medium">
                  <Compass className="w-3.5 h-3.5 mr-1 text-primary" /> Setup Wizard
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => logout()}
                className="w-full rounded-xl text-xs h-9 font-medium text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              >
                <LogOut className="w-3.5 h-3.5 mr-1" /> Sign Out
              </Button>
            </div>
          </div>

        </div>

      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Shared Dialog 1: Change Display Name */}
      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
        <DialogContent className="max-w-sm rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Change Display Name</DialogTitle>
            <DialogDescription>
              How would you like MoodAware to greet you?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Label className="text-xs font-semibold">Your Name</Label>
            <Input 
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              placeholder="Enter your name"
              className="rounded-xl"
              autoFocus
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setNameDialogOpen(false)} className="rounded-xl">
              Cancel
            </Button>
            <Button 
              onClick={handleSaveName} 
              disabled={updateUser.isPending}
              className="btn-primary rounded-xl font-semibold"
            >
              {updateUser.isPending ? <RefreshCw className="w-4 h-4 animate-spin mr-1" /> : null}
              Save Name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Shared Dialog 2: Comprehensive Edit All Preferences Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-border bg-card/95 backdrop-blur-xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Edit Wellness Preferences
            </DialogTitle>
            <DialogDescription>
              Update your lifestyle schedule, activity targets, and relaxation preferences.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveAllPreferences} className="space-y-5 pt-2">
            <Tabs defaultValue="routine" className="w-full">
              <TabsList className="grid grid-cols-3 rounded-2xl p-1 bg-muted/60 mb-4">
                <TabsTrigger value="routine" className="rounded-xl text-xs font-semibold">Routine & Sleep</TabsTrigger>
                <TabsTrigger value="lifestyle" className="rounded-xl text-xs font-semibold">Lifestyle & Sound</TabsTrigger>
                <TabsTrigger value="goals" className="rounded-xl text-xs font-semibold">Goals & Notes</TabsTrigger>
              </TabsList>

              {/* Tab 1: Routine & Sleep */}
              <TabsContent value="routine" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Typical Bedtime</Label>
                    <Input 
                      type="time" 
                      value={formData.sleepTime}
                      onChange={(e) => setFormData({ ...formData, sleepTime: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Typical Wake Time</Label>
                    <Input 
                      type="time" 
                      value={formData.wakeTime}
                      onChange={(e) => setFormData({ ...formData, wakeTime: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Break Frequency at Work</Label>
                  <Select 
                    value={formData.breakFrequency} 
                    onValueChange={(val) => setFormData({ ...formData, breakFrequency: val })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {BREAK_FREQUENCIES.map((b) => (
                        <SelectItem key={b.id} value={b.id}>{b.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Caffeine Intake</Label>
                  <Select 
                    value={formData.caffeineIntake} 
                    onValueChange={(val) => setFormData({ ...formData, caffeineIntake: val })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select intake level" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {CAFFEINE_LEVELS.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* Tab 2: Lifestyle & Sound */}
              <TabsContent value="lifestyle" className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Physical Activity Level</Label>
                  <Select 
                    value={formData.physicalActivity} 
                    onValueChange={(val) => setFormData({ ...formData, physicalActivity: val })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select activity" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {ACTIVITY_LEVELS.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.icon} {a.label} ({a.desc})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Preferred Music Sanctuary</Label>
                  <Select 
                    value={formData.musicApp} 
                    onValueChange={(val) => setFormData({ ...formData, musicApp: val })}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select music app" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {MUSIC_APPS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.icon} {m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3.5 rounded-2xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-xs font-semibold">Relaxation Gaming Breaks</Label>
                      <p className="text-[11px] text-muted-foreground">Suggest quick puzzle & mindful gaming breaks</p>
                    </div>
                    <Switch 
                      checked={formData.playsGames}
                      onCheckedChange={(checked) => setFormData({ ...formData, playsGames: checked })}
                    />
                  </div>
                </div>
              </TabsContent>

              {/* Tab 3: Goals & Notes */}
              <TabsContent value="goals" className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Feedback, Reflection & Notes</Label>
                  <Textarea 
                    value={formData.feedback}
                    onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                    placeholder="Share your personal wellness goals or suggestions for your AI plan..."
                    className="min-h-[120px] rounded-2xl resize-none text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/40">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setEditModalOpen(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateProfile.isPending}
                className="btn-primary rounded-xl font-semibold gap-2"
              >
                {updateProfile.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Save Preferences
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
