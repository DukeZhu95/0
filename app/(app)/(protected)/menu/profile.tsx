// app/(app)/(protected)/menu/profile.tsx

import { Ionicons, Feather, FontAwesome } from "@expo/vector-icons"; // Added Feather icons
import { decode } from "base64-arraybuffer";
import { Video } from "expo-av";

import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";

import { router, useFocusEffect } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Share,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
  PanResponder,
} from "react-native";

import { Image } from "@/components/image";
import { Card } from "@/components/ui/card";
import { Text } from "@/components/ui/text";

import { supabase } from "@/config/supabase";
import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useSupabase } from "@/context/supabase-provider";
import { useTheme } from "@/context/theme-context";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserSubmissions } from "@/hooks/useUserSubmissions";
import { useUserLikes } from "@/hooks/useUserLikes";
import { useUserFollowers } from "@/hooks/useUserFollowers";
import { useUserFollowing } from "@/hooks/useUserFollowing";
import { useUserJoinedChallenges } from "@/hooks/useUserJoinedChallenges";
import { useQueryClient } from "@tanstack/react-query";
import { Submission } from "@/types";

const { width } = Dimensions.get("window");
const POST_GRID_SIZE = width / 3 - 6; // Adjust for better spacing

interface MenuAction {
  label: string;
  icon: string;
  onPress: () => void;
  color?: string;
}

interface GalleryModalProps {
  visible: boolean;
  submission: Submission;
  onClose: () => void;
  onDelete: () => void;
  onShare: () => void;
}

