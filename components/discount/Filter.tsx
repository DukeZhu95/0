import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FilterScreen = () => {
  const [selectedOption, setSelectedOption] = useState("View All");

  const options = [
    "View All",
    "Active Discounts",
    "New Available Discounts",
    "Available At All Times",
  ];

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F4", padding: 20 }}>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          marginBottom: 10,
          color: "#666",
        }}
      >
        View Store Discounts
      </Text>
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 10,
          paddingVertical: 10,
        }}
      >
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedOption(option)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 15,
              paddingHorizontal: 20,
              borderBottomWidth: index !== options.length - 1 ? 1 : 0,
              borderBottomColor: "#E0E0E0",
            }}
          >
            <Text style={{ fontSize: 16, color: "#000" }}>{option}</Text>
            {selectedOption === option && (
              <Ionicons name="radio-button-on" size={24} color="#1F4D5D" />
            )}
            {selectedOption !== option && (
              <Ionicons name="radio-button-off" size={24} color="#A9BCC6" />
            )}
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <TouchableOpacity
          style={{
            backgroundColor: "#1F4D5D",
            padding: 15,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16, fontWeight: "bold" }}>
            Save changes
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FilterScreen;
