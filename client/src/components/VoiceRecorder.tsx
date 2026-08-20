import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export function VoiceRecorder({ onTranscript, className }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " ";
        }
      }
      if (finalTranscript) {
        onTranscript(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      console.warn("Speech recognition error:", event.error);
      setIsRecording(false);
      if (event.error !== "no-speech") {
        toast({ title: "Microphone Note", description: "Voice recognition paused.", variant: "default" });
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [onTranscript]);

  const toggleRecording = () => {
    if (!isSupported) {
      toast({
        title: "Voice Not Supported",
        description: "Your browser doesn't support Web Speech. Please type notes directly.",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      toast({ title: "Voice Captured! 🎙️", description: "Your spoken thoughts have been transcribed." });
    } else {
      try {
        recognitionRef.current?.start();
        setIsRecording(true);
        toast({ title: "Listening... 🎙️", description: "Speak naturally about your feelings or day." });
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <Button
      type="button"
      onClick={toggleRecording}
      variant="outline"
      className={cn(
        "rounded-2xl transition-all duration-300 flex items-center gap-2 h-10 px-3 text-xs font-semibold active:scale-95",
        isRecording 
          ? "bg-rose-500/10 border-rose-500 text-rose-600 animate-pulse shadow-md shadow-rose-500/20" 
          : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50",
        className
      )}
      title={isRecording ? "Stop voice recording" : "Voice dictation"}
    >
      {isRecording ? (
        <>
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping mr-1" />
          <MicOff className="w-4 h-4 text-rose-500" />
          <span>Listening... (Tap to finish)</span>
        </>
      ) : (
        <>
          <Mic className="w-4 h-4 text-primary" />
          <span>Voice Record</span>
        </>
      )}
    </Button>
  );
}
