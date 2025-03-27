// app/(app)/(protected)/SubmissionDetails.tsx

import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";

import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Image,
  StyleSheet,
  Platform,
  FlatList,
} from "react-native";
import VideoPlayer from "@/components/videoCard/videoPlayer";
import { useInfiniteVideos } from "@/hooks/useInfiniteVideos";

import { supabase } from "@/config/supabase";

// Interface Definitions

interface Creator {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  bio: string;
  location: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  is_seasonal: boolean;
  is_sponsored: boolean;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

interface Submission {
  id: string;
  video_url: string | null;
  title: string | null;
  description: string | null;
  votes: number | null;
  created_at: string;
  updated_at: string;
  creator: Creator;
  challenge: Challenge;
}

export default function SubmissionDetails() {
  const { submissionId } = useLocalSearchParams<{ submissionId: string }>();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false); // State to track playback
  const videoRef = useRef<Video>(null); // Ref to control Video component
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);

  // Get device dimensions for responsive video sizing
  const { width, height } = Dimensions.get("window");
  
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPlaying(viewableItems[0].item.id);
    }
  }).current;
  
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  // Fetch Submission Details
  const fetchSubmissionDetails = useCallback(async () => {
    if (!submissionId) {
      setError("Submission ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // First, get the selected submission to get the user_id
      const { data: selectedSubmission, error: selectedError } = await supabase
        .from("submissions")
        .select(`*, creator:users!user_id(id)`)
        .eq("id", submissionId)
        .single();

      if (selectedError) throw selectedError;

      // Then fetch all submissions from this user
      const { data: userSubmissions, error: submissionsError } = await supabase
        .from("submissions")
        .select(
          `
          id,
          video_url,
          title,
          description,
          votes,
          created_at,
          updated_at,
          creator:users!user_id(
            id,
            username,
            first_name,
            last_name,
            profile_picture_url,
            bio,
            location
          ),
          challenge:challenges!challenge_id(
            id,
            title,
            description,
            category,
            is_seasonal,
            is_sponsored,
            video_url,
            created_at,
            updated_at
          )
        `,
        )
        .eq('user_id', selectedSubmission.creator.id)
        .order('created_at', { ascending: false });

      if (submissionsError) throw submissionsError;

      // Reorder the array to start from the selected video
      const selectedIndex = userSubmissions.findIndex(
        (submission) => submission.id === submissionId
      );
      const reorderedSubmissions = [
        ...userSubmissions.slice(selectedIndex),
        ...userSubmissions.slice(0, selectedIndex),
      ];

      setSubmissions(reorderedSubmissions);
    } catch (err: any) {
      console.error("Error fetching submissions:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    fetchSubmissionDetails();
  }, [fetchSubmissionDetails]);

  // Handler to toggle video playback
  const togglePlayback = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  // Navigate Back Handler
  const handleGoBack = useCallback(() => {
    router.back();
  }, []);

  // Render Loading State
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  // Render Error State
  if (error || !submissions.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load submission details.</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.goBackButton}>
          <Ionicons name="arrow-back-circle" size={50} color="#ffffff" />
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={submissions}
        renderItem={({ item }) => (
          <View style={styles.videoWrapper}>
            <VideoPlayer
              post={item}
              isFocused={currentPlaying === item.id}
              hideInteractiveButtons={false}
            />
          </View>
        )}
        keyExtractor={(item) => item.id}
        pagingEnabled
        vertical
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToAlignment="start"
        snapToInterval={height}
        decelerationRate="fast"
      />
    </View>
  );
}

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    marginTop: -95,
  },
  videoWrapper: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    flex: 1,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50, // This will push the video up
  },
  video: {
    width: '100%',
    height: '100%',
    position: 'absolute'
  },
  gradient: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "50%",
  },
  videoOverlay: {
    position: "absolute",
    top: height / 2 - 32, // Center the icon vertically
    left: width / 2 - 32, // Center the icon horizontally
    zIndex: 2,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20, // Adjust for status bar
    right: 20,
    zIndex: 3,
  },
  videoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
  },
  videoPlaceholderText: {
    color: "#555",
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  overlayContent: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.6)", // Semi-transparent background
    zIndex: 4,
    maxHeight: height * 0.5, // Limit the height of the overlay
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: "#ddd",
    textAlign: "center",
    marginBottom: 16,
  },
  creatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  creatorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  creatorPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  creatorInfo: {
    flex: 1,
  },
  creatorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  creatorUsername: {
    fontSize: 16,
    color: "#aaa",
    marginTop: 4,
  },
  creatorBio: {
    fontSize: 14,
    color: "#ddd",
    marginTop: 4,
  },
  creatorLocation: {
    fontSize: 14,
    color: "#ddd",
    marginTop: 2,
  },
  challengeContainer: {
    backgroundColor: "rgba(255,255,255,0.1)", // Slightly transparent background
    padding: 12,
    borderRadius: 8,
  },
  challengeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  challengeDescription: {
    fontSize: 16,
    color: "#ddd",
    marginBottom: 8,
  },
  challengeCategory: {
    fontSize: 14,
    color: "#aaa",
    marginBottom: 8,
  },
  challengeBadges: {
    flexDirection: "row",
  },
  seasonalBadge: {
    backgroundColor: "#FFD700",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  sponsoredBadge: {
    backgroundColor: "#FF4500",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    color: "#fff",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000", // Match background color
    paddingHorizontal: 16,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  goBackButton: {
    alignItems: "center",
  },
  goBackText: {
    color: "#ffffff",
    fontSize: 16,
    marginTop: 8,
  },
});