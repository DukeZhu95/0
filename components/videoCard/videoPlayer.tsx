// components/videoCard/videoPlayer.tsx

import React, { useRef, useState, useEffect } from "react";
import {
  Dimensions,
  View,
  TouchableOpacity,
  Text,
  Share,
  Alert,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
  Image,
  Modal,
  Pressable,
  TextInput,
  Platform,
} from "react-native";
import { Video } from "expo-av";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { supabase } from "@/config/supabase"; // Ensure correct path
import { useAuth } from "@/context/supabase-provider"; // Ensure correct path
import { Post } from "@/types"; // Adjust the path as necessary

import { useTranslation } from "react-i18next";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";
import { colors } from "@/constants/colours";
import CustomButton from "@/components/common/CustomButton";

// Import CameraRoll for saving media to the device's camera roll (for iOS)
import * as MediaLibrary from "expo-media-library";
import * as FileSystem from "expo-file-system";

interface VideoPlayerProps {
  post: Post;
  isFocused: boolean;
  onVideoEnd?: () => void;
  onInspiredByPress?: () => void; // Optional prop for 'challenge' posts
  hideInteractiveButtons?: boolean;
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  animation: Animated.Value;
}

interface UserProfile {
  id: string;
  username: string;
  // Add other fields if necessary
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  post,
  isFocused,
  onVideoEnd,
  onInspiredByPress,
  hideInteractiveButtons,
}) => {
  const router = useRouter();
  const videoRef = useRef<Video>(null);

  // Use Auth Context
  const { user } = useAuth();
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  // Local states
  const [isMuted, setIsMuted] = useState(false);
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [showReactions, setShowReactions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showMuteButton, setShowMuteButton] = useState(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [creatorProfilePic, setCreatorProfilePic] = useState<string | null>(
    null
  );
  const [isFollowing, setIsFollowing] = useState<boolean>(false);
  const [followCount, setFollowCount] = useState<number>(0);
  const [hasJoinedChallenge, setHasJoinedChallenge] = useState<boolean>(false); // New state
  const [reportModalVisible, setReportModalVisible] = useState<boolean>(false);
  const [report, setReport] = useState<string>("");
  const [videoProgress, setVideoProgress] = useState(0);
  const [showMoreMenu, setShowMoreMenu] = useState(false); // State for more menu
  const [isScreenCleared, setIsScreenCleared] = useState(false); // State for clear screen toggle
  // Animated values
  const reactionAnimation = useRef(new Animated.Value(0)).current;
  const muteButtonOpacity = useRef(new Animated.Value(0)).current;
  const [joinChallengeModal, setJoinChallengeModal] = useState<boolean>(false);

  // Refs for managing timeouts
  const reactionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const floatingEmojisTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const floatingEmojiId = useRef(0);

  // Reaction mapping
  const reactionMap: { [key: string]: string } = {
    Like: "💖",
    "100": "💯",
    Laugh: "😂",
    Sad: "😢",
    Fire: "🔥",
  };

  // Authenticated user's profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Add this new state to track the last tap time
  const [lastTap, setLastTap] = useState<Date>(new Date(0));
  const singleTapTimeout = useRef<NodeJS.Timeout>();

  // Fetch current authenticated user and their profile from 'users' table
  useEffect(() => {
    const fetchUser = async () => {
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("id, username")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Error fetching user profile:", profileError.message);
          Alert.alert("Error", "Failed to fetch user profile.");
        } else {
          setCurrentUser(profile);
        }
      }
    };

    fetchUser();
  }, [user]);

  // Fetch creator's profile picture from 'users' table
  useEffect(() => {
    const fetchCreatorProfilePic = async () => {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("profile_picture_url")
          .eq("id", post.creator.id)
          .single();
        if (error) {
          throw error;
        }
        setCreatorProfilePic(data.profile_picture_url);
      } catch (error: any) {
        console.error("Error fetching creator profile picture:", error.message);
        setCreatorProfilePic(null);
      }
    };

    fetchCreatorProfilePic();
  }, [post.creator.id]);

  // Fetch Follow Count
  const fetchFollowCount = async () => {
    try {
      const { count, error } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", post.creator.id);

      if (error) {
        throw error;
      }

      setFollowCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching follow count:", error.message);
    }
  };

  // Fetch Likes Count
  const fetchLikesCount = async () => {
    try {
      const { count, error } = await supabase
        .from("likes")
        .select("*", { count: "exact", head: false })
        .eq(
          post.type === "submission" ? "submission_id" : "challenge_id",
          post.id
        );

      if (error) {
        throw error;
      }

      setLikesCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching likes count:", error.message);
    }
  };

  // Add this function to handle downloading the video
  const handleDownload = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert(
        "Not Available",
        "Download is only available on iOS devices."
      );
      return;
    }

    try {
      // Request permissions first
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "Please grant permission to save videos to your camera roll."
        );
        return;
      }

      // Show loading indicator
      Alert.alert("Downloading", "Video is being downloaded to your device...");

      // Get the file extension from the URL
      const fileExtension = post.video_url.split(".").pop();
      const localUri =
        FileSystem.documentDirectory + `video-${Date.now()}.${fileExtension}`;

      // Download the file
      const downloadResumable = FileSystem.createDownloadResumable(
        post.video_url,
        localUri,
        {},
        (downloadProgress) => {
          const progress =
            downloadProgress.totalBytesWritten /
            downloadProgress.totalBytesExpectedToWrite;
          // You could update a progress indicator here if desired
        }
      );

      const { uri } = await downloadResumable.downloadAsync();

      // Save to camera roll
      const asset = await MediaLibrary.createAssetAsync(uri);

      // Create an album and add the asset to it (optional)
      const album = await MediaLibrary.getAlbumAsync("Challenz");
      if (album === null) {
        await MediaLibrary.createAlbumAsync("Challenz", asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      // Close the menu
      setShowMoreMenu(false);

      // Alert success
      Alert.alert(
        "Success",
        "Video has been saved to your camera roll in the Challenz album."
      );
    } catch (error) {
      console.error("Error downloading video:", error);
      Alert.alert(
        "Download Failed",
        "There was an error downloading the video. Please try again later."
      );
    }
  };

  // Fetch Comments Count
  const fetchCommentsCount = async () => {
    try {
      const { count, error } = await supabase
        .from("comments")
        .select("*", { count: "exact", head: false })
        .eq("video_id", post.id);

      if (error) {
        throw error;
      }

      setCommentsCount(count || 0);
    } catch (error: any) {
      console.error("Error fetching comments count:", error.message);
      Alert.alert("Error", "Failed to fetch comments count.");
    }
  };

  // Check if the user has already liked the post, if they are following the creator, and if they've joined the challenge
  useEffect(() => {
    const checkIfLiked = async () => {
      if (user) {
        const foreignKey =
          post.type === "submission" ? "submission_id" : "challenge_id";
        const { data, error } = await supabase
          .from("likes")
          .select("reaction")
          .eq(foreignKey, post.id)
          .eq("user_id", user.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            setUserReaction(null);
          } else {
            console.error("Error checking like status:", error.message);
          }
        } else if (data) {
          setUserReaction(data.reaction);
        }
      }
    };

    const checkIfFollowing = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("follows")
          .select("*")
          .eq("follower_id", user.id)
          .eq("following_id", post.creator.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            setIsFollowing(false);
          } else {
            console.error("Error checking follow status:", error.message);
          }
        } else if (data) {
          setIsFollowing(true);
        }
      }
    };

    const checkIfJoinedChallenge = async () => {
      if (user && post.type === "submission") {
        try {
          // Using post.id as challenge_id in user_challenges
          const { data: userChallengeData, error: userChallengeError } =
            await supabase
              .from("user_challenges")
              .select("*")
              .eq("user_id", user.id)
              .eq("challenge_id", post.id);

          if (userChallengeError) {
            console.error(
              "Error checking join challenge status:",
              userChallengeError.message
            );
            setHasJoinedChallenge(false);
          } else if (userChallengeData && userChallengeData.length > 0) {
            setHasJoinedChallenge(true);
          } else {
            setHasJoinedChallenge(false);
          }
        } catch (error: any) {
          console.error("Error checking join challenge status:", error.message);
          setHasJoinedChallenge(false);
        }
      } else {
        setHasJoinedChallenge(false);
      }
    };

    checkIfLiked();
    fetchLikesCount();
    fetchFollowCount();
    fetchCommentsCount();
    checkIfJoinedChallenge();
  }, [user, post.id, post.creator.id, post.type]);

  // Handle focus changes to play/pause the video
  useEffect(() => {
    if (videoRef.current) {
      if (isFocused) {
        videoRef.current.playAsync();
        setIsPlaying(true);

        // Show mute button after 5 seconds
        const muteTimer = setTimeout(() => {
          setShowMuteButton(true);
          Animated.timing(muteButtonOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, 5000);

        return () => {
          clearTimeout(muteTimer);
        };
      } else {
        videoRef.current.pauseAsync();
        setIsPlaying(false);
        setShowMuteButton(false);
        Animated.timing(muteButtonOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }
    }
  }, [isFocused, muteButtonOpacity]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reactionsTimeoutRef.current) {
        clearTimeout(reactionsTimeoutRef.current);
      }
      if (floatingEmojisTimeoutRef.current) {
        clearTimeout(floatingEmojisTimeoutRef.current);
      }
    };
  }, []);

  // Handle video end event
  const handleVideoEndEvent = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  // Modify the handleVideoTap function
  const handleVideoTap = () => {
    const currentTime = new Date();
    const timeDiff = currentTime.getTime() - lastTap.getTime();

    // Clear any pending single tap timeout
    if (singleTapTimeout.current) {
      clearTimeout(singleTapTimeout.current);
      singleTapTimeout.current = null;
    }

    // Check if it's a double tap
    if (timeDiff < 300) {
      // Double tap - trigger like
      toggleLike();
      return;
    }

    // Single tap - handle play/pause after a short delay
    singleTapTimeout.current = setTimeout(() => {
      if (videoRef.current) {
        if (isPlaying) {
          videoRef.current.pauseAsync();
          setIsPlaying(false);
        } else {
          videoRef.current.playAsync();
          setIsPlaying(true);
        }
      }
    }, 300);

    // Update last tap time
    setLastTap(currentTime);
  };

  // Toggle mute state
  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    if (videoRef.current) {
      videoRef.current.setIsMutedAsync(!isMuted);
    }
  };

  // Handle video share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this video: ${post.description}\n${post.video_url}`,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share video.");
    }
  };

  // Handle like button long press to show reactions
  const handleLikeLongPress = () => {
    showReactionsWithTimeout();
  };

  // Show reactions popup with animation and timeout
  const showReactionsWithTimeout = () => {
    setShowReactions(true);
    Animated.spring(reactionAnimation, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    // Clear existing timeout if any
    if (reactionsTimeoutRef.current) {
      clearTimeout(reactionsTimeoutRef.current);
    }

    // Set timeout to hide reactions after 10 seconds
    reactionsTimeoutRef.current = setTimeout(() => {
      setShowReactions(false);
      reactionAnimation.setValue(0);
      reactionsTimeoutRef.current = null;
    }, 10000);
  };

  // Handle reaction selection (treated as like)
  const handleReactionSelect = async (reaction: string) => {
    const emoji = reactionMap[reaction] || "💖";

    if (userReaction) {
      // User has already liked, so unlike
      await unlikeInSupabase();
    } else {
      // User is liking with the selected reaction
      await likeInSupabase(emoji);
    }

    // Clear reactions timeout and hide reactions
    if (reactionsTimeoutRef.current) {
      clearTimeout(reactionsTimeoutRef.current);
      reactionsTimeoutRef.current = null;
    }

    setShowReactions(false);
    reactionAnimation.setValue(0);
  };

  // Toggle like/unlike and update Supabase
  const toggleLike = async () => {
    if (!user) {
      Alert.alert("Authentication Required", "Please log in to like videos.");
      return;
    }

    if (userReaction) {
      await unlikeInSupabase();
    } else {
      await likeInSupabase(reactionMap["Like"]);
    }
  };

  // Function to like the video in Supabase with a specific reaction
  const likeInSupabase = async (reaction: string) => {
    try {
      const foreignKey =
        post.type === "submission" ? "submission_id" : "challenge_id";

      const likeData: any = {
        user_id: user.id,
        reaction,
      };

      likeData[foreignKey] = post.id;

      const { error } = await supabase.from("likes").upsert(likeData, {
        onConflict:
          post.type === "submission"
            ? ["submission_id", "user_id"]
            : ["challenge_id", "user_id"],
      });

      if (error) {
        throw error;
      }

      // Update local state
      setUserReaction(reaction);
      setLikesCount((prev) => prev + 1);

      // Start floating emojis
      startFloatingEmojisLoop(reaction, 5000);
    } catch (error: any) {
      console.error("Error liking video:", error.message);
      if (error.code === "23505") {
        // Unique violation, already liked
        Alert.alert("Already Liked", "You have already liked this video.");
      } else {
        Alert.alert("Error", "Failed to like the video.");
      }
    }
  };

  // Function to unlike the video in Supabase
  const unlikeInSupabase = async () => {
    try {
      const foreignKey =
        post.type === "submission" ? "submission_id" : "challenge_id";

      const { error } = await supabase
        .from("likes")
        .delete()
        .eq(foreignKey, post.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      // Update local state
      setUserReaction(null);
      setLikesCount((prev) => (prev > 0 ? prev - 1 : 0));
    } catch (error: any) {
      console.error("Error unliking video:", error.message);
      Alert.alert("Error", "Failed to unlike the video.");
    }
  };

  // Start floating emojis loop for a specified duration
  const startFloatingEmojisLoop = (
    emoji: string,
    duration: number = 5000,
    intervalTime: number = 300
  ) => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      triggerFloatingEmoji(emoji);

      // Check if duration has passed
      if (Date.now() - startTime >= duration) {
        clearInterval(interval);
      }
    }, intervalTime);

    // Clear the loop after duration
    floatingEmojisTimeoutRef.current = setTimeout(() => {
      clearInterval(interval);
      floatingEmojisTimeoutRef.current = null;
    }, duration);
  };

  // Trigger a floating emoji with animation
  const triggerFloatingEmoji = (emoji: string) => {
    const id = floatingEmojiId.current++;
    const animation = new Animated.Value(0);

    const newEmoji: FloatingEmoji = { id, emoji, animation };
    setFloatingEmojis((prev) => [...prev, newEmoji]);

    // Start the animation
    Animated.timing(animation, {
      toValue: 1,
      duration: 2000, // 2 seconds for rising
      useNativeDriver: true,
    }).start(() => {
      // Remove the emoji after animation completes
      setFloatingEmojis((prev) => prev.filter((item) => item.id !== id));
    });
  };

  const blockUser = async () => {
    try {
      // Insert a record into the blocked_users table
      const { error } = await supabase.from("user_blocks").upsert(
        {
          blocker_id: user.id,
          blocked_id: post.creator.id,
          created_at: new Date(),
        },
        { onConflict: ["blocker_id", "blocked_id"] }
      );

      if (error) {
        console.error("Error blocking user:", error.message);
        Alert.alert("Error", "Failed to block user. Please try again later.");
        return;
      }

      Alert.alert(
        "User Blocked",
        "You have blocked this user and will no longer see their content."
      );
    } catch (error: any) {
      console.error("Error in block user operation:", error.message);
      Alert.alert("Error", "Something went wrong. Please try again.");
    }
  };

  // Realtime subscription for likes count updates
  useEffect(() => {
    const channel = supabase
      .channel(`likes-challenge-${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
          filter:
            post.type === "submission"
              ? `submission_id=eq.${post.id}`
              : `challenge_id=eq.${post.id}`,
        },
        (_payload) => {
          // Re-fetch likes count whenever a like is added or removed
          fetchLikesCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id, post.type]);

  // Realtime subscription for comments count updates
  useEffect(() => {
    const channel = supabase
      .channel(`comments-challenge-${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `video_id=eq.${post.id}`,
        },
        (_payload) => {
          setCommentsCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "comments",
          filter: `video_id=eq.${post.id}`,
        },
        (_payload) => {
          setCommentsCount((prev) => (prev > 0 ? prev - 1 : 0));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id]);

  // Realtime subscription for follow count (INSERT and DELETE)
  useEffect(() => {
    const channel = supabase
      .channel(`follows-creator-${post.creator.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "follows",
          filter: `following_id=eq.${post.creator.id}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setFollowCount((prev) => prev + 1);
          } else if (payload.eventType === "DELETE") {
            setFollowCount((prev) => (prev > 0 ? prev - 1 : 0));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.creator.id]);

  // Realtime subscription for user_challenges (hasJoinedChallenge)
  useEffect(() => {
    if (post.type === "submission" && user) {
      const userJoinChannel = supabase
        .channel(`user-challenges-user-${user.id}-post-${post.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "user_challenges",
            filter: `user_id=eq.${user.id} AND challenge_id=eq.${post.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setHasJoinedChallenge(true);
            } else if (payload.eventType === "DELETE") {
              setHasJoinedChallenge(false);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(userJoinChannel);
      };
    }
  }, [post.type, post.id, user]);

  // **Handle Joining a Challenge for 'submission' Posts**
  const handleJoinChallenge = async () => {
    if (post.type !== "submission") {
      console.log("Attempted to join a challenge on a non-submission post:", {
        postType: post.type,
      });
      Alert.alert("Error", "This post is not eligible to join a challenge.");
      return;
    }

    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please log in to join challenges."
      );
      return;
    }

    if (hasJoinedChallenge) {
      Alert.alert("Already Joined", "You have already joined this challenge.");
      return;
    }

    try {
      console.log("Joining Challenge with the following details:", {
        postId: post.id,
        userId: user.id,
      });

      // **Validation Step: Check if challenge exists in 'submissions' table**
      const { data: challenge, error: challengeError } = await supabase
        .from("submissions")
        .select("*")
        .eq("id", post.id)
        .maybeSingle(); // Removed the type filter

      if (challengeError) {
        console.error("Challenge Validation Error:", challengeError.message);
        Alert.alert(
          "Error",
          "An error occurred while validating the challenge."
        );
        return;
      }

      if (!challenge) {
        console.error("Challenge Validation Error: No challenge found.");
        Alert.alert(
          "Error",
          "The challenge you are trying to join does not exist."
        );
        return;
      }

      // Insert into user_challenges with post.id as challenge_id
      const { error: insertError } = await supabase
        .from("user_challenges")
        .insert([{ user_id: user.id, challenge_id: post.id }]);

      if (insertError) {
        console.error("Insert Error Details:", insertError);
        if (insertError.code === "23505") {
          // Unique violation, user has already joined
          Alert.alert(
            "Already Joined",
            "You have already joined this challenge."
          );
          setHasJoinedChallenge(true);
          return;
        }
        throw insertError;
      }

      // Update local state
      setHasJoinedChallenge(true);

      // Navigate to Join Challenge Screen with Parameters
      router.push({
        pathname: "/(app)/joinchallenge",
        params: {
          initialDuetMode: "true", // Initialize in Duet Mode as string
          challengeVideoUri: post.video_url, // Pass the challenge video URI
          videoId: post.id, // Pass the video ID
        },
      });
    } catch (error: any) {
      console.error("Error joining challenge:", error.message);
      Alert.alert("Error", "Failed to join the challenge.");
    }
  };

  // Handler for joining the challenge with state management
  const onJoinChallengePress = () => {
    setJoinChallengeModal(true);
  };

  const joinChallengeNow = () => {
    if (hasJoinedChallenge) {
      setJoinChallengeModal(false);
      // User has already joined; navigate to the Join Challenge page with the correct path
      router.push({
        pathname: "/(app)/joinchallenge",
        params: {
          videoId: post.id, // Pass the video ID
          challengeVideoUri: post.video_url, // Pass the challenge video URI
        },
      });
    } else {
      // User has not joined; proceed to join the challenge
      handleJoinChallenge();
    }
  };

  const joinChallengeLater = async () => {
    setJoinChallengeModal(false);
    const { error: joinChallengeLaterError } = await supabase
      .from("saved_videos")
      .insert({
        user_id: user.id,
        submission_id: post.id,
      });

    if (joinChallengeLaterError) {
      Alert.alert(
        "Join Challenge Later Error",
        "The challenge could not be saved to join later."
      );
      return;
    }

    router.push({
      pathname: "/savedchallenges",
    });
  };

  const handleReportPress = async () => {
    if (!user) {
      Alert.alert(
        "Authentication Required",
        "Please log in to report content."
      );
      return;
    }

    // Close the more menu and open the report modal
    setShowMoreMenu(false);
    setReportModalVisible(true);
  };

  const handleReportSubmission = async () => {
    try {
      if (report.trim() === "") {
        Alert.alert(
          "Error",
          "Please provide a reason for reporting this content."
        );
        return;
      }

      // Show loading indicator
      Alert.alert("Submitting Report", "Please wait...");

      const { error: insertError } = await supabase.from("reports").insert({
        created_at: new Date(),
        title: post.id,
        description: report,
      });

      if (insertError) {
        console.error("Insert Error Details:", insertError);
        throw insertError;
      }

      // Close modal and reset report text
      setReportModalVisible(false);
      setReport("");

      // Show success message
      Alert.alert(
        "Report Submitted",
        "Thank you for your report. We will review it shortly."
      );
    } catch (error: any) {
      console.error("Error reporting video:", error.message);
      Alert.alert(
        "Error",
        "Failed to submit your report. Please try again later."
      );
    }
  };

  // Handle video progress update
  const handleVideoProgress = (status: any) => {
    if (status.isLoaded && status.durationMillis) {
      setVideoProgress(status.positionMillis / status.durationMillis);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.setOnPlaybackStatusUpdate(handleVideoProgress);
    }
  }, [videoRef]);

  return (
    <View style={styles.container}>
      {/* Early return if post or creator is missing */}
      {!post || !post.creator ? (
        <View style={styles.center}>
          <Text style={{ color: "#fff" }}>Invalid post data.</Text>
        </View>
      ) : (
        <>
          {/* Video Playback with Tap to Play/Pause */}
          <TouchableWithoutFeedback onPress={handleVideoTap}>
            <Video
              ref={videoRef}
              source={{ uri: post.video_url }}
              rate={1.0}
              volume={1.0}
              isMuted={isMuted}
              resizeMode="cover"
              shouldPlay={isFocused && isPlaying}
              isLooping
              style={styles.video}
              onEnd={handleVideoEndEvent}
              accessible={true}
              accessibilityLabel="Video Player"
            />
          </TouchableWithoutFeedback>

          {/* Video Progress Bar */}
          {!isScreenCleared && (
            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${videoProgress * 100}%` },
                ]}
              />
            </View>
          )}

          {/* Overlay UI Components */}
          <View style={styles.overlayContainer}>
            {/* User Info and Description - Hide when screen is cleared */}
            {!isScreenCleared && (
              <View style={styles.userInfoContainer}>
                <TouchableOpacity
                  style={styles.userInfo}
                  onPress={() => {
                    // If the user is the creator of the post,
                    // route them to their own profile.
                    if (user && user.id === post.creator.id) {
                      router.push("/(app)/(protected)/profile");
                    } else {
                      router.push(`/otheruserprofile?id=${post.creator.id}`);
                    }
                  }}
                  accessible={true}
                  accessibilityLabel="Go to user profile"
                >
                  <View style={styles.profilePictureContainer}>
                    {creatorProfilePic ? (
                      <Image
                        source={{ uri: creatorProfilePic }}
                        style={styles.profilePicture}
                        accessible={true}
                        accessibilityLabel={`${post.creator.username}'s profile picture`}
                      />
                    ) : (
                      <View style={styles.profilePicturePlaceholder}>
                        <FontAwesome name="user" size={24} color="#fff" />
                      </View>
                    )}
                    {/* Follow Icon (no unfollow) */}
                    <TouchableOpacity
                      style={styles.followIconContainer}
                      onPress={() =>
                        router.push(`/otheruserprofile?id=${post.creator.id}`)
                      }
                      accessible={true}
                      accessibilityLabel={
                        isFollowing ? "Already Following" : "Tap to Follow"
                      }
                    >
                      <FontAwesome
                        name="plus-circle"
                        size={FOLLOW_ICON_SIZE}
                        color="red"
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.usernameAndFollowCount}>
                    <Text style={styles.username}>
                      {post.creator.username || "Unknown User"}
                    </Text>
                    {/* {!hideInteractiveButtons && (
                      <Text style={styles.followCount}>
                        {followCount}{" "}
                        {followCount === 1 ? "Follower" : "Followers"}
                      </Text>
                    )} */}
                    {/* Boost Button */}
                    {user && user.id === post.creator.id ? (
                      <TouchableOpacity
                        style={{
                          backgroundColor: "transparent",
                          borderRadius: 14,
                          paddingVertical: 2,
                          paddingHorizontal: 16,
                          borderWidth: 1,
                          borderColor: colors[colorScheme]?.border,
                          alignItems: "center", // Center horizontally
                          justifyContent: "center", // Center vertically
                          // position: 'absolute',
                          // marginTop: 30,
                        }}
                        onPress={() =>
                          router.push(
                            `/(app)/(protected)/boostPost/SelectAudienceScreen`
                          )
                        } // Navigate to Boost Post Screen
                      >
                        <Text
                          style={{
                            color: "white",
                            fontSize: 14,
                            fontWeight: "500",
                          }}
                        >
                          Boost
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{
                          backgroundColor: "transparent",
                          borderRadius: 14,
                          paddingVertical: 2,
                          paddingHorizontal: 10,
                          borderWidth: 1,
                          borderColor: colors[colorScheme]?.border,
                          alignItems: "center", // Center horizontally
                          justifyContent: "center", // Center vertically
                          // position: 'absolute',
                          // marginTop: 30,
                        }}
                        onPress={onJoinChallengePress} // Navigate to Boost Post Screen
                      >
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: "500",
                          }}
                        >
                          Join Challenge
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
                <View className="pt-4">
                  <Text className="italic text-muted">{post.title}</Text>
                  <Text style={styles.description}>{post.description}</Text>
                </View>

                <TouchableOpacity
                  style={{
                    // marginTop: 60,
                    // alignItems: "center",
                    // marginLeft: -50,
                  }}
                  onPress={() => router.push(`/joinedList`)}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "500",
                    }}
                  >
                    2 joined
                  </Text>
                </TouchableOpacity>

                {/* Inspired By Section for 'challenge' Posts */}
                {post.type === "challenge" && post.inspired_by && (
                  <TouchableOpacity
                    style={styles.inspiredByContainer}
                    onPress={onInspiredByPress}
                    accessible={true}
                    accessibilityLabel="Inspired by this video"
                  >
                    {/* <Image
                      source={{ uri: post.inspired_by.profile_picture_url }}
                      style={styles.inspiredByProfilePic}
                      accessible={true}
                      accessibilityLabel={`${post.inspired_by.username}'s profile picture`}
                    /> */}
                    <View className="flex flex-row gap-2">
                      <Text style={styles.inspiredByLabel}>Inspired by</Text>
                      <Text style={styles.inspiredByTitle}>
                        {post.inspired_by.title}
                      </Text>
                      {/* <Text style={styles.inspiredByUsername}>@{post.inspired_by.username}</Text> */}
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Mute Button - Hide when screen is cleared */}
            {showMuteButton && !isScreenCleared && (
              <Animated.View
                style={[
                  styles.muteButtonContainer,
                  { opacity: muteButtonOpacity },
                ]}
              >
                <TouchableOpacity
                  onPress={toggleMute}
                  style={styles.muteButton}
                >
                  <FontAwesome
                    name={isMuted ? "volume-off" : "volume-up"}
                    size={24}
                    color="#fff"
                  />
                  <Text style={styles.muteButtonText}>
                    {isMuted ? "Unmute" : "Mute"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Interactive Buttons - Always visible */}
            {!hideInteractiveButtons && (
              <View style={styles.interactiveButtonsContainer}>
                {/* Like Button with Reactions */}
                <TouchableOpacity
                  style={styles.interactiveButton}
                  onPress={toggleLike}
                  onLongPress={handleLikeLongPress}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityLabel="Like Button"
                >
                  {userReaction ? (
                    <Text style={styles.userReactionEmoji}>{userReaction}</Text>
                  ) : (
                    <FontAwesome name="heart" size={30} color="#fff" />
                  )}
                  <Text style={styles.interactiveText}>{likesCount}</Text>
                </TouchableOpacity>

                {/* Comment Button */}
                <TouchableOpacity
                  style={styles.interactiveButton}
                  onPress={() => router.push(`/comments?video_id=${post.id}`)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityLabel="Comment Button"
                >
                  <FontAwesome name="comment" size={30} color="#fff" />
                  <Text style={styles.interactiveText}>{commentsCount}</Text>
                </TouchableOpacity>

                {/* More Button */}
                <TouchableOpacity
                  style={styles.interactiveButton}
                  onPress={() => setShowMoreMenu(true)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityLabel="More Button"
                >
                  <FontAwesome name="ellipsis-h" size={30} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* More Menu Modal */}
            {showMoreMenu && (
              <Modal
                animationType="slide"
                transparent={true}
                visible={showMoreMenu}
                onRequestClose={() => setShowMoreMenu(false)}
              >
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "rgba(0, 0, 0, 0)",
                      padding: 15,
                      borderRadius: 10,
                      width: "80%",
                      marginBottom: 20,
                      borderWidth: 1,
                      borderColor: "rgb(255, 255, 255)",
                    }}
                  >
                    {/* Menu Items in vertical layout for better organization */}
                    <TouchableOpacity
                      style={styles.moreMenuItemVertical}
                      onPress={handleShare}
                      accessible={true}
                      accessibilityLabel="Share Button"
                    >
                      <FontAwesome name="share" size={20} color="#fff" />
                      <Text style={[styles.moreMenuText, { color: "#fff" }]}>
                        Share
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.moreMenuItemVertical}
                      onPress={handleReportPress}
                      accessible={true}
                      accessibilityLabel="Report Button"
                    >
                      <FontAwesome name="flag" size={20} color="#fff" />
                      <Text style={[styles.moreMenuText, { color: "#fff" }]}>
                        Report
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.moreMenuItemVertical}
                      onPress={() => {
                        setShowMoreMenu(false);
                        Alert.alert(
                          "Block User",
                          "Are you sure you want to block this user? You will no longer see their content.",
                          [
                            {
                              text: "Cancel",
                              style: "cancel",
                            },
                            {
                              text: "Block",
                              style: "destructive",
                              onPress: () => {
                                blockUser();
                              },
                            },
                          ]
                        );
                      }}
                      accessible={true}
                      accessibilityLabel="Block User Button"
                    >
                      <FontAwesome name="ban" size={20} color="#fff" />
                      <Text style={[styles.moreMenuText, { color: "#fff" }]}>
                        Block User
                      </Text>
                    </TouchableOpacity>

                    {/* Download Button - only for iOS */}
                    {Platform.OS === "ios" && (
                      <TouchableOpacity
                        style={styles.moreMenuItemVertical}
                        onPress={handleDownload}
                        accessible={true}
                        accessibilityLabel="Download Button"
                      >
                        <FontAwesome name="download" size={20} color="#fff" />
                        <Text style={[styles.moreMenuText, { color: "#fff" }]}>
                          Download
                        </Text>
                      </TouchableOpacity>
                    )}

                    {/* Clear Screen Toggle Button - Moved to come after Download */}
                    <TouchableOpacity
                      style={styles.moreMenuItemVertical}
                      onPress={() => {
                        setIsScreenCleared(!isScreenCleared);
                        setShowMoreMenu(false);
                      }}
                      accessible={true}
                      accessibilityLabel={
                        isScreenCleared ? "Show UI Elements" : "Clear Screen"
                      }
                    >
                      <FontAwesome
                        name={isScreenCleared ? "eye" : "eye-slash"}
                        size={20}
                        color="#fff"
                      />
                      <Text style={[styles.moreMenuText, { color: "#fff" }]}>
                        {isScreenCleared ? "Show Text" : "Clear Screen"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.moreMenuItemVertical,
                        {
                          marginTop: 10,
                          borderTopWidth: 1,
                          borderTopColor: "rgb(255, 255, 255)",
                          paddingTop: 10,
                        },
                      ]}
                      onPress={() => setShowMoreMenu(false)}
                      accessible={true}
                      accessibilityLabel="Close Menu"
                    >
                      <FontAwesome name="times" size={20} color="#fff" />
                      <Text style={[styles.moreMenuText, { color: "#fff" }]}>
                        Close
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            )}
          </View>

          {/* Reactions Popup */}
          {showReactions && (
            <Animated.View
              style={[
                styles.reactionsContainer,
                {
                  transform: [{ scale: reactionAnimation }],
                },
              ]}
            >
              {[
                { name: "💯", label: "100" },
                { name: "😂", label: "Laugh" },
                { name: "😢", label: "Sad" },
                { name: "🔥", label: "Fire" },
                { name: "💖", label: "Like" }, // 'Like' reaction
              ].map((reaction, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleReactionSelect(reaction.label)}
                  style={styles.reactionButton}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityLabel={`${reaction.label} Reaction`}
                >
                  <Text style={styles.reactionEmoji}>{reaction.name}</Text>
                  <Text style={styles.reactionLabel}>{reaction.label}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}

          {/* Report Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={reportModalVisible}
            onRequestClose={() => setReportModalVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.reportModalContainer}>
                <Text style={styles.reportModalTitle}>Report Content</Text>
                <Text style={styles.reportModalSubtitle}>
                  Please tell us why you're reporting this content
                </Text>

                <TextInput
                  style={styles.reportInput}
                  placeholder="Describe the issue..."
                  placeholderTextColor="#999"
                  value={report}
                  onChangeText={setReport}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                <View style={styles.reportButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.reportButton, styles.cancelButton]}
                    onPress={() => {
                      setReportModalVisible(false);
                      setReport("");
                    }}
                  >
                    <Text style={styles.reportButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.reportButton, styles.submitButton]}
                    onPress={handleReportSubmission}
                  >
                    <Text style={styles.reportButtonText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Floating Emojis */}
          {floatingEmojis.map((item) => (
            <Animated.View
              key={item.id}
              style={[
                styles.floatingEmoji,
                {
                  transform: [
                    {
                      translateY: item.animation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -200],
                      }),
                    },
                  ],
                  opacity: item.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0],
                  }),
                },
              ]}
            >
              <Text style={styles.emoji}>{item.emoji}</Text>
            </Animated.View>
          ))}

          {/* Join Challenge Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={joinChallengeModal}
            onRequestClose={() => setJoinChallengeModal(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "hsla(0, 0.00%, 0.00%, 0.50)", // Semi-transparent background
              }}
            >
              <View
                style={{
                  backgroundColor: colors[colorScheme]?.background, // Default to light theme background
                  padding: 20,
                  borderRadius: 10,
                  width: "80%",
                  alignItems: "center",
                }}
              >
                <Pressable
                  onPress={() => setJoinChallengeModal(false)}
                  style={{
                    alignSelf: "flex-start",
                  }}
                >
                  <Text>&times;</Text>
                </Pressable>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: 10,
                    color: colors[colorScheme]?.foreground, // Default to light theme foreground
                  }}
                >
                  Join Challenge
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <CustomButton
                    title={t("menu.joinNow")}
                    handlePress={joinChallengeNow}
                    containerStyles="rounded-xl min-h-[52px] flex flex-row justify-center items-center"
                    textStyles=" font-psemibold text-lg text-center"
                    style={{
                      flex: 1,
                      marginHorizontal: 5,
                      backgroundColor:
                        colors[colorScheme]?.destructiveForeground,
                    }}
                  />
                  <CustomButton
                    title={t("menu.joinLater")}
                    handlePress={joinChallengeLater}
                    containerStyles="rounded-xl min-h-[52px] flex flex-row justify-center items-center"
                    textStyles="text-white text-lg text-center"
                    style={{
                      flex: 1,
                      marginHorizontal: 5,
                      fontFamily: selectedFont,
                      backgroundColor: colors[colorScheme]?.destructive,
                    }}
                  />
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const PROFILE_PICTURE_SIZE = 50;
const FOLLOW_ICON_SIZE = 16;

const styles = StyleSheet.create({
  container: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    position: "relative",
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
    justifyContent: "flex-end",
    paddingHorizontal: 15,
    paddingBottom: 0,
  },
  userInfoContainer: {
    marginBottom: 30,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    // marginBottom: 10,
  },
  profilePictureContainer: {
    position: "relative",
    marginRight: 10,
  },
  profilePicture: {
    width: PROFILE_PICTURE_SIZE,
    height: PROFILE_PICTURE_SIZE,
    borderRadius: PROFILE_PICTURE_SIZE / 2,
    backgroundColor: "#555",
  },
  profilePicturePlaceholder: {
    width: PROFILE_PICTURE_SIZE,
    height: PROFILE_PICTURE_SIZE,
    borderRadius: PROFILE_PICTURE_SIZE / 2,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
  },
  followIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: FOLLOW_ICON_SIZE / 2,
    padding: 2,
  },
  usernameAndFollowCount: {
    flexDirection: "row",
    gap: 4,
  },
  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flexShrink: 1,
  },
  followCount: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 2,
  },
  joinChallengeButton: {
    marginTop: 8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    backgroundColor: "#1e90ff",
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  joinedChallengeButton: {
    backgroundColor: "#32cd32",
  },
  joinChallengeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  joinedChallengeButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  description: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 5,
  },
  inspiredByContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  inspiredByProfilePic: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: "#555",
  },
  inspiredByTextContainer: {
    flexDirection: "column",
  },
  inspiredByLabel: {
    color: "#1e90ff",
    fontSize: 14,
    fontWeight: "bold",
  },
  inspiredByTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  inspiredByUsername: {
    color: "#ccc",
    fontSize: 12,
  },
  muteButtonContainer: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    padding: 8,
  },
  muteButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  muteButtonText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  interactiveButtonsContainer: {
    position: "absolute",
    right: 12,
    bottom: 30,
    alignItems: "center",
    justifyContent: "space-between",
  },
  interactiveButton: {
    alignItems: "center",
    marginBottom: 30,
  },
  interactiveText: {
    color: "#fff",
    marginTop: 5,
    fontSize: 14,
  },
  userReactionEmoji: {
    fontSize: 30,
  },
  reactionsContainer: {
    position: "absolute",
    bottom: 100,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 180,
  },
  reactionButton: {
    alignItems: "center",
    marginHorizontal: 5,
  },
  reactionEmoji: {
    fontSize: 30,
  },
  reactionLabel: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
  },
  floatingEmoji: {
    position: "absolute",
    bottom: 100,
    right: 20,
    marginBottom: 180,
  },
  emoji: {
    fontSize: 24,
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -15,
    marginTop: -15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarContainer: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 84 : 14,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#fff300",
  },

  moreMenuItemVertical: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
  },
  moreMenuText: {
    marginLeft: 15,
    fontSize: 16,
    color: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  reportModalContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "85%",
    maxWidth: 400,
  },
  reportModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 10,
  },
  reportModalSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  reportInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    color: "#000",
    minHeight: 100,
  },
  reportButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reportButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#f1f1f1",
  },
  submitButton: {
    backgroundColor: "#ff3b30",
  },
  reportButtonText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#000",
  },
});

export default VideoPlayer;
