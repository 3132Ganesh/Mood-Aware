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
  });

  return {
    reflections,
    isLoading,
    error,
  };
}
