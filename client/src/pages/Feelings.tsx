import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useFeelings, useCapsules } from "@/hooks/use-tracking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { 
  Plus, BookHeart, Sparkles, Heart, Loader2, Mail, Lock, Unlock, 
  CheckCircle2, Laptop, Smartphone, Trash2, Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function Feelings() {
  const { notes, isLoading, createNote, isCreating } = useFeelings();
  const { capsules, createCapsule, isCreating: isCreatingCapsule } = useCapsules();

  const [activeTab, setActiveTab] = useState<"notes" | "capsules">("notes");
  const [mobileTab, setMobileTab] = useState<"notes" | "write" | "capsules">("notes");
  
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Time capsule modal
  const [isCapsuleOpen, setIsCapsuleOpen] = useState(false);
  const [capsuleMsg, setCapsuleMsg] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    createNote({ title: title.trim() || undefined, content: content.trim() }, {
      onSuccess: () => {
        setIsOpen(false);
        setTitle("");
        setContent("");
        toast({ title: "Journal Saved ✨", description: "Your thoughts and sentiments are safely saved." });
      }
    });
  };

  const handleCapsuleSubmit = () => {
    if (!capsuleMsg.trim()) return;
    createCapsule({ message: capsuleMsg.trim(), moodScore: 5 }, {
      onSuccess: () => {
        setIsCapsuleOpen(false);
        setCapsuleMsg("");
        toast({ title: "Time Capsule Sealed! 💌", description: "This message will automatically deliver when you need a boost." });
      }
    });
  };

  const getSentimentLabel = (score?: number | null) => {
    if (!score) return { text: "Neutral", color: "bg-muted text-muted-foreground" };
    if (score >= 7) return { text: `Positive (${score}/10)`, color: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900" };
    if (score <= 4) return { text: `Reflective (${score}/10)`, color: "bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900" };
    return { text: `Balanced (${score}/10)`, color: "bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900" };
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-28 lg:pb-12">

        {/* ========================================================================= */}
        {/* 1. LAPTOP SCREEN UI (Visible on screens >= 1024px)                        */}
        {/* ========================================================================= */}
        <div className="hidden lg:block p-8 max-w-7xl w-full mx-auto space-y-8">
          
          <header className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-purple-500/10 text-purple-600 border-purple-500/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  Laptop Feelings Studio
                </Badge>
              </div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mt-1">
                Feelings Space & Journal
              </h1>
              <p className="text-sm text-muted-foreground">
                A private, sanctuary for your reflections, voice notes, and emotional time capsules.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => setIsCapsuleOpen(true)}
                variant="outline"
                className="rounded-2xl text-xs font-semibold h-11 border-purple-300 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 gap-2 px-4"
              >
                <Mail className="w-4 h-4" /> Seal Time Capsule
              </Button>
            </div>
          </header>

          {/* Laptop 2-Column Split: Left Composer / Time Capsule, Right Timeline Feed */}
          <div className="grid grid-cols-12 gap-8 items-start">
            
            {/* Left 5 Columns: Inline Studio Composer */}
            <div className="col-span-5 sticky top-6 space-y-6">
              
              <Card className="border-none shadow-xl bg-card/85 backdrop-blur-md rounded-3xl p-6 border border-border/40 space-y-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <BookHeart className="w-5 h-5 text-primary" /> Express Your Feelings
                  </CardTitle>
                  <VoiceRecorder onTranscript={(text: string) => setContent(prev => prev ? `${prev} ${text}` : text)} />
                </div>
                
                <div className="space-y-3">
                  <Input 
                    placeholder="Entry Title (e.g. Evening clarity after walk)" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl text-sm h-10"
                  />
                  <Textarea 
                    placeholder="What emotions or moments are present right now? Type freely or use the mic above..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[160px] rounded-2xl resize-none text-sm leading-relaxed"
                  />
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={!content.trim() || isCreating}
                  className="w-full btn-primary rounded-xl h-11 text-xs font-bold shadow-md shadow-primary/20 gap-2"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Save Reflection & Analyze Sentiment
                </Button>
              </Card>

              {/* Time Capsule Summary Card */}
              <Card className="border border-purple-500/30 bg-gradient-to-br from-purple-500/10 via-card to-card rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 flex items-center justify-center">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-foreground">Future Self Time Capsules</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-600 border-purple-500/30">
                    {capsules?.length || 0} Sealed
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Write messages when you feel great. MoodAware automatically delivers them back on low-energy days.
                </p>
                <Button 
                  onClick={() => setIsCapsuleOpen(true)}
                  variant="outline" 
                  size="sm" 
                  className="w-full rounded-xl text-xs font-semibold h-8"
                >
                  Write Future Letter
                </Button>
              </Card>

            </div>

            {/* Right 7 Columns: Past Reflections Timeline */}
            <div className="col-span-7 space-y-4">
              
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" /> Past Reflections ({notes?.length || 0})
                </h3>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : notes && notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => {
                    const sentiment = getSentimentLabel(note.sentimentScore);
                    return (
                      <Card key={note.id} className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40 p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-bold text-base text-foreground">{note.title || "Reflective Journal"}</h4>
                            <p className="text-[11px] text-muted-foreground">
                              {note.timestamp ? format(new Date(note.timestamp), "EEEE, MMMM do yyyy 'at' h:mm a") : "Recorded"}
                            </p>
                          </div>
                          <Badge variant="outline" className={cn("text-[10px] font-semibold", sentiment.color)}>
                            {sentiment.text}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/90 leading-relaxed italic">"{note.content}"</p>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="border-none shadow-sm bg-card/60 rounded-3xl p-12 text-center">
                  <p className="text-sm font-semibold text-foreground">Your Feelings Space is Empty</p>
                  <p className="text-xs text-muted-foreground mt-1">Write your first reflection using the studio composer on the left!</p>
                </Card>
              )}

            </div>

          </div>

        </div>


        {/* ========================================================================= */}
        {/* 2. MOBILE SCREEN UI (Visible on screens < 1024px)                        */}
        {/* ========================================================================= */}
        <div className="lg:hidden p-4 space-y-4 max-w-lg mx-auto w-full">
          
          <div className="flex items-center justify-between pb-1">
            <div>
              <Badge variant="outline" className="rounded-full bg-purple-500/10 text-purple-600 border-purple-500/20 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1 mb-0.5 w-fit">
                <Smartphone className="w-2.5 h-2.5" />
                Mobile Journal
              </Badge>
              <h1 className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Feelings Space
              </h1>
            </div>

            <Button 
              size="sm" 
              onClick={() => setMobileTab("write")} 
              className="btn-primary rounded-xl text-xs font-semibold h-8 px-3 shadow-sm gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Write
            </Button>
          </div>

          {/* Mobile Segmented Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setMobileTab("notes")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all",
                mobileTab === "notes" ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted/50 text-muted-foreground"
              )}
            >
              📖 Journal ({notes?.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("write")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all",
                mobileTab === "write" ? "bg-purple-500 text-white shadow-sm" : "bg-muted/50 text-muted-foreground"
              )}
            >
              ✍️ Write New
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("capsules")}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold flex-shrink-0 transition-all",
                mobileTab === "capsules" ? "bg-pink-500 text-white shadow-sm" : "bg-muted/50 text-muted-foreground"
              )}
            >
              💌 Capsules ({capsules?.length || 0})
            </button>
          </div>

          {/* Mobile Tab Content */}
          {mobileTab === "write" && (
            <Card className="border-none shadow-md bg-card/90 rounded-3xl p-4 space-y-3 border border-border/40">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground">New Note</span>
                <VoiceRecorder onTranscript={(text: string) => setContent(prev => prev ? `${prev} ${text}` : text)} />
              </div>
              <Input 
                placeholder="Title..." 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="rounded-xl text-xs h-9" 
              />
              <Textarea 
                placeholder="What are you feeling right now?..." 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                className="min-h-[120px] rounded-xl text-xs resize-none" 
              />
              <Button 
                onClick={handleSubmit} 
                disabled={!content.trim() || isCreating}
                className="w-full btn-primary rounded-xl h-10 text-xs font-bold"
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save Journal Entry"}
              </Button>
            </Card>
          )}

          {mobileTab === "notes" && (
            <div className="space-y-3">
              {notes && notes.length > 0 ? (
                notes.map((note) => {
                  const sentiment = getSentimentLabel(note.sentimentScore);
                  return (
                    <Card key={note.id} className="border-none shadow-sm bg-card/90 rounded-2xl p-4 space-y-2 border border-border/40">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-foreground">{note.title || "Reflection"}</h4>
                        <Badge variant="outline" className={cn("text-[9px]", sentiment.color)}>
                          {sentiment.text}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground/80 leading-relaxed italic">"{note.content}"</p>
                      <p className="text-[10px] text-muted-foreground">
                        {note.timestamp ? format(new Date(note.timestamp), "MMM d, yyyy") : ""}
                      </p>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs text-muted-foreground">No journal entries yet.</p>
                </div>
              )}
            </div>
          )}

          {mobileTab === "capsules" && (
            <div className="space-y-3">
              <Button 
                onClick={() => setIsCapsuleOpen(true)}
                className="w-full btn-primary rounded-2xl text-xs font-bold h-10 shadow-sm gap-1.5"
              >
                <Mail className="w-4 h-4" /> Seal New Time Capsule
              </Button>

              {capsules && capsules.length > 0 ? (
                capsules.map((cap) => (
                  <Card key={cap.id} className="border border-purple-500/30 bg-purple-500/5 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {cap.isDelivered ? "💌 Delivered Letter" : "🔒 Sealed Capsule"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {cap.createdAt ? format(new Date(cap.createdAt), "MMM d") : ""}
                      </span>
                    </div>
                    <p className="text-xs text-foreground italic">"{cap.message}"</p>
                  </Card>
                ))
              ) : (
                <p className="text-center text-xs text-muted-foreground py-6">No sealed time capsules.</p>
              )}
            </div>
          )}

        </div>

        {/* Time Capsule Modal */}
        <Dialog open={isCapsuleOpen} onOpenChange={setIsCapsuleOpen}>
          <DialogContent className="sm:max-w-[480px] rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-purple-600" /> Seal Future Time Capsule
              </DialogTitle>
              <DialogDescription className="text-xs">
                Write a note of encouragement. MoodAware will automatically deliver it on a future tough day.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Textarea 
                placeholder="Dear future me, remember how strong you are..." 
                value={capsuleMsg}
                onChange={(e) => setCapsuleMsg(e.target.value)}
                className="min-h-[120px] rounded-2xl text-sm"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsCapsuleOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleCapsuleSubmit} disabled={!capsuleMsg.trim() || isCreatingCapsule} className="btn-primary rounded-xl font-semibold">
                {isCreatingCapsule ? <Loader2 className="w-4 h-4 animate-spin" /> : "Seal Capsule 💌"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <MobileNav />
    </div>
  );
}
