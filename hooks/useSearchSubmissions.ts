import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";

export const useSearchSubmissions = (searchTerm?: string) => {
  return useQuery({
    queryKey: ["submissions", searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const { data, error } = await supabase
        .from("submissions")
        .select(`
          id,
          video_url,
          title,
          description,
          created_at,
          user_id,
          challenge_id,
          creator:users!user_id(
            id,
            username,
            first_name,
            last_name,
            profile_picture_url
          ),
          challenge:challenges!challenge_id(
            id,
            title
          )
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(20)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!searchTerm,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};