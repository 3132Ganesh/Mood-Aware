import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertMoodLog, type InsertDailyHabit, type InsertFeelingsNote } from "@shared/routes";

export function useMood() {
  const queryClient = useQueryClient();

  const history = useQuery({
    queryKey: [api.mood.history.path],
    queryFn: async () => {
      const res = await fetch(api.mood.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch mood history");
      return api.mood.history.responses[200].parse(await res.json());
    },
  });

  const logMood = useMutation({
    mutationFn: async (data: InsertMoodLog) => {
      const res = await fetch(api.mood.log.path, {
        method: api.mood.log.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log mood");
      return api.mood.log.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.mood.history.path] });
    },
  });

  return { 
    history: history.data, 
    isLoading: history.isLoading, 
    logMood: logMood.mutate,
    isLogging: logMood.isPending 
  };
}

export function useHabits() {
  const queryClient = useQueryClient();

  const history = useQuery({
    queryKey: [api.habits.history.path],
    queryFn: async () => {
      const res = await fetch(api.habits.history.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch habit history");
      return api.habits.history.responses[200].parse(await res.json());
    },
  });

  const logHabit = useMutation({
    mutationFn: async (data: InsertDailyHabit) => {
      const res = await fetch(api.habits.log.path, {
        method: api.habits.log.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to log habit");
      return api.habits.log.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.habits.history.path] });
    },
  });

  return {
    history: history.data,
    isLoading: history.isLoading,
    logHabit: logHabit.mutate,
    isLogging: logHabit.isPending
  };
}

export function useFeelings() {
  const queryClient = useQueryClient();

  const notes = useQuery({
    queryKey: [api.notes.list.path],
    queryFn: async () => {
      const res = await fetch(api.notes.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notes");
      return api.notes.list.responses[200].parse(await res.json());
    },
  });

  const createNote = useMutation({
    mutationFn: async (data: InsertFeelingsNote) => {
      const res = await fetch(api.notes.create.path, {
        method: api.notes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create note");
      return api.notes.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.notes.list.path] });
    },
  });

  return {
    notes: notes.data,
    isLoading: notes.isLoading,
    createNote: createNote.mutate,
    isCreating: createNote.isPending
  };
}
