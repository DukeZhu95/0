// // components/exploremore/contests/contests.tsx

import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";

import { supabase } from "@/config/supabase";
import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";
import { useLocalSearchParams } from "expo-router";

type Contest = {
  id: string;
  title: string;
  description?: string;
  is_sponsored?: boolean;
  start_date?: string;
  end_date?: string;
  winner_reward?: number;
  participant_reward?: number;
  created_at?: string;
  updated_at?: string;
};

export default function Contests() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  const { category } = useLocalSearchParams(); // Get selected category

  const [contests, setContests] = useState<Contest[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchContests();
  }, [category]);

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from("contests")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false });
      if (error) throw error;

      setContests(data || []);
    } catch (error) {
      console.error("Error fetching contests:", error);
      Alert.alert(t("contests.error.title"), t("contests.error.message"));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContests();
    setRefreshing(false);
  };

  const getStatus = (startDate?: string, endDate?: string): string => {
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && now < start) return t("contests.status.notStarted");
    if (end && now > end) return t("contests.status.ended");
    return t("contests.status.ongoing");
  };

  const renderItem = ({ item }: { item: Contest }) => {
    const status = getStatus(item.start_date, item.end_date);

    // Define colors based on status
    let statusColor = "";
    let cardBorderColor = colors[colorScheme]?.border;
    switch (status) {
      case t("contests.status.notStarted"):
        statusColor = "text-yellow-400";
        break;
      case t("contests.status.ongoing"):
        statusColor = "text-green-400";
        cardBorderColor = "rgba(29, 197, 94, 0.2)";
        break;
      case t("contests.status.ended"):
        statusColor = "text-red-400";
        break;
      default:
        statusColor = "text-gray-400";
    }

    return (
      <>
        <TouchableOpacity
          className="px-4"
          style={{
            flexDirection: "column",
            justifyContent: "space-between",
            paddingVertical: 28,
            paddingHorizontal: 12,
            margin: 8,
            borderRadius: 8,
            borderWidth: 1,
            borderStyle: "dotted",
            borderColor: cardBorderColor,
            backgroundColor: colors[colorScheme]?.card,
          }}
          onPress={() => router.push(`/contestDetails?contestId=${item.id}`)}
        >
          {item.is_sponsored && (
            <Text
              style={{
                // color: colors[colorScheme]?.cardForeground,
                fontFamily: selectedFont,
              }}
              className="text-lg text-lime-500"
            >
              Sponsored
            </Text>
          )}
          <Text
            style={{
              color: colors[colorScheme]?.cardForeground,
              fontFamily: selectedFont,
              // fontWeight:"bold"
            }}
            className="text-lg"
          >
            {item.title}
          </Text>

          {item.description ? (
            <Text
              style={{
                color: colors[colorScheme]?.mutedForeground,
                fontFamily: selectedFont,
              }}
            >
              {item.description}
            </Text>
          ) : null}
          <Text className={`${statusColor} font-semibold mt-1`}>{status}</Text>
          <Text
            style={{ color: colors[colorScheme]?.mutedForeground }}
            className="mt-0.5"
          >
            {t("contests.dates.start")}
            {item.start_date ?? t("contests.dates.notAvailable")} ||{"  "}
            {t("contests.dates.end")}
            {item.end_date ?? t("contests.dates.notAvailable")}
          </Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <View
      style={{
        height: "100%",
        backgroundColor: colors[colorScheme]?.background,
      }}
    >
      {category ? (
        <Text
          style={{
            fontSize: 20,
            padding: 16,
            fontWeight: "bold",
            color: colors[colorScheme]?.card,
          }}
        >
          {category} {t("contests.listTitle")}
        </Text>
      ) : null}
      <FlatList
        data={contests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View className="mt-10 items-center">
            <Text
              style={{ color: colors[colorScheme]?.destructive }}
              // className={`text-red-500`}
            >
              {t("contests.noContests")}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
