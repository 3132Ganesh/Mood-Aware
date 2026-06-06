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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl border-none shadow-2xl bg-card/50 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6 overflow-x-auto no-scrollbar pb-2">
            <div className="flex items-center min-w-max px-4">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <div className={`
                    w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-colors shrink-0
                    ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                  `}>
                    <s.icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-8 md:w-12 h-0.5 mx-1 md:mx-2 ${i < step ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <CardTitle className="text-2xl md:text-3xl font-display uppercase tracking-tight">{currentStep.title}</CardTitle>
          <CardDescription className="text-sm md:text-base">Let's personalize your experience.</CardDescription>
        </CardHeader>
        
        <CardContent className="p-4 md:p-6">
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
                              <SelectTrigger className="h-11 rounded-xl">
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
                          <FormLabel>Occupation Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl">
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sleepTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Typical Bedtime</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} value={field.value || ""} className="h-11 rounded-xl" />
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
                              <Input type="time" {...field} value={field.value || ""} className="h-11 rounded-xl" />
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
                              <SelectTrigger className="h-11 rounded-xl">
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
                          <FormLabel>Preferred Music App</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                            <FormControl>
                              <SelectTrigger>
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
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                          <FormControl>
                            <Checkbox
                              checked={field.value || false}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>I play video games to relax</FormLabel>
                            <FormDescription>
                              We'll suggest gaming breaks if checked.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 mb-4">
                      <p className="text-sm text-primary flex items-center gap-2">
                        <Quote className="w-4 h-4" />
                        Connect Notion to see your reflections in the app.
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name="notionToken"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notion Integration Token</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="secret_..." {...field} value={field.value || ""} />
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
                          <FormLabel>Mood Reflections Database ID</FormLabel>
                          <FormControl>
                            <Input placeholder="32-character ID" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormDescription>
                            Found in the database URL.
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </motion.div>

              <div className="flex justify-between pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                >
                  Back
                </Button>
                <Button type="submit" className="btn-primary">
                  {updateProfile.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  ) : step === steps.length - 1 ? (
                    "Complete Setup"
                  ) : (
                    "Next"
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
