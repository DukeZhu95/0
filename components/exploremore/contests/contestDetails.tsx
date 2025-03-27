//   return (
//     <View
//       style={{
//         flex: 1,
//         backgroundColor: colors[colorScheme]?.card,
//         padding: 16,
//       }}
//     >
//       <View style={styles.contestDetailsContainer}>
//         <TouchableOpacity
//           onPress={() => setIsRulesModalVisible(true)}
//           style={{
//             marginTop: 15,
//             alignSelf: "center",
//             padding: 10,
//             backgroundColor: colors[colorScheme]?.primary,
//             borderRadius: 5,
//           }}
//         >
//           <Text
//             style={{ color: "#fff", fontSize: 16, fontFamily: selectedFont }}
//           >
//             View Contest Rules
//           </Text>
//         </TouchableOpacity>

//         <Text style={styles.contestTitle}>{contest.title}</Text>
//         {contest.description && (
//           <Text style={styles.contestDescription}>{contest.description}</Text>
//         )}
//         <View style={styles.statusContainer}>
//           <View
//             style={[styles.statusIndicator, { backgroundColor: status.color }]}
//           />
//           <Text style={[styles.statusText, { color: status.color }]}>
//             {status.text}
//           </Text>
//         </View>
//         <Text style={styles.contestDates}>
//           Start:{" "}
//           {contest.start_date
//             ? new Date(contest.start_date).toDateString()
//             : "N/A"}{" "}
//           | End:{" "}
//           {contest.end_date ? new Date(contest.end_date).toDateString() : "N/A"}
//         </Text>

//         {!status.text.includes("Ended") && (
//           <TouchableOpacity
//             style={[
//               styles.joinButton,
//               hasJoined() ? styles.joinedButton : styles.notJoinedButton,
//             ]}
//             onPress={handleJoinContest}
//             disabled={hasJoined()}
//           >
//             <Ionicons
//               name={hasJoined() ? "checkmark-circle" : "add-circle-outline"}
//               size={20}
//               color="#FFFFFF"
//               style={styles.joinButtonIcon}
//             />
//             <Text style={styles.joinButtonText}>
//               {hasJoined() ? "Joined" : "Join Contest"}
//             </Text>
//           </TouchableOpacity>
//         )}

//         <TouchableOpacity
//           style={styles.viewSubmissionsButton}
//           onPress={handleViewSubmissions}
//         >
//           <Ionicons
//             name="list-circle-outline"
//             size={20}
//             color="#FFFFFF"
//             style={styles.viewSubmissionsIcon}
//           />
//           <Text style={styles.viewSubmissionsText}>View Submissions</Text>
//         </TouchableOpacity>
//       </View>

//       <View style={styles.leaderboardContainer}>
//         <Text style={styles.leaderboardTitle}>Leaderboard</Text>
//         {leaderboard.slice(0, showAllLeaderboard ? 20 : 8).map((entry) => (
//           <View key={entry.rank} style={styles.leaderboardEntry}>
//             <Text style={styles.leaderboardRank}>#{entry.rank}</Text>
//             {entry.profile_picture_url && (
//               <Image
//                 source={{ uri: entry.profile_picture_url }}
//                 style={styles.profileImage}
//                 alt="User Profile"
//               />
//             )}
//             <Text style={styles.leaderboardName}>{entry.name}</Text>
//             <Text style={styles.leaderboardVotes}>{entry.votes} Votes</Text>
//           </View>
//         ))}
//         {!showAllLeaderboard && leaderboard.length > 8 && (
//           <TouchableOpacity
//             style={styles.loadMoreButton}
//             onPress={handleLoadMore}
//           >
//             <Text style={styles.loadMoreText}>Load More</Text>
//           </TouchableOpacity>
//         )}
//       </View>

//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={isRulesModalVisible}
//         onRequestClose={() => setIsRulesModalVisible(false)}
//       >
//         <View
//           style={{
//             flex: 1,
//             justifyContent: "center",
//             alignItems: "center",
//             backgroundColor: "rgba(0,0,0,0.5)",
//           }}
//         >
//           <View
//             style={{
//               width: "90%",
//               padding: 20,
//               backgroundColor: colors[colorScheme]?.card,
//               borderRadius: 10,
//             }}
//           >
//             <Text
//               style={{
//                 fontSize: 22,
//                 fontWeight: "bold",
//                 color: colors[colorScheme]?.primary,
//                 fontFamily: selectedFont,
//                 marginBottom: 10,
//               }}
//             >
//               Challenge & Contest Rules
//             </Text>

