// hooks/useUserJoinedChallenges

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

export const useUserJoinedChallenges = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userJoinedChallenges", userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("challenge_id")
        .eq("user_id", userId);
      if (error) throw error;
      return data.map((c) => c.challenge_id);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
