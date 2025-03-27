// hooks/usePreloadFirstVideo.ts
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { Video } from "expo-av";

async function preloadFirstVideo() {
  try {
    const { data, error } = await supabase
      .from("submissions") // Prioritize submissions, adjust as needed
      .select(
        `
        id, video_url, title, description, created_at,
        creator:users!submissions_user_id_fkey(username, id)
      `
      )
      .eq("is_contest_submission", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    const videoData = { ...data, type: "submission" as const };
    const video = new Video({ uri: videoData.video_url });
    await video.loadAsync({ uri: videoData.video_url }, { shouldPlay: false });

    return videoData;
  } catch (error) {
    console.error("Error preloading first video:", error);
    throw error;
  }
}

export function usePreloadFirstVideo() {
  return useQuery({
    queryKey: ["firstVideo"],
    queryFn: preloadFirstVideo,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1, // Retry once before failing
  });
}
