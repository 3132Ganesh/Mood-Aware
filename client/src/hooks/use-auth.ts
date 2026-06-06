import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useAuth() {
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (_event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      }
      if (_event === 'SIGNED_OUT') {
        queryClient.setQueryData([api.auth.me.path], null);
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const res = await fetch(api.auth.me.path, { 
        headers: { "Authorization": `Bearer ${session.access_token}` },
        credentials: "include" 
      });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.me.responses[200].parse(await res.json());
    },
    enabled: !!session,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.username,
        password: credentials.password,
      });
      if (error) throw error;
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      setLocation("/dashboard");
    },
  });

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    if (error) throw error;
  };

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.name
          }
        }
      });
      if (error) throw error;
      return data.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      setLocation("/onboarding");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      setLocation("/");
    },
  });

  return {
    user,
    isLoading: isLoading || (!!session && !user),
    error,
    login: loginMutation.mutate,
    loginWithGoogle,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutate,
  };
}

export function useProfile() {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: [api.profile.get.path],
    queryFn: async () => {
      const res = await fetch(api.profile.get.path, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch profile");
      return api.profile.get.responses[200].parse(await res.json());
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: any) => {
      // Note: any type here because complex nested JSON/arrays in profile
      const res = await fetch(api.profile.update.path, {
        method: api.profile.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return api.profile.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.setQueryData([api.profile.get.path], data);
    },
  });

  return { profile, isLoading, updateProfile };
}
