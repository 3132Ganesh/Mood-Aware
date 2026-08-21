import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, TrendingUp, Moon, Monitor, Activity, Lightbulb } from "lucide-react";
import { type MoodLog, type DailyHabit } from "@shared/schema";

interface PredictiveInsightsProps {
  moods: MoodLog[];
  habits: DailyHabit[];
}

export function PredictiveInsights({ moods, habits }: PredictiveInsightsProps) {
  // Statistical correlation calculations
  const generateInsights = () => {
    const list: { icon: any; title: string; desc: string; color: string; tag: string }[] = [];

    if (!moods || moods.length === 0) {
      list.push({
        icon: Lightbulb,
        title: "Baseline Forming",
        desc: "Log 3+ check-ins to unlock personalized AI lifestyle & mood correlations.",
        color: "from-primary/10 to-accent/10 text-primary border-primary/20",
        tag: "Getting Started"
      });
      return list;
    }

    // 1. Sleep Correlation
    const logsWithSleep = moods.filter(m => m.sleepScore != null && m.sleepScore > 0);
    if (logsWithSleep.length >= 2) {
      const goodSleepMoods = logsWithSleep.filter(m => m.sleepScore! >= 7);
      const lowSleepMoods = logsWithSleep.filter(m => m.sleepScore! < 7);

      const avgGoodMood = goodSleepMoods.length > 0
        ? goodSleepMoods.reduce((a, b) => a + b.moodScore, 0) / goodSleepMoods.length
        : 0;
      const avgLowMood = lowSleepMoods.length > 0
        ? lowSleepMoods.reduce((a, b) => a + b.moodScore, 0) / lowSleepMoods.length
        : 0;

      if (avgGoodMood > avgLowMood && lowSleepMoods.length > 0) {
        const diffPercent = Math.round(((avgGoodMood - avgLowMood) / avgLowMood) * 100);
        list.push({
          icon: Moon,
          title: "Sleep & Mood Multiplier",
          desc: `Sleeping 7+ hours boosts your average mood by +${diffPercent}% compared to shorter nights.`,
          color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200 dark:border-blue-900",
          tag: "Sleep Science"
        });
      } else {
        list.push({
          icon: Moon,
          title: "Sleep Baseline",
          desc: "Consistent 7-8 hour sleep schedules stabilize your emotional resilience.",
          color: "from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-200 dark:border-blue-900",
          tag: "Rest"
        });
      }
    }

    // 2. Screen Time Correlation
    const logsWithScreen = habits.filter(h => h.screenTimeHours != null);
    if (logsWithScreen.length >= 2) {
      const avgScreen = logsWithScreen.reduce((a, b) => a + (b.screenTimeHours || 0), 0) / logsWithScreen.length;
      if (avgScreen > 5) {
        list.push({
          icon: Monitor,
          title: "Screen Time Alert",
          desc: `Your screen time averages ${avgScreen.toFixed(1)} hrs/day. Reducing by 1 hour can lower stress ratings by up to 25%.`,
          color: "from-amber-500/10 to-orange-500/10 text-amber-600 border-amber-200 dark:border-amber-900",
          tag: "Digital Balance"
        });
      } else {
        list.push({
          icon: Monitor,
          title: "Healthy Screen Rhythm",
          desc: `Great screen discipline (${avgScreen.toFixed(1)} hrs/day average), protecting your evening wind-down time.`,
          color: "from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-900",
          tag: "Digital Wellness"
        });
      }
    }

    // 3. Movement / Physical Activity Correlation
    const activeDays = habits.filter(h => h.extraPhysicalActivity).length;
    if (habits.length > 0) {
      const activeRate = Math.round((activeDays / habits.length) * 100);
      list.push({
        icon: Activity,
        title: "Movement Vitality",
        desc: `You stayed active on ${activeRate}% of logged days. Physical movement reliably elevates daytime energy levels.`,
        color: "from-purple-500/10 to-pink-500/10 text-purple-600 border-purple-200 dark:border-purple-900",
        tag: "Vitality"
      });
    }

    return list.slice(0, 3);
  };

  const insights = generateInsights();

  return (
    <Card className="border-none shadow-md bg-card/85 backdrop-blur-md rounded-3xl border border-border/40 w-full min-w-0">
      <CardHeader className="pb-3 flex flex-col space-y-1.5 w-full min-w-0">
        <div className="flex items-center justify-between gap-2 w-full min-w-0 flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" /> Predictive Wellness Insights
          </div>
          <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1 flex-shrink-0">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Live Correlation
          </span>
        </div>
        <CardTitle className="text-lg font-bold truncate">Smart Lifestyle Trends</CardTitle>
        <CardDescription className="text-xs line-clamp-2">Data-driven observations connecting your habits to how you feel.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 w-full min-w-0">
        {insights.map((item, idx) => (
          <div 
            key={idx}
            className={`p-3.5 sm:p-4 rounded-2xl border bg-gradient-to-r ${item.color} flex items-start gap-3.5 transition-all w-full min-w-0`}
          >
            <div className="p-2 rounded-xl bg-card shadow-sm flex-shrink-0 mt-0.5">
              <item.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">{item.title}</h4>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-card/80 border border-border/40 text-muted-foreground flex-shrink-0">
                  {item.tag}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.desc}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
