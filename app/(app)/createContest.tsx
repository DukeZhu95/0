//  app/(app)/contestform.tsx

import React from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";
import NewContestScreen from "@/components/exploremore/contests/createcontest";

export default function ContestCreate() {
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
      <NewContestScreen />
    </SafeAreaView>
  );
}
