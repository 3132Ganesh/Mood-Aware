import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Sparkles, Heart, Brain, Wind, ShieldCheck, 
  CheckCircle2, Laptop, Smartphone, Lock, ArrowRight, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Schema for login form
const loginSchema = z.object({
  username: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

export default function Landing() {
  const [activeTab, setActiveTab] = useState("login");
  const { user, login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: { email: "", password: "", name: "" },
  });

  function onLogin(data: any) {
    login(data);
  }

  function onRegister(data: any) {
    register(data);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-primary/5 via-background to-secondary/10 flex flex-col justify-between">

      {/* ========================================================================= */}
      {/* 1. LAPTOP SCREEN UI (Visible on screens >= 1024px)                        */}
      {/* ========================================================================= */}
      <div className="hidden lg:block max-w-7xl w-full mx-auto p-10 my-auto">
        <div className="grid grid-cols-12 gap-12 items-center">
          
          {/* Left 7 Columns: Product Hero & Live Feature Matrix */}
          <div className="col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-xl shadow-md shadow-primary/20 text-white">
                🌿
              </div>
              <span className="text-xl font-display font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                MoodAware
              </span>
              <Badge variant="outline" className="ml-2 rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                AI Wellness Ecosystem
              </Badge>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground tracking-tight leading-tight">
                Find Balance in Your <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Daily Rhythm</span>.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
                Personalized AI wellness plans, guided circadian sleep calibration, mood swing tracking, and mindful breathwork.
              </p>
            </div>

            {/* Feature Showcase Grid */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-card/70 border border-border/50 shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">AI Predictive Insights</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Forecasts burnout triggers and personalizes 7-day schedules.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card/70 border border-border/50 shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Vagus Nerve Breathing</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Interactive rhythm orb to reduce heart rate in 60s.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card/70 border border-border/50 shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Live Mood Garden</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Your emotions bloom into a flourishing visual flower ecosystem.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-card/70 border border-border/50 shadow-sm flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Intraday Shift Logging</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Track spontaneous emotional swings with trigger tags.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Authentication Studio */}
          <div className="col-span-5">
            <Card className="border-border/50 shadow-2xl shadow-black/5 backdrop-blur-xl bg-card/90 rounded-3xl p-6">
              <CardHeader className="p-0 pb-4 text-center">
                <CardTitle className="text-2xl font-display font-bold">Welcome to MoodAware</CardTitle>
                <CardDescription className="text-xs">
                  Sign in or create your private wellness account
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 rounded-2xl p-1 bg-muted/60">
                    <TabsTrigger value="login" className="rounded-xl text-xs font-semibold">Sign In</TabsTrigger>
                    <TabsTrigger value="register" className="rounded-xl text-xs font-semibold">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Email</FormLabel>
                              <FormControl>
                                <Input placeholder="hello@example.com" {...field} className="rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} className="rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {loginError && (
                          <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-xl">
                            {loginError.message}
                          </p>
                        )}
                        <Button type="submit" disabled={isLoggingIn} className="w-full btn-primary rounded-2xl h-11 text-xs font-bold shadow-md shadow-primary/20">
                          {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Sign In to Your Space
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3.5">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Your Name" {...field} className="rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="hello@example.com" {...field} className="rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-semibold">Create Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} className="rounded-xl" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {registerError && (
                          <p className="text-xs text-destructive font-medium bg-destructive/10 p-2.5 rounded-xl">
                            {registerError.message}
                          </p>
                        )}
                        <Button type="submit" disabled={isRegistering} className="w-full btn-primary rounded-2xl h-11 text-xs font-bold shadow-md shadow-primary/20">
                          {isRegistering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Create Free Account
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>


      {/* ========================================================================= */}
      {/* 2. MOBILE SCREEN UI (Visible on screens < 1024px)                        */}
      {/* ========================================================================= */}
      <div className="lg:hidden w-full max-w-md mx-auto p-5 my-auto space-y-6">
        
        {/* Mobile Header Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-primary to-accent rounded-2xl mx-auto shadow-lg shadow-primary/25 flex items-center justify-center text-2xl text-white">
            🌿
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            MoodAware
          </h1>
          <p className="text-xs text-muted-foreground">
            Find balance in your daily emotional rhythm.
          </p>
        </div>

        {/* Mobile Auth Card */}
        <Card className="border-border/50 shadow-xl bg-card/95 rounded-3xl p-5">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4 rounded-xl p-1 bg-muted/60">
              <TabsTrigger value="login" className="rounded-lg text-xs font-semibold">Sign In</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg text-xs font-semibold">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-3.5">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="hello@example.com" {...field} className="rounded-xl text-xs h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="rounded-xl text-xs h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {loginError && (
                    <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
                      {loginError.message}
                    </p>
                  )}
                  <Button type="submit" disabled={isLoggingIn} className="w-full btn-primary rounded-xl h-10 text-xs font-bold">
                    {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    Sign In
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="register">
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-3">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your Name" {...field} className="rounded-xl text-xs h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Email</FormLabel>
                        <FormControl>
                          <Input placeholder="hello@example.com" {...field} className="rounded-xl text-xs h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} className="rounded-xl text-xs h-10" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {registerError && (
                    <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-lg">
                      {registerError.message}
                    </p>
                  )}
                  <Button type="submit" disabled={isRegistering} className="w-full btn-primary rounded-xl h-10 text-xs font-bold">
                    {isRegistering ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    Sign Up
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </Card>

      </div>

      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border/20">
        MoodAware © 2026 • Private & Secure Wellness Sanctuary
      </footer>
    </div>
  );
}
