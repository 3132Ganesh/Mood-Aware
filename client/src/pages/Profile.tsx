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
  CheckCircle2, Bed, Smile, Layers, HelpCircle
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
  { id: "30m", label: "Every 30 mins" },
  { id: "1h", label: "Every 1 hour" },
  { id: "2h", label: "Every 2 hours" },
  { id: "as_needed", label: "As needed" },
];

const CAFFEINE_LEVELS = [
  { id: "none", label: "None / Decaf" },
  { id: "low", label: "1-2 cups" },
  { id: "moderate", label: "3-4 cups" },
  { id: "high", label: "High (5+ cups)" },
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
      <Sidebar />

      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-28 lg:pb-12">
        {/* Top Header Banner */}
        <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto space-y-6">
          
          {/* Top Bar Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon" className="rounded-xl hover:bg-muted/80">
                  <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Profile & Preferences
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Manage your personal account details and fine-tune your wellness settings instantly.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary rounded-2xl shadow-md shadow-primary/20 text-xs sm:text-sm font-semibold gap-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Edit All Preferences</span>
                    <span className="sm:hidden">Edit</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-border bg-card/95 backdrop-blur-xl p-6">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-display font-bold flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      Edit Wellness Preferences
                    </DialogTitle>
                    <DialogDescription>
                      Update your lifestyle goals, daily schedule, and relaxation preferences.
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
          </div>

          {/* User Account Overview Hero Card */}
          <Card className="border-none shadow-xl bg-gradient-to-br from-card/90 via-card/70 to-card/40 backdrop-blur-xl rounded-3xl overflow-hidden relative border border-border/50">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <CardContent className="p-6 sm:p-8 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                
                {/* Avatar & Personal Identity */}
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-2xl sm:text-3xl font-display font-bold text-white shadow-xl shadow-primary/30 ring-4 ring-background">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center text-white text-[10px]" title="Active & Synced">
                      ✓
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-display font-bold text-foreground">
                        {user?.name || "Mindful User"}
                      </h2>
                      <Dialog open={nameDialogOpen} onOpenChange={setNameDialogOpen}>
                        <DialogTrigger asChild>
                          <button 
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                            title="Edit Name"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="max-w-sm rounded-3xl">
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
                              Save
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-primary/70" />
                        {user?.email || "No email"}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary/70" />
                        Member since {user?.createdAt ? format(new Date(user.createdAt), "MMM yyyy") : "Recently"}
                      </span>
                    </div>

                    <div className="pt-1.5 flex items-center gap-2">
                      <Badge variant="outline" className="rounded-full bg-primary/10 text-primary border-primary/20 text-[11px] font-medium px-2.5 py-0.5">
                        ✨ Mindful Explorer
                      </Badge>
                      <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] font-medium px-2.5 py-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Account Synced
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Quick AI Plan Sync Action */}
                <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                  <Button 
                    variant="outline" 
                    onClick={() => generatePlan()}
                    disabled={isGenerating}
                    className="w-full sm:w-auto rounded-2xl text-xs font-semibold gap-2 border-primary/20 hover:bg-primary/5 hover:border-primary/40 h-10 px-4"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5 text-primary", isGenerating && "animate-spin")} />
                    {isGenerating ? "Rebuilding Plan..." : "Re-sync AI Plan"}
                  </Button>
                </div>
              </div>

              {/* Activity Summary Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-border/40">
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/30 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm">
                    🌟
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold font-display">{totalCheckins}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">Daily Check-ins</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/30 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold text-sm">
                    📝
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold font-display">{totalNotes}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">Feelings Logged</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/30 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">
                    🎯
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold font-display">{completedTasksCount}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">Tasks Mastered</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/30 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-sm">
                    💌
                  </div>
                  <div>
                    <p className="text-base sm:text-lg font-bold font-display">{totalCapsules}</p>
                    <p className="text-[11px] text-muted-foreground font-medium">Time Capsules</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Instant Preferences Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Instant Preferences & Controls
                </h3>
                <p className="text-xs text-muted-foreground">
                  Tap any option below to change your wellness preferences immediately.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Card 1: Sleep Schedule & Rest Routine */}
              <Card className="border-none shadow-md bg-card/80 backdrop-blur-md rounded-3xl border border-border/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                        <Moon className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">Sleep & Rest Schedule</CardTitle>
                        <CardDescription className="text-xs">Your circadian rhythm targets</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-600">
                      {calculateSleepWindow(currentSleep, currentWake)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted/30 rounded-2xl border border-border/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <Moon className="w-3 h-3 text-indigo-400" /> Bedtime
                        </span>
                      </div>
                      <Input 
                        type="time" 
                        value={currentSleep} 
                        onChange={(e) => handleInstantUpdate({ sleepTime: e.target.value }, `Bedtime updated to ${e.target.value}`)}
                        className="h-8 text-sm font-semibold rounded-xl bg-card border-border/60"
                      />
                    </div>

                    <div className="p-3 bg-muted/30 rounded-2xl border border-border/30">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <Sun className="w-3 h-3 text-amber-400" /> Wake Time
                        </span>
                      </div>
                      <Input 
                        type="time" 
                        value={currentWake} 
                        onChange={(e) => handleInstantUpdate({ wakeTime: e.target.value }, `Wake time updated to ${e.target.value}`)}
                        className="h-8 text-sm font-semibold rounded-xl bg-card border-border/60"
                      />
                    </div>
                  </div>

                  {/* Break & Caffeine Chips */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3 text-primary" /> Break Frequency
                      </span>
                      <span className="font-semibold text-foreground capitalize">
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
                            onClick={() => handleInstantUpdate({ breakFrequency: freq.id }, `Break frequency set to ${freq.label}`)}
                            className={cn(
                              "px-2 py-1.5 rounded-xl text-[11px] font-semibold border transition-all text-center",
                              isSelected 
                                ? "bg-primary text-primary-foreground border-primary shadow-sm" 
                                : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                            )}
                          >
                            {freq.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 2: Physical Activity Level */}
              <Card className="border-none shadow-md bg-card/80 backdrop-blur-md rounded-3xl border border-border/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                        <Dumbbell className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">Physical Activity</CardTitle>
                        <CardDescription className="text-xs">Tailors workout & stretch intensity</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full text-[11px] font-semibold capitalize bg-emerald-500/10 text-emerald-600">
                      {currentActivity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    {ACTIVITY_LEVELS.map((level) => {
                      const isSelected = currentActivity === level.id;
                      return (
                        <button
                          key={level.id}
                          type="button"
                          onClick={() => handleInstantUpdate({ physicalActivity: level.id }, `Activity level set to ${level.label}`)}
                          className={cn(
                            "p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between",
                            isSelected 
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 shadow-sm ring-1 ring-emerald-500/30" 
                              : "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-base">{level.icon}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-foreground">{level.label}</p>
                            <p className="text-[10px] text-muted-foreground">{level.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Caffeine Selector */}
                  <div className="pt-2 border-t border-border/30 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                      <Coffee className="w-3.5 h-3.5 text-amber-600" /> Caffeine:
                    </span>
                    <div className="flex items-center gap-1">
                      {CAFFEINE_LEVELS.map((c) => {
                        const isSelected = currentCaffeine === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => handleInstantUpdate({ caffeineIntake: c.id }, `Caffeine intake set to ${c.label}`)}
                            className={cn(
                              "px-2 py-1 rounded-xl text-[10px] font-semibold border transition-all",
                              isSelected 
                                ? "bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40" 
                                : "bg-muted/30 border-border/50 text-muted-foreground hover:bg-muted"
                            )}
                          >
                            {c.id}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card 3: Sound Sanctuary & Music */}
              <Card className="border-none shadow-md bg-card/80 backdrop-blur-md rounded-3xl border border-border/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                        <Headphones className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">Music Sanctuary</CardTitle>
                        <CardDescription className="text-xs">Your audio integration for focus & calm</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="rounded-full text-[11px] font-semibold capitalize bg-pink-500/10 text-pink-600">
                      {MUSIC_APPS.find(m => m.id === currentMusicApp)?.label || currentMusicApp}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {MUSIC_APPS.map((app) => {
                      const isSelected = currentMusicApp === app.id;
                      return (
                        <button
                          key={app.id}
                          type="button"
                          onClick={() => handleInstantUpdate({ musicApp: app.id }, `Music platform set to ${app.label}`)}
                          className={cn(
                            "p-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-2 transition-all active:scale-95",
                            isSelected 
                              ? "bg-pink-500/15 border-pink-500/40 text-pink-950 dark:text-pink-100 ring-1 ring-pink-500/30" 
                              : "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <span className="text-sm">{app.icon}</span>
                          <span className="truncate">{app.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-pink-600 ml-auto" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Music Vibes Chips */}
                  <div className="pt-2 border-t border-border/30">
                    <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Preferred Vibes</p>
                    <div className="flex flex-wrap gap-1.5">
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
                              "px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all active:scale-95",
                              isSelected 
                                ? "bg-primary/20 text-primary border-primary/30" 
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

              {/* Card 4: Relaxation Gaming & Micro-Breaks */}
              <Card className="border-none shadow-md bg-card/80 backdrop-blur-md rounded-3xl border border-border/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                        <Gamepad2 className="w-4 h-4" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">Gaming Micro-Breaks</CardTitle>
                        <CardDescription className="text-xs">Interactive puzzles & stress relief</CardDescription>
                      </div>
                    </div>
                    <Switch 
                      checked={currentPlaysGames}
                      onCheckedChange={(checked) => handleInstantUpdate({ playsGames: checked }, checked ? "Gaming breaks enabled! 🎮" : "Gaming breaks disabled")}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className={cn(
                    "p-3.5 rounded-2xl border transition-all duration-300",
                    currentPlaysGames 
                      ? "bg-blue-500/10 border-blue-500/20 text-foreground" 
                      : "bg-muted/20 border-border/40 text-muted-foreground opacity-60"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        🎮 {currentPlaysGames ? "Gaming Breaks Active" : "Gaming Breaks Off"}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {currentPlaysGames ? "Included in Plan" : "Excluded from Plan"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {currentPlaysGames 
                        ? "Quick 5-15 min brain teasers and casual mini-games are scheduled in your daily wellness plan."
                        : "Turn this on if you enjoy puzzle games or relaxing mini-games to de-stress during work."}
                    </p>
                  </div>

                  {/* Game Platforms */}
                  {currentPlaysGames && (
                    <div className="pt-2 border-t border-border/30 space-y-1.5">
                      <p className="text-[11px] font-semibold text-muted-foreground">Platforms & Types</p>
                      <div className="flex flex-wrap gap-1.5">
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
                                handleInstantUpdate({ gameTypes: updatedTypes }, "Game preferences updated");
                              }}
                              className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-semibold border transition-all",
                                isSelected 
                                  ? "bg-blue-500/20 text-blue-800 dark:text-blue-200 border-blue-500/30" 
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

            </div>
          </div>

          {/* Card 5: Goals & Feedback Vision */}
          <Card className="border-none shadow-md bg-card/80 backdrop-blur-md rounded-3xl border border-border/40">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Wellness Intentions & Vision</CardTitle>
                    <CardDescription className="text-xs">Your guiding focus for personalized AI guidance</CardDescription>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setEditModalOpen(true)}
                  className="rounded-xl text-xs font-semibold h-8"
                >
                  <Edit3 className="w-3 h-3 mr-1" /> Edit Goals
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
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
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all active:scale-95",
                        isSelected 
                          ? "bg-purple-500/20 text-purple-900 dark:text-purple-200 border-purple-500/40 shadow-sm" 
                          : "bg-muted/20 border-border/60 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      <span>{goal.emoji}</span>
                      <span>{goal.label}</span>
                      {isSelected && <Check className="w-3 h-3 text-purple-600 ml-1" />}
                    </button>
                  );
                })}
              </div>

              {profile?.feedback ? (
                <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/30 text-xs text-muted-foreground leading-relaxed mt-2">
                  <span className="font-semibold text-foreground">Personal Notes: </span>
                  {profile.feedback}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  No personal notes added yet. Click "Edit Goals" to add your wellness expectations!
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions & System Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <Card className="border-none shadow-sm bg-card/60 rounded-3xl p-4 flex items-center justify-between border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Guided Setup Wizard</p>
                  <p className="text-xs text-muted-foreground">Redo step-by-step onboarding walkthrough</p>
                </div>
              </div>
              <Link href="/onboarding">
                <Button variant="outline" size="sm" className="rounded-xl text-xs font-semibold">
                  Launch Wizard
                </Button>
              </Link>
            </Card>

            <Card className="border-none shadow-sm bg-card/60 rounded-3xl p-4 flex items-center justify-between border border-border/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
                  <LogOut className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Account Session</p>
                  <p className="text-xs text-muted-foreground">Sign out of this browser</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => logout()}
                className="rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              >
                Sign Out
              </Button>
            </Card>
          </div>

        </div>
      </main>

      <MobileNav />
    </div>
  );
}
