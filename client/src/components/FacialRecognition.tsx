import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Loader2, CameraOff, RefreshCw } from "lucide-react";
import { toast } from "@/hooks/use-tracking";

interface FacialRecognitionProps {
  onEmotionDetected: (emotion: string, score: number) => void;
}

export const FacialRecognition: React.FC<FacialRecognitionProps> = ({ onEmotionDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelsLoaded, setIsModelsLoaded] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string>("Neutral");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      setIsLoading(true);
      try {
        const MODEL_URL = '/models';
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
        ]);
        setIsModelsLoaded(true);
        console.log("Face-api models loaded");
      } catch (error) {
        console.error("Error loading models:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadModels();
  }, []);

  const startCamera = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Error accessing webcam:", error);
      // toast({ title: "Camera Error", description: "Could not access webcam.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCameraActive(false);
    }
  };

  const handleVideoPlay = () => {
    const interval = setInterval(async () => {
      if (videoRef.current && canvasRef.current && isCameraActive) {
        const detections = await faceapi
          .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detections.length > 0) {
          const expressions = detections[0].expressions;
          const dominantEmotion = Object.entries(expressions).reduce((a, b) => a[1] > b[1] ? a : b)[0];
          
          setDetectedEmotion(dominantEmotion.charAt(0).toUpperCase() + dominantEmotion.slice(1));
          
          // Map emotion to score (1-5)
          let score = 3; // Neutral
          if (dominantEmotion === 'happy') score = 5;
          if (dominantEmotion === 'surprised') score = 4;
          if (dominantEmotion === 'neutral') score = 3;
          if (dominantEmotion === 'sad') score = 2;
          if (dominantEmotion === 'angry' || dominantEmotion === 'disgusted' || dominantEmotion === 'fearful') score = 1;
          
          onEmotionDetected(dominantEmotion, score);
        }

        // Draw detection results on canvas (optional)
        const displaySize = { 
          width: videoRef.current.videoWidth, 
          height: videoRef.current.videoHeight 
        };
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, displaySize.width, displaySize.height);
        // faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
        // faceapi.draw.drawFaceExpressions(canvasRef.current, resizedDetections);
      }
    }, 500);

    return () => clearInterval(interval);
  };

  return (
    <Card className="overflow-hidden bg-muted/20 border-dashed border-2">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {!isCameraActive ? (
            <div className="text-center p-6">
              <CameraOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                Camera is off. Use facial recognition to set your mood.
              </p>
              <Button 
                onClick={startCamera} 
                disabled={!isModelsLoaded || isLoading}
                variant="outline"
                className="gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : <Camera className="w-4 h-4" />}
                {isModelsLoaded ? "Start Camera" : "Loading Models..."}
              </Button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                muted
                onPlay={handleVideoPlay}
                className="w-full h-full object-cover"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full"
              />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border shadow-sm">
                  <span className="text-xs font-semibold mr-2 uppercase text-muted-foreground tracking-wider">Detected:</span>
                  <span className="text-sm font-bold text-primary">{detectedEmotion}</span>
                </div>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="rounded-full shadow-lg"
                  onClick={stopCamera}
                >
                  <CameraOff className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
