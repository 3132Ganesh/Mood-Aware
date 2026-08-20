import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { BreathingOrb } from "@/components/BreathingOrb";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, Heart, Brain, Moon, ShieldCheck } from "lucide-react";

export default function Breathing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 pb-28 lg:pb-8 max-w-4xl mx-auto w-full">
        <header className="mb-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Mindful Sanctuary
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold">Guided Breathwork</h2>
          <p className="text-sm text-muted-foreground">Take a conscious pause to lower cortisol, calm your nervous system, and reset.</p>
        </header>

        <div className="space-y-6">
          <BreathingOrb standalone={true} />

          {/* Educational Science Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Card className="border-none shadow-sm bg-card/70 backdrop-blur-sm p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center mb-2">
                <Brain className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-foreground">Vagus Nerve Reset</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Slow, extended exhalations trigger your parasympathetic nervous system, lowering heart rate in 60 seconds.
              </p>
            </Card>

            <Card className="border-none shadow-sm bg-card/70 backdrop-blur-sm p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-2">
                <Moon className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-foreground">Sleep Preparation</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Using 4-7-8 breathing before bed clears intrusive thoughts and preps melatonin production.
              </p>
            </Card>

            <Card className="border-none shadow-sm bg-card/70 backdrop-blur-sm p-4 rounded-2xl">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold text-foreground">Anti-Stress Shield</h4>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                Just 2 minutes of box breathing breaks the fight-or-flight cortisol cycle during busy work days.
              </p>
            </Card>
          </div>
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
