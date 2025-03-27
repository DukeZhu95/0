// components/ContestRulesModal.tsx
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";
import { useTranslation } from "react-i18next";

interface ContestRulesModalProps {
  visible: boolean;
  onClose: () => void;
}

export const ContestRulesModal = ({
  visible,
  onClose,
}: ContestRulesModalProps) => {
  const { selectedFont } = useFont();
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal
      //   animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.5)",
        }}
      >
        <View
          style={{
            width: "80%",
            padding: 20,
            backgroundColor: colors[colorScheme]?.card,
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 10,
              color: colors[colorScheme].primary,
              fontFamily: selectedFont,
            }}
          >
            Challenge & Contest Rules
          </Text>
          <ScrollView style={{ maxHeight: 400 }}>
            <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
              1. Creating a Challenge
            </Text>
            <Text>
              - Any user can create a challenge and post it on Challenz.
            </Text>
            <Text>
              - Challenges can be open-ended or have a specific theme.
            </Text>
            <Text>
              - A clear title, description, and instructions are required.
            </Text>
            <Text>- The creator sets a time limit for participation.</Text>
            <Text>- Once posted, users can join and submit entries.</Text>
            <Text>- Winning challenges get more visibility.</Text>

            <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
              2. Creating a Contest
            </Text>
            <Text>- A contest is a structured challenge with a theme.</Text>
            <Text>- Users can create contests and invite participants.</Text>
            <Text>
              - Engagement (views, likes, comments) determines rankings.
            </Text>
            <Text>- The creator cannot modify rankings after submission.</Text>

            <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
              3. Entering a Challenge or Contest
            </Text>
            <Text>- Users can join by submitting their entry.</Text>
            <Text>- Entries must follow challenge guidelines.</Text>
            <Text>- Engagement determines rankings.</Text>
            <Text>
              - The top 10 ranked participants enter the Winning Zone.
            </Text>

            <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
              4. Winning and Visibility
            </Text>
            <Text>- The top 10 ranked entries receive increased exposure.</Text>
            <Text>
              - Challenz may feature top challenges for further visibility.
            </Text>

            <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
              5. Disqualification & Content Moderation
            </Text>
            <Text>- Entries must follow community guidelines.</Text>
            <Text>
              - Hate speech, violence, harassment, explicit, or illegal content
              is removed.
            </Text>
            <Text>
              - Fake engagement (spam, bots) leads to disqualification.
            </Text>
            <Text>- Manipulating rankings may result in suspension.</Text>
            <Text>
              - Challenz reserves the right to remove any violating content.
            </Text>

            <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
              6. Disclaimer
            </Text>
            <Text>
              The organization of challenges and contests is independent and is
              not sponsored, endorsed, or affiliated with Apple in any way.
            </Text>
          </ScrollView>
          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 15,
              backgroundColor: colors[colorScheme].primary,
              padding: 10,
              borderRadius: 5,
              alignItems: "center",
            }}
          >
            <Text
              style={{ color: "#fff", fontSize: 16, fontFamily: selectedFont }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
