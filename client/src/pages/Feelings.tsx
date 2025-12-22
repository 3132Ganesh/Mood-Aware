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
import { Plus, BookHeart, Quote } from "lucide-react";

export default function Feelings() {
  const { notes, isLoading, createNote, isCreating } = useFeelings();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    createNote({ title, content }, {
      onSuccess: () => {
        setIsOpen(false);
        setTitle("");
        setContent("");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 pb-24 lg:pb-6 max-w-[1600px] mx-auto w-full">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-display font-bold">Feelings Space</h2>
            <p className="text-muted-foreground">A safe place for your emotional reflections.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" /> New Entry
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>New Journal Entry</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <Input 
                  placeholder="Title (optional)" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                />
                <Textarea 
                  placeholder="How are you feeling right now?" 
                  className="min-h-[200px] resize-none"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
                <Button onClick={handleSubmit} disabled={isCreating || !content} className="w-full btn-primary">
                  Save Entry
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Create new card inline */}
          <button 
            onClick={() => setIsOpen(true)}
            className="group flex flex-col items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all h-[280px]"
          >
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <span className="font-medium text-muted-foreground">Create New Entry</span>
          </button>

          {notes?.map((note) => (
            <Card key={note.id} className="h-[280px] flex flex-col border-none shadow-md hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-2">
                  <BookHeart className="w-5 h-5 text-primary/60" />
                  <span className="text-xs text-muted-foreground font-medium">
                    {format(new Date(note.timestamp || ""), "MMM d, yyyy")}
                  </span>
                </div>
                <CardTitle className="text-lg line-clamp-1">{note.title || "Untitled Entry"}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden relative">
                <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line line-clamp-6">
                  {note.content}
                </p>
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent" />
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
