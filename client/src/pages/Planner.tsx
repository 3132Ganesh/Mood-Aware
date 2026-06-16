import { useCurrentPlan } from "@/hooks/use-tasks";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays, startOfWeek } from "date-fns";
import { Loader2, Plus, Calendar as CalendarIcon, Clock, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Planner() {
  const { plan, isLoading, generatePlan, isGenerating, completeTask } = useCurrentPlan();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [genStep, setGenStep] = useState(0);

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
    return d;
  });

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const tasksForDay = plan?.items.filter(item => {
    const itemDate = new Date(item.dayDate).toISOString().split('T')[0];
    return itemDate === selectedDateStr;
  }) || [];

  // Simulate AI generation steps
  useEffect(() => {
    if (isGenerating) {
      setGenStep(1);
      const t1 = setTimeout(() => setGenStep(2), 1500);
      const t2 = setTimeout(() => setGenStep(3), 3000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    } else {
      setGenStep(0);
    }
  }, [isGenerating]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex relative">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-6 pb-24 lg:pb-6 max-w-[1600px] mx-auto w-full">
        <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-display font-bold">Weekly Plan</h2>
            <p className="text-sm md:text-base text-muted-foreground">Balanced activities for your wellbeing.</p>
          </div>
          {!plan && !isGenerating && (
            <Button onClick={() => generatePlan()} className="w-full sm:w-auto btn-primary relative overflow-hidden group">
              <span className="relative z-10 flex items-center">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate AI Plan
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </Button>
          )}
        </header>

        {/* Date Selector */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-4 no-scrollbar">
          {days.map((date, i) => {
            const isSelected = format(date, "yyyy-MM-dd") === selectedDateStr;
            const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-2xl transition-all duration-300 border",
                  isSelected 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-110 z-10" 
                    : "bg-card text-muted-foreground border-border hover:bg-muted/50"
                )}
              >
                <span className="text-xs font-medium uppercase">{format(date, "EEE")}</span>
                <span className="text-xl font-bold mt-1">{format(date, "d")}</span>
                {isToday && <span className="w-1.5 h-1.5 bg-current rounded-full mt-1" />}
              </button>
            );
          })}
        </div>

        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm min-h-[400px] relative overflow-hidden">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Tasks for {format(selectedDate, "EEEE, MMMM do")}
            </h3>

            {isLoading && !isGenerating ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tasksForDay.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                key={selectedDateStr} // Forces re-animation on date change
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {tasksForDay.map((item) => (
                  <motion.div 
                    variants={itemVariants}
                    key={item.id}
                    className={cn(
                      "p-5 rounded-2xl border transition-all duration-300 relative overflow-hidden group",
                      item.isCompleted 
                        ? "bg-muted/30 border-transparent opacity-60" 
                        : "bg-card border-border hover:border-primary/40 hover:shadow-lg"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
                        item.task.category === 'mental' && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                        item.task.category === 'physical' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
                        item.task.category === 'music' && "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
                        item.task.category === 'game' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                      )}>
                        {item.task.category}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.task.duration} min
                      </span>
                    </div>
                    
                    <h4 className="font-bold text-lg mb-2">{item.task.title}</h4>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.task.description}</p>
                    
                    <Button 
                      onClick={() => completeTask({ planId: item.planId, taskId: item.taskId, isCompleted: !item.isCompleted })}
                      variant={item.isCompleted ? "outline" : "default"}
                      className={cn(
                        "w-full transition-all",
                        !item.isCompleted && "btn-primary"
                      )}
                    >
                      {item.isCompleted ? "Completed" : "Mark Complete"}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <Sparkles className="w-8 h-8 text-primary absolute -top-2 -right-2 animate-pulse" />
                  <CalendarIcon className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">A blank canvas</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  There are no scheduled activities for today. Relax, or let AI generate a balanced routine for you.
                </p>
                {!plan && !isGenerating && (
                  <Button onClick={() => generatePlan()} className="mt-8 btn-primary">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Plan
                  </Button>
                )}
              </motion.div>
            )}

            {/* AI Generation Overlay */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
                >
                  <div className="w-24 h-24 mb-8 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary"
                    />
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                  
                  <div className="h-8 overflow-hidden">
                    <AnimatePresence mode="wait">
                      {genStep === 1 && (
                        <motion.p key="1" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="text-lg font-medium">
                          Analyzing mood patterns...
                        </motion.p>
                      )}
                      {genStep === 2 && (
                        <motion.p key="2" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="text-lg font-medium text-primary">
                          Selecting balanced activities...
                        </motion.p>
                      )}
                      {genStep === 3 && (
                        <motion.p key="3" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className="text-lg font-medium text-emerald-500">
                          Finalizing your weekly plan...
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </main>
      <MobileNav />
    </div>
  );
}
