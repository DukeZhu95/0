//
// lib/useColorScheme.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

import { colors } from "@/constants/colours";

const THEME_KEY = "app_theme";

export function useColorScheme() {
  const [colorScheme, setColorScheme] = useState<keyof typeof colors>("light");

  // Load theme from AsyncStorage
  useEffect(() => {
    (async () => {
      const savedTheme = await AsyncStorage.getItem(THEME_KEY);
      if (savedTheme) setColorScheme(savedTheme);
    })();
  }, []);

  // Save theme to AsyncStorage
  const setCustomColorScheme = async (scheme: keyof typeof colors) => {
    setColorScheme(scheme);
    await AsyncStorage.setItem(THEME_KEY, scheme);
  };

  return {
    colorScheme,
    setCustomColorScheme,
  };
}
