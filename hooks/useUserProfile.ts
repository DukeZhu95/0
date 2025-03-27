// hooks/useUserProfile

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

export const useUserProfile = (userId?: string) => {
  return useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!userId, // Only run if user exists
    staleTime: 1000 * 60 * 60, // Cache for 60 minutes
  });
};
