import { Scroll } from "@react-three/drei";
import { motion } from "framer-motion";
import { Brain, Code, Activity, Music, TrendingUp, Sparkles, Droplets, Zap, Dumbbell, MessageSquare, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { useState } from "react";

interface OverlayProps {
  moodScore: number;
  completedTasksCount: number;
  totalTaskDuration: number;
  recentMoodLogsCount: number;
}

export default function Overlay({ moodScore, completedTasksCount, totalTaskDuration, recentMoodLogsCount }: OverlayProps) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [isAsking, setIsAsking] = useState(false);

  const handleAskAura = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsAsking(true);
    setResponse("");
    
    try {
      const res = await fetch("/api/rag/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        credentials: "include",
      });
      
      const data = await res.json();
      if (res.ok) {
        setResponse(data.response);
      } else {
        setResponse(data.message || "Communication failed.");
      }
    } catch (err) {
      setResponse("Aura is currently unreachable.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <Scroll html style={{ width: "100vw" }}>
      {/* 1. Hero Section */}
      <section className="scroll-section hero-section flex flex-col justify-center items-center h-[100vh] pointer-events-none px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-card pointer-events-auto text-center p-6 md:p-8 rounded-[1.5rem] bg-zinc-900/40 backdrop-blur-xl border border-white/5"
        >
          <h1 className="gradient-text-accent text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500 tracking-tighter">
            P R E S E N C E
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 mb-8 max-w-md mx-auto">
            Your evolving digital manifestation of habits, intellect, and mood.
          </p>

          <Link href="/dashboard">
            <Button className="rounded-full px-8 py-6 text-lg hover:scale-105 transition-transform bg-white text-black hover:bg-zinc-200">
              Return to Dashboard
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* 2. Learnings Section */}
      <section className="scroll-section learn-section flex flex-col justify-center items-center md:items-start h-[100vh] md:pl-[10vw] pointer-events-none px-4">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-card max-w-[600px] pointer-events-auto p-6 md:p-8 rounded-[1.5rem] bg-zinc-900/40 backdrop-blur-xl border border-white/5"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <Brain className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">Learnings</h2>
          </div>
          <p className="text-zinc-400 leading-relaxed text-base md:text-lg mb-8">
            Your intellect is expanding. Current records from your completed tasks
            fuel the structural complexity of your presence.
          </p>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 w-full">
            <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-emerald-500 text-white shrink-0">
                <Activity size={20} className="md:w-6 md:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base md:text-lg m-0">{completedTasksCount} Completed</h4>
                <p className="text-[10px] md:text-sm text-zinc-400 m-0">Tasks Today</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-amber-500 text-white shrink-0">
                <Code size={20} className="md:w-6 md:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base md:text-lg m-0">{totalTaskDuration} Mins</h4>
                <p className="text-[10px] md:text-sm text-zinc-400 m-0">Total Effort</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Habits Section */}
      <section className="scroll-section habit-section flex flex-col justify-center items-center md:items-end h-[100vh] md:pr-[10vw] pointer-events-none px-4">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-card max-w-[600px] pointer-events-auto p-6 md:p-8 rounded-[1.5rem] bg-zinc-900/40 backdrop-blur-xl border border-white/5"
        >
          <div className="flex items-center justify-end gap-4 mb-6">
            <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">Vibes</h2>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-blue-500 text-white shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <p className="text-zinc-400 leading-relaxed text-base md:text-lg mb-8 text-center md:text-right">
            Your recent moods and activities sculpt your presence's movement and base frequency colors.
          </p>
          
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 w-full" style={{ direction: "rtl" }}>
            <div className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl" style={{ direction: "ltr", textAlign: "left" }}>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-blue-500 text-white shrink-0">
                <TrendingUp size={20} className="md:w-6 md:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base md:text-lg m-0">Mood: {moodScore}/10</h4>
                <p className="text-[10px] md:text-sm text-zinc-400 m-0">Average Current</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-pink-500/10 border border-pink-500/20 p-4 rounded-xl" style={{ direction: "ltr", textAlign: "left" }}>
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-pink-500 text-white shrink-0">
                <Brain size={20} className="md:w-6 md:h-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base md:text-lg m-0">{recentMoodLogsCount} Logs</h4>
                <p className="text-[10px] md:text-sm text-zinc-400 m-0">Recent Check-ins</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Aura RAG Chat Section */}
      <section className="scroll-section chat-section flex flex-col justify-center items-center h-[100vh] pointer-events-none px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-card w-full max-w-[700px] pointer-events-auto p-6 md:p-8 rounded-[1.5rem] bg-zinc-900/60 backdrop-blur-2xl border border-purple-500/20 shadow-2xl shadow-purple-900/20 flex flex-col"
        >
          <div className="flex items-center gap-4 mb-6 border-b border-white/10 pb-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center bg-purple-500 text-white shadow-lg shadow-purple-500/20">
              <MessageSquare className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Aura Neural Link</h2>
              <p className="text-sm text-zinc-400">Connected to your Moods, Habits, Notion & Spotify</p>
            </div>
          </div>
          
          <div className="flex-1 min-h-[150px] mb-6 overflow-y-auto">
            {response ? (
              <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl text-zinc-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {response}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-500 italic text-center px-4">
                "Ask me to analyze your recent moods, summarize your Notion reflections, or see how your music matches your habits."
              </div>
            )}
          </div>

          <form onSubmit={handleAskAura} className="flex gap-2">
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="E.g., Why was my mood low yesterday?"
              className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 h-12 rounded-xl focus-visible:ring-purple-500"
              disabled={isAsking}
            />
            <Button 
              type="submit" 
              disabled={isAsking || !query.trim()}
              className="h-12 w-12 shrink-0 rounded-xl bg-purple-600 hover:bg-purple-500 text-white"
            >
              {isAsking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </form>
        </motion.div>
      </section>
    </Scroll>
  );
}
