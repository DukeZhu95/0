// screens/TermsOfServiceScreen.js
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { eulaText } from "@/constants/helper";

function TermsOfServiceScreen() {
  return (
    <View className="bg-background flex-1 px-4">
      <ScrollView>
        <Text className="text-base leading-6 text-justify text-primary">
          {eulaText}
        </Text>
      </ScrollView>
    </View>
  );
}

export default TermsOfServiceScreen;
