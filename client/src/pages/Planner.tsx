import { useCurrentPlan } from "@/hooks/use-tasks";
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format, addDays, startOfWeek } from "date-fns";
import { Loader2, Plus, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Planner() {
  const { plan, isLoading, generatePlan, isGenerating, completeTask } = useCurrentPlan();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
    return d;
  });

  // Filter tasks for selected date
  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const tasksForDay = plan?.items.filter(item => {
    const itemDate = new Date(item.dayDate).toISOString().split('T')[0];
    return itemDate === selectedDateStr;
  }) || [];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-6 pb-24 lg:pb-6 max-w-[1600px] mx-auto w-full">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-display font-bold">Weekly Plan</h2>
            <p className="text-muted-foreground">Balanced activities for your wellbeing.</p>
          </div>
          {!plan && (
            <Button onClick={() => generatePlan()} disabled={isGenerating} className="btn-primary">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              Generate New Plan
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
                  "flex flex-col items-center justify-center min-w-[4.5rem] h-20 rounded-2xl transition-all duration-200 border",
                  isSelected 
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-105" 
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

        <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm min-h-[400px]">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Tasks for {format(selectedDate, "EEEE, MMMM do")}
            </h3>

            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tasksForDay.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasksForDay.map((item) => (
                  <div 
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold text-foreground">No tasks for this day</h3>
                <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                  Relax! There are no scheduled activities for today. Or generate a new plan if you want to get active.
                </p>
                {!plan && (
                  <Button onClick={() => generatePlan()} disabled={isGenerating} className="mt-6 btn-primary">
                    Generate Plan
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <MobileNav />
    </div>
  );
}
