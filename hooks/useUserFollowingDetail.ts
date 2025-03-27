// hooks/useUserFollowingDetails.ts

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

export const useUserFollowingDetails = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["userFollowingDetails", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("follows")
        .select(
          `
          following_id,
          users:following_id (
            id,
            username,
            profile_picture_url
          )
        `
        )
        .eq("follower_id", userId);

      if (error) throw error;

      return data.map((item) => ({
        id: item.users.id,
        username: item.users.username,
        profile_picture_url: item.users.profile_picture_url,
      }));
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};
