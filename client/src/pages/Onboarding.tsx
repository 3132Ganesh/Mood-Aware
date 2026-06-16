import { useState } from "react";
import { useProfile } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserProfileSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Music, Gamepad2, Clock, Moon, Sparkles, Quote } from "lucide-react";

const steps = [
  { id: "basic", title: "About You", icon: Clock },
  { id: "lifestyle", title: "Lifestyle", icon: Moon },
  { id: "interests", title: "Interests", icon: Music },
  { id: "integrations", title: "Integrations", icon: Sparkles },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [_, setLocation] = useLocation();
  const { updateProfile } = useProfile();
  
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
      musicMoods: [],
      playsGames: false,
      gamePlatforms: [],
      gameTypes: [],
      notionToken: "",
      notionDatabaseId: "",
    },
  });

  const onSubmit = async (data: any) => {
    if (step < steps.length - 1) {
      setStep(step + 1);
      return;
    }
    
    try {
      await updateProfile.mutateAsync(data);
      setLocation("/dashboard");
    } catch (error) {
      console.error("Profile update failed", error);
    }
  };

  const currentStep = steps[step];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fdfdfc] dark:bg-background p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-2xl bg-white dark:bg-card border-2 border-black/10 dark:border-white/10 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] rounded-2xl overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-8 overflow-x-auto no-scrollbar pb-2">
              <div className="flex items-center min-w-max">
                {steps.map((s, i) => (
                  <div key={s.id} className="flex items-center">
                    <motion.div 
                      whileHover={{ scale: 1.05 }}
                      className={`
                      w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center transition-all duration-300 shrink-0 font-bold border-2
                      ${i === step ? "bg-black text-white border-black dark:bg-white dark:text-black dark:border-white" : 
                        i < step ? "bg-black/5 text-black border-black/20 dark:bg-white/5 dark:text-white dark:border-white/20" : 
                        "bg-transparent text-muted-foreground border-muted"}
                    `}>
                      <s.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </motion.div>
                    {i < steps.length - 1 && (
                      <div className={`w-8 md:w-16 h-[2px] mx-2 ${i < step ? "bg-black/20 dark:bg-white/20" : "bg-muted"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
            <motion.h1 
              key={`title-${step}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-black uppercase tracking-tighter"
            >
              {currentStep.title}
            </motion.h1>
            <p className="text-muted-foreground mt-2 font-medium">Let's personalize your baseline.</p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {step === 0 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="ageGroup"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-sm uppercase tracking-wider">Age Group</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="h-14 rounded-xl border-2 border-input focus:border-primary bg-transparent text-lg">
                                <SelectValue placeholder="Select age range" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                          <FormLabel className="font-bold text-sm uppercase tracking-wider">Occupation Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="h-14 rounded-xl border-2 border-input focus:border-primary bg-transparent text-lg">
                                <SelectValue placeholder="Select work type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="sleepTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-sm uppercase tracking-wider">Typical Bedtime</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ""} className="h-14 rounded-xl border-2 text-lg" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="wakeTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-bold text-sm uppercase tracking-wider">Typical Wake Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ""} className="h-14 rounded-xl border-2 text-lg" />
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
                          <FormLabel className="font-bold text-sm uppercase tracking-wider">Activity Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="h-14 rounded-xl border-2 border-input focus:border-primary bg-transparent text-lg">
                                <SelectValue placeholder="How active are you?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                          <FormLabel className="font-bold text-sm uppercase tracking-wider">Preferred Music App</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="h-14 rounded-xl border-2 border-input focus:border-primary bg-transparent text-lg">
                                <SelectValue placeholder="Select app" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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
                        <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-xl border-2 p-6 shadow-sm cursor-pointer hover:bg-muted/50 transition-colors">
                          <FormControl>
                            <Checkbox
                              className="w-6 h-6 rounded-md border-2"
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="font-bold text-lg cursor-pointer">I play video games to relax</FormLabel>
                            <FormDescription className="text-sm">
                              We'll integrate gaming breaks into your AI planner.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <div className="bg-black text-white dark:bg-white dark:text-black p-6 rounded-xl mb-6">
                      <p className="font-bold flex items-center gap-3 text-lg">
                        <Sparkles className="w-5 h-5" />
                        Optional Integrations
                      </p>
                      <p className="opacity-80 mt-2 text-sm">Connect external apps to enrich your mood data.</p>
                    </div>
                    <FormField
                      control={form.control}
                      name="notionToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-sm uppercase tracking-wider">Notion Integration Token</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="secret_..." {...field} value={field.value || ""} className="h-14 rounded-xl border-2" />
                          </FormControl>
                          <FormDescription>
                            Create an integration at developers.notion.com
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="notionDatabaseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-bold text-sm uppercase tracking-wider">Notion Database ID</FormLabel>
                          <FormControl>
                            <Input placeholder="32-character ID" {...field} value={field.value || ""} className="h-14 rounded-xl border-2" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </motion.div>

              <div className="flex justify-between pt-8 border-t-2 mt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="h-14 px-8 rounded-xl font-bold uppercase tracking-wide border-2 hover:bg-muted"
                >
                  Back
                </Button>
                <Button type="submit" className="h-14 px-10 rounded-xl font-bold uppercase tracking-wide bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] transition-all">
                  {updateProfile.isPending ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 
                  ) : step === steps.length - 1 ? (
                    "Complete Setup"
                  ) : (
                    "Next Step"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
