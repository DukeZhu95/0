import { useEffect, useState } from "react";
import { supabase } from "@/config/supabase";

export const useMarketplaceItems = (searchTerm: string) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("marketplace_items")
        .select("*")
        .ilike("description", `%${searchTerm}%`) // Case-insensitive search for "font" or "theme"
        .order("name", { ascending: true }); // Order alphabetically

      if (error) {
        console.error(
          `Error fetching marketplace items for ${searchTerm}:`,
          error,
        );
        setError("Failed to fetch marketplace items");
        setItems([]);
      } else {
        setItems(data || []);
      }
    } catch (error) {
      console.error("Unexpected error fetching items:", error);
      setError("Unexpected error occurred");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchTerm]); // Re-fetch when search term changes

  return { items, loading, error, refreshItems: fetchItems };
};