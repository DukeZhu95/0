// hooks/useUserLikes

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

export const useUserLikes = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userLikes", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId, // Only run when userId exists
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
