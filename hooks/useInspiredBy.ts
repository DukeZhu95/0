import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase"; // Ensure correct path

interface InspiredBy {
  title: string;
  username: string;
  profile_picture_url: string;
}

export const useInspiredBy = (challengeId: string | null) => {
  return useQuery<InspiredBy | null, Error>({
    queryKey: ["inspired-by", challengeId],
    queryFn: async () => {
      if (!challengeId) return null;
      try {
        const { data, error } = await supabase
          .from("challenges")
          .select(
            `
            inspired_by_id,
            inspired_by:users!challenges_inspected_by_id_fkey(username, profile_picture_url)
            `
          )
          .eq("id", challengeId)
          .single();

        if (error) {
          throw error;
        }

        return {
          title: data.inspired_by?.username,
          username: data.inspired_by?.username,
          profile_picture_url: data.inspired_by?.profile_picture_url,
        };
      } catch (error: any) {
        console.error("Error fetching inspired_by data:", error.message);
        throw error;
      }
    },
    enabled: !!challengeId, // Only fetch if challengeId is available
  });
};
