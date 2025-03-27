// components/AgeRestrictionModal.tsx
import { Modal, View, Text, TouchableOpacity } from "react-native";
import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";
import { useTranslation } from "react-i18next";

interface AgeRestrictionModalProps {
  visible: boolean;
  onClose: () => void;
}

export const AgeRestrictionModal = ({ visible, onClose }: AgeRestrictionModalProps) => {
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" }}>
        <View style={{ width: "80%", padding: 20, backgroundColor: colors[colorScheme]?.card, borderRadius: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, color: colors[colorScheme].primary, fontFamily: selectedFont }}>
            Sorry!
          </Text>
          <Text style={{ fontSize: 14, color: colors[colorScheme].mutedForeground, fontFamily: selectedFont }}>
            We do not have features for you yet. Maybe in a few years time!
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{ marginTop: 15, backgroundColor: colors[colorScheme].primary, padding: 10, borderRadius: 5, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontSize: 16, fontFamily: selectedFont }}>
              Got it!
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};