import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserProfileSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Music, Clock, Moon, MessageSquareHeart, Sparkles, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = [
  { id: "basic", title: "About You", icon: Clock },
  { id: "lifestyle", title: "Lifestyle", icon: Moon },
  { id: "interests", title: "Interests", icon: Music },
  { id: "feedback", title: "Feedback & Goals", icon: MessageSquareHeart },
];

const FEEDBACK_TAGS = [
  { emoji: "🤩", label: "Loving it" },
  { emoji: "🌿", label: "Mindfulness" },
  { emoji: "💪", label: "Better Habits" },
  { emoji: "😴", label: "Better Sleep" },
  { emoji: "💡", label: "Have Suggestions" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [_, setLocation] = useLocation();
  const { profile, updateProfile } = useProfile();
  
  const form = useForm({
    resolver: zodResolver(insertUserProfileSchema),
    defaultValues: {
      ageGroup: "",
      occupation: "",
      sleepTime: "",
      wakeTime: "",
      breakFrequency: "",
      caffeineIntake: "",
      physicalActivity: "",
      musicApp: "",
      musicMoods: [] as string[],
      playsGames: false,
      gamePlatforms: [] as string[],
      gameTypes: [] as string[],
      feedback: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        ageGroup: profile.ageGroup || "",
        occupation: profile.occupation || "",
        sleepTime: profile.sleepTime || "",
        wakeTime: profile.wakeTime || "",
        breakFrequency: profile.breakFrequency || "",
        caffeineIntake: profile.caffeineIntake || "",
        physicalActivity: profile.physicalActivity || "",
        musicApp: profile.musicApp || "",
        musicMoods: (profile.musicMoods as string[]) || [],
        playsGames: profile.playsGames || false,
        gamePlatforms: (profile.gamePlatforms as string[]) || [],
        gameTypes: (profile.gameTypes as string[]) || [],
        feedback: profile.feedback || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: any) => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    
    try {
      // Append tag if selected
      const finalData = {
        ...data,
        feedback: selectedTag 
          ? (data.feedback ? `[${selectedTag}] ${data.feedback}` : `[${selectedTag}]`) 
          : (data.feedback || "")
      };

      await updateProfile.mutateAsync(finalData);
      setLocation("/dashboard");
    } catch (error) {
      console.error("Profile update failed", error);
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6">
      <Card className="w-full max-w-2xl border-none shadow-2xl bg-card/70 backdrop-blur-xl rounded-3xl overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center items-center mb-4">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={cn(
                    "w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center transition-all duration-300",
                    i === step 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                      : i < step 
                        ? "bg-primary/20 text-primary cursor-pointer hover:bg-primary/30" 
                        : "bg-muted/60 text-muted-foreground opacity-50"
                  )}
                >
                  <s.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                {i < steps.length - 1 && (
                  <div className={cn(
                    "w-8 sm:w-12 h-1 mx-1.5 sm:mx-2 rounded-full transition-colors duration-300",
                    i < step ? "bg-primary" : "bg-muted/80"
                  )} />
                )}
              </div>
            ))}
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-display font-bold">{currentStep.title}</CardTitle>
          <CardDescription>
            {step === 3 
              ? "We'd love to hear your thoughts, expectations, or wellness goals!" 
              : "Let's personalize your daily wellness experience."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 0 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="ageGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age Group</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select age range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="18-24">18-24</SelectItem>
                              <SelectItem value="25-34">25-34</SelectItem>
                              <SelectItem value="35-44">35-44</SelectItem>
                              <SelectItem value="45+">45+</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select work type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="student">Student</SelectItem>
                              <SelectItem value="office">Office / Desk Job</SelectItem>
                              <SelectItem value="physical">Physical Labor</SelectItem>
                              <SelectItem value="creative">Creative / Arts</SelectItem>
                              <SelectItem value="tech">Tech / Engineering</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sleepTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Typical Bedtime</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ""} className="rounded-xl" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="wakeTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Typical Wake Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ""} className="rounded-xl" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="physicalActivity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="How active are you?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="sedentary">Sedentary (Little exercise)</SelectItem>
                              <SelectItem value="moderate">Moderate (1-2 times/week)</SelectItem>
                              <SelectItem value="active">Active (3-5 times/week)</SelectItem>
                              <SelectItem value="athlete">Athlete (Daily)</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="musicApp"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Music App</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="Select app" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-2xl">
                              <SelectItem value="spotify">Spotify</SelectItem>
                              <SelectItem value="apple">Apple Music</SelectItem>
                              <SelectItem value="youtube">YouTube Music</SelectItem>
                              <SelectItem value="none">I don't listen to music</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="playsGames"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border border-border/80 p-4 shadow-sm bg-muted/20">
                          <FormControl>
                            <Checkbox
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-medium text-sm">I play games to relax</FormLabel>
                            <FormDescription className="text-xs">
                              We'll suggest quick puzzle or gaming breaks in your plan.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-5">
                    <div>
                      <FormLabel className="text-sm font-semibold">What is your primary wellness goal?</FormLabel>
                      <p className="text-xs text-muted-foreground mb-3">Select what matters most to you</p>
                      <div className="flex flex-wrap gap-2">
                        {FEEDBACK_TAGS.map((tag) => {
                          const isSelected = selectedTag === tag.label;
                          return (
                            <button
                              key={tag.label}
                              type="button"
                              onClick={() => setSelectedTag(isSelected ? "" : tag.label)}
                              className={cn(
                                "flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border text-xs font-semibold transition-all active:scale-95",
                                isSelected
                                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20 scale-105"
                                  : "bg-muted/30 border-border/70 text-foreground hover:bg-muted/60"
                              )}
                            >
                              <span>{tag.emoji}</span>
                              <span>{tag.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="feedback"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold">Feedback & Suggestions (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Any feedback on the setup, features you'd like to see, or notes on your health goals?"
                              className="min-h-[130px] rounded-2xl resize-none text-sm leading-relaxed"
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormDescription className="text-xs text-muted-foreground">
                            Your feedback helps us tailor your wellness journey and improve the app.
                          </FormDescription>
                        </FormItem>
                      )}
                    />

                    <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-foreground/90 font-medium">
                        You're all set! We will generate a customized 7-day wellness action plan for you.
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              <div className="flex justify-between pt-4 border-t border-border/40">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="rounded-xl px-5"
                >
                  Back
                </Button>
                <Button type="submit" className="btn-primary rounded-xl px-6 font-semibold shadow-md shadow-primary/25">
                  {updateProfile.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  ) : step === steps.length - 1 ? (
                    "Complete & Open App 🚀"
                  ) : (
                    "Next →"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
