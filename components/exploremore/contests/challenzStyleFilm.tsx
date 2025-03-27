// app/(app)/(protected)/challengestyle.tsx
import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";

export default function ChallengeStyle() {
  const subcategories = [
    {
      id: "1",
      name: "Collective Storytelling Challenge",
      description: "One Director Starts a Story, and Different Filmmakers Continue the Next Scene, Building a Community-Driven Film",
      category: "ChallengeStyle",
    },
  ];

  const renderItem = ({ item }: { item: { id: string; name: string; description: string; category: string } }) => (
    <TouchableOpacity
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
      }}
      onPress={() =>
        router.push({
          pathname: "/(app)/(protected)/contestdetails",
          params: { category: item.category, subcategory: item.name },
        })
      }
    >
      <Text style={{ fontSize: 18, fontWeight: "600", color: "#333" }}>{item.name}</Text>
      <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F4" }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          color: "#333",
          margin: 16,
        }}
      >
        ChallengeStyle
      </Text>
      <FlatList
        data={subcategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}