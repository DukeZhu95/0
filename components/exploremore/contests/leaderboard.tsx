// app/(app)/(protected)/leaderboard.tsx
import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Alert, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/config/supabase";
import { useTheme } from "@/context/theme-context";
import { colors } from "@/constants/colours";

type LeaderboardEntry = {
  rank: number;
  name: string;
  votes: number;
  profile_picture_url?: string;
};

export default function LeaderboardScreen() {
  const { colorScheme } = useTheme();
  const { contestId } = useLocalSearchParams<{ contestId: string }>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!contestId) {
      Alert.alert("Error", "No contest ID provided.");
      router.back();
      return;
    }
    fetchLeaderboard(contestId);
    subscribeToLeaderboardUpdates(contestId);
  }, [contestId]);

  const fetchLeaderboard = useCallback(async (id: string) => {
    try {
      setLoadingMore(true);

      const { data: leaderboardData, error: leaderboardError } = await supabase
        .from("submissions")
        .select("id, title, user_id, contest_id")
        .eq("contest_id", id)
        .order("id", { ascending: true })
        .limit(20);

      if (leaderboardError) {
        console.error("Error fetching leaderboard:", leaderboardError);
        Alert.alert("Error", "Failed to load leaderboard.");
        return;
      }

      const leaderboardWithVotes = await Promise.all(
        leaderboardData.map(async (entry, index) => {
          const { data: voteData, error: voteError } = await supabase
            .from("votes")
            .select("id")
            .eq("submission_id", entry.id);

          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("profile_picture_url")
            .eq("id", entry.user_id)
            .single();

          if (voteError || userError) {
            console.error(
              "Error fetching votes or user data:",
              voteError || userError
            );
            return { ...entry, votes: 0, profile_picture_url: null };
          }

          return {
            rank: index + 1,
            name: entry.title || "Unnamed Submission",
            votes: voteData ? voteData.length : 0,
            profile_picture_url: userData?.profile_picture_url || null,
          };
        })
      );

      leaderboardWithVotes.sort((a, b) => b.votes - a.votes); // Sort by votes in descending order
      setLeaderboard(leaderboardWithVotes);
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoadingMore(false);
      setLoading(false);
    }
  }, []);

  const subscribeToLeaderboardUpdates = (contestId: string) => {
    const leaderboardChannel = supabase
      .channel(`leaderboard-${contestId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "votes",
          filter: `contest_id=eq.${contestId}`,
        },
        () => {
          fetchLeaderboard(contestId); // Re-fetch leaderboard when a vote changes
        }
      )
      .subscribe();
  };

  const renderLeaderboardItem = ({ item }: { item: LeaderboardEntry }) => (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E7EB",
      }}
    >
      <Text style={{ fontSize: 18, color: "#DAA520", fontWeight: "bold" }}>
        #{item.rank}
      </Text>
      <Text style={{ fontSize: 16, color: "#333", flex: 1, marginLeft: 8 }}>
        {item.name}
      </Text>
      <Text style={{ fontSize: 16, color: "#10B981" }}>{item.votes} Votes</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#333" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F4", padding: 16 }}>
      {/* <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          color: "#000",
          textAlign: "center",
          marginBottom: 16,
          textShadowColor: "#DAA520",
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        }}
      >
        Leaderboard
      </Text> */}
      <FlatList
        data={leaderboard}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.rank.toString()}
        ListEmptyComponent={
          <Text style={{ fontSize: 16, color: "#666", textAlign: "center" }}>
            No submissions yet.
          </Text>
        }
      />
      <TouchableOpacity
        style={{
          backgroundColor: colors[colorScheme]?.primary,
          paddingVertical: 16,
          borderRadius: 8,
          alignItems: "center",
          marginTop: 16,
        }}
        onPress={() => router.back()}
      >
        <Text style={{ color: "#FFFFFF", fontSize: 18, fontWeight: "600" }}>
          Back to Contest
        </Text>
      </TouchableOpacity>
    </View>
  );
}