
import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import {
  View,
  Text,
  FlatList,
  Alert,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Share,
  Dimensions,
  Animated,
  Modal,
} from "react-native";

import { SafeAreaView } from "@/components/safe-area-view"; // Adjust the import path as necessary
import { supabase } from "@/config/supabase"; // Adjust the import path as necessary
import { useAuth } from "@/context/supabase-provider"; // Adjust the import path as necessary
import { colors } from "@/constants/colours";
import { useTheme } from "@/context/theme-context";
import { router } from "expo-router";


// Type Definitions

type Submission = {
  id: string;
  user_id: string;
  contest_id: string;
  video_url?: string;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  type: "submission" | "challenge"; // Assuming types
  inspired_by?: {
    id: string;
    title: string;
    // Add other fields if necessary
  };
  creator: {
    id: string;
    username: string;
    // Add other creator fields as necessary
  };
};

type ReactionRow = {
  submission_id: string;
  user_id: string;
  reaction: string;
};

type VoteRow = {
  submission_id: string;
  user_id: string;
};

type User = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url?: string;
  // Add other user fields as necessary
};

type SubmissionWithUser = Submission & {
  voteCount?: number;
  user?: User;
  likeCount?: number;
  userReaction?: string; // Track user's reaction
  userVoted?: boolean; // Track if user has voted
};

interface FloatingEmoji {
  id: number;
  emoji: string;
  animation: Animated.Value;
}

