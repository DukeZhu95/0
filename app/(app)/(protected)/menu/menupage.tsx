// app/(app)/(protected)/menu.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Modal } from "react-native";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@/context/theme-context";
import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useSupabase } from "@/context/supabase-provider";
import { MenuOption } from "@/utils/types";
import CustomButton from "@/components/common/CustomButton";
import coinImage from "@/assets/icons/uwaciCoinsLogo.png";
import { Image } from "@/components/image";

export default function Menu() {
  const { signOut } = useSupabase();
  const [visible, setVisible] = useState(false);

  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();

  const menuOptions: MenuOption[] = [
    // {
    //   id: "1",
    //   title: t("menu.marketplace"),
    //   icon: "cart-outline",
    //   onPress: () => router.push("/market"),
    // },

    // {
    //   id: "2",
    //   title: t("menu.yourUwaciCoins"),
    //   icon: coinImage,
    //   onPress: () => router.push("/coin"),
    // },
    {
      id: "3",
      title: t("menu.notifications"),
      icon: "notifications-outline",
      onPress: () => router.push("menu/notifications"),
    },
    {
      id: "4",
      title: t("menu.faq"),
      icon: "book-outline",
      onPress: () => router.push("menu/faq"),
    },
    {
      id: "5",
      title: t("menu.settings"),
      icon: "settings-outline",
      onPress: () => router.push("/menu/settings"),
    },
    {
      id: "6",
      title: t("menu.savedChallenges"),
      icon: "bookmark-outline",
      onPress: () => router.push("menu/savedchallenges"),
    },
    {
      id: "7",
      title: t("menu.signOut"),
      icon: "log-out-outline",
      onPress: () => setVisible(true),
    },
  ];

  const renderOption = ({ item }: { item: MenuOption }) => (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 28,
        paddingHorizontal: 12,
        margin:8,
        borderRadius: 8,
        backgroundColor: colors[colorScheme]?.card,
      }}
      onPress={item.onPress}
      accessibilityLabel={item.title}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {typeof item.icon === "string" ? (
          <Ionicons
            name={item.icon}
            size={24}
            color={colors[colorScheme]?.cardForeground}
          />
        ) : (
          <Image
            source={item.icon}
            style={{
              width: 24,
              height: 24,
            }}
          />
        )}
        <Text
          style={[
            {
              marginLeft: 12,
              fontSize: 16,
              color: colors[colorScheme]?.cardForeground,
              fontFamily: selectedFont,
            },
          ]}
        >
          {item.title}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors[colorScheme]?.cardForeground}
      />
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        backgroundColor: colors[colorScheme]?.muted,
      }}
    >
      <FlatList
        data={menuOptions}
        keyExtractor={(item) => item.id}
        renderItem={renderOption}
        // ItemSeparatorComponent={() => (
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      {/* Custom Modal for Sign Out Confirmation */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "hsla(0, 0.00%, 0.00%, 0.50)", // Semi-transparent background
          }}
        >
          <View
            style={{
              backgroundColor: colors[colorScheme]?.background, // Default to light theme background
              padding: 20,
              borderRadius: 10,
              width: "80%",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                marginBottom: 10,
                color: colors[colorScheme]?.foreground, // Default to light theme foreground
              }}
            >
              {t("menu.confirmSignOut")}
            </Text>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 20,
                color: colors.light?.foreground, // Default to light theme foreground
              }}
            >
              {t("menu.areYouSureSignOut")}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <CustomButton
                title={t("menu.cancel")}
                handlePress={() => setVisible(false)}
                containerStyles="rounded-xl min-h-[52px] flex flex-row justify-center items-center"
                textStyles=" font-psemibold text-lg"
                style={{
                  flex: 1,
                  marginHorizontal: 5,
                  backgroundColor: colors[colorScheme]?.destructiveForeground,
                }}
              />
              <CustomButton
                title={t("menu.signOut")}
                handlePress={() => {
                  setVisible(false);
                  signOut();
                }}
                containerStyles="rounded-xl min-h-[52px] flex flex-row justify-center items-center"
                textStyles="text-white text-lg"
                style={{
                  flex: 1,
                  marginHorizontal: 5,
                  fontFamily: selectedFont,
                  backgroundColor: colors[colorScheme]?.destructive,
                  // color: colors[colorScheme]?.destructiveForeground,
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
