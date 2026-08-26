import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { UserGoalWithDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Sparkles, Target, Compass, CheckCircle2, Circle, Search, ExternalLink, 
  Trash2, RefreshCw, Zap, BookOpen, Dumbbell, Briefcase, Rocket, Brain, Layers, 
  ChevronRight, ArrowUpRight, Flame, Trophy
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function GoalHub() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeGoalId, setActiveGoalId] = useState<number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("professional");
  const [targetDeadline, setTargetDeadline] = useState("30 Days");
  const [skillLevel, setSkillLevel] = useState("scratch");
  const [description, setDescription] = useState("");

  // Fetch Goals
  const { data: goals = [], isLoading, isError } = useQuery<UserGoalWithDetails[]>({
    queryKey: ["/api/goals"],
  });

  // Active Goal Logic
  const filteredGoals = goals.filter(g => selectedCategory === "all" || g.category === selectedCategory);
  const activeGoal = goals.find(g => g.id === activeGoalId) || filteredGoals[0] || goals[0];

  // Create Goal Mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/goals", {
        title,
        category,
        targetDeadline,
        skillLevel,
        description,
      });
      return await res.json();
    },
    onSuccess: (newGoal: UserGoalWithDetails) => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setActiveGoalId(newGoal.id);
      setIsCreateOpen(false);
      setTitle("");
      setDescription("");
      toast({
        title: "Master Goal Created! 🚀",
        description: "AI has trained on your goal domain and generated your zero-to-hero roadmap.",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Failed to generate goal roadmap",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  // Re-generate Roadmap Mutation
  const regenerateMutation = useMutation({
    mutationFn: async (goalId: number) => {
      const res = await apiRequest("POST", `/api/goals/${goalId}/generate`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Roadmap Re-trained 🧠",
        description: "AI updated domain analysis and research checkpoints.",
      });
    },
  });

  // Toggle Checkpoint Mutation
  const toggleCheckpointMutation = useMutation({
    mutationFn: async ({ goalId, cpId, isCompleted }: { goalId: number; cpId: number; isCompleted: boolean }) => {
      const res = await apiRequest("PATCH", `/api/goals/${goalId}/checkpoints/${cpId}`, { isCompleted });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
    },
  });

  // Delete Goal Mutation
  const deleteMutation = useMutation({
    mutationFn: async (goalId: number) => {
      await apiRequest("DELETE", `/api/goals/${goalId}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      setActiveGoalId(null);
      toast({
        title: "Goal Archived",
        description: "The goal and roadmap were removed.",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Cover / Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-accent/5 to-transparent border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5">
                  <Sparkles className="w-3 h-3 mr-1" /> Notion AI Master Studio
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-medium">
                  Zero-to-Hero Roadmap Engine
                </Badge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-foreground">
                AI Goal Planner & Accelerator
              </h1>
              <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
                Define professional, career, upskilling, or personal health goals. Our AI self-trains on the domain, curates industry search terms, and builds step-by-step roadmaps from scratch.
              </p>
            </div>

            <Button
              onClick={() => setIsCreateOpen(true)}
              size="lg"
              className="rounded-2xl shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-accent hover:opacity-95 text-white font-bold gap-2 self-start md:self-center"
            >
              <Rocket className="w-4 h-4" /> Create AI Master Goal
            </Button>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="mt-8 flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Goals", icon: Layers },
              { id: "professional", label: "Professional & Career", icon: Briefcase },
              { id: "upskill", label: "Upskilling & Tech", icon: Brain },
              { id: "diet", label: "Diet & Nutrition", icon: BookOpen },
              { id: "health", label: "Health & Fitness", icon: Dumbbell },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all border",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card/80 text-muted-foreground border-border/80 hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Workspace Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <p className="text-sm font-semibold text-muted-foreground animate-pulse">Loading AI Goal Studio...</p>
          </div>
        ) : goals.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-16 px-4 text-center bg-card/60 backdrop-blur-md rounded-3xl border border-border/80 shadow-xl max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
              <Target className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground">No Goals Created Yet</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Start by telling the AI about your dream professional target (job, upskilling) or personal goal (diet, health). The AI will generate a personalized roadmap with tool recommendations and search queries.
            </p>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="mt-6 rounded-2xl bg-primary text-primary-foreground font-bold gap-2"
            >
              <Sparkles className="w-4 h-4" /> Tell AI Your Goal Now
            </Button>
          </motion.div>
        ) : (
          /* Goals Workspace Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Sidebar: Goal Selection Cards */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">
                Your Active Goals ({filteredGoals.length})
              </h2>

              <div className="space-y-3">
                {filteredGoals.map((g) => {
                  const isSelected = activeGoal?.id === g.id;
                  const progress = g.progressPercent || 0;

                  return (
                    <motion.div
                      key={g.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setActiveGoalId(g.id)}
                      className={cn(
                        "p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden",
                        isSelected
                          ? "bg-card border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20"
                          : "bg-card/70 border-border/70 hover:border-primary/40 hover:bg-card"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                            {g.category}
                          </span>
                          <h4 className="font-bold text-sm text-foreground line-clamp-1 mt-1">
                            {g.title}
                          </h4>
                        </div>
                        <Badge variant="outline" className="text-[10px] whitespace-nowrap">
                          {g.targetDeadline}
                        </Badge>
                      </div>

                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] text-muted-foreground font-medium">
                          <span>Roadmap Progress</span>
                          <span className="font-bold text-foreground">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2 rounded-full" />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Main Area: Notion Roadmap & Tools Canvas */}
            <div className="lg:col-span-8 space-y-6">
              {activeGoal ? (
                <motion.div
                  key={activeGoal.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Goal Master Card Header */}
                  <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-primary/10 text-primary border-primary/30 uppercase text-[10px] font-bold">
                            {activeGoal.category}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {activeGoal.skillLevel === "scratch" ? "From Scratch (Beginner)" : activeGoal.skillLevel}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                            <Flame className="w-3.5 h-3.5 text-amber-500" /> Target: {activeGoal.targetDeadline}
                          </span>
                        </div>
                        <h2 className="text-2xl font-display font-bold text-foreground mt-2">
                          {activeGoal.title}
                        </h2>
                        {activeGoal.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {activeGoal.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => regenerateMutation.mutate(activeGoal.id)}
                          disabled={regenerateMutation.isPending}
                          className="rounded-xl text-xs gap-1.5"
                        >
                          <RefreshCw className={cn("w-3.5 h-3.5", regenerateMutation.isPending && "animate-spin")} />
                          Re-train AI
                        </Button>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this goal and roadmap?")) {
                              deleteMutation.mutate(activeGoal.id);
                            }
                          }}
                          className="rounded-xl text-xs text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Progress Bar & Summary */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          <Trophy className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-foreground">
                            {activeGoal.progressPercent}% Overall Mastery Completed
                          </div>
                          <div className="text-[11px] text-muted-foreground">
                            {activeGoal.checkpoints?.filter(c => c.isCompleted).length || 0} of {activeGoal.checkpoints?.length || 0} checkpoints completed
                          </div>
                        </div>
                      </div>
                      <div className="w-full sm:w-48">
                        <Progress value={activeGoal.progressPercent || 0} className="h-3 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* AI Self-Trained Research Strategy Block */}
                  {activeGoal.roadmap?.aiSelfTrainedSummary && (
                    <div className="p-5 rounded-3xl bg-primary/5 border border-primary/20 space-y-2">
                      <div className="flex items-center gap-2">
                        <Brain className="w-4 h-4 text-primary animate-pulse" />
                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                          AI Self-Trained Domain Research Summary
                        </h4>
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed font-sans italic">
                        "{activeGoal.roadmap.aiSelfTrainedSummary}"
                      </p>
                    </div>
                  )}

                  {/* Fast Learning Recommended Tools Stack */}
                  {activeGoal.roadmap?.recommendedTools && Array.isArray(activeGoal.roadmap.recommendedTools) && activeGoal.roadmap.recommendedTools.length > 0 && (
                    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-amber-500" />
                          <h3 className="font-bold text-sm text-foreground">Recommended Tools to Learn Faster</h3>
                        </div>
                        <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30">
                          Speed Acceleration Stack
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {activeGoal.roadmap.recommendedTools.map((tool: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl bg-muted/30 border border-border/60 flex flex-col justify-between space-y-2.5 hover:border-primary/40 transition-all"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-foreground">{tool.name}</span>
                                <Badge className="text-[9px] bg-amber-500 text-white font-extrabold px-1.5 py-0">
                                  {tool.speedMultiplier || "⚡ 3x Speed"}
                                </Badge>
                              </div>
                              <p className="text-[10px] text-muted-foreground line-clamp-2">{tool.description || tool.purpose}</p>
                            </div>

                            <a
                              href={tool.searchUrl || `https://www.google.com/search?q=${encodeURIComponent(tool.name)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                            >
                              Explore Tool <ArrowUpRight className="w-3 h-3" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notion-Style Phase Accordion Canvas */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Compass className="w-4 h-4 text-primary" /> Step-by-Step Scratch-to-Mastery Roadmap
                    </h3>

                    {activeGoal.roadmap?.phases && Array.isArray(activeGoal.roadmap.phases) ? (
                      activeGoal.roadmap.phases.map((phase: any) => {
                        const phaseCheckpoints = activeGoal.checkpoints?.filter(c => c.phaseIndex === phase.phaseIndex) || [];
                        const completedPhaseCp = phaseCheckpoints.filter(c => c.isCompleted).length;

                        return (
                          <div
                            key={phase.phaseIndex}
                            className="rounded-3xl bg-card border border-border/80 shadow-md overflow-hidden"
                          >
                            {/* Phase Banner */}
                            <div className="p-5 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm">
                                  P{phase.phaseIndex}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm text-foreground">{phase.title}</h4>
                                  <p className="text-[11px] text-muted-foreground">{phase.objective}</p>
                                </div>
                              </div>
                              <Badge variant="outline" className="text-[10px] self-start sm:self-center">
                                Timeframe: {phase.timeframe}
                              </Badge>
                            </div>

                            {/* Phase Content */}
                            <div className="p-5 space-y-4">
                              {/* Zero to Hero Instruction Box */}
                              {phase.zeroToHeroInstruction && (
                                <div className="p-4 rounded-2xl bg-muted/40 border border-border/50 text-xs text-foreground/90 space-y-1.5">
                                  <div className="font-bold text-primary flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                    <BookOpen className="w-3.5 h-3.5" /> Scratch Guidance Instruction
                                  </div>
                                  <p className="leading-relaxed text-muted-foreground">{phase.zeroToHeroInstruction}</p>
                                </div>
                              )}

                              {/* Milestones / Checkpoints */}
                              <div className="space-y-2">
                                <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
                                  <span>Action Milestones ({completedPhaseCp}/{phaseCheckpoints.length})</span>
                                </div>

                                <div className="space-y-2">
                                  {phaseCheckpoints.map((cp) => (
                                    <div
                                      key={cp.id}
                                      onClick={() =>
                                        toggleCheckpointMutation.mutate({
                                          goalId: activeGoal.id,
                                          cpId: cp.id,
                                          isCompleted: !cp.isCompleted,
                                        })
                                      }
                                      className={cn(
                                        "p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer select-none",
                                        cp.isCompleted
                                          ? "bg-primary/5 border-primary/30 text-muted-foreground line-through"
                                          : "bg-card border-border/60 hover:border-primary/40 text-foreground"
                                      )}
                                    >
                                      {cp.isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                      ) : (
                                        <Circle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                                      )}
                                      <div className="flex-1 space-y-0.5">
                                        <div className="font-semibold text-xs">{cp.title}</div>
                                        {cp.instruction && (
                                          <div className="text-[11px] text-muted-foreground no-underline">{cp.instruction}</div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-muted-foreground italic">No roadmap phases available.</p>
                    )}
                  </div>

                  {/* AI Curated Web Search Hub */}
                  {activeGoal.roadmap?.searchQueries && Array.isArray(activeGoal.roadmap.searchQueries) && activeGoal.roadmap.searchQueries.length > 0 && (
                    <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-md space-y-3">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-primary" />
                        <h3 className="font-bold text-sm text-foreground">AI Curated Web Research Queries</h3>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {activeGoal.roadmap.searchQueries.map((sq: any, idx: number) => (
                          <a
                            key={idx}
                            href={sq.url || `https://www.google.com/search?q=${encodeURIComponent(sq.query || sq.topic)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted/50 border border-border/60 text-xs font-medium text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all"
                          >
                            <span>🔍 {sq.topic}:</span>
                            <span className="font-bold">{sq.query}</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Modal / Drawer for Creating AI Goal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-lg rounded-3xl bg-card/95 backdrop-blur-2xl border-border/80 shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-display font-extrabold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Tell AI About Your Goal
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define your professional or personal target. AI will self-train on the topic and generate your roadmap starting from scratch.
            </DialogDescription>
          </DialogHeader>

          {createMutation.isPending ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-2xl shadow-xl shadow-primary/30"
              >
                🧠
              </motion.div>
              <div className="space-y-1 text-center">
                <h4 className="font-bold text-sm text-foreground">AI Master Self-Training in Progress...</h4>
                <p className="text-xs text-muted-foreground animate-pulse">
                  Synthesizing domain knowledge, curating top tools & building step-by-step roadmap...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Goal Title</label>
                <Input
                  placeholder="e.g. Master Full-Stack AI Engineer or Keto Weight Gain Diet"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="rounded-xl text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="professional">Professional / Career</SelectItem>
                      <SelectItem value="upskill">Upskilling & Tech</SelectItem>
                      <SelectItem value="diet">Diet & Nutrition</SelectItem>
                      <SelectItem value="health">Health & Fitness</SelectItem>
                      <SelectItem value="personal">Personal Life</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">Target Deadline</label>
                  <Select value={targetDeadline} onValueChange={setTargetDeadline}>
                    <SelectTrigger className="rounded-xl text-xs">
                      <SelectValue placeholder="Select Deadline" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="14 Days">14 Days Sprint</SelectItem>
                      <SelectItem value="30 Days">30 Days (1 Month)</SelectItem>
                      <SelectItem value="60 Days">60 Days (2 Months)</SelectItem>
                      <SelectItem value="90 Days">90 Days (3 Months)</SelectItem>
                      <SelectItem value="6 Months">6 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Starting Skill Level</label>
                <Select value={skillLevel} onValueChange={setSkillLevel}>
                  <SelectTrigger className="rounded-xl text-xs">
                    <SelectValue placeholder="Skill level" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="scratch">Starting from Scratch (Beginner)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (Some background)</SelectItem>
                    <SelectItem value="advanced">Advanced (Optimization focus)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Aspirations & Specific Notes (Optional)</label>
                <Textarea
                  placeholder="Tell the AI any specific tools you want to master, current limitations, or target roles..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl text-xs resize-none min-h-[80px]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="rounded-xl text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!title.trim()) {
                      toast({ title: "Please enter a goal title", variant: "destructive" });
                      return;
                    }
                    createMutation.mutate();
                  }}
                  className="rounded-xl bg-gradient-to-r from-primary to-accent text-white text-xs font-bold gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Generate AI Roadmap
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
