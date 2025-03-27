// screens/TermsOfServiceScreen.js

import React from "react";
import { ScrollView, Text, View } from "react-native";

import { termsOfServiceText } from "@/constants/helper";

function TermsOfServiceScreen() {
  return (
    <View className="bg-background flex-1 px-4">
      <ScrollView>
        <Text className="text-base leading-6 text-justify text-primary">
          {termsOfServiceText}
        </Text>
      </ScrollView>
    </View>
  );
}

export default TermsOfServiceScreen;
