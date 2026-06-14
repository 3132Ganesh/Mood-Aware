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
  const { login, loginWithGoogle, register, isLoggingIn, isRegistering, loginError, registerError } = useAuth();
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
            <div className="space-y-6">
              <Button 
                variant="outline" 
                className="w-full h-11 border-border/50 bg-background hover:bg-muted/50 transition-colors"
                onClick={() => loginWithGoogle()}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                </div>
              </div>

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
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
