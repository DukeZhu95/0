import "../global.css";
import { Slot } from "expo-router";

import { SupabaseProvider } from "@/context/supabase-provider";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000,
          },
        },
      })
  );
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <SupabaseProvider>
          <Slot />
        </SupabaseProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
