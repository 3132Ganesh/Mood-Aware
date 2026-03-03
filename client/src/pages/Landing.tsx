import { useState } from "react";
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
import { Loader2 } from "lucide-react";

// Schema for login form (subset of insertUserSchema)
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"), // schema says username but auth uses email... wait schema changed to email
  // Actually schema has `email`, `password`, `name`. Let's assume login uses email.
  // Wait, backend route /api/login expects { username, password } but users table has email.
  // The provided code snippet in `shared/routes.ts` says `username` in input but user table has `email`. 
  // I will follow the `shared/routes.ts` contract exactly: { username, password }.
  password: z.string().min(1, "Password is required"),
});

export default function Landing() {
  const [activeTab, setActiveTab] = useState("login");
  const { login, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
  const [_, setLocation] = useLocation();

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
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/10 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block"
          >
            {/* Abstract logo representation */}
            <div className="w-16 h-16 bg-gradient-to-tr from-primary to-accent rounded-2xl mx-auto shadow-xl shadow-primary/20 flex items-center justify-center">
              <span className="text-3xl">🌿</span>
            </div>
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">
            MoodAware
          </h1>
          <p className="text-muted-foreground text-lg">
            Find balance in your daily rhythm.
          </p>
        </div>

        <Card className="border-border/50 shadow-xl shadow-black/5 backdrop-blur-sm bg-white/80 dark:bg-black/50">
          <CardHeader>
            <CardTitle>Welcome</CardTitle>
            <CardDescription>
              Sign in to track your mood and get personalized plans.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="hello@example.com" {...field} className="input-field" />
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="input-field" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {loginError && (
                      <p className="text-sm text-destructive font-medium text-center">
                        {loginError.message}
                      </p>
                    )}
                    <Button type="submit" className="w-full btn-primary" disabled={isLoggingIn}>
                      {isLoggingIn ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Sign In
                    </Button>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register">
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} className="input-field" />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="hello@example.com" {...field} className="input-field" />
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} className="input-field" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {registerError && (
                      <p className="text-sm text-destructive font-medium text-center">
                        {registerError.message}
                      </p>
                    )}
                    <Button type="submit" className="w-full btn-primary" disabled={isRegistering}>
                      {isRegistering ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Create Account
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
