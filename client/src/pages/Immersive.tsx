import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { ScrollControls, Environment, Float, Sparkles, Stars } from "@react-three/drei";
import AuraBlob from "@/Aura/AuraBlob";
import { useAuraIntelligence } from "@/Aura/use-aura-intelligence";
import Overlay from "@/components/Overlay";
import AuraIntelligence from "@/Aura/AuraIntelligence";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentPlan } from "@/hooks/use-tasks";
import { useMood } from "@/hooks/use-tracking";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function Immersive() {
  const { user } = useAuth();
  const { plan } = useCurrentPlan();
  const { history } = useMood();
  const { metrics, detectEmotion } = useAuraIntelligence();

  const today = format(new Date(), "yyyy-MM-dd");

  const { completedTasksCount, totalTaskDuration, moodScore, recentMoodLogsCount } = useMemo(() => {
    let completed = 0;
    let duration = 0;
    
    const todaysTasks = plan?.items.filter(item => {
      const itemDate = new Date(item.dayDate).toISOString().split('T')[0];
      return itemDate === today;
    }) || [];

    todaysTasks.forEach(item => {
      if (item.isCompleted) {
        completed++;
        duration += (item.task.duration || 0);
      }
    });

    let moodSum = 0;
    let moodCount = 0;
    const sortedHistory = [...(history || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentLogs = sortedHistory.slice(0, 7);
    recentLogs.forEach(h => {
      moodSum += (h.moodScore || 0);
      moodCount++;
    });

    const avgMoodScore = moodCount > 0 ? Math.round(moodSum / moodCount) : 5; // default 5 out of 10 or 3 out of 5

    return {
      completedTasksCount: completed,
      totalTaskDuration: duration,
      moodScore: avgMoodScore,
      recentMoodLogsCount: moodCount,
    };
  }, [plan, history, today]);

  // Map 1-10 moodScore to 1-5 scale for AuraBlob
  const emotionMap: Record<string, number> = { "happy": 5, "surprised": 4, "neutral": 3, "sad": 1, "angry": 1, "fearful": 2, "disgusted": 2 };
  const currentEmotionMood = emotionMap[metrics.detectedEmotion] || 3;
  const auraMood = Math.max(1, Math.min(5, Math.ceil((moodScore + currentEmotionMood * 2) / 3)));

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen bg-black overflow-hidden relative">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <color attach="background" args={["#050505"]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#8b5cf6" />
        
        <Suspense fallback={null}>
          <Environment preset="city" />
          
          <ScrollControls pages={4} damping={0.25} distance={1.2}>
            
            <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />
            
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
              <AuraBlob mood={auraMood} />
            </Float>
            
            <Sparkles count={150} scale={12} size={2} speed={0.4} opacity={0.5} color="#8b5cf6" />
            <Sparkles count={50} scale={10} size={4} speed={0.6} opacity={0.3} color="#f43f5e" />
            <Sparkles count={100} scale={15} size={1} speed={0.2} opacity={0.6} color="#10b981" />
            
            <Overlay 
              moodScore={moodScore} 
              completedTasksCount={completedTasksCount}
              totalTaskDuration={totalTaskDuration}
              recentMoodLogsCount={recentMoodLogsCount}
            />
          </ScrollControls>
          <AuraIntelligence metrics={metrics} onEmotionDetect={detectEmotion} />
        </Suspense>
      </Canvas>
    </div>
  );
}


