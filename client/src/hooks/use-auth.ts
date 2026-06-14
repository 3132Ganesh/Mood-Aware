import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertUser } from "@shared/routes";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function useAuth() {
  const queryClient = useQueryClient();
  const [_, setLocation] = useLocation();

  const { data: user, isLoading, error } = useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path, { credentials: "include" });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error("Failed to fetch user");
      return api.auth.me.responses[200].parse(await res.json());
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username: credentials.username,
          password: credentials.password,
          redirect: "false",
        }),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (!res.ok || data.error || (data.url && data.url.includes("error="))) {
        throw new Error("Invalid email or password");
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      setLocation("/dashboard");
    },
  });

  const loginWithGoogle = () => {
    // Auth.js handles the OAuth flow via redirects
    window.location.href = "/api/auth/signin/google";
  };

  const registerMutation = useMutation({
    mutationFn: async (userData: InsertUser) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }
      return res.json();
    },
    onSuccess: () => {
      setLocation("/onboarding");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await fetch("/api/auth/signout", { method: "POST" });
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null);
      setLocation("/");
    },
  });

  return {
    user,
    isLoading,
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
