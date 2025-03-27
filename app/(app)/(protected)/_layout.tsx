// app/(app)/(protected)/_layout.tsx

import { LinearGradient } from "expo-linear-gradient";
import { router, Tabs } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";
import {
  Entypo,
  FontAwesome5,
  Ionicons,
  Octicons,
  SimpleLineIcons,
} from "@expo/vector-icons";

import { Image } from "@/components/image";
import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";
import { useSupabase } from "@/context/supabase-provider";

export default function ProtectedLayout() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  const { profile } = useSupabase(); // Get profile from Supabase context
  // Check if userType allows contest creation (not "standard" or "minor")
  const canCreateContest =
    profile?.role && profile.role !== "standard" && profile.role !== "minor";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: colors[colorScheme]?.background,
        },
        headerTintColor: colors[colorScheme]?.foreground,
        headerLeft: () => (
          <TouchableOpacity
            style={{ marginLeft: 15 }}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={colors[colorScheme]?.foreground}
            />
          </TouchableOpacity>
        ),
        headerTitleAlign: "center",
        headerTitle: ({ children }) => (
          <Text
            style={{
              fontFamily: selectedFont,
              color: colors[colorScheme]?.foreground,
            }}
          >
            {children}
          </Text>
        ),
        tabBarStyle: {
          backgroundColor: colors[colorScheme]?.background,
        },
        tabBarActiveTintColor: colors[colorScheme]?.foreground,
        tabBarInactiveTintColor: colors[colorScheme]?.accentForeground,
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: t("tabs.home"),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 12,
                fontFamily: selectedFont,
                color: focused
                  ? colors[colorScheme]?.foreground
                  : colors[colorScheme]?.accentForeground,
              }}
            >
              {t("tabs.home")}
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <>
              {focused ? (
                <Entypo name="home" size={20} color={color} />
              ) : (
                <Octicons name="home" size={20} color={color} />
              )}
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerShown: true,
          title: t("tabs.search"),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 12,
                fontFamily: selectedFont,
                color: focused
                  ? colors[colorScheme]?.foreground
                  : colors[colorScheme]?.accentForeground,
              }}
            >
              {t("tabs.search")}
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <>
              {focused ? (
                <FontAwesome5 name="search" size={20} color={color} />
              ) : (
                <Ionicons name="search-outline" size={20} color={color} />
              )}
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: t("tabs.create"),
          headerShown: false,
          tabBarLabel: () => null,
          tabBarIcon: () => (
            <LinearGradient
              colors={["#fff", "#1f5c71", "#fff"]} // Silver gradient for border
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 64, // Larger size for the gradient border
                height: 64,
                borderRadius: 32,
                marginTop: -10,
                justifyContent: "center",
                alignItems: "center",
                borderWidth: 3, // Border width for the silver border
                borderColor: "#c0c0c0", // Silver border color
                backgroundColor: "red", // Red background for the icon
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "red", // Red center for the icon
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("@/assets/icons/plus-outline.png")} // Your icon path
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: "#fff", // White icon for contrast
                  }}
                />
              </View>
            </LinearGradient>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push("/shoot");
          },
        }}
      />
      <Tabs.Screen
        name="contest"
        options={{
          headerShown: true,
          title: t("tabs.contest"),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 12,
                fontFamily: selectedFont,
                color: focused
                  ? colors[colorScheme]?.foreground
                  : colors[colorScheme]?.accentForeground,
              }}
            >
              {t("tabs.contest")}
            </Text>
          ),
          tabBarIcon: ({ color, focused }) => (
            <>
              {focused ? (
                <Ionicons name="trophy" size={20} color={color} />
              ) : (
                <SimpleLineIcons name="trophy" size={20} color={color} />
              )}
            </>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/(app)/contestform")}
              style={{
                marginRight: 15,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <SimpleLineIcons
                name="plus"
                size={24}
                color={colors[colorScheme]?.foreground}
                style={{ marginRight: 5 }}
              />
              <Text style={{ color: colors[colorScheme]?.foreground }}>
                {t("tabs.newContest")}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          headerShown: true,
          title: t("tabs.menu"),
          headerTintColor: colors[colorScheme]?.foreground,
          headerTitleAlign: "center",
          headerTitle: ({ children }) => (
            <Text
              style={{
                fontFamily: selectedFont,
                color: colors[colorScheme]?.foreground,
              }}
            >
              {children}
            </Text>
          ),
          tabBarLabel: ({ focused }) => (
            <Text
              style={{
                fontSize: 12,
                fontFamily: selectedFont,
                color: focused
                  ? colors[colorScheme]?.foreground
                  : colors[colorScheme]?.accentForeground,
              }}
            >
              {t("tabs.menu")}
            </Text>
          ),
          tabBarIcon: ({ focused, color }) => (
            <>
              {focused ? (
                <Entypo name="menu" size={20} color={color} />
              ) : (
                <Ionicons name="menu" size={20} color={color} />
              )}
            </>
          ),
        }}
      />

      <Tabs.Screen
        name="editprofile"
        options={{
          headerShown: true,
          title: t("tabs.editProfile"),
          href: null,
        }}
      />

      <Tabs.Screen
        name="otheruserprofile"
        options={{
          headerShown: true,
          title: t("tabs.otherUserProfile"),
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{ headerShown: true, title: t("tabs.explore"), href: null }}
      />
      <Tabs.Screen
        name="challengeDetails"
        options={{
          headerShown: true,
          title: t("tabs.challengeDetails"),
          href: null,
        }}
      />
      <Tabs.Screen
        name="submissionDetails"
        options={{
          headerShown: true,
          headerTitle: "",
          headerStyle: { backgroundColor: "transparent" },
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
          href: null,
        }}
      />
      <Tabs.Screen
        name="contestDetails"
        options={{
          headerShown: true,
          title: t("tabs.contestDetails"),
          href: null,
        }}
      />
      <Tabs.Screen
        name="contestList"
        options={{
          headerShown: true,
          title: t("tabs.contestList"),
          href: null,
        }}
      />
      {/* <Tabs.Screen
        name="inbox"
        options={{
          headerShown: true,
          title: t("tabs.inbox"),
          href: null,
          headerRight: () => (
            <TouchableOpacity
              style={{ marginLeft: 15 }}
              onPress={() => router.push("/(app)/(protected)/(home)/users")}
            >
             <FontAwesome5
                name="users"
                size={22}
                color="white"
                style={{ marginHorizontal: 15 }}
              />
            </TouchableOpacity>
          ),
        }}
      /> */}
      <Tabs.Screen
        name="notinbox"
        options={{
          headerShown: false,
          href: null,
        }}
      />
      <Tabs.Screen
        name="(home)"
        options={{ headerShown: true, title: t("tabs.home"), href: null }}
      />
      <Tabs.Screen
        name="followers"
        options={{
          headerShown: true,
          title: t("tabs.followers"),
          href: null,
        }}
      />
      <Tabs.Screen
        name="following"
        options={{
          headerShown: true,
          title: t("tabs.following"),
          href: null,
        }}
      />
      {/* <Tabs.Screen
        name="account"
        options={{ headerShown: true, title: t("tabs.account"), href: null }}
      />

      <Tabs.Screen
        name="rewards"
        options={{ headerShown: true, title: t("tabs.rewards"), href: null }}
      />

      <Tabs.Screen
        name="coin"
        options={{
          headerShown: true,
          title: t("tabs.coin"),
          href: null,
        }}
      />
      <Tabs.Screen
        name="boostPost"
        options={{ headerShown: true, title: "Boost Your Post", href: null }}
      />
      <Tabs.Screen name="payment" options={{ title: "Payment", href: null }} />
      <Tabs.Screen
        name="scanDiscount"
        options={{
          title: "Scan Discount",
          href: null,
          headerRight: () => (
            <Ionicons name="help-circle-outline" size={24} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="purchaseCoins"
        options={{ headerShown: true, title: "Boost Your Post", href: null }}
      /> */}
      <Tabs.Screen
        name="calculator"
        options={{ title: "Calculator", href: null }}
      />
    </Tabs>
  );
}
