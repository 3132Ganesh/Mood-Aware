import { useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { SlidingCompanionDrawer } from "@/components/SlidingCompanionDrawer";
import { AgustNotificationCenter } from "@/components/agust/AgustNotificationCenter";
import { AgustOrb } from "@/components/agust/AgustOrb";
import { AgustChatDrawer } from "@/components/agust/AgustChatDrawer";
import { AgustModelStudio } from "@/components/agust/AgustModelStudio";
import { useCapacitorNotifications } from "@/hooks/use-capacitor-notifications";
import { Cpu } from "lucide-react";

import Landing from "@/pages/Landing";
import Onboarding from "@/pages/Onboarding";
import Dashboard from "@/pages/Dashboard";
import Planner from "@/pages/Planner";
import Checkin from "@/pages/Checkin";
import Feelings from "@/pages/Feelings";
import Analytics from "@/pages/Analytics";
import Breathing from "@/pages/Breathing";
import Profile from "@/pages/Profile";
import GoalHub from "@/pages/GoalHub";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isModelStudioOpen, setIsModelStudioOpen] = useState(false);
  // Schedule native Agust notifications (Android: @capacitor/local-notifications, Web: Web API)
  useCapacitorNotifications();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/onboarding">
          {() => <ProtectedRoute component={Onboarding} />}
        </Route>
        <Route path="/dashboard">
          {() => <ProtectedRoute component={Dashboard} />}
        </Route>
        <Route path="/planner">
          {() => <ProtectedRoute component={Planner} />}
        </Route>
        <Route path="/goals">
          {() => <ProtectedRoute component={GoalHub} />}
        </Route>
        <Route path="/checkin">
          {() => <ProtectedRoute component={Checkin} />}
        </Route>
        <Route path="/feelings">
          {() => <ProtectedRoute component={Feelings} />}
        </Route>
        <Route path="/analytics">
          {() => <ProtectedRoute component={Analytics} />}
        </Route>
        <Route path="/breathing">
          {() => <ProtectedRoute component={Breathing} />}
        </Route>
        <Route path="/profile">
          {() => <ProtectedRoute component={Profile} />}
        </Route>
        <Route path="/settings">
          {() => <ProtectedRoute component={Profile} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
      {user && <SlidingCompanionDrawer />}
      {/* Agust global overlay — notification bell + orb + model studio button, fixed top-right */}
      {user && (
        <>
          <div className="fixed top-4 right-16 z-[90] flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsModelStudioOpen(true)}
              className="p-2 rounded-2xl bg-card/90 backdrop-blur-md border border-border/80 text-muted-foreground hover:text-primary hover:border-primary/50 shadow-md transition-all active:scale-95 flex items-center gap-1.5 text-xs font-bold"
              title="Neural LLM Studio"
            >
              <Cpu className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">Model Studio</span>
            </button>
            <AgustNotificationCenter />
            <AgustOrb onClick={() => setIsChatOpen(true)} />
          </div>
          <AgustChatDrawer isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
          <AgustModelStudio open={isModelStudioOpen} onOpenChange={setIsModelStudioOpen} />
        </>
      )}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
