import { Scroll } from "@react-three/drei";
import { motion } from "framer-motion";
import { Brain, Code, Activity, Music, TrendingUp, Sparkles, Droplets, Zap, Dumbbell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface OverlayProps {
  moodScore: number;
  completedTasksCount: number;
  totalTaskDuration: number;
  recentMoodLogsCount: number;
}

export default function Overlay({ moodScore, completedTasksCount, totalTaskDuration, recentMoodLogsCount }: OverlayProps) {
  return (
    <Scroll html style={{ width: "100vw" }}>
      {/* 1. Hero Section */}
      <section className="scroll-section hero-section" style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-card"
          style={{ pointerEvents: "auto", textAlign: "center", padding: "2rem", borderRadius: "1.5rem", background: "rgba(20, 20, 25, 0.4)", backdropFilter: "blur(16px)" }}
        >
          <h1 className="gradient-text-accent text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-500">
            A U R A
          </h1>
          <p className="text-xl text-zinc-400 mb-8 max-w-md mx-auto">
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
      <section className="scroll-section learn-section" style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", paddingLeft: "10vw", pointerEvents: "none" }}>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-card"
          style={{ maxWidth: "600px", pointerEvents: "auto", padding: "2rem", borderRadius: "1.5rem", background: "rgba(20, 20, 25, 0.4)", backdropFilter: "blur(16px)" }}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <Brain />
            </div>
            <h2 className="text-4xl font-bold text-white">Learnings</h2>
          </div>
          <p className="text-zinc-400 leading-relaxed text-lg mb-8">
            Your intellect is expanding. Current records from your completed tasks
            fuel the structural complexity of your aura.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-emerald-500 text-white">
                <Activity size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg m-0">{completedTasksCount} Completed</h4>
                <p className="text-sm text-zinc-400 m-0">Tasks Today</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-amber-500 text-white">
                <Code size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg m-0">{totalTaskDuration} Mins</h4>
                <p className="text-sm text-zinc-400 m-0">Total Effort</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. Habits Section */}
      <section className="scroll-section habit-section" style={{ height: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-end", paddingRight: "10vw", pointerEvents: "none" }}>
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="glass-card"
          style={{ maxWidth: "600px", pointerEvents: "auto", padding: "2rem", borderRadius: "1.5rem", background: "rgba(20, 20, 25, 0.4)", backdropFilter: "blur(16px)" }}
        >
          <div className="flex items-center justify-end gap-4 mb-6">
            <h2 className="text-4xl font-bold text-white">Vibes</h2>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500 text-white shadow-lg shadow-blue-500/20">
              <Activity />
            </div>
          </div>
          <p className="text-zinc-400 leading-relaxed text-lg mb-8 text-right">
            Your recent moods and activities sculpt your aura's movement and base frequency colors.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" style={{ direction: "rtl" }}>
            <div className="flex items-center gap-4 bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl" style={{ direction: "ltr", textAlign: "left" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500 text-white">
                <TrendingUp size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg m-0">Mood: {moodScore}/10</h4>
                <p className="text-sm text-zinc-400 m-0">Average Current</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-pink-500/10 border border-pink-500/20 p-4 rounded-xl" style={{ direction: "ltr", textAlign: "left" }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-pink-500 text-white">
                <Brain size={24} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg m-0">{recentMoodLogsCount} Logs</h4>
                <p className="text-sm text-zinc-400 m-0">Recent Check-ins</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </Scroll>
  );
}
