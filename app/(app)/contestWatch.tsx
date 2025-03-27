//  app/(app)/contestWatch.tsx

import React from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";
import ContestWatchCategory from "@/components/exploremore/contests/watchCategory";

export default function Contestform() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();

  return (
    <SafeAreaView
      style={{
        backgroundColor: colors[colorScheme]?.foreground,
        fontFamily: selectedFont,
        height:"100%",
      }}
    >
      <ContestWatchCategory />
    </SafeAreaView>
  );
}
