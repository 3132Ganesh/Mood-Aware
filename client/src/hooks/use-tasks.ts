import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useTasks() {
  return useQuery({
    queryKey: [api.tasks.list.path],
    queryFn: async () => {
      const res = await fetch(api.tasks.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return api.tasks.list.responses[200].parse(await res.json());
    },
  });
}

export function useCurrentPlan() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [api.plans.current.path],
    queryFn: async () => {
      const res = await fetch(api.plans.current.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch current plan");
      return api.plans.current.responses[200].parse(await res.json());
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(api.plans.generate.path, {
        method: api.plans.generate.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate plan");
      return api.plans.generate.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.plans.current.path] });
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ planId, taskId, isCompleted }: { planId: number; taskId: number; isCompleted: boolean }) => {
      const url = buildUrl(api.plans.completeTask.path, { id: planId, taskId });
      const res = await fetch(url, {
        method: api.plans.completeTask.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update task status");
      return api.plans.completeTask.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.plans.current.path] });
    },
  });

  return { 
    plan: query.data, 
    isLoading: query.isLoading, 
    generatePlan: generateMutation.mutate, 
    isGenerating: generateMutation.isPending,
    completeTask: completeTaskMutation.mutate,
  };
}
