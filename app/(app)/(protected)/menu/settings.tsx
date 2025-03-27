// app/(app)/(protected)/settings.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Alert,
  FlatList,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/theme-context";
import { colors } from "@/constants/colours";
import { useTranslation } from "react-i18next";
import { useSupabase } from "@/context/supabase-provider";
import { useFont } from "@/context/font-context";
import { useLanguage } from "@/context/language-context";
import { fonts } from "@/constants/fonts";
import { H1 } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { languages, themes } from "@/constants/helper";

export default function Settings() {
  const { deleteOwnAccount } = useSupabase();

  const { colorScheme, setCustomColorScheme } = useTheme();
  const { selectedFont, setSelectedFont } = useFont();
  const { t } = useTranslation();
  const { setLanguage } = useLanguage();
  const fontOptions = Object.keys(fonts);

  const [fontModalVisible, setFontModalVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Account");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  // Handlers
  const handleFontSelect = (fontKey) => {
    setSelectedFont(fonts[fontKey]);
    Alert.alert(
      t("settings.fontSelected"),
      `${fontKey} ${t("settings.asYourFont")}.`
    );
    setFontModalVisible(false);
  };

  const handleLanguageSelect = (languageCode) => {
    setLanguage(languageCode);
    const selectedLang = languages.find((lang) => lang.code === languageCode);
    Alert.alert(
      t("settings.languageSelected"),
      `${selectedLang.label} ${t("settings.asYourLanguage")}.`
    );
    setLanguageModalVisible(false);
  };

  const handleThemeSelect = (theme) => {
    setCustomColorScheme(theme);
    Alert.alert(
      t("settings.themeSelected"),
      `${theme} ${t("settings.asYourTheme")}.`
    );
    setThemeModalVisible(false);
  };

  const confirmDeleteAccount = async () => {
    try {
      await deleteOwnAccount();
      setDeleteModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to delete your account.");
    }
  };
  const accountOptions = [
    // {
    //   id: "1",
    //   title: t("settings.passwordSecurity"),
    //   icon: "lock-closed-outline",
    //   onPress: () => router.push("/password-security"),
    // },
    {
      id: "2",
      title: t("settings.personalDetails"),
      icon: "person-outline",
      onPress: () => router.push("./profile"),
    },

    {
      id: "3",
      title: t("settings.blockedUsers"),
      icon: "ban",
      onPress: () => router.push("/blocked"),
    },
    {
      id: "4",
      title: t("accountDetails.deleteAccountModal.title"),
      icon: "checkmark-circle-outline",
      iconType: "DeleteAccount",
      onPress: () => setDeleteModalVisible(true),
    },
    // {
    //   id: "4",
    //   title: t("settings.paymentMethods"),
    //   icon: "card-outline",
    //   onPress: () => router.push("/(app)/(protected)/payment/payment"),
    // },
    // {
    //   id: "5",
    //   title: t("settings.adPreferences"),
    //   icon: "campaign",
    //   iconType: "MaterialIcons",
    //   onPress: () => router.push("/ad-preferences"),
    // },
    // {
    //   id: "6",
    //   title: t("settings.upgradePremium"),
    //   icon: "star-half-outline",
    //   onPress: () => router.push("/upgrade-premium"),
    // },
  ];

  const contentOptions = [
    // {
    //   id: "7",
    //   title: t("settings.savedDraft"),
    //   icon: "document-text-outline",
    //   onPress: () => router.push("/saved-draft"),
    // },
    // {
    //   id: "8",
    //   title: t("settings.yourActivity"),
    //   icon: "time-outline",
    //   onPress: () => router.push("/your-activity"),
    // },
    // {
    //   id: "9",
    //   title: t("settings.notifications"),
    //   icon: "notifications-outline",
    //   onPress: () => router.push("/notifications"),
    // },
    {
      id: "10",
      title: t("settings.themes"),
      icon: "color-palette-outline",
      onPress: () => setThemeModalVisible(true),
    },
    {
      id: "11",
      title: t("settings.fonts"),
      icon: "text-outline",
      onPress: () => setFontModalVisible(true),
    },
    {
      id: "12",
      title: t("settings.language"),
      icon: "language-outline",
      onPress: () => setLanguageModalVisible(true),
    },
    // {
    //   id: "13",
    //   title: t("settings.accessibility"),
    //   icon: "accessibility-outline",
    //   onPress: () => router.push("/accessibility"),
    // },
  ];

  const privacyOptions = [
    // {
    //   id: "14",
    //   title: t("settings.privateAccount"),
    //   icon: "lock-closed-outline",
    //   onPress: () => router.push("/private-account"),
    // },
    // {
    //   id: "15",
    //   title: t("settings.comments"),
    //   icon: "chatbubble-ellipses-outline",
    //   onPress: () => router.push("/comments"),
    // },
    // {
    //   id: "16",
    //   title: t("settings.directMessaging"),
    //   icon: "chatbox-ellipses-outline",
    //   onPress: () => router.push("/direct-messaging"),
    // },
    // {
    //   id: "17",
    //   title: t("settings.blockedReports"),
    //   icon: "alert-circle-outline",
    //   onPress: () => router.push("/blocked-reports"),
    // },
    {
      id: "18",
      title: t("settings.termsPolicies"),
      icon: "document-text-outline",
      onPress: () => router.push("./terms-policies"),
    },
    // {
    //   id: "19",
    //   title: t("settings.switchAccount"),
    //   icon: "swap-horizontal-outline",
    //   onPress: () => router.push("/switch-account"),
    // },
  ];

  const renderOption = ({ item }) => (
    <TouchableOpacity
      style={{
        paddingHorizontal: 36,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 25,
        marginHorizontal: 16,
        marginVertical: 2,
        borderRadius: 4,
        borderBottomWidth: 1,
        backgroundColor: colors[colorScheme]?.card,
        borderBottomColor: colors[colorScheme]?.border,
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
        {item.iconType === "MaterialIcons" ? (
          <MaterialIcons
            name={item.icon}
            size={24}
            color={colors[colorScheme]?.secondaryForeground}
          />
        ) : item.iconType === "DeleteAccount" ? (
          <MaterialCommunityIcons
            name="delete-forever"
            size={20}
            color={colors[colorScheme]?.destructive}
          />
        ) : (
          <Ionicons
            name={item.icon}
            size={24}
            color={colors[colorScheme]?.secondaryForeground}
          />
        )}
        {item.iconType === "DeleteAccount" ? (
          <Text
            style={{
              marginLeft: 12,
              fontSize: 16,
              fontWeight: "bold",
              color: colors[colorScheme]?.destructive,
              fontFamily: selectedFont,
            }}
          >
            {item.title}
          </Text>
        ) : (
          <Text
            style={{
              marginLeft: 12,
              fontSize: 16,
              color: colors[colorScheme]?.secondaryForeground,
              fontFamily: selectedFont,
            }}
          >
            {item.title}
          </Text>
        )}
      </View>
      {item.iconType !== "DeleteAccount" &&  (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors[colorScheme]?.secondaryForeground}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors[colorScheme]?.muted,
      }}
    >
      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingVertical: 8,
          backgroundColor: colors[colorScheme]?.muted,
        }}
      >
        {["Account", "Content", "Privacy"].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor:
                selectedTab === tab
                  ? colors[colorScheme]?.foreground
                  : "transparent",
              borderBottomWidth: selectedTab === tab ? 2 : 0,
              borderBottomColor:
                selectedTab === tab
                  ? colors[colorScheme]?.background
                  : "transparent",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                fontFamily: selectedFont,
                color:
                  selectedTab === tab
                    ? colors[colorScheme]?.background
                    : colors[colorScheme]?.secondaryForeground,
              }}
            >
              {t(`settings.${tab.toLowerCase()}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Options */}
      {selectedTab === "Account" && (
        <FlatList
          data={accountOptions}
          keyExtractor={(item) => item.id}
          renderItem={renderOption}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
      {selectedTab === "Content" && (
        <FlatList
          data={contentOptions}
          keyExtractor={(item) => item.id}
          renderItem={renderOption}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
      {selectedTab === "Privacy" && (
        <FlatList
          data={privacyOptions}
          keyExtractor={(item) => item.id}
          renderItem={renderOption}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      {/* Logout Button */}
      {/* <TouchableOpacity
        style={{
          margin: 16,
          padding: 12,
          // backgroundColor: colors[colorScheme]?.destructive,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors[colorScheme]?.background,
        }}
        onPress={() => signOut()}
      >
        <Text
          style={{
            color: colors[colorScheme]?.background,
            textAlign: "center",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          {t("settings.signOut")}
        </Text>
      </TouchableOpacity> */}

      {/* Logout Button */}
      {/* <TouchableOpacity
        style={{ margin: 16, padding: 12, borderRadius: 8 }}
        onPress={() => setDeleteModalVisible(true)}
      >
        <Text
          style={{
            color: colors[colorScheme]?.destructive,
            textAlign: "center",
            fontSize: 16,
            fontWeight: "bold",
          }}
        >
          {t("accountDetails.deleteAccount")}
        </Text>
      </TouchableOpacity> */}

      {/* Font Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={fontModalVisible}
        onRequestClose={() => setFontModalVisible(false)}
      >
        <View
          style={[
            {
              flex: 1,
              padding: 16,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
            },
            // { backgroundColor: colors[colorScheme]?.muted },
          ]}
        >
          <View
            style={[
              {
                width: "100%",
                maxHeight: "80%",
                // backgroundColor: "#fff",
                borderRadius: 10,
                padding: 20,
              },
              { backgroundColor: colors[colorScheme]?.background },
            ]}
          >
            <Text
              style={[
                {
                  fontSize: 20,
                  marginBottom: 20,
                  textAlign: "center",

                  color: colors[colorScheme]?.foreground,
                  fontFamily: selectedFont,
                },
              ]}
            >
              {t("settings.selectFont")}
            </Text>
            <FlatList
              data={fontOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    {
                      paddingVertical: 12,
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => handleFontSelect(item)}
                  accessibilityLabel={`Select ${item} font`}
                >
                  <Text
                    style={[
                      {
                        fontSize: 16,
                      },
                      { fontFamily: fonts[item] },
                      { color: colors[colorScheme]?.foreground },
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              style={{ marginBottom: 20 }}
            />
            <Button
              onPress={() => setFontModalVisible(false)}
              style={[
                {
                  backgroundColor: "#e53935",
                  paddingVertical: 12,
                  borderRadius: 5,
                },
              ]}
            >
              <Text
                style={[
                  {
                    color: "#fff",
                    textAlign: "center",
                    fontSize: 16,
                  },
                  { fontFamily: selectedFont },
                ]}
              >
                {t("settings.cancel")}
              </Text>
            </Button>
          </View>
        </View>
      </Modal>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View
          style={[
            {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: 16,
              // opacity: 0.9,
            },
            // { backgroundColor: colors[colorScheme]?.muted },
          ]}
        >
          <View
            style={[
              {
                width: "100%",
                maxHeight: "80%",
                // backgroundColor: "#fff",
                borderRadius: 10,
                padding: 20,
              },
              { backgroundColor: colors[colorScheme]?.background },
            ]}
          >
            <H1
              style={[
                {
                  fontSize: 20,
                  marginBottom: 20,
                  textAlign: "center",
                },
                { color: colors[colorScheme]?.foreground },
                { fontFamily: selectedFont },
              ]}
            >
              {t("settings.selectLanguage")}
            </H1>
            <FlatList
              data={languages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    {
                      paddingVertical: 12,
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => handleLanguageSelect(item.code)}
                  accessibilityLabel={`Select ${item.label} language`}
                >
                  <Text
                    style={[
                      {
                        fontSize: 16,
                      },
                      { color: colors[colorScheme]?.foreground },
                      { fontFamily: fonts[item] },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              style={{ marginBottom: 20 }}
            />
            <Button
              onPress={() => setLanguageModalVisible(false)}
              style={[
                {
                  backgroundColor: "#e53935",
                  paddingVertical: 12,
                  borderRadius: 5,
                },
              ]}
            >
              <Text
                style={[
                  {
                    color: "#fff",
                    textAlign: "center",
                    fontSize: 16,
                  },
                  { fontFamily: selectedFont },
                ]}
              >
                {t("settings.cancel")}
              </Text>
            </Button>
          </View>
        </View>
      </Modal>

      {/* Theme Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={themeModalVisible}
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <View
          style={[
            {
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0,0,0,0.5)",
              padding: 16,
              opacity: 0.95,
            },
          ]}
        >
          <View
            style={[
              {
                width: "100%",
                maxHeight: "80%",
                // backgroundColor: "#fff",
                borderRadius: 10,
                padding: 20,
              },
              { backgroundColor: colors[colorScheme]?.background },
            ]}
          >
            <H1
              style={[
                {
                  fontSize: 20,
                  marginBottom: 20,
                  textAlign: "center",
                },
                { color: colors[colorScheme]?.foreground },
                { fontFamily: selectedFont },
              ]}
            >
              {t("settings.selectTheme")}
            </H1>
            <FlatList
              data={themes}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    {
                      paddingVertical: 12,
                      alignItems: "center",
                    },
                  ]}
                  onPress={() => handleThemeSelect(item)}
                  accessibilityLabel={`Select ${item} theme`}
                >
                  <Text
                    style={[
                      {
                        fontSize: 16,
                        color: colors[colorScheme]?.foreground,
                        fontFamily: fonts[item],
                      },
                    ]}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </TouchableOpacity>
              )}
              style={[{ marginBottom: 20 }]}
            />
            <Button
              onPress={() => setThemeModalVisible(false)}
              style={[
                {
                  backgroundColor: "#e53935",
                  paddingVertical: 12,
                  borderRadius: 5,
                },
                { backgroundColor: colors[colorScheme]?.destructive },
              ]}
            >
              <Text
                style={[
                  {
                    color: "#fff",
                    textAlign: "center",
                    fontSize: 16,
                  },
                  { color: colors[colorScheme]?.destructiveForeground },
                  { fontFamily: selectedFont },
                ]}
              >
                {t("settings.cancel")}
              </Text>
            </Button>
          </View>
        </View>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={deleteModalVisible}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
            padding: 16,
          }}
        >
          <View
            style={{
              width: "90%",
              backgroundColor: colors[colorScheme]?.destructiveForeground,
              padding: 20,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "center",
                color: colors[colorScheme]?.destructive,
              }}
            >
              {t("accountDetails.deleteAccountModal.title")}
            </Text>
            <Text
              style={{
                marginTop: 10,
                textAlign: "center",
                color: colors[colorScheme]?.secondaryForeground,
              }}
            >
              {t("accountDetails.deleteAccountModal.message")}
            </Text>

            <View
              style={{
                flexDirection: "row",
                marginTop: 15,
                width: "100%",
                justifyContent: "space-between",
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors[colorScheme]?.mutedForeground,
                  padding: 10,
                  borderRadius: 5,
                  alignItems: "center",
                  marginRight: 5,
                }}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text
                  style={{
                    color: colors[colorScheme]?.muted,
                    fontSize: 16,
                  }}
                >
                  {t("accountDetails.deleteAccountModal.cancel")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDeleteAccount}
                style={{
                  flex: 1,
                  backgroundColor: colors[colorScheme]?.destructive,
                  padding: 10,
                  borderRadius: 5,
                  alignItems: "center",
                  marginLeft: 5,
                }}
              >
                <Text
                  style={{
                    color: colors[colorScheme]?.destructiveForeground,
                    fontSize: 16,
                  }}
                >
                  {t("accountDetails.deleteAccountModal.delete")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
