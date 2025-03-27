// app/(app)/(protected)/NotificationsPage.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";

import { useSupabase } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";

// Notification Types
type NotificationType =
  | "joined_challenge"
  | "commented"
  | "liked"
  | "followed"
  | "mentioned_you";

// TypeScript Interfaces for Supabase Responses
interface User {
  id: string;
  username: string;
  profile_picture_url: string;
}

interface Submission {
  id: string;
  title: string;
}

interface Like {
  id: string;
  created_at: string;
  submission_id: string;
  user: User;
  submission: Submission;
}

interface ChallengeParticipant {
  id: string;
  created_at: string;
  challenge_id: string;
  user: User;
  challenge: Submission;
}

interface Comment {
  id: string;
  created_at: string;
  content: string;
  challenge_id: string;
  user: User;
  challenge: Submission;
}

interface Follow {
  id: string;
  created_at: string;
  follower: User;
}

interface Mention {
  id: string;
  created_at: string;
  title: string;
  inspired_by_id: string;
  user: User;
}

// Single Notification interface
interface NotificationItem {
  id: string;
  type: NotificationType;
  username: string;         // The user who triggered the notification
  userId?: string;          // ID of the user who triggered the notification
  avatarUrl?: string;       // Their profile pic
  createdAt: string;        // Timestamp
  submissionTitle?: string; // For "joined_challenge", "commented", etc.
  submissionId?: string;    // ID of the related submission/post
  commentText?: string;     // For comments if you want to show text
}

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useSupabase();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    if (user) {
      fetchNotifications();

      // Listener for receiving notifications in the foreground
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log("Notification Received:", notification);
        fetchNotifications(); // Refresh notifications on new notification
      });

      // Listener for interacting with notifications
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log("Notification Response:", response);
        // Optionally handle user interaction with the notification
      });
    }

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [user]);

  async function fetchNotifications() {
    try {
      setLoading(true);

      // 1) Fetch all "submissions" posted by this user
      const { data: myChallenges, error: challError } = await supabase
        .from("submissions")
        .select("id, title")
        .eq("user_id", user.id);

      if (challError) throw challError;

      const challengeIds = (myChallenges || []).map((c) => c.id);
      console.log("User's Challenge IDs:", challengeIds);

      // Proceed only if there are challenge IDs
      if (challengeIds.length === 0) {
        console.log("No challenges found for the user.");
      }

      // A) "Someone joined your challenge"
      let joinItems: NotificationItem[] = [];
      if (challengeIds.length > 0) {
        const { data: joinedData, error: joinedError } = await supabase
          .from("challenge_participants")
          .select(
            `id,
            created_at,
            challenge_id,
            user:user_id (
              id,
              username,
              profile_picture_url
            ),
            challenge:challenge_id (
              id,
              title
            )`
          )
          .in("challenge_id", challengeIds)
          .order("created_at", { ascending: false });

        if (joinedError) throw joinedError;

        joinItems = (joinedData || []).map((row: ChallengeParticipant) => ({
          id: row.id,
          type: "joined_challenge",
          username: row.user?.username || "Unknown",
          userId: row.user?.id, // Added userId
          avatarUrl: row.user?.profile_picture_url || "",
          submissionTitle: row.challenge?.title || "",
          submissionId: row.challenge?.id, // Added submissionId
          createdAt: row.created_at,
        }));
      }

      // B) "Someone commented on your challenge"
      let commentItems: NotificationItem[] = [];
      if (challengeIds.length > 0) {
        const { data: commentData, error: commentError } = await supabase
          .from("comments")
          .select(
            `id,
            created_at,
            content,
            challenge_id,
            user:user_id (
              id,
              username,
              profile_picture_url
            ),
            challenge:challenge_id (
              id,
              title
            )`
          )
          .in("challenge_id", challengeIds)
          .order("created_at", { ascending: false });

        if (commentError) throw commentError;

        commentItems = (commentData || []).map((row: Comment) => ({
          id: row.id,
          type: "commented",
          username: row.user?.username || "Unknown",
          userId: row.user?.id, // Added userId
          avatarUrl: row.user?.profile_picture_url || "",
          submissionTitle: row.challenge?.title || "",
          submissionId: row.challenge?.id, // Added submissionId
          commentText: row.content,
          createdAt: row.created_at,
        }));
      }

      // C) "Someone liked your challenge"
      let likeItems: NotificationItem[] = [];
      if (challengeIds.length > 0) {
        const { data: likeData, error: likeError } = await supabase
          .from("likes")
          .select(
            `id,
            created_at,
            submission_id,
            user:user_id (
              id,
              username,
              profile_picture_url
            ),
            submission:submission_id (
              id,
              title
            )`
          )
          .in("submission_id", challengeIds)
          .order("created_at", { ascending: false });

        if (likeError) {
          console.error("Error fetching likes:", likeError);
          throw likeError;
        }

        console.log("Fetched likes:", likeData);

        if (likeData.length === 0) {
          console.warn("No likes found for the user's submissions.");
        } else {
          console.log(`Found ${likeData.length} likes for the user's submissions.`);
        }

        likeItems = (likeData || []).map((row: Like) => ({
          id: row.id,
          type: "liked",
          username: row.user?.username || "Unknown",
          userId: row.user?.id, // Added userId
          avatarUrl: row.user?.profile_picture_url || "",
          submissionTitle: row.submission?.title || "",
          submissionId: row.submission?.id, // Added submissionId
          createdAt: row.created_at,
        }));
      }

      // D) "Someone followed you"
      const { data: followData, error: followError } = await supabase
        .from("follows")
        .select(
          `id,
          created_at,
          follower:follower_id (
            id,
            username,
            profile_picture_url
          )`
        )
        .eq("following_id", user.id)
        .order("created_at", { ascending: false });

      if (followError) throw followError;

      const followItems: NotificationItem[] = (followData || []).map((row: Follow) => ({
        id: row.id,
        type: "followed",
        username: row.follower?.username || "Unknown",
        userId: row.follower?.id, // Added userId
        avatarUrl: row.follower?.profile_picture_url || "",
        createdAt: row.created_at,
      }));

      // E) "Someone mentioned you in a post"
      // "challenges" table has "inspired_by_id" referencing your submission's id
      let mentionItems: NotificationItem[] = [];
      if (challengeIds.length > 0) {
        const { data: newChallenges, error: mentionError } = await supabase
          .from("challenges")
          .select(
            `id,
            created_at,
            title,
            inspired_by_id,
            user:user_id (
              id,
              username,
              profile_picture_url
            )`
          )
          .in("inspired_by_id", challengeIds) // note "inspired_by_id" not "inspired_by"
          .order("created_at", { ascending: false });

        if (mentionError) throw mentionError;

        mentionItems = (newChallenges || []).map((row: Mention) => ({
          id: row.id,
          type: "mentioned_you",
          username: row.user?.username || "Unknown",
          userId: row.user?.id, // Added userId
          avatarUrl: row.user?.profile_picture_url || "",
          submissionTitle: row.title || "",
          submissionId: row.id, // Assuming id is the submission ID
          createdAt: row.created_at,
        }));
      }

      // Combine & Sort
      const combined = [
        ...joinItems,
        ...commentItems,
        ...likeItems,
        ...followItems,
        ...mentionItems,
      ].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      console.log("Combined Notifications:", combined);

      setNotifications(combined);

      // Optionally, mark notifications as read here if needed
    } catch (err: any) {
      Alert.alert("Error Fetching Notifications", err.message);
      console.error("Error in fetchNotifications:", err);
    } finally {
      setLoading(false);
    }
  }

  /** Format notification text */
  function getNotificationText(item: NotificationItem) {
    switch (item.type) {
      case "joined_challenge":
        return `joined your challenge "${item.submissionTitle ?? ""}"`;
      case "commented":
        return `commented on your challenge "${item.submissionTitle ?? ""}"`;
      case "liked":
        return `liked your challenge "${item.submissionTitle ?? ""}"`;
      case "followed":
        return "started following you";
      case "mentioned_you":
        return `mentioned you in their post "${item.submissionTitle ?? ""}"`;
      default:
        return "did something";
    }
  }

  /** Convert createdAt to "3h ago", etc. */
  function timeAgo(dateString: string) {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return days === 1 ? "1 day ago" : `${days} days ago`;
  }

  /** Handle navigation to user profile */
  const handleUserPress = (userId?: string) => {
    if (userId) {
      router.push(`/otheruserprofile?id=${userId}`); // Updated to use query parameter
    } else {
      Alert.alert("User ID not available");
    }
  };

  // Removed handlePostPress function as routing to posts is no longer needed

  // Render each notification row
  const renderNotification = ({ item }: { item: NotificationItem }) => (
    <View style={styles.notificationRow}>
      {/* Navigate to User Profile when avatar or username is pressed */}
      <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
        <Image
          source={{ uri: item.avatarUrl }}
          style={styles.avatar}
        />
      </TouchableOpacity>
      <View style={styles.notificationTextWrapper}>
        <TouchableOpacity onPress={() => handleUserPress(item.userId)}>
          <Text style={styles.username}>{item.username}</Text>
        </TouchableOpacity>
        {/* Removed TouchableOpacity around notification text to disable routing to post */}
        <Text style={styles.notificationText}>{getNotificationText(item)}</Text>
        {item.type === "commented" && item.commentText && (
          <Text style={styles.commentText}>{item.commentText}</Text>
        )}
        <Text style={styles.timestamp}>{timeAgo(item.createdAt)}</Text>
      </View>
    </View>
  );

  // Header without Notification Icon
  // const renderHeader = () => (
  //   <View style={styles.headerContainer}>
  //     <TouchableOpacity onPress={() => router.back()} style={styles.headerIconButton}>
  //       <Ionicons name="arrow-back-outline" size={24} color="#FFF" />
  //     </TouchableOpacity>
  //     <Text style={styles.headerTitle}>Notifications</Text>
  //     <TouchableOpacity
  //       onPress={() => router.push("")} // Update the path as per your routing
  //       style={styles.headerIconButton}
  //     >
  //       <Ionicons name="settings-outline" size={24} color="#FFF" />
  //     </TouchableOpacity>
  //   </View>
  // );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#FFF" />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* {renderHeader()} */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderNotification}
        style={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recent notifications.</Text>
          </View>
        }
      />
    </View>
  );
}

// -----------------------------
//    STYLES
// -----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212", // Dark background for cinematic feel
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#1F1F1F", // Slightly lighter for header
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerIconButton: {
    padding: 6,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  list: {
    flex: 1,
    paddingTop: 5,
  },
  notificationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomColor: "#2C2C2C",
    borderBottomWidth: 1,
    backgroundColor: "#1E1E1E",
    // Add subtle shadows and rounded corners
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderRadius: 8,
    marginHorizontal: 8,
    marginVertical: 3,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#444",
    marginRight: 12,
  },
  notificationTextWrapper: {
    flex: 1,
  },
  username: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 1,
  },
  notificationText: {
    color: "#CCCCCC",
    marginTop: 1,
    fontSize: 13,
    letterSpacing: 0.3,
  },
  commentText: {
    color: "#AAAAAA",
    marginTop: 2,
    fontSize: 12,
    fontStyle: "italic",
  },
  timestamp: {
    color: "#777777",
    fontSize: 11,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 30,
  },
  emptyText: {
    color: "#999999",
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#FFFFFF",
    marginTop: 8,
    fontSize: 14,
  },
});