import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, Heart, MessageCircle, Share2, Sparkles, Send, Flame, 
  Compass, Radio, Plus, CheckCircle2, Bookmark, Wind, ShieldCheck,
  Laptop, Smartphone, MoreHorizontal, UserCheck
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CommunityPost {
  id: string;
  author: string;
  authorAvatar?: string;
  badge: string;
  timeAgo: string;
  content: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  topic: string;
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: "1",
    author: "Elena Rose",
    badge: "Zen Level 12",
    timeAgo: "2h ago",
    content: "The morning dew on the balcony pine tree. I usually rush to open my laptop, but today I sat for 5 minutes and just watched the light filter through the needles.",
    likes: 24,
    comments: 6,
    topic: "Daily Mindfulness Prompt"
  },
  {
    id: "2",
    author: "Marcus Chen",
    badge: "30-Day Streak Master",
    timeAgo: "4h ago",
    content: "Completed my 4-7-8 breathwork before my team presentation today. Felt my heart rate drop from 105 to 68 bpm. Deep calm is a superpower.",
    likes: 42,
    comments: 11,
    topic: "Breathwork Victory"
  },
  {
    id: "3",
    author: "Aria Thorne",
    badge: "Gratitude Keeper",
    timeAgo: "6h ago",
    content: "Grateful for warm chamomile tea, silent morning streets, and having the courage to set boundary hours for my work notifications.",
    likes: 31,
    comments: 4,
    topic: "Gratitude Reflection"
  }
];

