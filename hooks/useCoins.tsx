import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";

export const useCoins = () => {
  const [coins, setCoins] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCoins = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (user && user.user) {
        const { data, error } = await supabase
          .from("users")
          .select("coins")
          .eq("id", user.user.id)
          .single();

        if (error) {
          console.error("Error fetching coins:", error);
          setError("Failed to fetch coins");
          setCoins(null);
        } else {
          setCoins(data?.coins || 0);
        }
      }
    } catch (error) {
      console.error("Unexpected error fetching coins:", error);
      setError("Unexpected error occurred");
      setCoins(null);
    } finally {
      setLoading(false);
    }
  };

  const updateCoins = async (newAmount: number) => {
    setLoading(true);
    setError(null);
    try {
      const { data: user, error: userError } = await supabase.auth.getUser();
      if (user && user.user) {
        const { error } = await supabase
          .from("users")
          .update({ coins: newAmount })
          .eq("id", user.user.id);

        if (error) {
          console.error("Error updating coins:", error);
          setError("Failed to update coins");
        } else {
          setCoins(newAmount); // Update local state after successful update
        }
      }
    } catch (error) {
      console.error("Unexpected error updating coins:", error);
      setError("Unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  return { coins, loading, error, refreshCoins: fetchCoins, updateCoins };
};