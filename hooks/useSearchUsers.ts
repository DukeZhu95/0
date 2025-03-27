import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

export const useSearchUsers = (searchTerm?: string) => {
  return useQuery({
    queryKey: ["users", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .or(
          `username.ilike.%${searchTerm}%,first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`
        )
        .limit(20)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};