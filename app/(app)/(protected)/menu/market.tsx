import { View, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "@/components/safe-area-view";
import { H2 } from "@/components/ui/typography";
import MarketScreen from "@/components/exploremore/marketplace/marketplace";
import { colors } from "@/constants/colours";
import { useTheme } from "@/context/theme-context";
import { useFont } from "@/context/font-context";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
// import useHandleBackPress from "@/hooks/useHandleBackPress";
import { useSupabase } from "@/context/supabase-provider";

export default function Market() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  const { user } = useSupabase();
  // const handleBackPress = useHandleBackPress();
  return (
    <SafeAreaView style={{ backgroundColor: colors[colorScheme]?.background }}>
      {/* <View className="flex-row pt-[10px]">
        <TouchableOpacity
          onPress={() => handleBackPress({ pathname: "/settings" })}
          className="pl-2"
          accessibilityLabel={t("goBack")}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={colors[colorScheme]?.primary}
          />
        </TouchableOpacity>
        <H2
          style={{
            color: colors[colorScheme]?.foreground,
            fontFamily: selectedFont,
          }}
          className="px-4"
        >
          Market Place
        </H2>
      </View> */}
      <MarketScreen />
    </SafeAreaView>
  );
}