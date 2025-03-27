import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { SafeAreaView } from "@/components/safe-area-view";
import { faqData } from "@/constants/helper";

export default function FAQScreen() {
  const router = useRouter();

  const FAQItem = ({ question, answer }) => (
    <View style={styles.faqItem}>
      <Text style={styles.question}>{question}</Text>
      <Text style={styles.answer}>{answer}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
      >
        {faqData.map((faq, index) => (
          <FAQItem key={index} question={faq.question} answer={faq.answer} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E293B", // Dark background
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#334155", // Slightly lighter dark background
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  faqItem: {
    backgroundColor: "#334155", // Card background
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  question: {
    color: "#10B981", // Accent color
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  answer: {
    color: "#94A3B8", // Muted text color
    fontSize: 16,
    lineHeight: 24,
  },
});
