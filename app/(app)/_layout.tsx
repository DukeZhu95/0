// import { View, Text } from 'react-native'
// import React from 'react'

// export default function _layout() {
//   return (


//     <View>
//       <Text>_layout</Text>
//     </View>


//   )
// }


import React, { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { ThemeProvider, useTheme } from "@/context/theme-context";
import { FontProvider, useFont } from "@/context/font-context";
import { StatusBar } from "expo-status-bar";
import { LanguageProvider } from "@/context/language-context";
import { colors } from "@/constants/colours";
import { useTranslation } from "react-i18next";
import { TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Updates from 'expo-updates';
import UpdateModal from "@/components/common/UpdateModal";

export default function AppLayout() {
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState<boolean>(false);
  const [isStoreUpdateRequired, setIsStoreUpdateRequired] = useState<boolean>(false);

  useEffect(() => {
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      if (!__DEV__) { // Skip in development mode
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          setIsUpdateModalVisible(true);
          setIsStoreUpdateRequired(false); // OTA update
        }
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      checkForStoreUpdate(); // Fallback to store update check
    }
  };

  const checkForStoreUpdate = async () => {
    // Placeholder for server-side version check
    const currentVersion = require('../../app.json').expo.version; // e.g., "1.0.0"
    const latestVersion = '1.0.1'; // Replace with API call to your server
    if (currentVersion !== latestVersion) {
      setIsUpdateModalVisible(true);
      setIsStoreUpdateRequired(true);
    }
  };

  const handleUpdateModalClose = () => {
    setIsUpdateModalVisible(false);
    if (!isStoreUpdateRequired) {
      Updates.reloadAsync().catch((err) => console.error('Error reloading app:', err));
    }
  };


  return (
    <LanguageProvider>
      <FontProvider>
        <ThemeProvider>
          <AppStack />
          <UpdateModal
              visible={isUpdateModalVisible}
              onClose={handleUpdateModalClose}
              isStoreUpdate={isStoreUpdateRequired}
            />
        </ThemeProvider>
      </FontProvider>
    </LanguageProvider>
  );
}

function AppStack() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,
          gestureEnabled: true,
          headerStyle: {
            backgroundColor: colors[colorScheme]?.background,
          },
          headerTintColor: colors[colorScheme]?.foreground,
          headerTitleStyle: {
            fontFamily: selectedFont,
          },
          contentStyle: {
            backgroundColor: colors[colorScheme]?.background,
          },
        }}
      >
        <Stack.Screen
          name="(protected)"
          options={{ headerTitle: "", headerShown: false }}
        />
        <Stack.Screen
          name="(auth)"
          options={{ headerTitle: "", headerShown: false }}
        />
        <Stack.Screen
          name="(legal)"
          options={{ headerTitle: "", headerShown: false }}
        />
        <Stack.Screen
          name="welcome"
          options={{ headerTitle: "", headerShown: false }}
        />
        <Stack.Screen
          name="shoot"
          options={{
            headerTitle: "Record Video",
          }}
        />
        <Stack.Screen
          name="postvideo"
          options={{
            headerTitle: "Post Video",
          }}
        />
        <Stack.Screen
          name="comments"
          options={{
            headerTitle: "comments",
          }}
        />
        <Stack.Screen
          name="contestform"
          options={{
            headerTitle: "Post Contest",
          }}
        />
        <Stack.Screen
          name="contestWatch"
          options={{
            headerTitle: "Watch Contest",
          }}
        />
        <Stack.Screen
          name="createContest"
          options={{
            headerTitle: "Create Contest",
          }}
        />
        <Stack.Screen
          name="leaderboard"
          options={{
            headerTitle: "Leaderboard",
          }}
        />
        <Stack.Screen
          name="joinedList"
          options={{
            headerTitle: "Joined Leaderboard",
          }}
        />
        <Stack.Screen
          name="contestsView"
          options={{
            headerTitle: "Contest Submission List",
            headerStyle: { backgroundColor: colors[colorScheme]?.background },
          }}
        />
        <Stack.Screen
          name="joinchallenge"
          options={{
            headerTitle: "Join a Challenge",
          }}
        />
        <Stack.Screen
          name="joincontest"
          options={{
            headerTitle: "Upload/Record",
            headerStyle: { backgroundColor: colors[colorScheme]?.background },
          }}
        />
        <Stack.Screen
          name="postcontest"
          options={{
            headerTitle: "Post Contest",
          }}
        />
        <Stack.Screen
          name="postform"
          options={{
            headerTitle: "Post",
          }}
        />
        <Stack.Screen
          name="Reels"
          options={{
            headerShown: true,
            headerTitle: "",
            headerStyle: { backgroundColor: colors[colorScheme]?.background },
            headerRight: () => (
              <TouchableOpacity
                style={{ marginLeft: 15 }}
                onPress={() => router.back()}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={24}
                  color={colors[colorScheme]?.foreground}
                />
              </TouchableOpacity>
            ),
          }}
        />
        <Stack.Screen
          name="shoot-challenge"
          options={{
            headerTitle: "Record",
          }}
        />
      </Stack>
      <StatusBar
        style="inverted"
        animated
        backgroundColor={colors[colorScheme]?.background}
      />
    </>
  );
}