const GalleryModal: React.FC<GalleryModalProps> = ({
  visible,
  submission,
  onClose,
  onDelete,
  onShare,
}) => {
  const translateY = new Animated.Value(1000);
  const backgroundOpacity = new Animated.Value(0);

  const menuActions: MenuAction[] = [
    {
      label: "Copy",
      icon: "copy-outline",
      onPress: () => {
        /* Copy functionality */
      },
    },
    {
      label: "Share",
      icon: "share-outline",
      onPress: onShare,
    },
    {
      label: "Favourite",
      icon: "heart-outline",
      onPress: () => {
        /* Favorite functionality */
      },
    },
    {
      label: "Hide",
      icon: "eye-off-outline",
      onPress: () => {
        /* Hide functionality */
      },
    },
    {
      label: "Add to Album",
      icon: "albums-outline",
      onPress: () => {
        /* Add to album functionality */
      },
    },
    {
      label: "Delete",
      icon: "trash-outline",
      color: "#FF3B30",
      onPress: onDelete,
    },
  ];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 12,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(backgroundOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Animated.View
        style={[styles.modalOverlay, { opacity: backgroundOpacity }]}
        onTouchEnd={onClose}
      >
        <Animated.View
          style={[
            styles.menuContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          <View style={styles.menuHeader} />
          {menuActions.map((action, index) => (
            <TouchableOpacity
              key={action.label}
              style={[
                styles.menuItem,
                index === menuActions.length - 1 && styles.deleteButton,
              ]}
              onPress={() => {
                action.onPress();
                onClose();
              }}
            >
              <Text
                style={[
                  styles.menuText,
                  action.color && { color: action.color },
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default function Profile() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  const { user } = useSupabase();
  const queryClient = useQueryClient(); // ✅ Create query client instance
  const [activeTab, setActiveTab] = useState<"posts" | "likes" | "challenges">(
    "posts"
  );

  const { data: profile, isLoading: loadingProfile } = useUserProfile(user?.id);
  const {
    data: submissions,
    isLoading: loadingSubmissions,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchSubmissions,
  } = useUserSubmissions(user?.id);
  const { data: likedPosts, isLoading: loadingLikes } = useUserLikes(user?.id);
  const { data: followers } = useUserFollowers(user?.id);
  const { data: following } = useUserFollowing(user?.id);
  const { data: joinedChallenges } = useUserJoinedChallenges(user?.id);
  // const [deletingSubmission, setDeletingSubmission] = useState(false);
  const [deletingSubmissions, setDeletingSubmissions] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [batchDeleting, setBatchDeleting] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState<boolean>(false);
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Add cleanup effect for batch deleting when navigating away
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Cleanup function that runs when screen loses focus
        setBatchDeleting(false);
        setSelectedVideos([]);
        setShowMoreMenu(false);
        setDeletingSubmissions({});
      };
    }, [])
  );

  // Add cleanup effect for batch deleting when component unmounts
  useEffect(() => {
    return () => {
      // Cleanup function that runs when component unmounts
      setBatchDeleting(false);
      setSelectedVideos([]);
      setShowMoreMenu(false);
      setDeletingSubmissions({});
    };
  }, []);

  useEffect(() => {
    if (submissions?.pages.flat().length > 0) {
      const initialDeletingState = submissions.pages
        .flat()
        .reduce((acc, curr) => ({ ...acc, [curr.id]: false }), {});
      setDeletingSubmissions(initialDeletingState);
    }
  }, [submissions]);

  useEffect(() => {
    if (batchDeleting) {
      setSelectedVideos([]);
    }
  }, [batchDeleting]);

  const toggleItemSelect = (id: string) => {
    if (selectedVideos.includes(id)) {
      setSelectedVideos((prevIds) => prevIds.filter((itemId) => itemId !== id));
    } else {
      setSelectedVideos((prevIds) => [...prevIds, id]);
    }
  };

  // Add image picking functionality
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "We need permission to access your photos."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        await uploadProfilePicture(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
      console.error("Error picking image:", error);
    }
  };

  // Add upload functionality
  const uploadProfilePicture = async (uri: string) => {
    if (!user?.id) return;

    setUploadingImage(true);
    try {
      // Optimistically update UI before uploading
      queryClient.setQueryData(
        ["userProfile", user?.id],
        (oldProfile: any) => ({
          ...oldProfile,
          profile_picture_url: uri, // Show new image immediately
        })
      );

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert to ArrayBuffer
      const arrayBuffer = decode(base64);

      // Get file info
      const fileName = uri.split("/").pop();
      const extension = fileName?.split(".").pop();
      const filePath = `${user.id}/profile-${Date.now()}.${extension}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, arrayBuffer, {
          contentType: `image/${extension}`,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      const publicUrl = publicData.publicUrl;
      // console.log("Profile picture uploaded. Public URL:", publicUrl);

      // Update profile with new image URL
      await supabase
        .from("users")
        .update({ profile_picture_url: publicUrl })
        .eq("id", user.id);

      // ✅ Force profile to refresh after updating the picture
      queryClient.invalidateQueries(["userProfile", user?.id]);

      Alert.alert("Success", "Profile picture updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update profile picture");
      console.error("Error uploading profile picture:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  // Share Referral Link
  const shareReferralLink = async () => {
    if (!user?.id) {
      Alert.alert(
        t("profile.errors.generalError"),
        t("profile.errors.generalError")
      );
      return;
    }
    const referralUrl = `https://www.challenzapp.com/sign-up?ref=${user.id}`;
    try {
      await Share.share({
        title: t("profile.referral.successShare.title"),
        message: t("profile.referral.successShare.message", { referralUrl }),
      });
    } catch (shareErr: any) {
      Alert.alert(
        t("profile.referral.shareError.title"),
        shareErr.message || t("profile.referral.shareError.message")
      );
    }
  };

  const handleInbox = () => {
    router.push("/(app)/(protected)/(home)/(tabs)");
  };

  const handleDeleteSelectedSubmissions = async () => {
    Alert.alert(
      t("profile.buttons.deleteSelectedAlert.title"),
      t("profile.buttons.deleteSelectedAlert.message"),
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Start loading spinner for all selected submissions
              // setDeletingSubmissions((prev) =>
              //   selectedVideos.reduce(
              //     (acc, curr) => ({ ...acc, [curr]: true }),
              //     prev
              //   )
              // );

              // 1. Delete related likes first
              const { error: deleteLikesError } = await supabase
                .from("likes")
                .delete()
                .in(
                  "submission_id",
                  selectedVideos.map((video) => video)
                );

              if (deleteLikesError) throw deleteLikesError;

              // 2. Fetch all selected submissions to get the video URLs
              const { data: submissionsData, error: fetchError } =
                await supabase
                  .from("submissions")
                  .select("video_url")
                  .in(
                    "id",
                    selectedVideos.map((video) => video)
                  )
                  .eq("user_id", user?.id);

              if (fetchError) throw fetchError;

              // 3. Determine the storage paths from the video URLs
              const filePaths = submissionsData.map((submission) => {
                const url = new URL(submission.video_url);
                const pathSegments = url.pathname.split("/");
                return pathSegments.slice(5).join("/"); // Example: public/videos
              });

              // 4. Delete the video files from storage
              const { error: storageError } = await supabase.storage
                .from("public") // Replace with your actual storage bucket name
                .remove(filePaths);

              if (storageError) throw storageError;

              // 5. Delete the submission records from the database
              const { error: deleteError } = await supabase
                .from("submissions")
                .delete()
                .in(
                  "id",
                  selectedVideos.map((video) => video)
                )
                .eq("user_id", user?.id);

              if (deleteError) throw deleteError;

              // 6. Invalidate and refetch queries to update the UI
              await queryClient.invalidateQueries([
                "userSubmissions",
                user?.id,
              ]);
              await refetchSubmissions();

              Alert.alert(
                t("profile.buttons.deleteSelectedSuccess.title"),
                t("profile.buttons.deleteSelectedSuccess.message")
              );
            } catch (error: any) {
              Alert.alert(
                t("profile.buttons.deleteError.title"),
                error.message || t("profile.buttons.deleteError.message")
              );

              setBatchDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleDeleteSubmission = async (submissionId: string) => {
    Alert.alert(
      t("profile.buttons.deleteVideoAlert.title"),
      t("profile.buttons.deleteVideoAlert.message"),
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Start loading spinner for the specific submission
              setDeletingSubmissions((prev) => ({
                ...prev,
                [submissionId]: true,
              }));

              // 1. Delete related likes first
              const { error: deleteLikesError } = await supabase
                .from("likes")
                .delete()
                .eq("submission_id", submissionId);

              if (deleteLikesError) throw deleteLikesError;

              // 2. Fetch the submission to get the video URL
              const { data: submissionData, error: fetchError } = await supabase
                .from("submissions")
                .select("video_url")
                .eq("id", submissionId)
                .eq("user_id", user?.id)
                .single();

              if (fetchError) throw fetchError;

              const videoUrl = submissionData.video_url;
              if (!videoUrl) {
                throw new Error(t("profile.errors.generalError"));
              }

              // 3. Determine the storage path from the video URL
              const url = new URL(videoUrl);
              const pathSegments = url.pathname.split("/");
              const filePath = pathSegments.slice(5).join("/");

              // 4. Delete the video file from storage
              const { error: storageError } = await supabase.storage
                .from("public") // Replace with your actual storage bucket name
                .remove([filePath]);

              if (storageError) throw storageError;

              // 5. Delete the submission record from the database
              const { error: deleteError } = await supabase
                .from("submissions")
                .delete()
                .eq("id", submissionId)
                .eq("user_id", user?.id);

              if (deleteError) throw deleteError;

              // 6. Invalidate and refetch queries to update the UI
              await queryClient.invalidateQueries([
                "userSubmissions",
                user?.id,
              ]);
              await refetchSubmissions();

              Alert.alert(
                t("profile.buttons.deleteSuccess.title"),
                t("profile.buttons.deleteSuccess.message")
              );
            } catch (error: any) {
              Alert.alert(
                t("profile.buttons.deleteError.title"),
                error.message || t("profile.buttons.deleteError.message")
              );
            } finally {
              // Stop loading spinner for the specific submission
              setDeletingSubmissions((prev) => ({
                ...prev,
                [submissionId]: false,
              }));
            }
          },
        },
      ]
    );
  };

  // Function to determine what data to show
  const renderTabContent = () => {
    if (activeTab === "posts") return submissions?.pages.flat() || [];
    if (activeTab === "likes") return likedPosts || [];
    if (activeTab === "challenges") return joinedChallenges || [];
  };

  // Dynamic empty state message
  // const getEmptyMessage = () => {
  //   if (activeTab === "posts") return t("profile.posts.noVideos");
  //   if (activeTab === "likes") return t("profile.likes.noLikedVideos");
  //   if (activeTab === "challenges")
  //     return t("profile.challenges.noJoinedChallenges");
  //   return "";
  // };

  // Handle Video Press
  const handleVideoPress = (submissionId: string) => {
    router.push(`/submissionDetails?submissionId=${submissionId}`);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries(["userProfile", user?.id]);
    await queryClient.invalidateQueries(["userSubmissions", user?.id]);
    setRefreshing(false);
  };

  // Render Loading State
  if (loadingProfile || loadingSubmissions || loadingLikes) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#ff6347" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={renderTabContent()}
        extraData={selectedVideos}
        refreshing={refreshing}
        onRefresh={onRefresh}
        numColumns={3}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View
            style={
              {
                // backgroundColor: colors[colorScheme]?.destructive,
                // color: colors[colorScheme]?.primary,
                // fontFamily: selectedFont,
              }
            }
          >
            {/* Profile Section */}
            <View
              // variant="default"
              style={{
                backgroundColor: colors[colorScheme]?.muted,
                // border:"none"
              }}
              className="py-4 mb-4 "
            >
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  onPress={pickImage}
                  disabled={uploadingImage}
                  className="relative"
                >
                  <Image
                    source={
                      profile.profile_picture_url
                        ? { uri: profile.profile_picture_url }
                        : require("@/assets/images/avatar.png")
                    }
                    className="w-24 h-24 rounded-full bg-gray-300"
                  />
                  {uploadingImage && (
                    <View className="absolute inset-0 justify-center items-center bg-black/30 rounded-full">
                      <ActivityIndicator color="white" />
                    </View>
                  )}
                  <View className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-2">
                    <Ionicons name="camera" size={16} color="white" />
                  </View>
                </TouchableOpacity>
                {/* User Info */}
                <View className="flex-1">
                  <Text
                    style={{
                      color: colors[colorScheme]?.background,
                      fontFamily: selectedFont,
                    }}
                    className="text-2xl font-bold"
                  >
                    {profile.first_name} {profile.last_name}
                  </Text>
                  <Text
                    style={{
                      color: colors[colorScheme]?.primary,
                      fontFamily: selectedFont,
                    }}
                    className="text-lg text-gray-500"
                  >
                    @{profile.username}
                  </Text>
                  {profile.bio && (
                    <Text
                      style={{
                        color: colors[colorScheme]?.mutedForeground,
                        fontFamily: selectedFont,
                      }}
                      className="text-sm text-gray-500 mt-1"
                    >
                      {profile.bio}
                    </Text>
                  )}
                </View>
              </View>

              {/* Counts Section */}
              <View className="flex-row justify-around mt-4">
                <TouchableOpacity
                  // onPress={() => router.push(`/Posts?userId=${user.id}`)}
                  accessibilityLabel="View Posts"
                  className="items-center"
                >
                  <Text
                    style={{
                      color: colors[colorScheme]?.background,
                      fontFamily: selectedFont,
                    }}
                    className="text-xl text-white font-bold"
                  >
                    {submissions?.pages.flat().length || 0}
                  </Text>
                  <Text
                    style={{
                      color: colors[colorScheme]?.primary,
                      fontFamily: selectedFont,
                    }}
                    className="text-gray-500"
                  >
                    Posts
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/followers?userId=${user.id}`)}
                  accessibilityLabel="View Followers"
                  className="items-center"
                >
                  <Text
                    style={{
                      color: colors[colorScheme]?.background,
                      fontFamily: selectedFont,
                    }}
                    className="text-xl text-white font-bold"
                  >
                    {followers?.length}
                  </Text>
                  <Text
                    style={{
                      color: colors[colorScheme]?.primary,
                      fontFamily: selectedFont,
                    }}
                    className="text-gray-500"
                  >
                    Followers
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push(`/following?userId=${user.id}`)}
                  accessibilityLabel="View Following"
                  className="items-center"
                >
                  <Text
                    style={{
                      color: colors[colorScheme]?.background,
                      fontFamily: selectedFont,
                    }}
                    className="text-xl text-white font-bold"
                  >
                    {following?.length}
                  </Text>
                  <Text
                    style={{
                      color: colors[colorScheme]?.primary,
                      fontFamily: selectedFont,
                    }}
                    className="text-gray-500"
                  >
                    Following
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Additional Info */}
              {/* <View className="mt-4 space-y-2">
                <View className="flex-row justify-between">
                  <Text
                    style={{
                      color: colors[colorScheme]?.primary,
                      fontFamily: selectedFont,
                    }}
                    className="text-sm "
                  >
                    {t("profile.info.email")}
                  </Text>
                  <Text
                    style={{
                      color: colors[colorScheme]?.primary,
                      fontFamily: selectedFont,
                    }}
                    className="text-lg"
                  >
                    {profile.email}
                  </Text>
                </View>

                {profile.phone_number && (
                  <View className="flex-row justify-between">
                    <Text
                      style={{
                        color: colors[colorScheme]?.primary,
                        fontFamily: selectedFont,
                      }}
                      className="text-sm text-gray-500"
                    >
                      Phone
                    </Text>
                    <Text className="text-lg text-secondary">
                      {profile.phone_number}
                    </Text>
                  </View>
                )}

                <View className="flex-row justify-between">
                  <Text
                    style={{
                      color: colors[colorScheme]?.primary,
                      fontFamily: selectedFont,
                    }}
                    className="text-sm text-gray-500"
                  >
                    Uwaci Coins
                  </Text>
                  <Text className="text-secondary">{profile.coins}</Text>
                </View>
              </View> */}

              {/* <View className="flex-row items-center w-full my-4">
                <TouchableOpacity
                  style={{
                    backgroundColor: colors[colorScheme]?.secondary,
                    color: colors[colorScheme]?.primary,
                    fontFamily: selectedFont,
                  }}
                  className="p-4 w-full rounded"
                  onPress={() =>
                    router.push(`/(app)/(protected)/coin?userID=${profile.id}`)
                  }
                  accessibilityLabel={t("profile.buttons.inviteFriends")}
                >
                  <Text
                    style={{
                      color: colors[colorScheme]?.primary,
                      fontFamily: selectedFont,
                    }}
                    className=" text-center"
                  >
                    Coins and Badges Unlocked
                  </Text>
                </TouchableOpacity>
              </View> */}

              {/* Action Buttons */}
              <View className="flex-row items-center w-full mb-4 gap-1">
                <TouchableOpacity
                  style={{
                    backgroundColor: colors[colorScheme]?.mutedForeground,
                  }}
                  className="w-1/2 p-4 my-4 rounded"
                  onPress={shareReferralLink}
                  accessibilityLabel={t("profile.buttons.inviteFriends")}
                >
                  <Text
                    style={{
                      color: colors[colorScheme]?.foreground,
                      fontFamily: selectedFont,
                    }}
                    className=" text-center"
                  >
                    {t("profile.buttons.inviteFriends")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: colors[colorScheme]?.accent,
                  }}
                  className="w-1/2 p-4 my-4 rounded"
                  onPress={handleInbox}
                  accessibilityLabel={t("profile.buttons.inbox")}
                >
                  <Text
                    style={{
                      color: colors[colorScheme]?.foreground,
                      fontFamily: selectedFont,
                    }}
                    className=" text-center"
                  >
                    {t("profile.buttons.inbox")}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Stats */}
              <View className="flex-row justify-around">
                <TouchableOpacity
                  onPress={() => setActiveTab("posts")}
                  className="items-center text-white"
                >
                  <Text
                    style={{
                      color: colors[colorScheme]?.background,
                      fontFamily: selectedFont,
                    }}
                    className="text-xl font-bold"
                  >
                    {submissions?.pages.flat().length || 0}
                  </Text>
                  <Text
                    style={{
                      color: colors[colorScheme]?.primary,
                      fontFamily: selectedFont,
                    }}
                  >
                    Challenges
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab("likes")}
                  className="items-center"
                >
                  <Text
                    style={{
                      color: colors[colorScheme]?.background,
                      fontFamily: selectedFont,
                    }}
                    className="text-xl font-bold"
                  >
                    {likedPosts?.length || 0}
                  </Text>
                  <Text
                    style={{
                      color: colors[colorScheme]?.primary,
                      fontFamily: selectedFont,
                    }}
                    className="text-white"
                  >
                    Likes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab("challenges")}
                  className="items-center"
                >
                  <Text
                    style={{
                      color: colors[colorScheme]?.background,
                      fontFamily: selectedFont,
                    }}
                    className="text-xl font-bold"
                  >
                    {joinedChallenges?.length || 0}
                  </Text>
                  <Text
                    style={{
                      color: colors[colorScheme]?.primary,
                      fontFamily: selectedFont,
                    }}
                    className="text-white"
                  >
                    Joined
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Small Select Videos Button */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 4,
                  gap: 8,
                  alignItems: "center",
                }}
              >
                {batchDeleting && (
                  <TouchableOpacity
                    style={{
                      backgroundColor: colors[colorScheme]?.destructive,
                      opacity: selectedVideos.length ? 1 : 0.5,
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      borderRadius: 4,
                    }}
                    onPress={handleDeleteSelectedSubmissions}
                    disabled={!selectedVideos.length}
                  >
                    <Text
                      style={{
                        color: "white",
                        fontFamily: selectedFont,
                        fontSize: 12,
                      }}
                    >
                      Delete{" "}
                      {selectedVideos.length > 0
                        ? `(${selectedVideos.length})`
                        : ""}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={{
                    backgroundColor: colors[colorScheme]?.mutedForeground,
                    opacity: submissions?.pages.flat().length ? 1 : 0.5,
                    paddingVertical: 4,
                    paddingHorizontal: 8,
                    borderRadius: 4,
                  }}
                  onPress={() => {
                    if (batchDeleting) {
                      setBatchDeleting(false);
                      setSelectedVideos([]);
                    } else if (submissions?.pages.flat().length) {
                      setBatchDeleting(true);
                    }
                  }}
                  disabled={!submissions?.pages.flat().length}
                >
                  <Text
                    style={{
                      color: "white",
                      fontFamily: selectedFont,
                      fontSize: 12,
                    }}
                  >
                    {batchDeleting ? "Done" : "Select"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={{
              width: POST_GRID_SIZE,
              height: POST_GRID_SIZE,
              backgroundColor: colors[colorScheme]?.background,
            }}
            className="mb-1 justify-center items-center relative"
          >
            {batchDeleting ? (
              <TouchableOpacity
                className="w-full h-full relative"
                accessibilityLabel={t("profile.buttons.deleteVideo")}
                onPress={() => toggleItemSelect(item.id)}
              >
                {item.video_url ? (
                  <View className="w-full h-full">
                    <Video
                      source={{ uri: item.video_url }}
                      rate={1.0}
                      volume={0.0}
                      isMuted
                      resizeMode="cover"
                      shouldPlay={false}
                      isLooping={false}
                      style={{ width: "100%", height: "100%" }}
                    />
                  </View>
                ) : (
                  <View
                    style={{
                      backgroundColor: colors[colorScheme]?.background,
                    }}
                    className="w-full h-full justify-center items-center"
                  >
                    <Ionicons
                      name="videocam-off-outline"
                      size={24}
                      color={colors[colorScheme]?.primary}
                    />
                  </View>
                )}
                <View
                  style={{
                    position: "absolute",
                    bottom: 8,
                    left: 8,
                    backgroundColor: selectedVideos.includes(item.id)
                      ? colors[colorScheme]?.destructive
                      : colors[colorScheme]?.mutedForeground,
                    borderRadius: 9999,
                    padding: 4,
                  }}
                >
                  <Ionicons name="checkmark" size={20} color="white" />
                </View>
              </TouchableOpacity>
            ) : (
              <View>
                <TouchableOpacity
                  key={item.id}
                  onPress={() => handleVideoPress(item.id)}
                  onLongPress={() => {
                    setSelectedSubmission(item);
                    setShowGalleryModal(true);
                  }}
                  delayLongPress={200}
                  activeOpacity={0.7}
                  className="w-full h-full"
                >
                  {item.video_url ? (
                    <View className="w-full h-full">
                      <Video
                        source={{ uri: item.video_url }}
                        rate={1.0}
                        volume={0.0}
                        isMuted
                        resizeMode="cover"
                        shouldPlay={false}
                        isLooping={false}
                        style={{ width: "100%", height: "100%" }}
                      />
                      <Ionicons
                        name="play-circle-outline"
                        size={32}
                        color="white"
                        style={{
                          position: "absolute",
                          alignSelf: "center",
                          top: "40%",
                          opacity: 0.8,
                        }}
                      />
                    </View>
                  ) : (
                    <View
                      style={{
                        backgroundColor: colors[colorScheme]?.background,
                        fontFamily: selectedFont,
                      }}
                      className="w-full h-full justify-center items-center"
                    >
                      <Ionicons
                        name="videocam-off-outline"
                        size={24}
                        color={colors[colorScheme]?.primary}
                      />
                      <Text
                        style={{
                          color: colors[colorScheme]?.primary,
                          fontFamily: selectedFont,
                        }}
                        className="text-xs mt-1"
                      >
                        {t("profile.posts.noVideos")}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ padding: 5 }}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <View className="py-4">
              <ActivityIndicator size="small" color="#ff6347" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center p-4">
            <Text
              style={{
                color: colors[colorScheme]?.primary,
                fontFamily: selectedFont,
              }}
              // className="text-gray-500"
            >
              {t("profile.posts.noVideos")}
            </Text>
          </View>
        }
      />
      <GalleryModal
        visible={showGalleryModal}
        submission={selectedSubmission}
        onClose={() => {
          setShowGalleryModal(false);
          setSelectedSubmission(null);
        }}
        onDelete={() => {
          setShowGalleryModal(false);
          selectedSubmission && handleDeleteSubmission(selectedSubmission.id);
        }}
        onShare={async () => {
          if (selectedSubmission?.video_url) {
            try {
              await Share.share({
                message: selectedSubmission.video_url,
              });
            } catch (error) {
              console.error("Error sharing:", error);
            }
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    backgroundColor: "#1C1C1E",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 34, // Safe area padding
  },
  menuHeader: {
    width: 36,
    height: 5,
    backgroundColor: "#808080",
    borderRadius: 3,
    alignSelf: "center",
    marginVertical: 8,
  },
  menuItem: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  menuText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "400",
    textAlign: "center",
  },
  deleteButton: {
    borderBottomWidth: 0,
    marginTop: 8,
  },
});
