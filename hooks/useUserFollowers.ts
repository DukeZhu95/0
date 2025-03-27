// hooks/useUserFollowers

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

export const useUserFollowers = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userFollowers", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("following_id", userId);

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
