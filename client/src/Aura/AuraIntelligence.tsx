import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Camera, Zap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AuraIntelligenceProps {
  metrics: {
    typingSpeed: number;
    typingVariability: number;
    detectedEmotion: string;
    emotionConfidence: number;
  };
  onEmotionDetect: (emotion: string, confidence: number) => void;
}

export default function AuraIntelligence({ metrics, onEmotionDetect }: AuraIntelligenceProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasWebcam, setHasWebcam] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    async function setupWebcam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasWebcam(true);
          setIsAnalyzing(true);
        }
      } catch (err) {
        console.warn("Webcam access denied or not available");
      }
    }

    setupWebcam();
    
    // Simulate periodic emotion detection
    const interval = setInterval(() => {
      const emotions = ["happy", "neutral", "surprised", "neutral", "neutral"];
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      onEmotionDetect(randomEmotion, 0.8 + Math.random() * 0.2);
    }, 5000);

    return () => {
      clearInterval(interval);
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [onEmotionDetect]);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4 pointer-events-none">
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="pointer-events-auto"
          >
            <Card className="w-64 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-2xl">
              <CardHeader className="p-4 pb-2 border-b border-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-xs font-medium uppercase tracking-widest text-white/60 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  Aura Intelligence
                </CardTitle>
                <Badge variant="outline" className="text-[10px] bg-green-500/20 text-green-400 border-green-500/30">
                  LIVE
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-white/5 border border-white/10 group">
                  {hasWebcam ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-2 text-white/40">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px]">Awaiting Vision...</span>
                    </div>
                  )}
                  
                  {/* Scanning Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/10 to-transparent h-1/2 w-full animate-scan pointer-events-none" />
                  
                  <div className="absolute bottom-2 left-2 flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[8px] font-mono uppercase text-primary/80">Analyzing facial geometry</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-white/40 flex items-center gap-1">
                      <Activity className="w-3 h-3" /> Rhythm
                    </span>
                    <p className="text-sm font-mono">{metrics.typingSpeed} <span className="text-[10px] opacity-40">CPM</span></p>
                  </div>
                  <div className="space-y-1 text-right">
                    <span className="text-[10px] text-white/40 flex items-center gap-1 justify-end">
                      Emotion <Brain className="w-3 h-3" />
                    </span>
                    <p className="text-sm font-medium capitalize text-primary">
                      {metrics.detectedEmotion}
                    </p>
                  </div>
                </div>

                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    animate={{ width: `${metrics.emotionConfidence * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
