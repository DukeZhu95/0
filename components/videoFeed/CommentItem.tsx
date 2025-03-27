// app/components/videoFeed/CommentItem.tsx

import { supabase } from "@/config/supabase";
import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";
import { FontAwesome, Entypo } from "@expo/vector-icons"; // Import Entypo
import { useRouter } from "expo-router";
import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Image,
  Modal,
  TextInput,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

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

interface CommentItemProps {
  comment: Comment;
  onLike: (reaction: string | null) => void;
  onReply: () => void;
  onDelete: () => void; // Add onDelete prop
  onEdit: (newContent: string) => void; // Add onEdit prop
  onReport: () => void; // Add onReport prop
  colorScheme: string | null;
  currentUserId: string | null;
}

const reportReasons = [
  "Nudity",
  "Pornography",
  "Violence",
  "Hate Speech",
  "Harassment",
  "Spam",
  "Other",
];

// Mapping of reaction names to emojis
const reactionMap: { [key: string]: string } = {
  Like: "💙", // Changed from "❤️" to "💙"
  "100": "💯",
  Laugh: "😂",
  Sad: "😢",
  Fire: "🔥",
};

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onLike,
  onReply,
  onDelete,
  onEdit,
  onReport,
  // colorScheme,
  currentUserId,
}) => {
  const router = useRouter();
  const [showReactions, setShowReactions] = useState(false);
  const reactionAnimation = useRef(new Animated.Value(0)).current;
  const [floatingEmojis, setFloatingEmojis] = useState<string[]>([]);
  const [isOptionsModalVisible, setIsOptionsModalVisible] = useState(false); // State for options modal
  const [isEditModalVisible, setIsEditModalVisible] = useState(false); // State for edit modal
  const [editedContent, setEditedContent] = useState(comment.content); // State for edited content
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [reportReason, setReportReason] = useState("");

  // Determine if the comment is from the current user
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  const isCurrentUser = currentUserId === comment.user_id;

  const handleReportComment = async () => {
    if (!reportReason) {
      Alert.alert("Error", "Please select a reason for reporting.");
      return;
    }

    try {
      const { error } = await supabase.from("comment_reports").insert([
        {
          comment_id: comment.id,
          reporter_id: currentUserId,
          reason: reportReason,
        },
      ]);

      if (error) throw error;
      Alert.alert("Success", "Comment reported successfully.");
      setReportModalVisible(false);
      setReportReason("");
    } catch (err) {
      Alert.alert("Error", "Failed to report comment. Try again later.");
    }
  };

  // Toggle reactions popup
  const toggleReactions = () => {
    if (!showReactions) {
      setShowReactions(true);
      Animated.spring(reactionAnimation, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(reactionAnimation, {
        toValue: 0,
        useNativeDriver: true,
      }).start(() => setShowReactions(false));
    }
  };

  // Handle selecting a reaction
  const selectReaction = (reaction: string) => {
    onLike(reaction); // Pass the reaction name instead of emoji

    // Trigger floating emoji
    triggerFloatingEmoji(reactionMap[reaction]);

    // Close the reactions popup
    setShowReactions(false);
    reactionAnimation.setValue(0);
  };

  // Trigger a floating emoji
  const triggerFloatingEmoji = (emoji: string) => {
    setFloatingEmojis((prev) => [...prev, emoji]);

    // Remove the emoji after animation
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((item) => item !== emoji));
    }, 2000); // Duration of the animation
  };

  // Handle navigation when tapping on avatar or username
  const handleProfilePress = () => {
    if (isCurrentUser) {
      router.push("/profile"); // Navigate to Profile page
    } else {
      router.push(`/otherusersprofile?id=${comment.user_id}`); // Navigate to OtherUserProfile page with user_id
    }
  };

  // Open Options Modal
  const openOptionsModal = () => {
    setIsOptionsModalVisible(true);
  };

  // Close Options Modal
  const closeOptionsModal = () => {
    setIsOptionsModalVisible(false);
  };

  // Open Edit Modal
  const openEditModal = () => {
    setIsOptionsModalVisible(false);
    setIsEditModalVisible(true);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setEditedContent(comment.content); // Reset edited content
  };

  // Confirm and Save Edit
  const confirmEdit = () => {
    if (editedContent.trim() === "") {
      Alert.alert("Error", "Comment cannot be empty.");
      return;
    }
    onEdit(editedContent.trim());
    setIsEditModalVisible(false);
  };

  // Handle Delete Action with confirmation
  const handleDelete = () => {
    setIsOptionsModalVisible(false);
    Alert.alert(
      "Delete Comment",
      "Are you sure you want to delete this comment?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <View
      style={[
        styles.commentContainer,
        { backgroundColor: colors[colorScheme]?.card },
      ]}
    >
      {/* User Avatar */}
      <TouchableOpacity
        onPress={handleProfilePress}
        accessible
        accessibilityLabel={
          isCurrentUser
            ? "Navigate to your profile"
            : `Navigate to ${comment.username}'s profile`
        }
      >
        <Image
          source={{ uri: comment.profile_picture_url }}
          style={styles.avatar}
        />
      </TouchableOpacity>

      {/* Comment Content */}
      <View style={styles.commentContent}>
        {/* Header with Username and Three-Dot Menu */}
        <View style={styles.commentHeader}>
          {/* Username */}
          <TouchableOpacity
            onPress={handleProfilePress}
            accessible
            accessibilityLabel={
              isCurrentUser
                ? "Navigate to your profile"
                : `Navigate to ${comment.username}'s profile`
            }
          >
            <Text
              style={[
                styles.commentText,
                { color: colorScheme === "dark" ? "#FFFFFF" : "#000000" },
              ]}
            >
              <Text style={styles.username}>{comment.username} </Text>
              {comment.content}
            </Text>
          </TouchableOpacity>

          {/* Three-Dot Menu (Visible Only to Comment Author) */}
          {isCurrentUser && (
            <TouchableOpacity
              onPress={openOptionsModal}
              style={styles.menuButton}
              accessible
              accessibilityLabel="Comment Options"
            >
              <Entypo
                name="dots-three-vertical"
                size={20}
                color={colorScheme === "dark" ? "#AAB8C2" : "#657786"}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Timestamp */}
        <Text
          style={[
            styles.timestamp,
            { color: colorScheme === "dark" ? "#AAB8C2" : "#657786" },
          ]}
        >
          {new Date(comment.created_at).toLocaleString()}
        </Text>

        {/* Actions: Like and Reply */}
        <View style={styles.actionsContainer}>
          {/* Like Button */}
          <TouchableOpacity
            onPress={() => onLike(comment.user_reaction ? null : "Like")}
            onLongPress={toggleReactions}
            style={styles.actionButton}
            accessible
            accessibilityLabel="Like Comment"
          >
            {comment.user_reaction ? (
              <Text style={styles.reactionEmoji}>
                {reactionMap[comment.user_reaction] || "💙"}
              </Text>
            ) : (
              <FontAwesome name="heart-o" size={20} color="#657786" />
            )}
            <Text
              style={[
                styles.actionText,
                { color: colorScheme === "dark" ? "#AAB8C2" : "#657786" },
              ]}
            >
              {comment.likes}
            </Text>
          </TouchableOpacity>

          {/* Reply Button */}
          {/* <TouchableOpacity
            onPress={onReply}
            style={styles.actionButton}
            accessible={true}
            accessibilityLabel="Reply to Comment"
          >
            <FontAwesome
              name="reply"
              size={20}
              color={colorScheme === "dark" ? "#AAB8C2" : "#657786"}
            />
            <Text
              style={[
                styles.actionText,
                { color: colorScheme === "dark" ? "#AAB8C2" : "#657786" },
              ]}
            >
              Reply
            </Text>
          </TouchableOpacity> */}

          {/* <TouchableOpacity
            style={styles.modalOption}
            onPress={handleReportComment}
          >
            <Entypo name="flag" size={16} color="#FFA500" />
            <Text style={styles.modalOptionText}>Report</Text>
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.modalOption}
            onPress={() => setReportModalVisible(true)}
          >
            <Entypo name="flag" size={16} color="#FFA500" />
            <Text style={styles.modalOptionText}>Report</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={isReportModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Report this Comment</Text>
            {reportReasons.map((reason) => (
              <TouchableOpacity
                key={reason}
                onPress={() => setReportReason(reason)}
                style={[
                  styles.reasonOption,
                  reportReason === reason && styles.selectedReason,
                ]}
              >
                <Text style={styles.reasonText}>{reason}</Text>
              </TouchableOpacity>
            ))}
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4,  }}
            >
              <TouchableOpacity
                onPress={handleReportComment}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>Submit Report</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ backgroundColor: "gray", padding: 10, marginTop: 10, borderRadius:4 }}
                onPress={() => setReportModalVisible(false)}
              >
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Reactions Popup */}
        {showReactions && (
          <Animated.View
            style={[
              styles.reactionsPopup,
              {
                transform: [{ scale: reactionAnimation }],
                backgroundColor: colorScheme === "dark" ? "#1A1A1A" : "#FFFFFF",
              },
            ]}
          >
            {/* Reactions */}
            {Object.entries(reactionMap).map(([key, emoji]) => (
              <TouchableOpacity
                key={key}
                onPress={() => selectReaction(key)}
                style={styles.reactionButton}
                accessible
                accessibilityLabel={`${key} Reaction`}
              >
                <Text style={styles.reactionEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Floating Emojis */}
        {floatingEmojis.map((emoji, index) => (
          <Animated.View
            key={index}
            style={[
              styles.floatingEmoji,
              {
                transform: [
                  {
                    translateY: new Animated.Value(0).interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -100],
                    }),
                  },
                ],
                opacity: new Animated.Value(1).interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </Animated.View>
        ))}

        {/* Options Modal */}
        <Modal
          visible={isOptionsModalVisible}
          transparent
          animationType="fade"
          onRequestClose={closeOptionsModal}
        >
          <TouchableWithoutFeedback onPress={closeOptionsModal}>
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2C2F33" : "#FFFFFF",
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={openEditModal}
                  accessible
                  accessibilityLabel="Edit Comment"
                >
                  <FontAwesome name="edit" size={20} color="#1DA1F2" />
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: colorScheme === "dark" ? "#FFFFFF" : "#14171A" },
                    ]}
                  >
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={handleDelete}
                  accessible
                  accessibilityLabel="Delete Comment"
                >
                  <FontAwesome name="trash" size={20} color="#E0245E" />
                  <Text style={[styles.modalOptionText, { color: "#E0245E" }]}>
                    Delete
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalCancel}
                  onPress={closeOptionsModal}
                  accessible
                  accessibilityLabel="Cancel"
                >
                  <Text style={[styles.modalCancelText, { color: "#1DA1F2" }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Edit Modal */}
        <Modal
          visible={isEditModalVisible}
          transparent
          animationType="slide"
          onRequestClose={closeEditModal}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.editModalOverlay}>
              <View
                style={[
                  styles.editModalContainer,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2C2F33" : "#FFFFFF",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.editModalTitle,
                    { color: colorScheme === "dark" ? "#FFFFFF" : "#14171A" },
                  ]}
                >
                  Edit Comment
                </Text>
                <TextInput
                  style={[
                    styles.editTextInput,
                    { color: colorScheme === "dark" ? "#FFFFFF" : "#14171A" },
                  ]}
                  value={editedContent}
                  onChangeText={setEditedContent}
                  multiline
                  autoFocus
                  placeholder="Edit your comment..."
                  placeholderTextColor={
                    colorScheme === "dark" ? "#AAB8C2" : "#657786"
                  }
                />
                <View style={styles.editModalButtons}>
                  <TouchableOpacity
                    onPress={closeEditModal}
                    style={styles.cancelEditButton}
                    accessible
                    accessibilityLabel="Cancel Editing"
                  >
                    <Text style={styles.cancelEditButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={confirmEdit}
                    style={styles.saveEditButton}
                    accessible
                    accessibilityLabel="Save Edited Comment"
                  >
                    <Text style={styles.saveEditButtonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </View>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(CommentItem);

const styles = StyleSheet.create({
  commentContainer: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomColor: "#2F3336",
    borderBottomWidth: 1,
    position: "relative", // To position floating emojis relative to this container
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#657786",
    marginRight: 10,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    flexShrink: 1,
  },
  username: {
    fontWeight: "bold",
    color: "#1DA1F2", // Updated to match Twitter Blue
  },
  timestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  actionsContainer: {
    flexDirection: "row",
    marginTop: 5,
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  actionText: {
    fontSize: 14,
    marginLeft: 5,
  },
  reactionEmoji: {
    fontSize: 20, // Match the FontAwesome icon size
  },
  reactionsPopup: {
    position: "absolute",
    bottom: 35,
    left: 0,
    flexDirection: "row",
    borderRadius: 20,
    padding: 5,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  reactionButton: {
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
  },
  floatingEmoji: {
    position: "absolute",
    bottom: 60,
    left: 50,
  },
  emoji: {
    fontSize: 24,
  },
  menuButton: {
    padding: 5,
    position: "absolute",
    marginLeft: 250,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 40,
    marginVertical: 100,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
  },
  modalOptionText: {
    fontSize: 12,
    marginLeft: 8,
    color: "#FFA500",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  reasonOption: {
    // padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  selectedReason: {
    backgroundColor: "#f0f0f0",
  },
  reasonText: {
    fontSize: 16,
    padding: 10,
    color: "black",
  },
  submitButton: {
    backgroundColor: "red",
    borderRadius:4,
    padding: 10,
    marginTop: 10,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    color: "white",
    // marginTop: 10,
  },
  modalCancel: {
    paddingVertical: 10,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  editModalContainer: {
    width: "90%",
    borderRadius: 10,
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  editTextInput: {
    height: 100,
    borderColor: "#E1E8ED",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: "top",
    marginBottom: 20,
    fontSize: 16,
  },
  editModalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelEditButton: {
    marginRight: 10,
  },
  cancelEditButtonText: {
    color: "#1DA1F2",
    fontSize: 16,
  },
  saveEditButton: {
    backgroundColor: "#1DA1F2",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  saveEditButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
