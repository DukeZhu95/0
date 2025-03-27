import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/theme-context";
import { colors } from "@/constants/colours";
import { useTranslation } from "react-i18next";
import { useFont } from "@/context/font-context";

export default function TermsAndPolicies() {
  const { colorScheme } = useTheme();
  const { t } = useTranslation();
  const { selectedFont } = useFont();

  // 🔥 Define the options for Terms, Privacy Policy, and EULA
  const policyOptions = [
    {
      id: "1",
      title: t("settings.termsOfService"),
      icon: "document-text-outline",
      onPress: () => router.push("/terms"),
    },
    {
      id: "2",
      title: t("settings.privacyPolicy"),
      icon: "shield-checkmark-outline",
      onPress: () => router.push("/privacy"),
    },
    {
      id: "3",
      title: t("settings.eulaAgreement"),
      icon: "information-circle-outline",
      onPress: () => router.push("/eula"),
    },
  ];

  // 🔥 Render each policy item
  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={{
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 20,
        borderBottomWidth: 1,
        backgroundColor: colors[colorScheme]?.card,
        borderBottomColor: colors[colorScheme]?.border,
      }}
      onPress={item.onPress}
    >
      <Ionicons
        name={item.icon}
        size={24}
        color={colors[colorScheme]?.secondaryForeground}
      />
      <Text
        style={{
          marginLeft: 12,
          fontSize: 16,
          color: colors[colorScheme]?.secondaryForeground,
          fontFamily: selectedFont,
        }}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors[colorScheme]?.muted }}
    >
      <FlatList
        data={policyOptions}
        keyExtractor={(item) => item.id}
        renderItem={renderOption}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}
