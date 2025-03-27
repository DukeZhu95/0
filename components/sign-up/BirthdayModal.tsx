// components/BirthdayModal.tsx
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";
import { useTranslation } from "react-i18next";
import { Link } from "expo-router";

interface BirthdayModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BirthdayModal = ({ visible, onClose }: BirthdayModalProps) => {
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
            Why do we ask for your birthday?
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors[colorScheme].mutedForeground,
              fontFamily: selectedFont,
            }}
          >
            We require your birthday to ensure compliance with age restrictions,
            provide an age-appropriate experience, and enhance account security.
            For more details about your account security, please check our
            <Link
              style={{ fontWeight: "600", color: "#aa32a0" }}
              href="/privacy"
            >
              {" "}
              Privacy Policy.
            </Link>
          </Text>
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
              Got it!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};