import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/context/theme-context";
import { colors } from "@/constants/colours";
import { Card } from "@/components/ui/card";
import { useFont } from "@/context/font-context";

import { Ionicons } from "@expo/vector-icons";

const contestCategories = [
  {
    title: "Contest Categories",
    data: [
      "Entertainment, Creative, Artistic",
      "Education",
      "Animal & Environment",
      "Health, Fitness & Well-being",
      "Culture & Social Good",
      "Festivals",
    ],
  },
  { title: "Comedy", data: ["Comedy"] },
  { title: "Short-Films", data: ["Short-Films"] },
];

export default function ContestCategorySelect() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: colors[colorScheme]?.muted,
        padding: 16,
      }}
    >
      {contestCategories.map((section, index) => (
        <View
          key={index}
          style={{
            marginBottom: 16,
            backgroundColor: colors[colorScheme]?.muted,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              marginBottom: 8,
              color: colors[colorScheme]?.background,
            }}
          >
            {section.title}
          </Text>
          {section.data.map((category, idx) => (
            <Card
              key={idx}
              style={{
                backgroundColor: colors[colorScheme]?.card,
                padding: 16,
                borderRadius: 0,
              }}
            >
              <TouchableOpacity
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
                onPress={() => router.push(`/(app)/createContest?category=${encodeURIComponent(category)}`)}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: colors[colorScheme]?.cardForeground,
                  }}
                >
                  {category}
                </Text>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={colors[colorScheme]?.cardForeground}
                />
              </TouchableOpacity>
            </Card>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