//             <ScrollView style={{ maxHeight: 400 }}>
//               <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
//                 1. Creating a Challenge
//               </Text>
//               <Text>
//                 - Any user can create a challenge and post it on Challenz.
//               </Text>
//               <Text>
//                 - Challenges can be open-ended or have a specific theme.
//               </Text>
//               <Text>
//                 - A clear title, description, and instructions are required.
//               </Text>
//               <Text>- The creator sets a time limit for participation.</Text>
//               <Text>- Once posted, users can join and submit entries.</Text>
//               <Text>- Winning challenges get more visibility.</Text>

//               <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
//                 2. Creating a Contest
//               </Text>
//               <Text>- A contest is a structured challenge with a theme.</Text>
//               <Text>- Users can create contests and invite participants.</Text>
//               <Text>
//                 - Engagement (views, likes, comments) determines rankings.
//               </Text>
//               <Text>
//                 - The creator cannot modify rankings after submission.
//               </Text>

//               <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
//                 3. Entering a Challenge or Contest
//               </Text>
//               <Text>- Users can join by submitting their entry.</Text>
//               <Text>- Entries must follow challenge guidelines.</Text>
//               <Text>- Engagement determines rankings.</Text>
//               <Text>
//                 - The top 10 ranked participants enter the Winning Zone.
//               </Text>

//               <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
//                 4. Winning and Visibility
//               </Text>
//               <Text>
//                 - The top 10 ranked entries receive increased exposure.
//               </Text>
//               <Text>
//                 - Challenz may feature top challenges for further visibility.
//               </Text>

//               <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
//                 5. Disqualification & Content Moderation
//               </Text>
//               <Text>- Entries must follow community guidelines.</Text>
//               <Text>
//                 - Hate speech, violence, harassment, explicit, or illegal
//                 content is removed.
//               </Text>
//               <Text>
//                 - Fake engagement (spam, bots) leads to disqualification.
//               </Text>
//               <Text>- Manipulating rankings may result in suspension.</Text>
//               <Text>
//                 - Challenz reserves the right to remove any violating content.
//               </Text>

//               <Text style={{ fontSize: 16, fontWeight: "bold", marginTop: 10 }}>
//                 6. Disclaimer
//               </Text>
//               <Text>
//                 The organization of challenges and contests is independent and
//                 is not sponsored, endorsed, or affiliated with Apple in any way.
//               </Text>
//             </ScrollView>

//             <TouchableOpacity
//               onPress={() => setIsRulesModalVisible(false)}
//               style={{
//                 marginTop: 15,
//                 backgroundColor: colors[colorScheme]?.primary,
//                 padding: 10,
//                 borderRadius: 5,
//                 alignItems: "center",
//               }}
//             >
//               <Text
//                 style={{
//                   color: "#fff",
//                   fontSize: 16,
//                   fontFamily: selectedFont,
//                 }}
//               >
//                 Close
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

// app/(app)/(protected)/contestdetails.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import { useTheme } from "@/context/theme-context";
import { useFont } from "@/context/font-context";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/colours";
import { ContestRulesModal } from "./contestRulesModal";
import { Ionicons } from "@expo/vector-icons";

type Contest = {
  id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  winner_reward?: number;
  participant_reward?: number;
  created_at?: string;
  updated_at?: string;
  creator_id?: string;
  category?: string;
  is_sponsored?: boolean;
  is_rewarded?: boolean;
  explanation_video_url?: string;
  video_url?: string;
};

