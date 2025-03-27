
// app/(app)/(protected)/watchcontests.tsx
import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";

export default function WatchContests() {
  const categories = [
    { id: "1", name: "Short-Film", route: "/(app)/(protected)/shortfilm" },
    { id: "2", name: "ChallengeStyle", route: "/(app)/(protected)/challengestyle" },
  ];

  const renderItem = ({ item }: { item: { id: string; name: string; route: string } }) => (
    <TouchableOpacity
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 8,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
      }}
      onPress={() => router.push(item.route)}
    >
      <Text style={{ fontSize: 18, color: "#333" }}>{item.name}</Text>
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
        Watch Contests
      </Text>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}