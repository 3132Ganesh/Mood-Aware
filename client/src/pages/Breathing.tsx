import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { BreathingOrb } from "@/components/BreathingOrb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Brain, Moon, ShieldCheck, Laptop, Smartphone, Wind, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Breathing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />

      <main className="flex-1 lg:pl-64 flex flex-col min-w-0 pb-28 lg:pb-12">

        {/* ========================================================================= */}
        {/* 1. LAPTOP SCREEN UI (CSS Grid 3-col science cards + Flexbox header/cards) */}
        {/* ========================================================================= */}
        <div className="hidden lg:block w-full max-w-[min(100%,75rem)] mx-auto px-[3vw] py-[3vh] space-y-[3vh]">
          
          <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-[2vw] w-full min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full bg-blue-500/10 text-blue-600 border-blue-500/20 text-[11px] font-semibold px-2.5 py-0.5 flex items-center gap-1">
                  <Laptop className="w-3 h-3" />
                  Laptop Zen Sanctuary
                </Badge>
              </div>
              <h1 className="text-3xl font-display font-bold bg-gradient-to-r from-blue-600 via-primary to-accent bg-clip-text text-transparent mt-1 truncate">
                Guided Breathwork Sanctuary
              </h1>
              <p className="text-sm text-muted-foreground truncate">
                Conscious rhythmic breathing to regulate your autonomic nervous system and lower cortisol.
              </p>
            </div>
          </header>

          {/* Central Breathing Orb Interactive Studio */}
          <div className="space-y-[3vh] w-full min-w-0">
            <BreathingOrb standalone={true} />

            {/* Educational Science Grid - CSS Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[1.5vw] w-full">
              <Card className="border-none shadow-md bg-card/85 backdrop-blur-md p-5 rounded-3xl border border-border/40 space-y-2 min-w-0 w-full">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground truncate">Vagus Nerve Activation</h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  Slow, extended exhalations trigger your parasympathetic nervous system, lowering heart rate in 60 seconds.
                </p>
              </Card>

              <Card className="border-none shadow-md bg-card/85 backdrop-blur-md p-5 rounded-3xl border border-border/40 space-y-2 min-w-0 w-full">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground truncate">Sleep Induction</h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  Using 4-7-8 breathing before bedtime silences intrusive rumination and activates natural melatonin production.
                </p>
              </Card>

              <Card className="border-none shadow-md bg-card/85 backdrop-blur-md p-5 rounded-3xl border border-border/40 space-y-2 min-w-0 w-full">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-foreground truncate">Anti-Stress Shield</h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                  Just 2 minutes of box breathing breaks the fight-or-flight cortisol cycle during high-pressure work days.
                </p>
              </Card>
            </div>
          </div>

        </div>


        {/* ========================================================================= */}
        {/* 2. MOBILE SCREEN UI (Visible on screens < 1024px)                        */}
        {/* ========================================================================= */}
        <div className="lg:hidden w-full px-4 py-3 space-y-4 max-w-lg mx-auto">
          
          <div className="pb-1">
            <Badge variant="outline" className="rounded-full bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-semibold px-2 py-0.5 flex items-center gap-1 mb-0.5 w-fit">
              <Smartphone className="w-2.5 h-2.5" />
              Mindful Breathing
            </Badge>
            <h1 className="text-xl font-display font-bold bg-gradient-to-r from-blue-600 via-primary to-accent bg-clip-text text-transparent">
              Guided Breathwork
            </h1>
          </div>

          {/* Centered Breathing Orb Component */}
          <div className="w-full">
            <BreathingOrb standalone={true} />
          </div>

          {/* Mobile Educational Science Cards */}
          <div className="space-y-2.5 pt-1 w-full">
            <div className="p-3.5 rounded-3xl bg-card border border-border/70 flex items-center gap-3.5 shadow-xs">
              <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Vagus Nerve Reset</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Slow exhalations lower heart rate in 60s</p>
              </div>
            </div>

            <div className="p-3.5 rounded-3xl bg-card border border-border/70 flex items-center gap-3.5 shadow-xs">
              <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Sleep Preparation</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">4-7-8 rhythm clears intrusive thoughts for deep sleep</p>
              </div>
            </div>

            <div className="p-3.5 rounded-3xl bg-card border border-border/70 flex items-center gap-3.5 shadow-xs">
              <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Anti-Stress Shield</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">Breaks the fight-or-flight cortisol cycle instantly</p>
              </div>
            </div>
          </div>

        </div>

      </main>

      <MobileNav />
    </div>
  );
}
