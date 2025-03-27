// app/(app)/(protected)/shortfilm.tsx
import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";

export default function ShortFilm() {
  const subcategories = [
    {
      id: "1",
      name: "Freestyle Short-Films",
      description: "Create Anything, No Rules, No Limits, Just Pure Filmmaking Freedom",
      category: "Short-Film",
    },
    {
      id: "2",
      name: "ChallengeStyle Short-Films",
      description: "Tap on Genre Based Challenges and Contests to Test Your Creativity",
      category: "Short-Film",
    },
    {
      id: "3",
      name: "24-Hour Film Challenge",
      description: "Create a Short-Film Based on a Theme in 24 Hours",
      category: "Short-Film",
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
        Short-Film
      </Text>
      <FlatList
        data={subcategories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}