export default function ContestsViewScreen() {
  const { contestId } = useLocalSearchParams<{ contestId: string }>();

  const { user } = useAuth();
 const { colorScheme } = useTheme();
  const [submissions, setSubmissions] = useState<SubmissionWithUser[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  // Floating Emojis State
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const floatingEmojiId = useRef(0);

  // Get screen height for responsive card sizing
  const screenHeight = Dimensions.get("window").height;
  const cardHeight = screenHeight / 3 - 24;

  // Add these new state variables in ContestsViewScreen component
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number>(-1);

  useEffect(() => {
    if (!contestId) {
      Alert.alert("Error", "No contest ID provided.");
      router.back();
      return;
    }
    fetchSubmissions(contestId);
  }, [contestId]);

  const fetchSubmissions = useCallback(
    async (id: string) => {
      try {
        setRefreshing(true);
        setLoading(true);

        const { data: submissionData, error: submissionError } = await supabase
          .from("submissions")
          .select("*")
          .eq("contest_id", id);

        if (submissionError) {
          console.error("Error fetching submissions:", submissionError);
          Alert.alert("Error", "Failed to load submissions.");
          setRefreshing(false);
          setLoading(false);
          return;
        }

        if (!submissionData || submissionData.length === 0) {
          setSubmissions([]);
          setRefreshing(false);
          setLoading(false);
          return;
        }

        const submissionIds = submissionData.map((s) => s.id);
        const { data: reactionData, error: reactionError } = await supabase
          .from("reactions")
          .select("submission_id, reaction, user_id")
          .in("submission_id", submissionIds);

        if (reactionError) {
          console.error("Error fetching reactions:", reactionError);
          Alert.alert("Error", "Failed to load reactions.");
        }

        const { data: voteData, error: voteError } = await supabase
          .from("votes")
          .select("submission_id, user_id")
          .in("submission_id", submissionIds);

        if (voteError) {
          console.error("Error fetching votes:", voteError);
          Alert.alert("Error", "Failed to load votes.");
        }

        const voteCounts: Record<string, number> = {};
        const userVotedMap: Record<string, boolean> = {};

        (voteData || []).forEach((row: VoteRow) => {
          voteCounts[row.submission_id] =
            (voteCounts[row.submission_id] || 0) + 1;
          if (user && row.user_id === user.id) {
            userVotedMap[row.submission_id] = true;
          }
        });

        const voteLikeCounts: Record<string, number> = {};
        const userReactions: Record<string, string> = {};

        (reactionData || []).forEach((row: ReactionRow) => {
          if (row.reaction === "Like") {
            voteLikeCounts[row.submission_id] =
              (voteLikeCounts[row.submission_id] || 0) + 1;
          }
          if (user && row.user_id === user.id) {
            userReactions[row.submission_id] = row.reaction;
          }
        });

        const userIds = submissionData.map((s) => s.user_id);
        const { data: usersData, error: usersError } = await supabase
          .from("users")
          .select("id, username, first_name, last_name, profile_picture_url")
          .in("id", userIds);

        if (usersError) {
          console.error("Error fetching submission users:", usersError);
        }

        const usersMap: Record<string, User> = {};
        (usersData || []).forEach((u: User) => {
          usersMap[u.id] = u;
        });

        const submissionsWithVotesAndUsers: SubmissionWithUser[] =
          submissionData.map((sub) => ({
            ...sub,
            voteCount: voteCounts[sub.id] || 0,
            user: usersMap[sub.user_id],
            likeCount: voteLikeCounts[sub.id] || 0,
            userReaction: userReactions[sub.id] || undefined,
            userVoted: userVotedMap[sub.id] || false,
          }));

        submissionsWithVotesAndUsers.sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime(),
        );

        setSubmissions(submissionsWithVotesAndUsers);
      } catch (err) {
        console.error("Unexpected error:", err);
        Alert.alert("Error", "An unexpected error occurred.");
      } finally {
        setRefreshing(false);
        setLoading(false);
      }
    },
    [user],
  );

  const onRefresh = async () => {
    if (contestId) {
      setRefreshing(true);
      await fetchSubmissions(contestId);
      setRefreshing(false);
    }
  };

  const reactionMap: { [key: string]: string } = {
    Like: "💖",
    Love: "❤️",
    Haha: "😂",
    Sad: "😢",
    Fire: "🔥",
  };

  const triggerFloatingEmoji = (emoji: string) => {
    const id = floatingEmojiId.current++;
    const animation = new Animated.Value(0);

    const newEmoji: FloatingEmoji = { id, emoji, animation };
    setFloatingEmojis((prev) => [...prev, newEmoji]);

    Animated.timing(animation, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    });
  };

  const handleSharePress = async (videoUrl?: string, title?: string) => {
    if (!videoUrl) {
      Alert.alert("Error", "Video URL not available for sharing.");
      return;
    }

    try {
      await Share.share({
        message: `Check out this submission: ${title}\n${videoUrl}`,
      });
    } catch (error: any) {
      console.error("Error sharing submission:", error);
      Alert.alert("Error", "Failed to share this submission.");
    }
  };

  const handleWatchVideo = (videoUrl?: string) => {
    if (videoUrl) {
      const index = submissions.findIndex(s => s.video_url === videoUrl);
      if (index !== -1) {
        setSelectedVideoIndex(index);
        setIsFullscreenMode(true);
      }
    }
  };

  // Add this new component for full-screen video viewing
  const FullscreenVideoViewer = ({
    visible,
    onClose,
    submissions,
    initialIndex,
  }: {
    visible: boolean;
    onClose: () => void;
    submissions: SubmissionWithUser[];
    initialIndex: number;
  }) => {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const flatListRef = useRef<FlatList>(null);

    useEffect(() => {
      if (visible && flatListRef.current) {
        flatListRef.current.scrollToIndex({
          index: initialIndex,
          animated: false,
        });
      }
    }, [visible, initialIndex]);

    const renderVideoItem = ({ item, index }: { item: SubmissionWithUser; index: number }) => (
      <View style={styles.fullscreenVideoItem}>
        <Video
          source={{ uri: item.video_url || '' }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="contain"
          shouldPlay={index === activeIndex}
          isLooping
          style={styles.fullscreenVideoPlayer}
        />
        <View style={styles.videoOverlay}>
          <Text style={styles.fullscreenVideoTitle}>{item.title}</Text>
          <Text style={styles.fullscreenVideoUser}>
            {item.user?.first_name} {item.user?.last_name}
          </Text>
        </View>
      </View>
    );

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
      >
        <View style={styles.fullscreenContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close-circle" size={36} color={colors[colorScheme]?.foreground} />
          </TouchableOpacity>
          
          <FlatList
            ref={flatListRef}
            data={submissions.filter(s => s.video_url)}
            keyExtractor={(item) => item.id}
            renderItem={renderVideoItem}
            pagingEnabled
            vertical
            showsVerticalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const index = Math.round(
                event.nativeEvent.contentOffset.y / SCREEN_HEIGHT
              );
              setActiveIndex(index);
            }}
            getItemLayout={(data, index) => ({
              length: SCREEN_HEIGHT,
              offset: SCREEN_HEIGHT * index,
              index,
            })}
          />
        </View>
      </Modal>
    );
  };

  useEffect(() => {
    const subscribeToChanges = () => {
      const channels: any[] = [];

      const reactionChannel = supabase
        .channel(`realtime-reactions-contest-${contestId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reactions",
            filter: `contest_id=eq.${contestId}`,
          },
          (_payload) => {
            fetchSubmissions(contestId);
          },
        )
        .subscribe();

      const voteChannel = supabase
        .channel(`realtime-votes-contest-${contestId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "votes",
            filter: `contest_id=eq.${contestId}`,
          },
          (_payload) => {
            fetchSubmissions(contestId);
          },
        )
        .subscribe();

      channels.push(reactionChannel, voteChannel);

      return () => {
        channels.forEach((channel) => {
          supabase.removeChannel(channel);
        });
      };
    };

    if (submissions.length > 0) {
      const cleanup = subscribeToChanges();
      return cleanup;
    }
  }, [submissions, contestId, fetchSubmissions]);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading submissions...</Text>
      </SafeAreaView>
    );
  }

  if (!submissions.length) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.placeholderText}>No submissions available.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={submissions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubmissionItem
            submission={item}
            user={user}
            reactionMap={reactionMap}
            onShare={handleSharePress}
            onWatchVideo={handleWatchVideo}
            triggerFloatingEmoji={triggerFloatingEmoji}
            fetchSubmissions={fetchSubmissions}
            contestId={contestId}
            cardHeight={cardHeight}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 16 }}
        ListEmptyComponent={() => (
          <View style={styles.emptySubmissionsContainer}>
            <Text style={styles.emptySubmissionsText}>No submissions yet.</Text>
          </View>
        )}
      />
      {isFullscreenMode && (
        <FullscreenVideoViewer
          visible={isFullscreenMode}
          onClose={() => setIsFullscreenMode(false)}
          submissions={submissions}
          initialIndex={selectedVideoIndex}
        />
      )}
      {floatingEmojis.map((emojiItem) => (
        <Animated.View
          key={emojiItem.id}
          style={[
            styles.floatingEmoji,
            {
              transform: [
                {
                  translateY: emojiItem.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -200],
                  }),
                },
              ],
              opacity: emojiItem.animation.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          <Text style={styles.emoji}>{emojiItem.emoji}</Text>
        </Animated.View>
      ))}
    </SafeAreaView>
  );
}

