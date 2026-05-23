import { useState, useEffect, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";

export interface AuraMetrics {
  typingSpeed: number; // characters per minute
  typingVariability: number;
  detectedEmotion: string;
  emotionConfidence: number;
}

export function useAuraIntelligence() {
  const [metrics, setMetrics] = useState<AuraMetrics>({
    typingSpeed: 0,
    typingVariability: 0,
    detectedEmotion: "neutral",
    emotionConfidence: 1,
  });

  // --- Typing Pattern Tracker ---
  const [keystrokes, setKeystrokes] = useState<number[]>([]);
  
  useEffect(() => {
    const handleKeyDown = () => {
      setKeystrokes(prev => [...prev.slice(-50), Date.now()]);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (keystrokes.length < 2) return;

    const intervals = [];
    for (let i = 1; i < keystrokes.length; i++) {
      intervals.push(keystrokes[i] - keystrokes[i-1]);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const typingSpeed = Math.round(60000 / avgInterval);

    // Calculate variability (standard deviation)
    const variance = intervals.reduce((a, b) => a + Math.pow(b - avgInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    setMetrics(prev => ({
      ...prev,
      typingSpeed: isFinite(typingSpeed) ? typingSpeed : 0,
      typingVariability: stdDev,
    }));
  }, [keystrokes]);

  // --- Emotion Recognition (Placeholder) ---
  // In a full implementation, this would use face-api.js or a similar library
  const detectEmotion = useCallback((emotion: string, confidence: number) => {
    setMetrics(prev => ({
      ...prev,
      detectedEmotion: emotion,
      emotionConfidence: confidence,
    }));
  }, []);

  return {
    metrics,
    detectEmotion,
  };
}
