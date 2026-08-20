import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { useFeelings, useCapsules } from "@/hooks/use-tracking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Plus, BookHeart, Sparkles, Heart, Loader2, Mail, Lock, Unlock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function Feelings() {
  const { notes, isLoading, createNote, isCreating } = useFeelings();
  const { capsules, createCapsule, isCreating: isCreatingCapsule } = useCapsules();

  const [activeTab, setActiveTab] = useState<"notes" | "capsules">("notes");
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
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 pb-28 lg:pb-8 max-w-[1400px] mx-auto w-full space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold mb-2">
              <BookHeart className="w-3.5 h-3.5" /> Feelings & Reflection
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold">Feelings Space</h2>
            <p className="text-sm text-muted-foreground">A safe, private space for your thoughts, voice notes, and emotional time capsules.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button className="btn-primary rounded-2xl text-xs sm:text-sm font-semibold shadow-md shadow-primary/20 flex items-center gap-2">
                  <Plus className="w-4 h-4" /> New Journal Entry
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[540px] rounded-3xl p-5 sm:p-6">
                <DialogHeader>
                  <div className="flex items-center justify-between">
                    <DialogTitle className="text-xl font-bold flex items-center gap-2">
                      <BookHeart className="w-5 h-5 text-primary" /> New Journal Entry
                    </DialogTitle>
                    <VoiceRecorder 
                      onTranscript={(spoken) => setContent((prev) => prev ? `${prev} ${spoken}` : spoken)} 
                    />
                  </div>
                  <DialogDescription className="text-xs">
                    Type your reflections or tap Voice Record to speak freely.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <Input 
                    placeholder="Title (e.g. A peaceful evening walk)" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="rounded-xl"
                  />
                  <Textarea 
                    placeholder="How are you feeling right now? What happened today? Express yourself..." 
                    className="min-h-[180px] resize-none rounded-2xl text-sm leading-relaxed"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <Button 
                    onClick={handleSubmit} 
                    disabled={isCreating || !content.trim()} 
                    className="w-full btn-primary rounded-2xl h-11 text-sm font-semibold"
                  >
                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Journal Entry"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* View Switcher Tabs */}
        <div className="flex gap-2 p-1.5 bg-muted/40 rounded-2xl border border-border/50 max-w-sm">
          <button
            type="button"
            onClick={() => setActiveTab("notes")}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
              activeTab === "notes" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookHeart className="w-3.5 h-3.5" /> Journal Entries ({notes?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("capsules")}
            className={cn(
              "flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5",
              activeTab === "capsules" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Mail className="w-3.5 h-3.5" /> Time Capsules ({capsules?.length || 0})
          </button>
        </div>

        {/* Tab 1: Journal Entries */}
        {activeTab === "notes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Create new card inline */}
            <button 
              type="button"
              onClick={() => setIsOpen(true)}
              className="group flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-border/80 rounded-3xl hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[220px] active:scale-95"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-primary" />
              </div>
              <span className="font-semibold text-sm text-foreground">Write a New Entry</span>
              <span className="text-xs text-muted-foreground mt-1">Capture your thoughts or speak with voice</span>
            </button>

            {notes?.map((note) => {
              const sentiment = getSentimentLabel(note.sentimentScore);
              const dateStr = note.timestamp ? format(new Date(note.timestamp), "MMM d, yyyy • h:mm a") : format(new Date(), "MMM d, yyyy");

              return (
                <Card key={note.id} className="min-h-[220px] flex flex-col border-none shadow-md hover:shadow-xl transition-all bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden">
                  <CardHeader className="pb-2.5">
                    <div className="flex justify-between items-start mb-2">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full border",
                        sentiment.color
                      )}>
                        {sentiment.text}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium">
                        {dateStr}
                      </span>
                    </div>
                    <CardTitle className="text-base sm:text-lg font-bold line-clamp-1">
                      {note.title || "Untitled Reflection"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden relative pb-4">
                    <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed whitespace-pre-line line-clamp-5">
                      {note.content}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-card to-transparent" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Tab 2: Future Self Time Capsules */}
        {activeTab === "capsules" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gradient-to-r from-purple-500/10 via-card to-pink-500/10 p-5 rounded-3xl border border-purple-200 dark:border-purple-900">
              <div>
                <h3 className="text-base sm:text-lg font-bold">Future Self Emotional Capsules</h3>
                <p className="text-xs text-muted-foreground">Messages written during happy days, auto-delivered on tough days.</p>
              </div>

              <Dialog open={isCapsuleOpen} onOpenChange={setIsCapsuleOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-primary rounded-xl text-xs sm:text-sm">
                    <Plus className="w-4 h-4 mr-1" /> Seal New Capsule
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] rounded-3xl p-5 sm:p-6">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-bold flex items-center gap-2">
                      <Mail className="w-5 h-5 text-purple-600" /> Write to Your Future Self
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Write an uplifting note or advice to encourage yourself on a low-energy day.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-2">
                    <Textarea
                      placeholder="e.g. Hey! Don't be hard on yourself today. You are doing amazing. Go get some fresh air and take a deep breath."
                      className="min-h-[140px] resize-none rounded-2xl text-sm leading-relaxed"
                      value={capsuleMsg}
                      onChange={(e) => setCapsuleMsg(e.target.value)}
                    />
                    <Button
                      onClick={handleCapsuleSubmit}
                      disabled={isCreatingCapsule || !capsuleMsg.trim()}
                      className="w-full btn-primary rounded-2xl h-11 text-sm font-semibold"
                    >
                      {isCreatingCapsule ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Seal & Store Capsule 💌"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {capsules && capsules.length > 0 ? (
                capsules.map((capsule) => (
                  <Card key={capsule.id} className="border-none shadow-md bg-card/80 backdrop-blur-sm rounded-3xl p-5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-purple-600 flex items-center gap-1.5">
                        {capsule.isDelivered ? (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-emerald-500" /> Delivered to You
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-purple-500" /> Sealed & Waiting
                          </>
                        )}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {capsule.createdAt ? format(new Date(capsule.createdAt), "MMM d, yyyy") : ""}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium italic text-foreground/90 leading-relaxed bg-muted/20 p-3.5 rounded-2xl border border-border/50">
                      "{capsule.message}"
                    </p>
                    <div className="text-[10px] text-muted-foreground flex items-center justify-between pt-1">
                      <span>Written at mood score: {capsule.moodScore}/5</span>
                      {capsule.isDelivered && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Opened
                        </span>
                      )}
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-12 text-center bg-muted/20 rounded-3xl border border-dashed border-border p-6">
                  <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                  <h4 className="font-bold text-sm">No Time Capsules Stored Yet</h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                    Write a message to your future self when you feel happy, and we'll deliver it on days you need extra support.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
