// screens/PrivacyPolicyScreen.js

import React from "react";
import { ScrollView, Text, View } from "react-native";

import { privacyPolicyText } from "@/constants/helper";

function PrivacyPolicyScreen() {
  return (
    <View className="bg-background flex-1 px-4 py-4">
      <ScrollView>
        <Text className="text-base leading-6 text-primary text-justify">
          {privacyPolicyText}
        </Text>
      </ScrollView>
    </View>
  );
}

export default PrivacyPolicyScreen;
