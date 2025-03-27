import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

export const useSearchChallenges = (searchTerm?: string) => {
  return useQuery({
    queryKey: ["challenges", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(20)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};