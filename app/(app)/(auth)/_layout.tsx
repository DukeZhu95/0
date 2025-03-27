import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";

import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";

export default function AuthLayout() {
  const { selectedFont } = useFont();
  const { colorScheme } = useTheme();
  const { t } = useTranslation();

  return (
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
        headerTitleAlign: "center",
        contentStyle: {
          backgroundColor: colors[colorScheme]?.background,
        },
      }}
    >
      <Stack.Screen
        name="sign-in"
        options={{
          title: " ",
          headerShown: true,
          headerTitle: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: selectedFont,
                  fontSize: 24,
                  fontWeight: "bold",
                  color: colors[colorScheme].foreground,
                }}
              >
                {t("signIn.title")}
              </Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="sign-up"
        options={{
          title: " ",
          headerShown: true,
          headerTitle: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: selectedFont,
                  fontSize: 24,
                  fontWeight: "bold",
                  color: colors[colorScheme].foreground,
                }}
              >
                {t("signUp.title")}
              </Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="sign-up-business"
        options={{
          title: " ",
          headerShown: true,
          headerTitle: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: selectedFont,
                  fontSize: 24,
                  fontWeight: "bold",
                  color: colors[colorScheme].foreground,
                }}
              >
                {t("signUp.title")}
              </Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="reset-password"
        options={{
          title: " ",
          headerShown: true,
          headerTitle: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: selectedFont,
                  fontSize: 24,
                  fontWeight: "bold",
                  color: colors[colorScheme].foreground,
                }}
              >
                {t("forgotPassword.buttons.reset")}
              </Text>
            </View>
          ),
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          title: " ",
          headerShown: true,
          headerTitle: () => (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: selectedFont,
                  fontSize: 24,
                  fontWeight: "bold",
                  color: colors[colorScheme].foreground,
                }}
              >
                {t("forgotPassword.title")}
              </Text>
            </View>
          ),
        }}
      />
    </Stack>
  );
}
