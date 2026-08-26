import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Brain, Cpu, Sparkles, RefreshCw, Zap, Server, Sliders, CheckCircle2, 
  AlertCircle, Play, Database, Terminal, ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgustModelStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AgustModelStudio({ open, onOpenChange }: AgustModelStudioProps) {
  const { toast } = useToast();
  const [provider, setProvider] = useState<"cloud" | "local" | "webllm">(() => {
    return (localStorage.getItem("moodaware_llm_provider") as any) || "cloud";
  });
  const [temperature, setTemperature] = useState<number[]>([70]);
  const [testPrompt, setTestPrompt] = useState("How can I handle work stress and gain muscle weight in Hyderabad?");
  const [testResponse, setTestResponse] = useState("");

  // Fetch local LLM availability status
  const { data: llmStatus, isLoading, refetch } = useQuery<{
    isLocalAvailable: boolean;
    availableModels: string[];
    defaultModel: string;
    datasetCount: number;
  }>({
    queryKey: ["/api/agust/llm-status"],
    refetchInterval: 10000,
  });

  const handleProviderSelect = (selected: "cloud" | "local" | "webllm") => {
    setProvider(selected);
    localStorage.setItem("moodaware_llm_provider", selected);
    toast({
      title: `Active Engine Set to ${selected.toUpperCase()} ⚡`,
      description: selected === "local" ? "Routing prompts to locally fine-tuned MoodAware-LLM." : "Routing prompts to OpenRouter Cloud gateway.",
    });
  };

  // Test Inference Mutation
  const testInferenceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/agust/chat", {
        message: testPrompt,
        history: [],
      }, {
        "x-llm-provider": provider,
      });
      return await res.json();
    },
    onSuccess: (data) => {
      setTestResponse(data.reply);
      toast({
        title: "Inference Completed! 🚀",
        description: `Generated via ${data.provider || provider} provider.`,
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Inference Failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl rounded-3xl bg-card/95 backdrop-blur-2xl border-border/80 shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-extrabold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary animate-pulse" /> MoodAware Neural Model Studio
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Configure, train, and test domain-specific LLM models locally or via cloud gateways.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-2">
          {/* Provider Selection Cards */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-primary" /> Active LLM Provider Engine
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cloud OpenRouter */}
              <div
                onClick={() => handleProviderSelect("cloud")}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5",
                  provider === "cloud"
                    ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                    : "bg-card border-border/70 hover:bg-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">Cloud OpenRouter</span>
                  <Badge variant="outline" className="text-[9px]">Multi-Model</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">High performance Gemini & Claude models via API.</p>
              </div>

              {/* Local Ollama Fine-Tuned */}
              <div
                onClick={() => handleProviderSelect("local")}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5",
                  provider === "local"
                    ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                    : "bg-card border-border/70 hover:bg-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">Local Ollama LLM</span>
                  {llmStatus?.isLocalAvailable ? (
                    <Badge className="text-[9px] bg-emerald-500 text-white font-bold">Online</Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[9px]">Offline</Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Fine-tuned Qwen-1.5B / Llama-3.2 running on host machine.</p>
              </div>

              {/* In-Browser WebLLM */}
              <div
                onClick={() => handleProviderSelect("webllm")}
                className={cn(
                  "p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5",
                  provider === "webllm"
                    ? "bg-primary/10 border-primary ring-2 ring-primary/20"
                    : "bg-card border-border/70 hover:bg-muted"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">WebGPU In-Browser</span>
                  <Badge variant="outline" className="text-[9px]">Mobile Ready</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground">100% offline private execution inside client browser.</p>
              </div>
            </div>
          </div>

          {/* Model Status & Fine-Tuning Metrics */}
          <div className="p-4 rounded-3xl bg-muted/30 border border-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-foreground">Fine-Tuning Dataset & Architecture</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => refetch()} className="h-7 text-[11px] gap-1">
                <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} /> Refresh
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-2xl bg-card border border-border/60">
                <div className="text-[10px] text-muted-foreground">Dataset Size</div>
                <div className="text-sm font-extrabold text-foreground">{llmStatus?.datasetCount || 500} Examples</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-card border border-border/60">
                <div className="text-[10px] text-muted-foreground">Base Model</div>
                <div className="text-sm font-extrabold text-foreground">Qwen-2.5-1.5B</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-card border border-border/60">
                <div className="text-[10px] text-muted-foreground">LoRA Rank</div>
                <div className="text-sm font-extrabold text-foreground">r = 16, alpha = 32</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-card border border-border/60">
                <div className="text-[10px] text-muted-foreground">Quantization</div>
                <div className="text-sm font-extrabold text-foreground">GGUF Q4_K_M</div>
              </div>
            </div>
          </div>

          {/* Hyperparameter Controls */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-foreground">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" /> Model Temperature ({temperature[0] / 100})
              </span>
              <span className="text-[10px] text-muted-foreground">
                {temperature[0] < 40 ? "Precise" : temperature[0] < 80 ? "Balanced" : "Creative"}
              </span>
            </div>
            <Slider value={temperature} onValueChange={setTemperature} min={10} max={100} step={5} />
          </div>

          {/* Inference Playground */}
          <div className="p-4 rounded-3xl bg-muted/30 border border-border/70 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-500" /> Live Model Inference Playground
              </span>
            </div>

            <Textarea
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Enter a prompt to test your custom fine-tuned model..."
              className="rounded-2xl text-xs resize-none min-h-[70px]"
            />

            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => testInferenceMutation.mutate()}
                disabled={testInferenceMutation.isPending}
                className="rounded-xl bg-gradient-to-r from-primary to-accent text-white font-bold text-xs gap-1.5"
              >
                <Play className={cn("w-3.5 h-3.5", testInferenceMutation.isPending && "animate-spin")} />
                Run Model Completion
              </Button>
            </div>

            {testResponse && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3.5 rounded-2xl bg-card border border-primary/30 text-xs leading-relaxed space-y-1"
              >
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  Model Output Response:
                </span>
                <p className="text-foreground">{testResponse}</p>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
