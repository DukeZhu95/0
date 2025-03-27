import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/context/theme-context";
import { colors } from "@/constants/colours";
import { Card } from "@/components/ui/card";
import { useFont } from "@/context/font-context";
import { useTranslation } from "react-i18next";
import { useSupabase } from "@/context/supabase-provider";

export default function Contest() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  const { profile } = useSupabase();

  const contestOptions = [
    { id: 1, label: "Create a Contest", route: "(app)/contestform" },
    { id: 2, label: "Watch Contests", route: "(app)/contestWatch" },
  ];
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors[colorScheme]?.foreground,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          color: colors[colorScheme]?.cardForeground,
          marginBottom: 16,
          fontFamily: selectedFont,
        }}
      >
        Contests
      </Text>
      {contestOptions.map((option) => (
        <Card
          key={option.id}
          variant="elevated"
          style={{
            backgroundColor: colors[colorScheme]?.background,
            marginBottom: 16,
            padding: 16,
            borderRadius: 8,
          }}
        >
          <TouchableOpacity
            style={{
              borderRadius: 8,

              justifyContent: "center",
              alignItems: "flex-start",
              paddingVertical: 12,
              paddingHorizontal: 16,
            }}
            onPress={() => router.push(`/${option.route}`)}
          >
            <Text
              className="uppercase"
              style={{
                color: colors[colorScheme]?.card,
                fontSize: 18,
                fontFamily: selectedFont,
              }}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        </Card>
      ))}
    </View>
  );
}
