import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertMoodLog, type InsertMoodSwing, type InsertDailyHabit, type InsertFeelingsNote } from "@shared/routes";

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
      if (!res.ok) {
        let errorMsg = "Failed to log mood";
        try {
          const err = await res.json();
          errorMsg = err.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      return api.mood.log.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.mood.history.path] });
    },
  });

  return { 
    history: history.data, 
    isLoading: history.isLoading, 
    logMood: logMood.mutateAsync,
    isLogging: logMood.isPending 
  };
}

export function useMoodSwings(date?: string) {
  const queryClient = useQueryClient();

  const swings = useQuery({
    queryKey: date ? [api.mood.swingsHistory.path, date] : [api.mood.swingsHistory.path],
    queryFn: async () => {
      const url = date 
        ? `${api.mood.swingsHistory.path}?date=${encodeURIComponent(date)}` 
        : api.mood.swingsHistory.path;
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch mood swings");
      return api.mood.swingsHistory.responses[200].parse(await res.json());
    },
  });

  const logSwing = useMutation({
    mutationFn: async (data: InsertMoodSwing) => {
      const res = await fetch(api.mood.logSwing.path, {
        method: api.mood.logSwing.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) {
        let errorMsg = "Failed to record mood swing";
        try {
          const err = await res.json();
          errorMsg = err.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      return api.mood.logSwing.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.mood.swingsHistory.path] });
      queryClient.invalidateQueries({ queryKey: [api.mood.history.path] });
    },
  });

  return {
    swings: swings.data,
    isLoading: swings.isLoading,
    logSwing: logSwing.mutateAsync,
    isLogging: logSwing.isPending,
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
      if (!res.ok) {
        let errorMsg = "Failed to log habit";
        try {
          const err = await res.json();
          errorMsg = err.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      return api.habits.log.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.habits.history.path] });
    },
  });

  return { 
    history: history.data, 
    isLoading: history.isLoading, 
    logHabit: logHabit.mutateAsync,
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

export function useCapsules() {
  const queryClient = useQueryClient();

  const capsules = useQuery({
    queryKey: [api.capsules.list.path],
    queryFn: async () => {
      const res = await fetch(api.capsules.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch time capsules");
      return api.capsules.list.responses[200].parse(await res.json());
    },
  });

  const undelivered = useQuery({
    queryKey: [api.capsules.undelivered.path],
    queryFn: async () => {
      const res = await fetch(api.capsules.undelivered.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch undelivered capsule");
      return api.capsules.undelivered.responses[200].parse(await res.json());
    },
  });

  const createCapsule = useMutation({
    mutationFn: async (data: { message: string; moodScore: number }) => {
      const res = await fetch(api.capsules.create.path, {
        method: api.capsules.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create time capsule");
      return api.capsules.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.capsules.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.capsules.undelivered.path] });
    },
  });

  const markDelivered = useMutation({
    mutationFn: async (id: number) => {
      const path = api.capsules.markDelivered.path.replace(":id", String(id));
      const res = await fetch(path, {
        method: api.capsules.markDelivered.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to mark capsule delivered");
      return api.capsules.markDelivered.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.capsules.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.capsules.undelivered.path] });
    },
  });

  return {
    capsules: capsules.data,
    undeliveredCapsule: undelivered.data,
    createCapsule: createCapsule.mutate,
    isCreating: createCapsule.isPending,
    markDelivered: markDelivered.mutate,
  };
}

