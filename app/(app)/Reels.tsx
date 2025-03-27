// app/(app)/Reels.tsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Dimensions,
  SafeAreaView,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/config/supabase";
import { VideoPlayer } from "@/components/videoCard/videoPlayer";
import { useInfiniteVideos } from "@/hooks/useInfiniteVideos";

// These match the interfaces in VideoPlayer.tsx
interface Creator {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  bio: string;
  location: string;
}

interface Post {
  id: number;
  video_url: string;
  title: string;
  description: string;
  hashtags: string[];
  music: string;
  likes: number;
  comments: number;
  creator: Creator;
}

const { width, height } = Dimensions.get("window");

export default function ReelsScreen() {
  const { userId } = useLocalSearchParams(); // The [userId] param
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteVideos();

  // For controlling which video is currently playing
  const [currentPlaying, setCurrentPlaying] = useState<number | null>(null);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  // Called whenever items in the FlatList come in/out of view
  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentPlaying(viewableItems[0].item.id);
    }
  }).current;

  const fetchUserVideos = useCallback(async () => {
    // 1) Check for userId
    if (!userId) {
      setError("User ID is missing.");
      setLoading(false);
      return;
    }

    try {
      // 2) Get the user’s submissions from 'submissions' table
      const { data: submissions, error: subError } = await supabase
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
          )
        `
        )
        .eq("user_id", userId);

      if (subError) throw subError;
      if (!submissions || submissions.length === 0) {
        // No videos found for this user
        setPosts([]);
        setLoading(false);
        return;
      }

      // 3) For each submission, replicate what "VideoPlayer" does:
      //    - fetch creator data (username, profile_picture_url), likes count, follow count, etc.
      const finalPosts: Post[] = [];

      for (const submission of submissions) {
        // Basic data from submission
        const postId = submission.id;
        const creatorUserId = submission.user_id;

        // // (A) Fetch the "creator" user to get username, profile pic, etc.
        // let creatorUsername = "Unknown User";
        // try {
        //   const { data: userData, error: userError } = await supabase
        //     .from("users")
        //     .select("username") // or "username, profile_picture_url" if you want
        //     .eq("id", creatorUserId)
        //     .single();

        //   if (!userError && userData) {
        //     creatorUsername = userData.username;
        //   }
        // } catch (err: any) {
        //   console.error("Error fetching creator user:", err.message);
        // }

        // // (B) Fetch the likes count from 'likes' table
        // let likesCount = 0;
        // try {
        //   const { count, error: likesError } = await supabase
        //     .from("likes")
        //     .select("*", { count: "exact", head: true })
        //     .eq(
        //       post.type === 'submission' ? 'submission_id' : 'challenge_id',
        //       post.id
        //     );

        //   if (likesError) {
        //     console.error("Error fetching likes count:", likesError.message);
        //   }
        //   likesCount = count || 0;
        // } catch (err: any) {
        //   console.error("Error in likesCount:", err.message);
        // }

        // // (C) Fetch the total comments if you want to mirror "post.comments".
        // //     If your DB has a 'comments' table:
        // let commentsCount = 0;
        // try {
        //   const { count, error: commentsError } = await supabase
        //     .from("comments")
        //     .select("*", { count: "exact", head: true })
        //     .eq("submission_id", postId);

        //   if (commentsError) {
        //     console.error(
        //       "Error fetching comments count:",
        //       commentsError.message
        //     );
        //   }
        //   commentsCount = count || 0;
        // } catch (err: any) {
        //   console.error("Error in commentsCount:", err.message);
        // }

        // Build our final Post object with all the fields VideoPlayer expects
        const post: Post = {
          id: submission.id,
          video_url: submission.video_url,
          title: submission.title || "",
          description: submission.description || "",
          likes: submission.votes || 0,
          creator: {
            username: submission.creator.username,
            id: submission.creator.id,
          },
          hashtags: [],
          music: "",
        };

        finalPosts.push(post);
      }

      setPosts(finalPosts);
    } catch (err: any) {
      console.error("fetchUserVideos error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserVideos();
  }, [fetchUserVideos]);

  // Render states: loading, error, no videos
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.noVideosText}>No Videos Found.</Text>
      </View>
    );
  }

  // 4) Render each post with your VideoPlayer
  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.videoWrapper}>
      <VideoPlayer
        post={item}
        isFocused={currentPlaying === item.id} // auto-play the focused video
        hideInteractiveButtons={true}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        snapToAlignment="start"
        snapToInterval={height}
        decelerationRate="fast"
        scrollEventThrottle={16}
        windowSize={3}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000", // black background to match VideoPlayer
    marginTop: -100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  noVideosText: {
    color: "#fff",
    fontSize: 18,
  },
  videoWrapper: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },
});