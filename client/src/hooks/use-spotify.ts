import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useSpotifyMood() {
  const query = useQuery({
    queryKey: [api.spotify.mood.path],
    queryFn: async () => {
      const res = await fetch(api.spotify.mood.path, { credentials: "include" });
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error("Failed to fetch Spotify mood");
      }
      return api.spotify.mood.responses[200].parse(await res.json());
    },
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
