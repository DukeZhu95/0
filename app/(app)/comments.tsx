// app/(app)/comments.tsx

import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import uuid from "react-native-uuid"; // Install this package for generating unique IDs

import CommentItem from "@/components/videoFeed/CommentItem"; // Ensure correct import path
import { supabase } from "@/config/supabase"; // Ensure correct import path
import { colors } from "@/constants/colours";
import { useTheme } from "@/context/theme-context";
import { useFont } from "@/context/font-context";
import { useTranslation } from "react-i18next";

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

// Define the structure of a Comment
interface Comment {
  id: string; // Changed to string to accommodate temporary UUIDs
  video_id: string;
  user_id: string;
  username: string;
  profile_picture_url: string;
  content: string;
  likes: number;
  user_reaction: string | null;
  created_at: string;
  isTemporary?: boolean; // Flag to identify optimistic comments
}

const CommentPage: React.FC = () => {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();

  const params = useLocalSearchParams<{ video_id: string }>();
  const videoId = params.video_id;

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false); // State for pull-to-refresh

  // User state
  const [user, setUser] = useState<{
    id: string;
    username: string;
    profile_picture_url: string;
  } | null>(null);

  // Ref for FlatList to enable scrolling to latest comment
  const flatListRef = useRef<FlatList>(null);

  // State to track deleting and editing comments
  const [deletingCommentIds, setDeletingCommentIds] = useState<string[]>([]);
  const [editingCommentIds, setEditingCommentIds] = useState<string[]>([]);

  // Fetch current user
  const fetchCurrentUser = useCallback(async () => {
    try {
      const {
        data: { user: supabaseUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (supabaseUser) {
        // Fetch profile_picture_url
        const { data, error: profileError } = await supabase
          .from("users")
          .select("id, username, profile_picture_url")
          .eq("id", supabaseUser.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setUser(data);
      }
    } catch (error: any) {
      console.error("Error fetching current user:", error.message);
      Alert.alert("Error", "Failed to fetch user information.");
    }
  }, []);

  // Fetch comments
  const fetchComments = useCallback(async () => {
    try {
      if (!videoId) throw new Error("Video ID not found.");

      // Fetch comments with related user data
      const { data, error } = await supabase
        .from("comments")
        .select(
          `
          id,
          video_id,
          user_id,
          content,
          likes,
          user_reaction,
          created_at,
          users (
            username,
            profile_picture_url
          )
        `
        )
        .eq("video_id", videoId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const formattedComments: Comment[] = data.map((comment: any) => ({
        id: comment.id,
        video_id: comment.video_id,
        user_id: comment.user_id,
        username: comment.users.username,
        profile_picture_url:
          comment.users.profile_picture_url || "https://placehold.co/40x40",
        content: comment.content,
        likes: comment.likes,
        user_reaction: comment.user_reaction,
        created_at: comment.created_at,
      }));

      setComments(formattedComments);
    } catch (error: any) {
      console.error("Error fetching comments:", error.message);
      Alert.alert("Error", "Failed to fetch comments.");
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop refreshing indicator
    }
  }, [videoId]);

  // Real-time subscription for comments using Supabase v2
  useEffect(() => {
    if (!videoId) return;

    // Initialize a channel for the specific video_id
    const channel = supabase.channel(`comments-for-video-${videoId}`);

    // Subscribe to all changes on the comments table filtered by video_id
    channel
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all event types: INSERT, UPDATE, DELETE
          schema: "public",
          table: "comments",
          filter: `video_id=eq.${videoId}`,
        },
        async (payload) => {
          console.log("Change received!", payload);
          const eventType = payload.eventType;
          const newRecord = payload.new;
          const oldRecord = payload.old;

          if (eventType === "INSERT") {
            // Fetch the user data associated with the comment
            const { data: userData, error: userError } = await supabase
              .from("users")
              .select("username, profile_picture_url")
              .eq("id", newRecord.user_id)
              .single();

            if (userError) {
              console.error("Error fetching user data:", userError.message);
              return;
            }

            const newComment: Comment = {
              id: newRecord.id,
              video_id: newRecord.video_id,
              user_id: newRecord.user_id,
              username: userData.username,
              profile_picture_url:
                userData.profile_picture_url || "https://placehold.co/40x40",
              content: newRecord.content,
              likes: newRecord.likes,
              user_reaction: newRecord.user_reaction,
              created_at: newRecord.created_at,
            };

            setComments((prev) => {
              // Check if a temporary comment with the same ID exists
              const index = prev.findIndex(
                (c) => c.id === newComment.id && c.isTemporary
              );
              if (index !== -1) {
                // Replace the temporary comment with the actual comment
                const updated = [...prev];
                updated[index] = newComment;
                return updated;
              } else {
                // If no temporary comment, simply add the new comment
                return [...prev, newComment];
              }
            });

            // Scroll to the latest comment
            flatListRef.current?.scrollToEnd({ animated: true });
          } else if (eventType === "UPDATE") {
            const updatedComment: Comment = {
              id: newRecord.id,
              video_id: newRecord.video_id,
              user_id: newRecord.user_id,
              username: newRecord.users.username,
              profile_picture_url: newRecord.users.profile_picture_url,
              content: newRecord.content,
              likes: newRecord.likes,
              user_reaction: newRecord.user_reaction,
              created_at: newRecord.created_at,
            };
            setComments((prev) =>
              prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
            );
          } else if (eventType === "DELETE") {
            setComments((prev) => prev.filter((c) => c.id !== oldRecord.id));
          }
        }
      )
      .subscribe();

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [videoId]);

  useEffect(() => {
    fetchCurrentUser();
    fetchComments();
  }, [fetchCurrentUser, fetchComments]);

  // Add a new comment with optimistic UI update
  const handleAddComment = useCallback(async () => {
    if (!user) {
      Alert.alert("Authentication Required", "Please log in to add comments.");
      return;
    }

    if (newComment.trim() === "") {
      Alert.alert("Error", "Comment cannot be empty.");
      return;
    }

    // Create a temporary comment
    const tempId = uuid.v4().toString();
    const tempComment: Comment = {
      id: tempId,
      video_id: videoId,
      user_id: user.id,
      username: user.username,
      profile_picture_url: user.profile_picture_url,
      content: newComment.trim(),
      likes: 0,
      user_reaction: null,
      created_at: new Date().toISOString(),
      isTemporary: true, // Flag to identify this comment as temporary
    };

    // Optimistically add the comment to the list
    setComments((prev) => [...prev, tempComment]);
    setNewComment("");

    try {
      const { data, error } = await supabase.from("comments").insert([
        {
          id: tempId, // Include the temporary ID
          video_id: videoId,
          user_id: user.id,
          content: newComment.trim(),
          likes: 0,
          user_reaction: null,
        },
      ]).select(`
          id,
          video_id,
          user_id,
          content,
          likes,
          user_reaction,
          created_at,
          users (
            username,
            profile_picture_url
          )
        `);

      if (error || !data) throw error || new Error("Failed to add comment.");

      // No need to manually update comments since real-time subscription handles it
      // Optionally, you can ensure the temporary comment is replaced
      // setComments(prev => prev.filter(c => c.id !== tempId));
    } catch (error: any) {
      console.error("Error adding comment:", error.message);
      Alert.alert("Error", "Failed to add comment.");

      // Remove the temporary comment
      setComments((prev) => prev.filter((c) => c.id !== tempId));
    }
  }, [newComment, videoId, user]);

  // Handle like functionality with optimistic UI updates
  const handleLike = useCallback(
    async (commentId: string, reaction: string | null) => {
      if (!user) {
        Alert.alert(
          "Authentication Required",
          "Please log in to react to comments."
        );
        return;
      }

      // Find the target comment
      const targetComment = comments.find((c) => c.id === commentId);
      if (!targetComment) {
        Alert.alert("Error", "Comment not found.");
        return;
      }

      // Determine the like increment/decrement
      let updatedLikes = targetComment.likes;
      if (targetComment.user_reaction && reaction === null) {
        // Removing reaction
        updatedLikes -= 1;
      } else if (!targetComment.user_reaction && reaction !== null) {
        // Adding new reaction
        updatedLikes += 1;
      }
      // If changing reaction from one to another, likes remain the same

      // Optimistically update the local state
      const updatedComment: Comment = {
        ...targetComment,
        likes: updatedLikes,
        user_reaction: reaction,
      };
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updatedComment : c))
      );

      try {
        const { data, error } = await supabase
          .from("comments")
          .update({
            likes: updatedLikes,
            user_reaction: reaction,
          })
          .eq("id", commentId).select(`
            id,
            video_id,
            user_id,
            content,
            likes,
            user_reaction,
            created_at,
            users (
              username,
              profile_picture_url
            )
          `);

        if (error || !data)
          throw error || new Error("Failed to update reaction.");

        // Real-time subscription will handle updating the comment in the list
      } catch (error: any) {
        console.error("Error updating reaction:", error.message);
        Alert.alert("Error", "Failed to react to comment.");

        // Revert the optimistic update
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  likes: targetComment.likes,
                  user_reaction: targetComment.user_reaction,
                }
              : c
          )
        );
      }
    },
    [comments, user]
  );

  // Handle reply functionality
  const handleReply = useCallback((commentId: string) => {
    // Implement reply functionality here
    // For simplicity, show an alert
    Alert.alert("Reply", `Reply to comment ID: ${commentId}`);
  }, []);

  // Handle pull-to-refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchComments();
  }, [fetchComments]);

  // Handle delete comment with optimistic UI update
  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      // Find the comment to delete
      const commentToDelete = comments.find((c) => c.id === commentId);
      if (!commentToDelete) return;

      // Optimistically remove the comment from the list
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setDeletingCommentIds((prev) => [...prev, commentId]);

      try {
        const { error } = await supabase
          .from("comments")
          .delete()
          .eq("id", commentId);

        if (error) throw error;

        // No need to do anything else since the real-time subscription will handle removing the comment
      } catch (error: any) {
        console.error("Error deleting comment:", error.message);
        Alert.alert("Error", "Failed to delete comment.");

        // Revert the optimistic deletion by re-adding the comment
        setComments((prev) => [...prev, commentToDelete]);
      } finally {
        setDeletingCommentIds((prev) => prev.filter((id) => id !== commentId));
      }
    },
    [comments]
  );

  // Handle edit comment with optimistic UI update
  const handleEditComment = useCallback(
    async (commentId: string, newContent: string) => {
      // Find the comment to edit
      const commentToEdit = comments.find((c) => c.id === commentId);
      if (!commentToEdit) return;

      const originalContent = commentToEdit.content;

      // Optimistically update the comment content
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, content: newContent } : c
        )
      );
      setEditingCommentIds((prev) => [...prev, commentId]);

      try {
        const { data, error } = await supabase
          .from("comments")
          .update({ content: newContent })
          .eq("id", commentId).select(`
          id,
          video_id,
          user_id,
          content,
          likes,
          user_reaction,
          created_at,
          users (
            username,
            profile_picture_url
          )
        `);

        if (error || !data) throw error || new Error("Failed to edit comment.");

        // Real-time subscription will handle updating the comment in the list
      } catch (error: any) {
        console.error("Error editing comment:", error.message);
        Alert.alert("Error", "Failed to edit comment.");

        // Revert the optimistic update
        setComments((prev) =>
          prev.map((c) =>
            c.id === commentId ? { ...c, content: originalContent } : c
          )
        );
      } finally {
        setEditingCommentIds((prev) => prev.filter((id) => id !== commentId));
      }
    },
    [comments]
  );

  // Render individual comment item
  const renderCommentItem = useCallback(
    ({ item }: { item: Comment }) => (
      <CommentItem
        comment={item}
        onLike={(reaction: string | null) => handleLike(item.id, reaction)}
        onReply={() => handleReply(item.id)}
        onDelete={() => handleDeleteComment(item.id)} // Pass delete handler
        onEdit={(newContent: string) => handleEditComment(item.id, newContent)} // Pass edit handler
        colorScheme={colorScheme}
        currentUserId={user ? user.id : null} // Pass currentUserId
      />
    ),
    [
      handleLike,
      handleReply,
      handleDeleteComment,
      handleEditComment,
      colorScheme,
      user,
    ]
  );

  // Scroll to the latest comment when comments list changes
  useEffect(() => {
    if (comments.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [comments]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors[colorScheme]?.background,
      }}
    >
      <KeyboardAvoidingView
        style={{
          flex: 1,
          backgroundColor: colors[colorScheme]?.secondary,
        }}
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.select({ ios: 80, android: 100 })}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            {/* Comments List */}
            <FlatList
              ref={flatListRef}
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderCommentItem}
              contentContainerStyle={{
                padding: 10,
              }}
              initialNumToRender={10}
              maxToRenderPerBatch={10}
              windowSize={21}
              removeClippedSubviews
              ListEmptyComponent={
                !loading && (
                  <Text
                    style={{
                      textAlign: "center",
                      // color: isDark ? "#AAB8C2" : "#657786",
                      marginTop: 20,
                      fontSize: 16,
                    }}
                  >
                    No comments yet. Be the first to comment!
                  </Text>
                )
              }
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  // colors={{colors[colorScheme]?.input}}
                  tintColor="#1da1f2"
                />
              }
            />

            {/* Loading Indicator */}
            {loading && (
              <View
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: [{ translateX: -50 }, { translateY: -10 }],
                  alignItems: "center",
                }}
              >
                <ActivityIndicator size="large" color="#1da1f2" />
                <Text
                  style={{
                    marginTop: 10,
                    color: colors[colorScheme].accent,
                    fontSize: 16,
                  }}
                >
                  Loading comments...
                </Text>
              </View>
            )}

            {/* Input Field */}
            <View
              style={{
                flexDirection: "row",
                padding: 10,
                borderTopWidth: 1,
                borderColor: colors[colorScheme]?.border,
                backgroundColor: colors[colorScheme]?.input,
                alignItems: "center",
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  maxHeight: 100,
                  paddingHorizontal: 15,
                  paddingVertical: 10,
                  backgroundColor: colors[colorScheme]?.input,
                  borderRadius: 20,
                  fontSize: 14,
                  color: colors[colorScheme]?.cardForeground,
                }}
                placeholder="Add a comment..."
                placeholderTextColor={colors[colorScheme]?.mutedForeground}
                value={newComment}
                onChangeText={setNewComment}
                multiline
                onSubmitEditing={handleAddComment}
                returnKeyType="send"
                accessibilityLabel="Comment Input"
              />

              <TouchableOpacity
                style={{
                  marginLeft: 10,
                  backgroundColor: colors[colorScheme]?.card,
                  paddingVertical: 10,
                  paddingHorizontal: 15,
                  borderRadius: 20,
                }}
                onPress={handleAddComment}
                accessible
                accessibilityLabel="Send Comment"
              >
                <Text
                  style={{
                    color: colors[colorScheme]?.cardForeground,
                    fontSize: 14,
                    fontWeight: "bold",
                  }}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CommentPage;
