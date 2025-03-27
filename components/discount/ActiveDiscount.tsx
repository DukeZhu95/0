import React from "react";
import { View, Text, ScrollView } from "react-native";

const DiscountCard = ({
  backgroundColor,
  offerText,
  discountText,
  availableText,
  brandText,
}) => {
  return (
    <View
      style={{
        padding: 20,
        borderRadius: 10,
        marginBottom: 15,
        backgroundColor,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      }}
    >
      <Text style={{ color: "#FF4A4A", fontSize: 12, fontWeight: "bold" }}>
        {offerText}
      </Text>
      <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 5 }}>
        {discountText}
      </Text>
      <Text style={{ fontSize: 12, color: "#666", marginTop: 3 }}>
        {availableText}
      </Text>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          textAlign: "right",
          marginTop: 5,
        }}
      >
        {brandText}
      </Text>
    </View>
  );
};

const ActiveDiscountsScreen = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F4", padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
        Active Discounts
      </Text>
      <ScrollView style={{ flex: 1 }}>
        <DiscountCard
          backgroundColor="#D4FB5E"
          offerText="OFFER"
          discountText="UWACI COINS DISCOUNT"
          availableText="AVAILABLE NOW"
          brandText="BOTANIC GARDENS"
        />
        <DiscountCard
          backgroundColor="#000"
          offerText="OFFER"
          discountText="UWACI COINS DISCOUNT"
          availableText="AVAILABLE NOW"
          brandText="APPLE"
        />
        <DiscountCard
          backgroundColor="#2B5D75"
          offerText="OFFER"
          discountText="UWACI COINS DISCOUNT"
          availableText="AVAILABLE NOW"
          brandText="MOST POPULAR"
        />
      </ScrollView>
    </View>
  );
};

export default ActiveDiscountsScreen;