export default function ContestDetailsScreen() {
  // const { category, subcategory } = useLocalSearchParams<{ category: string; subcategory: string }>();

  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  const { contestId } = useLocalSearchParams<{ contestId: string }>();
  const { user, joinChallenge, joinedChallenges } = useAuth();
  const [isRulesModalVisible, setIsRulesModalVisible] = useState(false);

  const [contest, setContest] = useState<Contest | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    if (!contestId) {
      Alert.alert("Error", "No contest ID provided.");
      router.back();
      return;
    }
    fetchContestDetails(contestId);
  }, [contestId]);

  const fetchContestDetails = useCallback(async (id: string) => {
    try {
      setRefreshing(true);
      setLoading(true);

      const { data: contestData, error: contestError } = await supabase
        .from("contests")
        .select("*")
        .eq("id", id)
        .single();

      if (contestError) {
        console.error("Error fetching contest:", contestError);
        Alert.alert("Error", "Failed to load contest details.");
        setRefreshing(false);
        setLoading(false);
        return;
      }
      setContest(contestData);
    } catch (err) {
      console.error("Unexpected error:", err);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    if (contestId) {
      setRefreshing(true);
      await fetchContestDetails(contestId);

      setRefreshing(false);
    }
  };

  const determineStatus = (
    startDate?: string,
    endDate?: string
  ): { text: string; color: string } => {
    const now = new Date();
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && now < start) return { text: "Upcoming", color: "#F59E0B" }; // Yellow
    if (end && now > end) return { text: "Ended", color: "#EF4444" }; // Red
    return { text: "Active", color: "#10B981" }; // Green
  };

  const hasJoined = () => {
    if (!user || !joinedChallenges) return false;
    return joinedChallenges.some((jc) => jc.challenge_id === contestId);
  };

  const handleJoinContest = () => {
    if (!contest?.id) return;
    router.push(`/joincontest?contestId=${contest.id}`);
  };

  const handleViewSubmissions = () => {
    if (!contestId) {
      Alert.alert("Error", "No contest ID provided.");
      return;
    }
    router.push(`/contestsView?contestId=${contest?.id}`);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#333" }}>Loading...</Text>
      </View>
    );
  }

  if (!contest) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 16, color: "#333" }}>Contest not found.</Text>
      </View>
    );
  }

  const status = determineStatus(contest.start_date, contest.end_date);

  return (
    <View style={{ flex: 1, backgroundColor: "#F4F4F4", padding: 16 }}>
      <View className="flex flex-row items-center justify-between">
        <Text
          style={{
            fontSize: 24,
            fontWeight: "bold",
            color: "#333",
            marginBottom: 16,
          }}
        >
          {contest.title}
        </Text>
        {contest.is_sponsored && (
          <Text
            style={{ borderColor: colors[colorScheme]?.border }}
            className="border p-2 rounded text-lime-500"
          >
            Sponsored
          </Text>
        )}
      </View>
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          paddingHorizontal: 10,
          paddingVertical: 20,
         
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 16, color: "#666", marginBottom: 16 }}>
          {contest.description}
        </Text>
        <View className="flex-row items-center mb-8">
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              marginRight: 6,
              backgroundColor: status.color,
            }}
          />
          <Text
            style={{ fontSize: 16, fontWeight: "600", color: status.color }}
          >
            {status.text}
          </Text>
        </View>
        <Text style={{ fontSize: 14, color: colors[colorScheme]?.primary }}>
          Start:{" "}
          {contest.start_date
            ? new Date(contest.start_date).toDateString()
            : "N/A"}{" "}
          | End:{" "}
          {contest.end_date ? new Date(contest.end_date).toDateString() : "N/A"}
        </Text>

        <View>
          <TouchableOpacity
            style={{
              backgroundColor: colors[colorScheme]?.primary,
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: "center",
              marginVertical: 16,
            }}
            onPress={() => setIsRulesModalVisible(true)}
          >
            <Text
              style={{
                color: colors[colorScheme]?.secondary,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              View Contest Rules
            </Text>
          </TouchableOpacity>

          {!status.text.includes("Ended") && (
            <TouchableOpacity
              style={[
                hasJoined()
                  ? { backgroundColor: "#6B7280" }
                  : { backgroundColor: "green" },
                { flexDirection: "row" },
                { paddingVertical: 16 },
                { borderRadius: 8 },
                { alignItems: "center" },
                { justifyContent: "center" },
                { marginBottom: 16 },
              ]}
              onPress={handleJoinContest}
              disabled={hasJoined()}
            >
              <Ionicons
                name={hasJoined() ? "checkmark-circle" : "add-circle-outline"}
                size={20}
                color={colors[colorScheme]?.secondary}
                style={{ marginRight: 6 }}
              />
              <Text
                style={{
                  color: colors[colorScheme]?.secondary,
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                {hasJoined() ? "Joined" : "Join Contest"}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              backgroundColor: colors[colorScheme]?.accent,
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 16,
            }}
            onPress={handleViewSubmissions}
          >
            <Text
              style={{
                color: colors[colorScheme]?.secondary,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              View Submissions
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              backgroundColor: colors[colorScheme]?.secondaryForeground,
              paddingVertical: 16,
              borderRadius: 8,
              alignItems: "center",
              marginBottom: 16,
            }}
            onPress={() => router.push(`/leaderboard?contestId=${contestId}`)}
          >
            <Text
              style={{
                color: colors[colorScheme]?.secondary,
                fontSize: 18,
                fontWeight: "600",
              }}
            >
              View Leaderboard
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <ContestRulesModal
        visible={isRulesModalVisible}
        onClose={() => setIsRulesModalVisible(false)}
      />
    </View>
  );
}
