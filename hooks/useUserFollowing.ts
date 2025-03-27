// hooks/useUserFollowing

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

export const useUserFollowing = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userFollowing", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
