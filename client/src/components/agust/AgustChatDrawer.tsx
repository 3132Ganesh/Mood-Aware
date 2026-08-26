/**
 * AgustChatDrawer.tsx
 * Premium Stitch-styled AI Chat Companion Drawer.
 * Connects directly to /api/agust/chat (OpenRouter powered AI response).
 */
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import { loadPersona, CHARACTER_META } from "@/lib/agust-engine";

interface Message {
  id: string;
  sender: "user" | "agust";
  text: string;
  timestamp: string;
}

interface AgustChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AgustChatDrawer({ isOpen, onClose }: AgustChatDrawerProps) {
  const [persona, setPersona] = useState(loadPersona);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "agust",
      text: `Hello! I am ${persona.name}, your AI Wellness & Career companion. How can I guide your plan today? ✨`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const meta = CHARACTER_META[persona.character] || CHARACTER_META.zen_master;

  useEffect(() => {
    if (isOpen) {
      setPersona(loadPersona());
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Chat Mutation to call /api/agust/chat
  const chatMutation = useMutation({
    mutationFn: async (userMsg: string) => {
      const historyPayload = messages.map(m => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await apiRequest("POST", "/api/agust/chat", {
        message: userMsg,
        history: historyPayload,
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data?.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: "agust",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: "agust",
          text: "I am having trouble connecting right now, but stay focused on your daily micro-habits! 🧘",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    },
  });

  const handleSend = (textToSend?: string) => {
    const msgText = (textToSend || input).trim();
    if (!msgText || chatMutation.isPending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: msgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    chatMutation.mutate(msgText);
  };

  const quickPrompts = [
    "✨ Help me balance my career track & diet",
    "💧 Remind me about hydration & micro-habits",
    "🚀 Give me motivation for my weekend hard task",
    "🧘 Guide a 2-minute relaxation exercise",
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[150]"
          />

          {/* Slide-over Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[420px] bg-card/95 border-l border-border/60 shadow-2xl backdrop-blur-2xl z-[160] flex flex-col"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-border/50 flex items-center justify-between bg-muted/30">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-xl shadow-md", meta.color)}>
                  {persona.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-foreground leading-none">{persona.name} AI</h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">{persona.character.replace("_", " ")} Companion</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex flex-col max-w-[85%] rounded-2xl p-3 text-sm shadow-sm",
                    msg.sender === "user"
                      ? "ml-auto bg-primary text-primary-foreground rounded-br-none"
                      : "mr-auto bg-muted/80 text-foreground border border-border/40 rounded-bl-none"
                  )}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  <span className={cn(
                    "text-[10px] mt-1 self-end opacity-70",
                    msg.sender === "user" ? "text-primary-foreground" : "text-muted-foreground"
                  )}>
                    {msg.timestamp}
                  </span>
                </motion.div>
              ))}

              {chatMutation.isPending && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mr-auto bg-muted/80 border border-border/40 rounded-2xl rounded-bl-none p-3 flex items-center gap-2"
                >
                  <div className={cn("w-5 h-5 rounded-lg bg-gradient-to-tr flex items-center justify-center text-xs", meta.color)}>
                    {persona.avatar}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div className="px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar border-t border-border/30 bg-muted/10">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  disabled={chatMutation.isPending}
                  className="whitespace-nowrap px-2.5 py-1 text-xs rounded-full bg-card hover:bg-muted border border-border/50 text-muted-foreground hover:text-foreground transition-all flex items-center gap-1"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-border/50 bg-muted/20">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Ask ${persona.name} anything about goals & routine...`}
                  disabled={chatMutation.isPending}
                  className="flex-1 bg-card border border-border/60 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || chatMutation.isPending}
                  className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center transition-all",
                    input.trim() && !chatMutation.isPending
                      ? "bg-primary text-primary-foreground shadow-md hover:scale-105"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