const STILLNESS_ROOMS = [
  {
    id: "room-1",
    title: "Dawn Breathwork Circle",
    participants: 112,
    status: "Live Now",
    soundscape: "Ocean Waves & Singing Bowl",
    color: "from-teal-500/10 to-emerald-500/10 text-emerald-600 border-emerald-500/30"
  },
  {
    id: "room-2",
    title: "Deep Work Focus Sanctuary",
    participants: 86,
    status: "Active",
    soundscape: "Forest Rain 432Hz",
    color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-500/30"
  },
  {
    id: "room-3",
    title: "Evening Wind-Down & Gratitude",
    participants: 148,
    status: "Starts in 25m",
    soundscape: "Zen Bell Resonance",
    color: "from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-500/30"
  }
];

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [newPostContent, setNewPostContent] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      author: user?.name || "Mindful Friend",
      badge: "Mindful Explorer",
      timeAgo: "Just now",
      content: newPostContent.trim(),
      likes: 1,
      comments: 0,
      isLiked: true,
      topic: "Daily Reflection"
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
    toast({
      title: "Shared with the Sanctuary ✨",
      description: "Your reflection has been posted to the community feed."
    });
  };

  const handleJoinRoom = (roomTitle: string, roomId: string) => {
    if (joinedRoom === roomId) {
      setJoinedRoom(null);
      toast({ title: "Left Stillness Room", description: `You stepped out of ${roomTitle}.` });
    } else {
      setJoinedRoom(roomId);
      toast({ title: "Joined Stillness Room 🧘", description: `Synchronized with ${roomTitle}.` });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      <Sidebar />

      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full pb-[12vh] lg:pb-[5vh]">
        
        {/* ========================================================================= */}
        {/* 1. LAPTOP SCREEN UI (CSS Grid Asymmetric Layout: Feed + Stillness Rooms) */}
        {/* ========================================================================= */}
        <div className="hidden lg:block w-full max-w-[min(100%,88rem)] mx-auto px-[3vw] py-[3vh] space-y-[3vh]">
          
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-[2vw] w-full min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  Zenith Community Sanctuary
                </Badge>
              </div>
              <h1 className="text-4xl font-display font-light text-primary tracking-tight mt-1 truncate">
                Community
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                Growing together in shared stillness, daily mindful prompts, and synchronized meditation circles.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="px-4 py-2 bg-stitch-secondary-container/40 text-stitch-on-secondary-container rounded-full text-xs font-semibold flex items-center gap-1.5 border border-stitch-secondary-container">
                <Radio className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                <span>346 Practicing Live</span>
              </div>
            </div>
          </header>

          {/* Asymmetric 12-Column Grid (8 Col Left Feed, 4 Col Right Live Circles) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-[2.5vw] w-full items-start">
            
            {/* Left 8 Columns: Daily Prompt & Community Feed */}
            <div className="lg:col-span-8 space-y-[2.5vh] w-full min-w-0">
              
              {/* Daily Mindfulness Prompt Hero Banner */}
              <Card className="border-none shadow-md bg-gradient-to-br from-stitch-surface-container-lowest via-card to-stitch-surface-container-low rounded-3xl p-6 border border-border/50 space-y-4 w-full min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-stitch-primary-fixed text-stitch-primary flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Sparkles className="w-5 h-5 text-stitch-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-stitch-primary">Morning Mindfulness Prompt</h3>
                      <p className="text-xs text-muted-foreground">Daily collective reflection prompt</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-stitch-secondary-container/30 text-stitch-on-secondary-container border-stitch-secondary-container text-xs">
                    Active Today
                  </Badge>
                </div>

                <p className="text-xl font-display italic text-foreground leading-relaxed">
                  "What is one small thing you can notice today that usually goes unseen?"
                </p>

                {/* Inline Prompt Response Composer */}
                <form onSubmit={handleCreatePost} className="space-y-3 pt-2">
                  <Textarea
                    placeholder="Share your reflection with the sanctuary..."
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="min-h-[90px] rounded-2xl text-xs sm:text-sm resize-none bg-background/60"
                  />
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[11px] text-muted-foreground">
                      Reflections are shared gently with kind community members.
                    </span>
                    <Button 
                      type="submit" 
                      disabled={!newPostContent.trim()} 
                      className="btn-primary rounded-xl text-xs font-semibold h-9 px-4 gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" /> Share Reflection
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Feed Filter Chips */}
              <div className="flex items-center gap-2 flex-wrap w-full">
                <span className="text-xs font-semibold text-muted-foreground mr-1">Topics:</span>
                {["all", "Daily Prompt", "Breathwork Victory", "Gratitude Reflection"].map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setActiveFilter(topic)}
                    className={cn(
                      "px-3.5 py-1 rounded-full text-xs font-semibold capitalize border transition-all active:scale-95",
                      activeFilter === topic 
                        ? "bg-primary text-primary-foreground border-primary shadow-xs" 
                        : "bg-card border-border/70 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {topic === "all" ? "All Reflections" : topic}
                  </button>
                ))}
              </div>

              {/* Posts Timeline Stream */}
              <div className="space-y-4 w-full">
                {posts
                  .filter(p => activeFilter === "all" || p.topic === activeFilter)
                  .map((post) => (
                    <Card key={post.id} className="border-none shadow-sm bg-card/90 backdrop-blur-md rounded-3xl p-6 border border-border/50 space-y-4 transition-all hover:border-primary/30 w-full min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-stitch-primary to-stitch-primary-container text-white flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                            {post.author.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-foreground truncate">{post.author}</h4>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-stitch-secondary-container/40 text-stitch-on-secondary-container">
                                {post.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground">{post.timeAgo} • {post.topic}</p>
                          </div>
                        </div>

                        <button className="text-muted-foreground hover:text-foreground p-1 rounded-full">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-body">
                        "{post.content}"
                      </p>

                      <div className="flex items-center gap-6 pt-1 border-t border-border/40 text-xs text-muted-foreground">
                        <button 
                          type="button" 
                          onClick={() => handleLike(post.id)}
                          className={cn("flex items-center gap-1.5 transition-colors font-medium", post.isLiked ? "text-rose-500 font-bold" : "hover:text-foreground")}
                        >
                          <Heart className={cn("w-4 h-4", post.isLiked && "fill-rose-500")} />
                          <span>{post.likes}</span>
                        </button>
                        <button type="button" className="flex items-center gap-1.5 hover:text-foreground transition-colors font-medium">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments} responses</span>
                        </button>
                        <button type="button" className="flex items-center gap-1.5 hover:text-foreground transition-colors font-medium ml-auto">
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Card>
                  ))}
              </div>

            </div>

            {/* Right 4 Columns: Synchronous Stillness Rooms & Badges */}
            <div className="lg:col-span-4 space-y-[2.5vh] w-full min-w-0 lg:sticky lg:top-6">
              
              {/* Stillness Circles Header Card */}
              <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl p-5 border border-border/50 space-y-4 w-full min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-600 flex items-center justify-center">
                      <Radio className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base font-bold">Stillness Rooms</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-[10px] text-teal-600 bg-teal-500/10 border-teal-500/20">
                    Live Audio Sync
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  Join synchronized silent breathing and soundscape spaces with fellow practitioners.
                </CardDescription>

                <div className="space-y-3 pt-1">
                  {STILLNESS_ROOMS.map((room) => {
                    const isJoined = joinedRoom === room.id;
                    return (
                      <div 
                        key={room.id} 
                        className={cn(
                          "p-4 rounded-2xl border transition-all space-y-2 w-full min-w-0",
                          isJoined 
                            ? "bg-stitch-primary/10 border-stitch-primary" 
                            : "bg-muted/20 border-border/60 hover:bg-muted/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-foreground truncate">{room.title}</h4>
                          <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                            {room.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                          <Wind className="w-3 h-3 text-primary flex-shrink-0" /> {room.soundscape}
                        </p>
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <span className="text-[10px] text-muted-foreground">{room.participants} members present</span>
                          <Button 
                            size="sm" 
                            onClick={() => handleJoinRoom(room.title, room.id)}
                            variant={isJoined ? "default" : "outline"}
                            className={cn("rounded-xl h-7 text-xs font-semibold px-3", isJoined && "bg-stitch-primary text-white")}
                          >
                            {isJoined ? "Leave" : "Join Circle"}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>

              {/* Mindful Sanctuary Guidelines */}
              <Card className="border-none shadow-sm bg-stitch-surface-container-low rounded-3xl p-5 space-y-3 w-full min-w-0">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-stitch-primary" />
                  <span className="text-xs font-bold text-stitch-primary">Sanctuary Principles</span>
                </div>
                <ul className="text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <li>• Share authentically with gentleness and respect.</li>
                  <li>• No advice-giving; focus on personal reflections.</li>
                  <li>• Keep all shared feelings completely confidential.</li>
                </ul>
              </Card>

            </div>

          </div>

        </div>


        {/* ========================================================================= */}
        {/* 2. MOBILE SCREEN UI (CSS Grid Single-column Vertical Scroll Stream)       */}
        {/* ========================================================================= */}
        <div className="lg:hidden w-full px-[4vw] py-[2vh] space-y-[2vh] max-w-[min(100%,36rem)] mx-auto">
          
          <div className="flex items-center justify-between pb-1">
            <div>
              <Badge variant="outline" className="rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1 mb-0.5 w-fit">
                <Smartphone className="w-2.5 h-2.5" />
                Community Space
              </Badge>
              <h1 className="text-2xl font-display font-light text-primary">
                Community
              </h1>
            </div>

            <div className="px-3 py-1 bg-stitch-secondary-container/40 text-stitch-on-secondary-container rounded-full text-[10px] font-semibold flex items-center gap-1">
              <Radio className="w-2.5 h-2.5 text-rose-500 animate-pulse" />
              346 Live
            </div>
          </div>

          {/* Mobile Daily Prompt Card */}
          <Card className="border-none shadow-sm bg-card/95 rounded-3xl p-4 space-y-3 border border-border/50 w-full min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-stitch-primary-fixed text-stitch-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-stitch-primary">Morning Prompt</h3>
                <p className="text-[10px] text-muted-foreground">Today's question</p>
              </div>
            </div>

            <p className="text-sm font-display italic text-foreground leading-relaxed">
              "What is one small thing you can notice today that usually goes unseen?"
            </p>

            <form onSubmit={handleCreatePost} className="space-y-2 pt-1">
              <Textarea
                placeholder="Type your reflection..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                className="min-h-[70px] rounded-xl text-xs resize-none"
              />
              <Button 
                type="submit" 
                disabled={!newPostContent.trim()} 
                className="w-full btn-primary rounded-xl text-xs font-semibold h-8"
              >
                Post Reflection ✨
              </Button>
            </form>
          </Card>

          {/* Mobile Stillness Circle Card */}
          <div className="p-3.5 rounded-2xl bg-stitch-surface-container-low border border-border/50 flex items-center justify-between w-full min-w-0">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 rounded-xl bg-teal-500/15 text-teal-600 flex items-center justify-center flex-shrink-0">
                <Radio className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-foreground truncate">Dawn Breathwork Circle</p>
                <p className="text-[10px] text-muted-foreground truncate">112 members in sync</p>
              </div>
            </div>
            <Button 
              size="sm"
              onClick={() => handleJoinRoom("Dawn Breathwork", "room-1")}
              className="rounded-xl h-7 text-xs font-semibold px-3 flex-shrink-0"
              variant={joinedRoom === "room-1" ? "default" : "outline"}
            >
              {joinedRoom === "room-1" ? "In Circle" : "Join"}
            </Button>
          </div>

          {/* Mobile Posts Feed */}
          <div className="space-y-3 w-full min-w-0">
            {posts.map((post) => (
              <Card key={post.id} className="border-none shadow-xs bg-card/95 rounded-3xl p-4 space-y-2 border border-border/50 w-full min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-stitch-primary text-white flex items-center justify-center font-bold text-xs">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{post.author}</h4>
                      <p className="text-[9px] text-muted-foreground">{post.timeAgo}</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-stitch-secondary-container/40 text-stitch-on-secondary-container">
                    {post.badge}
                  </span>
                </div>

                <p className="text-xs text-foreground/90 leading-relaxed font-body italic">
                  "{post.content}"
                </p>

                <div className="flex items-center gap-4 pt-1 text-[11px] text-muted-foreground border-t border-border/30">
                  <button 
                    type="button" 
                    onClick={() => handleLike(post.id)}
                    className={cn("flex items-center gap-1", post.isLiked && "text-rose-500 font-bold")}
                  >
                    <Heart className={cn("w-3.5 h-3.5", post.isLiked && "fill-rose-500")} />
                    <span>{post.likes}</span>
                  </button>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{post.comments}</span>
                  </span>
                </div>
              </Card>
            ))}
          </div>

        </div>

      </main>

      <MobileNav />
    </div>
  );
}
