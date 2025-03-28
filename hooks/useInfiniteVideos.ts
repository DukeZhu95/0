// hooks/useInfiniteVideos

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

interface Creator {
  username: string;
  id: string;
  profile_picture_url?: string;
}

interface InspiredBy {
  title: string;
  username: string;
  profile_picture_url: string;
}

interface BasePost {
  id: string;
  video_url: string;
  title: string;
  description: string;
  created_at: string;
  creator: Creator | null;
}

interface Submission extends BasePost {
  type: "submission";
}

interface Challenge extends BasePost {
  type: "challenge";
  inspired_by_id?: string | null;
  inspired_by?: InspiredBy;
}

type Post = Submission | Challenge;

const PAGE_SIZE = 15; // Adjust to optimize scrolling

async function fetchVideos({ pageParam = 0 }: { pageParam: number }) {
  try {
    const [submissionsResult, challengesResult] = await Promise.all([
      supabase
        .from("submissions")
        .select(
          `
          id, video_url, title, description, created_at,
          creator:users!submissions_user_id_fkey(username, id)
        `
        )
        .eq("is_contest_submission", false)
        .order("created_at", { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1),

      supabase
        .from("challenges")
        .select(
          `
    id, video_url, title, description, created_at,
    creator:users!challenges_creator_id_fkey(username, id),
    inspired_by_id
  `
        )
        .order("created_at", { ascending: false })
        .range(pageParam * PAGE_SIZE, (pageParam + 1) * PAGE_SIZE - 1),
    ]);

    if (submissionsResult.error) throw submissionsResult.error;
    if (challengesResult.error) throw challengesResult.error;

    const submissions = submissionsResult.data || [];
    const challenges = challengesResult.data || [];

    if (__DEV__) {
      console.log("Fetched submissions:", submissions);
      // console.log("Fetched challenges:", challenges);
      // console.log("Merged & Sorted Videos:", allVideos);
    }

    const allVideos: Post[] = [
      ...submissions.map((s) => ({ ...s, type: "submission" })),
      ...challenges.map((c) => ({ ...c, type: "challenge" })),
    ].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return {
      data: allVideos,
      nextPage: allVideos.length === PAGE_SIZE ? pageParam + 1 : undefined,
    };
  } catch (error) {
    console.error("Error fetching videos:", error);
    throw error;
  }
}

export function useInfiniteVideos() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["videos"],
    queryFn: fetchVideos,
    initialPageParam: 0, // ✅ Fix: Add initialPageParam
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 60 * 1000,
    retry: 3, // Automatically retry up to 3 times before failing
    refetchOnWindowFocus: false, // Prevents unnecessary refetching when switching tabs
  });
  // ✅ Prefetch the next page for smoother scrolling
  if (query.data?.pages) {
    const lastPage = query.data.pages[query.data.pages.length - 1];
    if (lastPage?.nextPage) {
      queryClient.prefetchQuery({
        queryKey: ["videos", lastPage.nextPage],
        queryFn: () => fetchVideos({ pageParam: lastPage.nextPage }),
      });
    }
  }

  return query;
}
