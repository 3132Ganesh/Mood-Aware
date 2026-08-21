import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Mic, MicOff, Loader2, Sparkles, AlertCircle, Volume2, CheckCircle2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  className?: string;
  buttonVariant?: "outline" | "default" | "ghost" | "secondary";
  compact?: boolean;
}

export function VoiceRecorder({ 
  onTranscript, 
  className,
  buttonVariant = "outline",
  compact = false
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionState, setPermissionState] = useState<"unknown" | "prompt" | "granted" | "denied">("unknown");
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showDeniedModal, setShowDeniedModal] = useState(false);
  const [interimText, setInterimText] = useState("");
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check browser support and initial permissions
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition && !navigator.mediaDevices?.getUserMedia) {
      setIsSupported(false);
    }

    // Check if permission was already granted in this session
    if (localStorage.getItem("moodaware_mic_granted") === "true") {
      setPermissionState("granted");
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecordingCleanup();
    };
  }, []);

  const stopRecordingCleanup = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (e) {}
      audioContextRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    setIsRecording(false);
  };

  // 1. Explicitly Request Mobile Microphone Permission via getUserMedia
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("MediaDevices API not supported on this browser.");
      }

      // Explicitly trigger native mobile OS microphone prompt
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });

      // Permission granted!
      localStorage.setItem("moodaware_mic_granted", "true");
      setPermissionState("granted");
      setShowPermissionModal(false);

      // Start visual audio analyzer
      startAudioVisualizer(stream);
      mediaStreamRef.current = stream;

      return true;
    } catch (err: any) {
      console.warn("Microphone permission denied or error:", err);
      setShowPermissionModal(false);
      
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionState("denied");
        setShowDeniedModal(true);
      } else {
        toast({
          title: "Microphone Access Issue",
          description: err.message || "Could not access mobile microphone.",
          variant: "destructive",
        });
      }
      return false;
    }
  };

  // 2. Audio level analyzer for interactive mobile waveform feedback
  const startAudioVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      const audioCtx = new AudioCtx();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (e) {
      console.warn("Audio visualizer initialization skipped:", e);
    }
  };

  // 3. Start Speech Recognition Engine
  const startSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        title: "Voice Transcription Note",
        description: "Your browser's speech recognition engine is unavailable. Microphone is active.",
      });
      return;
    }

    try {
      // Re-create instance to prevent mobile invalid state error
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsRecording(true);
        setInterimText("");
        toast({
          title: "Listening... 🎙️",
          description: "Speak clearly into your phone. We'll transcribe in real-time.",
        });
      };

      recognition.onresult = (event: any) => {
        let accumulatedFinal = "";
        let accumulatedInterim = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            accumulatedFinal += transcript + " ";
          } else {
            accumulatedInterim += transcript;
          }
        }

        if (accumulatedInterim) {
          setInterimText(accumulatedInterim);
        }

        if (accumulatedFinal) {
          setInterimText("");
          onTranscript(accumulatedFinal.trim());
        }
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition event error:", event.error);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setPermissionState("denied");
          setShowDeniedModal(true);
          stopRecordingCleanup();
        } else if (event.error !== "no-speech") {
          toast({
            title: "Voice Notice",
            description: "Dictation paused. Tap microphone to resume.",
            variant: "default",
          });
        }
      };

      recognition.onend = () => {
        // If still marked as recording on mobile, finalize any pending text
        if (interimText.trim()) {
          onTranscript(interimText.trim());
          setInterimText("");
        }
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.error("SpeechRecognition start error:", e);
      setIsRecording(false);
    }
  };

  // 4. Primary Button Toggle Handler
  const handleToggle = async () => {
    if (!isSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Your mobile browser does not support Web Speech. Please type notes directly.",
        variant: "destructive",
      });
      return;
    }

    // If currently recording, stop it
    if (isRecording) {
      if (interimText.trim()) {
        onTranscript(interimText.trim());
        setInterimText("");
      }
      stopRecordingCleanup();
      toast({
        title: "Voice Captured! ✨",
        description: "Your words have been added to your reflection.",
      });
      return;
    }

    // Check if we need to request permission first
    const hasPermission = localStorage.getItem("moodaware_mic_granted") === "true";

    if (!hasPermission) {
      // Show explicit permission explanation dialog before prompting native OS
      setShowPermissionModal(true);
      return;
    }

    // Permission is already granted: acquire stream and start recognition
    const granted = await requestMicrophonePermission();
    if (granted) {
      startSpeechRecognition();
    }
  };

  // User confirmed permission in pre-flight dialog
  const handleConfirmPermission = async () => {
    const granted = await requestMicrophonePermission();
    if (granted) {
      startSpeechRecognition();
    }
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handleToggle}
          variant={buttonVariant}
          className={cn(
            "rounded-2xl transition-all duration-300 flex items-center gap-2 h-10 px-3.5 text-xs font-semibold active:scale-95 select-none",
            isRecording 
              ? "bg-rose-500 text-white border-rose-600 shadow-md shadow-rose-500/25 hover:bg-rose-600" 
              : "border-border/80 text-foreground bg-stitch-surface-container-low hover:bg-muted",
            className
          )}
          aria-label={isRecording ? "Stop voice dictation" : "Start voice dictation"}
        >
          {isRecording ? (
            <>
              <div className="flex items-center gap-1">
                <span 
                  className="w-1.5 bg-white rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(6, (audioLevel / 100) * 18)}px` }}
                />
                <span 
                  className="w-1.5 bg-white rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(10, (audioLevel / 100) * 24)}px` }}
                />
                <span 
                  className="w-1.5 bg-white rounded-full transition-all duration-75"
                  style={{ height: `${Math.max(6, (audioLevel / 100) * 16)}px` }}
                />
              </div>
              <MicOff className="w-3.5 h-3.5 ml-1" />
              <span>{compact ? "Stop" : "Listening... (Tap to finish)"}</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 text-primary" />
              <span>{compact ? "Speak" : "Voice Dictate"}</span>
            </>
          )}
        </Button>

        {/* Live Interim Transcript Feedback */}
        {isRecording && interimText && (
          <span className="text-[11px] text-primary font-medium italic truncate max-w-[150px] animate-pulse">
            "{interimText}"
          </span>
        )}
      </div>

      {/* Permission Request Pre-flight Modal */}
      <Dialog open={showPermissionModal} onOpenChange={setShowPermissionModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-xs">
              <Mic className="w-6 h-6" />
            </div>
            <DialogTitle className="text-center font-headline text-lg font-bold text-foreground">
              Enable Microphone Access 🎙️
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              MoodAware uses your mobile microphone to transcribe your reflections, daily check-ins, and feelings directly into text without typing.
            </DialogDescription>
          </DialogHeader>

          <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/60 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Privacy-First Voice Dictation</span>
            </div>
            <p className="text-[11px] leading-snug">
              Your audio is processed in real-time by your device browser and is never stored as raw recordings.
            </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPermissionModal(false)}
              className="rounded-xl text-xs h-10 w-full sm:w-auto"
            >
              Not Now
            </Button>
            <Button
              type="button"
              onClick={handleConfirmPermission}
              className="btn-primary rounded-xl text-xs font-semibold h-10 w-full sm:w-auto shadow-md gap-2"
            >
              <Mic className="w-4 h-4" />
              Allow Microphone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Blocked / Denied Modal */}
      <Dialog open={showDeniedModal} onOpenChange={setShowDeniedModal}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-6 h-6" />
            </div>
            <DialogTitle className="text-center font-headline text-lg font-bold text-foreground">
              Microphone Permission Needed 🔒
            </DialogTitle>
            <DialogDescription className="text-center text-xs text-muted-foreground leading-relaxed">
              Microphone access was blocked or denied by your browser settings. To use voice dictation on mobile:
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-2xl bg-muted/30 border border-border/60 space-y-2.5 text-xs text-foreground">
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
              <span>Tap the <strong>Lock (🔒) or Tune</strong> icon in your browser's address bar.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
              <span>Select <strong>Permissions / Site Settings</strong>.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-5 h-5 rounded-full bg-primary/20 text-primary font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
              <span>Set <strong>Microphone</strong> to <strong>Allow</strong>, then reload this page.</span>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              onClick={() => setShowDeniedModal(false)}
              className="btn-primary rounded-xl text-xs font-semibold h-10 w-full"
            >
              Got It
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
