/**
 * OpenRouterKeyWidget.tsx
 * Secured & Hidden OpenRouter API Key Manager.
 * Keeps key fields completely hidden from public view behind a discreet Dialog modal.
 */
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key, ExternalLink, Check, Sparkles, AlertCircle, Eye, EyeOff, Cpu, RefreshCw, HelpCircle, Lock, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const STORAGE_KEYS = {
  API_KEY: "agust_openrouter_key",
  MODEL: "agust_openrouter_model",
};

export const SUPPORTED_MODELS = [
  { id: "openai/gpt-4o-mini", name: "OpenAI GPT-4o Mini", tag: "Recommended • Fast & Smart", badge: "Primary" },
  { id: "google/gemini-2.0-flash-001", name: "Google Gemini 2.0 Flash", tag: "Ultra Fast • Multimodal", badge: "Google" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Meta Llama 3.3 70B", tag: "Open Source Powerhouse", badge: "Meta" },
  { id: "anthropic/claude-3.5-haiku", name: "Anthropic Claude 3.5 Haiku", tag: "High Accuracy • Poetic", badge: "Anthropic" },
];

export function getStoredOpenRouterConfig() {
  const key = localStorage.getItem(STORAGE_KEYS.API_KEY) || "";
  const model = localStorage.getItem(STORAGE_KEYS.MODEL) || "openai/gpt-4o-mini";
  return { key, model };
}

export function OpenRouterKeyWidget() {
  const [key, setKey] = useState("");
  const [model, setModel] = useState("openai/gpt-4o-mini");
  const [showKey, setShowKey] = useState(false);
  const [status, setStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const [showGuide, setShowGuide] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const config = getStoredOpenRouterConfig();
    setKey(config.key);
    setModel(config.model);
    if (config.key) {
      setStatus("success");
      setStatusMsg("Custom OpenRouter key active!");
    }
  }, []);

  const handleSave = async () => {
    const trimmedKey = key.trim();
    if (!trimmedKey) {
      localStorage.removeItem(STORAGE_KEYS.API_KEY);
      localStorage.setItem(STORAGE_KEYS.MODEL, model);
      setStatus("idle");
      setStatusMsg("Using default system key.");
      return;
    }

    if (!trimmedKey.startsWith("sk-or-v1-")) {
      setStatus("error");
      setStatusMsg("OpenRouter API keys usually start with 'sk-or-v1-'. Please double check.");
      return;
    }

    setStatus("testing");
    setStatusMsg("Testing connection with OpenRouter...");

    try {
      const res = await fetch("/api/agust/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openrouter-key": trimmedKey,
          "x-openrouter-model": model,
        },
        body: JSON.stringify({ message: "ping test connection" }),
      });

      if (res.ok) {
        localStorage.setItem(STORAGE_KEYS.API_KEY, trimmedKey);
        localStorage.setItem(STORAGE_KEYS.MODEL, model);
        setStatus("success");
        setStatusMsg("Connected! OpenRouter key saved and active.");
      } else {
        setStatus("error");
        setStatusMsg("Connection test failed. Please verify your OpenRouter key.");
      }
    } catch (e: any) {
      setStatus("error");
      setStatusMsg("Unable to reach OpenRouter. Key saved locally.");
      localStorage.setItem(STORAGE_KEYS.API_KEY, trimmedKey);
      localStorage.setItem(STORAGE_KEYS.MODEL, model);
    }
  };

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    setKey("");
    setStatus("idle");
    setStatusMsg("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* Discreet Public View Trigger Button */}
      <DialogTrigger asChild>
        <div className="p-4 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-md flex items-center justify-between shadow-sm hover:bg-card/90 transition-all cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-foreground">Advanced AI Engine</h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted border border-border/40 text-muted-foreground font-semibold">
                  Private & Hidden
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Click to configure private OpenRouter API credentials
              </p>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="rounded-xl text-xs font-semibold gap-1.5 h-8">
            <Settings className="w-3.5 h-3.5" />
            Configure
          </Button>
        </div>
      </DialogTrigger>

      {/* Secured Key Configuration Dialog Modal */}
      <DialogContent className="max-w-md rounded-3xl bg-card/95 border-border/60 backdrop-blur-2xl shadow-2xl space-y-4">
        <DialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">OpenRouter API Key Settings</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Secured & hidden from public view
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step-by-Step Setup Guide Accordion */}
        <div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mb-2"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            {showGuide ? "Hide Setup Instructions" : "Show Setup Instructions"}
          </button>

          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-2xl bg-muted/40 border border-border/40 p-3 space-y-2 text-xs text-muted-foreground mb-3">
                  <ol className="space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[10px]">1</span>
                      <span>
                        Visit{" "}
                        <a
                          href="https://openrouter.ai/keys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary hover:underline inline-flex items-center gap-0.5"
                        >
                          openrouter.ai/keys <ExternalLink className="w-3 h-3" />
                        </a>
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[10px]">2</span>
                      <span>Click <strong>"Create Key"</strong> and copy your key (<code className="bg-muted px-1 py-0.5 rounded text-foreground">sk-or-v1-...</code>).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center flex-shrink-0 text-[10px]">3</span>
                      <span>Paste the key below and click <strong>"Save API Key"</strong>.</span>
                    </li>
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Form */}
        <div className="space-y-4">
          {/* Masked OpenRouter Key Field */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              OpenRouter API Key (Masked)
            </label>
            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="sk-or-v1-••••••••••••••••••••"
                className="w-full bg-muted/30 border border-border/60 rounded-xl pl-3 pr-10 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                title={showKey ? "Hide key" : "Show key (Use with caution)"}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* AI Model Selector */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-400" />
              Preferred AI Model
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUPPORTED_MODELS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModel(m.id)}
                  className={cn(
                    "p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between",
                    model === m.id
                      ? "border-primary bg-primary/10 shadow-sm ring-1 ring-primary"
                      : "border-border/50 bg-muted/20 hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{m.name}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-card border border-border/60 text-muted-foreground font-semibold">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.tag}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Status Message */}
          {statusMsg && (
            <div
              className={cn(
                "p-2.5 rounded-xl text-xs flex items-center gap-2",
                status === "success" && "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500",
                status === "error" && "bg-red-500/10 border border-red-500/20 text-red-400",
                status === "testing" && "bg-blue-500/10 border border-blue-500/20 text-blue-400",
                status === "idle" && "bg-muted text-muted-foreground"
              )}
            >
              {status === "testing" && <RefreshCw className="w-3.5 h-3.5 animate-spin flex-shrink-0" />}
              {status === "error" && <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />}
              {status === "success" && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleSave}
              disabled={status === "testing"}
              className="flex-1 bg-primary text-primary-foreground hover:opacity-90 font-semibold py-2 px-4 rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              {status === "testing" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Testing...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> Save API Key
                </>
              )}
            </button>

            {key && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2 rounded-xl border border-border/60 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
