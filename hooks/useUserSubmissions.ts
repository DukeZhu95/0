// hooks/useUserSubmissions

import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

const PAGE_SIZE = 10; // Number of posts per page

export const useUserSubmissions = (userId?: string) => {
  return useInfiniteQuery({
    queryKey: ["userSubmissions", userId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("submissions")
        .select("id, video_url, title, description, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1); // Pagination

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
    initialPageParam: 0, // ✅ REQUIRED to fix the error
    getNextPageParam: (lastPage, pages) =>
      lastPage.length ? pages.length : undefined,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
