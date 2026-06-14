import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export interface NotionReflection {
  id: string;
  date: string;
  mood: string;
  notes: string;
  tags: string[];
}

export function useNotionReflections() {
  const { data: reflections, isLoading, error } = useQuery<NotionReflection[]>({
    queryKey: [api.notion.reflections.path],
    queryFn: async () => {
      const res = await fetch(api.notion.reflections.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch Notion reflections");
      const data = await res.json();
      return api.notion.reflections.responses[200].parse(data);
    },
  });

  return {
    reflections,
    isLoading,
    error,
  };
}
