import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { useFeelings } from "@/hooks/use-tracking";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Plus, BookHeart, Sparkles, Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Feelings() {
  const { notes, isLoading, createNote, isCreating } = useFeelings();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;
    createNote({ title: title.trim() || undefined, content: content.trim() }, {
      onSuccess: () => {
        setIsOpen(false);
        setTitle("");
        setContent("");
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
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 pb-28 lg:pb-8 max-w-[1400px] mx-auto w-full">
        <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 text-xs font-semibold mb-2">
              <BookHeart className="w-3.5 h-3.5" /> Feelings & Reflection
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold">Feelings Space</h2>
            <p className="text-sm text-muted-foreground">A safe, private space for your thoughts and emotional reflections.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary rounded-xl text-sm font-semibold shadow-md shadow-primary/20 flex items-center gap-2">
                <Plus className="w-4 h-4" /> New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] rounded-3xl p-5 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <BookHeart className="w-5 h-5 text-primary" /> New Journal Entry
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Input 
                  placeholder="Title (e.g. A peaceful evening walk)" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="rounded-xl"
                />
                <Textarea 
                  placeholder="How are you feeling right now? What happened today?" 
                  className="min-h-[180px] resize-none rounded-xl text-sm leading-relaxed"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <Button 
                  onClick={handleSubmit} 
                  disabled={isCreating || !content.trim()} 
                  className="w-full btn-primary rounded-xl h-11 text-sm font-semibold"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Save Journal Entry"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Create new card inline */}
          <button 
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex flex-col items-center justify-center p-6 sm:p-8 border-2 border-dashed border-border/80 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all min-h-[220px] active:scale-95"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <span className="font-semibold text-sm text-foreground">Write a New Entry</span>
            <span className="text-xs text-muted-foreground mt-1">Capture your thoughts</span>
          </button>

          {notes?.map((note) => {
            const sentiment = getSentimentLabel(note.sentimentScore);
            const dateStr = note.timestamp ? format(new Date(note.timestamp), "MMM d, yyyy • h:mm a") : format(new Date(), "MMM d, yyyy");

            return (
              <Card key={note.id} className="min-h-[220px] flex flex-col border-none shadow-md hover:shadow-xl transition-all bg-card/80 backdrop-blur-sm rounded-2xl overflow-hidden">
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
      </main>
      <MobileNav />
    </div>
  );
}