// SubmissionItem Component
interface SubmissionItemProps {
  submission: SubmissionWithUser;
  user: User | null;
  reactionMap: { [key: string]: string };
  onShare: (videoUrl?: string, title?: string) => void;
  onWatchVideo: (videoUrl?: string) => void;
  triggerFloatingEmoji: (emoji: string) => void;
  fetchSubmissions: (id: string) => Promise<void>;
  contestId: string;
  cardHeight: number;
}

const SubmissionItem: React.FC<SubmissionItemProps> = memo(
  ({
    submission,
    user,
    reactionMap,
    onShare,
    onWatchVideo,
    triggerFloatingEmoji,
    fetchSubmissions,
    contestId,
    cardHeight,
  }) => {
    const [showReactions, setShowReactions] = useState(false);
    const reactionAnimation = useRef(new Animated.Value(0)).current;

    const handleLikePress = async () => {
      if (!user) {
        Alert.alert(
          "Authentication Required",
          "Please log in to like submissions.",
        );
        return;
      }

      try {
        if (submission.userReaction) {
          const { error } = await supabase
            .from("reactions")
            .delete()
            .eq("submission_id", submission.id)
            .eq("user_id", user.id);

          if (error) {
            console.error("Error removing reaction:", error);
            Alert.alert("Error", "Failed to remove your reaction.");
            return;
          }

          fetchSubmissions(contestId);
        } else {
          setShowReactions(true);
          Animated.spring(reactionAnimation, {
            toValue: 1,
            useNativeDriver: true,
          }).start();

          setTimeout(() => {
            setShowReactions(false);
            Animated.timing(reactionAnimation, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start();
          }, 10000);
        }
      } catch (error: any) {
        console.error("Error handling like press:", error);
        Alert.alert("Error", "Failed to process your reaction.");
      }
    };

    const handleReactionSelect = async (reaction: string) => {
      if (!user) {
        Alert.alert("Authentication Required", "Please log in to react.");
        return;
      }

      try {
        const { error } = await supabase.from("reactions").insert([
          {
            submission_id: submission.id,
            user_id: user.id,
            reaction,
          },
        ]);

        if (error) {
          console.error("Error inserting reaction:", error);
          Alert.alert("Error", "Failed to add your reaction.");
          return;
        }

        fetchSubmissions(contestId);
        triggerFloatingEmoji(reactionMap[reaction] || "💖");

        setShowReactions(false);
        Animated.timing(reactionAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      } catch (error: any) {
        console.error("Error selecting reaction:", error);
        Alert.alert("Error", "Failed to add your reaction.");
      }
    };

    const handleVotePress = async () => {
      if (!user) {
        Alert.alert("Authentication Required", "Please log in to vote.");
        return;
      }

      try {
        if (submission.userVoted) {
          return;
        }

        const { error } = await supabase.from("votes").insert([
          {
            submission_id: submission.id,
            user_id: user.id,
          },
        ]);

        if (error) {
          if (error.code === "23505") {
            Alert.alert(
              "Vote Already Cast",
              "You have already voted for this submission.",
            );
          } else {
            console.error("Error inserting vote:", error);
            Alert.alert("Error", "Failed to cast your vote.");
          }
          return;
        }

        fetchSubmissions(contestId);
      } catch (error: any) {
        console.error("Error handling vote press:", error);
        Alert.alert("Error", "Failed to cast your vote.");
      }
    };

    const userName = submission.user
      ? `${submission.user.first_name} ${submission.user.last_name}`
      : "Unknown User";

    return (
      <View style={[styles.submissionContainer, { height: cardHeight }]}>
        <View style={styles.userInfo}>
          {submission.user?.profile_picture_url ? (
            <Image
              source={{ uri: submission.user.profile_picture_url }}
              style={styles.profileImage}
              accessible
              accessibilityLabel={`${submission.user.username}'s profile picture`}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={30} color="#FFFFFF" />
          )}
          <Text style={styles.userName} numberOfLines={1}>
            {submission.user
              ? `${submission.user.first_name} ${submission.user.last_name}`
              : "Unknown User"}
          </Text>
        </View>

        <Text style={styles.submissionTitle} numberOfLines={1}>
          {submission.title}
        </Text>

        <Text style={styles.submissionDescription} numberOfLines={2}>
          {submission.description}
        </Text>

        {submission.video_url && (
          <TouchableOpacity onPress={() => onWatchVideo(submission.video_url)}>
            <Video
              source={{ uri: submission.video_url }}
              rate={1.0}
              volume={1.0}
              isMuted={false}
              resizeMode="cover"
              shouldPlay={false}
              isLooping={false}
              style={styles.video}
              accessible
              accessibilityLabel="Submission Video"
            />
            <View style={styles.playButtonOverlay}>
              <Ionicons name="play-circle" size={30} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.interactionContainer}>
          <TouchableOpacity
            onPress={handleLikePress}
            style={styles.interactionButton}
            activeOpacity={0.7}
          >
            {submission.userReaction ? (
              <Text style={styles.userReactionEmoji}>
                {reactionMap[submission.userReaction] || "💖"}
              </Text>
            ) : (
              <Ionicons name="heart-outline" size={20} color="#10B981" />
            )}
            <Text style={styles.interactionText}>
              {submission.likeCount || 0}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onShare(submission.video_url, submission.title)}
            style={styles.interactionButton}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={20} color="#6B7280" />
            <Text style={styles.interactionText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleVotePress}
            style={styles.interactionButton}
            activeOpacity={0.7}
            disabled={submission.userVoted}
          >
            <Text
              style={[
                styles.voteText,
                submission.userVoted && styles.votedText,
              ]}
            >
              {submission.userVoted ? "Voted" : "Vote"}
            </Text>
            {submission.userVoted && (
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color="#FFA500"
                style={{ marginLeft: 4 }}
              />
            )}
            <Text style={styles.interactionText}>
              {submission.voteCount || 0}
            </Text>
          </TouchableOpacity>
        </View>

        {showReactions && (
          <Animated.View
            style={[
              styles.reactionsContainer,
              {
                transform: [{ scale: reactionAnimation }],
              },
            ]}
          >
            {Object.entries(reactionMap).map(([label, emoji], index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleReactionSelect(label)}
                style={styles.reactionButton}
                activeOpacity={0.7}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
                <Text style={styles.reactionLabel}>{label}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}
      </View>
    );
  },
);

// Styles

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E293B", // Tailwind slate-800
    padding: 8,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1E293B",
    padding: 16,
  },
  loadingText: {
    color: "#3B82F6", // Tailwind blue-500
    marginTop: 8,
    fontSize: 14,
  },
  placeholderText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  submissionContainer: {
    backgroundColor: "#334155", // Tailwind slate-700
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    justifyContent: "space-between",
    position: "relative",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  profileImage: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 6,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  submissionTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  submissionDescription: {
    color: "#94A3B8",
    fontSize: 12,
    marginBottom: 4,
  },
  video: {
    width: "100%",
    height: 100,
    borderRadius: 6,
    marginBottom: 4,
  },
  playButtonOverlay: {
    position: "absolute",
    top: "35%",
    left: "45%",
    justifyContent: "center",
    alignItems: "center",
  },
  interactionContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 4,
  },
  interactionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  interactionText: {
    color: "#FFFFFF",
    marginLeft: 2,
    fontSize: 12,
  },
  reactionsContainer: {
    position: "absolute",
    bottom: 60,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  reactionButton: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  reactionEmoji: {
    fontSize: 24,
  },
  reactionLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
  },
  floatingEmoji: {
    position: "absolute",
    bottom: 120,
    right: 20,
  },
  emoji: {
    fontSize: 24,
  },
  videoModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 30,
    right: 15,
    zIndex: 1,
  },
  fullscreenVideo: {
    width: "90%",
    height: "70%",
  },
  emptySubmissionsContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  emptySubmissionsText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  userReactionEmoji: {
    fontSize: 20,
    color: "#10B981",
  },
  voteText: {
    color: "#FFFFFF",
    fontSize: 12,
  },
  votedText: {
    color: "#FFA500", // Orange color for voted state
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullscreenVideoItem: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  fullscreenVideoPlayer: {
    flex: 1,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 48,
    left: 16,
    right: 16,
  },
  fullscreenVideoTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  fullscreenVideoUser: {
    color: '#FFFFFF',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});