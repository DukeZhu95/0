// app/(app)/(protected)/otheruserprofile.tsx

import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { router, useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/config/supabase";
import { Video } from "expo-av";
import { useTheme } from "@/context/theme-context";
import { useFont } from "@/context/font-context";
import { useTranslation } from "react-i18next";
import { useSupabase } from "@/context/supabase-provider";
import { colors } from "@/constants/colours";
// import { useChatContext } from "stream-chat-expo";

const { width } = Dimensions.get("window");
const POST_GRID_SIZE = width / 3 - 2;

type UserProfile = {
  id: string;
  username: string;
  bio: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  profilePictureUrl: string;
};

type Post = {
  id: string;
  video_url: string;
};

export default function OtherUserProfile() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  const { user } = useSupabase();
  const { id } = useLocalSearchParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // const { client } = useChatContext();
  // const { profile } = useSupabase();

  // console.log("User ID from URL:", id);
  // const callClient = new StreamVideoClient("STREAM_API_KEY");

  // const startCall = async () => {
  //   const call = callClient.call("video", userId);
  //   await call.join({ create: true });
  //   router.push(`/calls/${call.id}`);
  // };

  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching current user:", error.message);
        setCurrentUser(null);
      } else if (data.user) {
        setCurrentUser({ id: data.user.id });
      } else {
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setCurrentUser({ id: session.user.id });
        } else {
          setCurrentUser(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const [isFollowing, setIsFollowing] = useState<boolean>(false);

  const fetchProfile = useCallback(async () => {
    if (!id) {
      setError("User ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const { data: userProfile, error: profileError } = await supabase
        .from("users")
        .select("id, username, bio, profile_picture_url")
        .eq("id", id)
        .single();

      if (profileError) throw profileError;

      const followersPromise = supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", id);

      const followingPromise = supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("follower_id", id);

      const postsCountPromise = supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", id);

      const [followersResult, followingResult, postsCountResult] =
        await Promise.all([
          followersPromise,
          followingPromise,
          postsCountPromise,
        ]);

      const { count: followersCount, error: followersError } = followersResult;
      const { count: followingCount, error: followingError } = followingResult;
      const { count: postsCount, error: postsError } = postsCountResult;

      if (followersError) throw followersError;
      if (followingError) throw followingError;
      if (postsError) throw postsError;

      setProfile({
        id: userProfile.id,
        username: userProfile.username,
        bio: userProfile.bio,
        followersCount: followersCount || 0,
        followingCount: followingCount || 0,
        postsCount: postsCount || 0,
        profilePictureUrl: userProfile.profile_picture_url,
      });

      const { data: userPosts, error: postsDataError } = await supabase
        .from("submissions")
        .select("id, video_url")
        .eq("user_id", id);

      if (postsDataError) throw postsDataError;
      setPosts(userPosts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchFollowStatus = useCallback(async () => {
    if (!id || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from("follows")
        .select("*")
        .eq("follower_id", currentUser.id)
        .eq("following_id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setIsFollowing(false);
        } else {
          throw error;
        }
      } else {
        setIsFollowing(true);
      }
    } catch (err: any) {
      console.error("Error fetching follow status:", err.message);
    }
  }, [id, currentUser]);

  useEffect(() => {
    if (id) {
      fetchProfile();
    } else {
      setError("User ID is missing.");
      setLoading(false);
    }
  }, [id, fetchProfile]);

  useEffect(() => {
    if (profile && currentUser) {
      fetchFollowStatus();
    }
  }, [profile, currentUser, fetchFollowStatus]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-500">No Profile Found</Text>
      </View>
    );
  }

  const handleFollow = async () => {
    if (!currentUser) {
      Alert.alert("Authentication Required", "Please log in to follow users.");
      return;
    }

    try {
      if (isFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", currentUser.id)
          .eq("following_id", id);

        if (error) throw error;

        setIsFollowing(false);
        setProfile((prev) =>
          prev ? { ...prev, followersCount: prev.followersCount - 1 } : prev
        );
        Alert.alert("Success", `You have unfollowed ${profile.username}.`);
      } else {
        const { error } = await supabase
          .from("follows")
          .insert([{ follower_id: currentUser.id, following_id: id }]);

        if (error) throw error;

        setIsFollowing(true);
        setProfile((prev) =>
          prev ? { ...prev, followersCount: prev.followersCount + 1 } : prev
        );
        Alert.alert("Success", `You are now following ${profile.username}.`);
      }
    } catch (err: any) {
      console.error("Error toggling follow status:", err.message);
      Alert.alert("Error", "Failed to update follow status.");
    }
  };

  // const handleChat = () => {
  //   const navigationPath = `/chat?userId=${id}`;
  //   router.push(navigationPath);
  // };

  // const handleChat = async () => {
  //   const channel = client.channel("messaging", {
  //     members: [profile.id, userId],
  //   });
  //   await channel.watch();
  //   console.log("other usr chaennle presses");

  //   router.push(`/(app)/(protected)/(home)/channel/${channel.cid}`);
  // };

  // const handleCall = () => {
  //   // Call the user using the user's ID
  //   console.log("Calling user:", id);
  // }

  const handleVideoPress = () => {
    // Navigate to Reels screen, passing the user's ID
    // router.push(`/Reels?userId=${id}`);
    console.log("reels video pressed");
  };

  return (
    <FlatList
      data={posts}
      numColumns={3}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <View
          style={{ backgroundColor: colors[colorScheme]?.card }}
          className="flex-row p-4 border-b border-gray-300"
        >
          <Image
            source={{ uri: profile.profilePictureUrl }}
            className="w-24 h-24 rounded-full mr-4 bg-gray-400"
          />
          <View className="flex-1 justify-center">
            <Text
              style={{ color: colors[colorScheme]?.cardForeground }}
              className="text-2xl font-bold"
            >
              {profile.username}
            </Text>
            <Text className="text-sm text-gray-500 my-1">{profile.bio}</Text>
            <View className="flex-row justify-around my-2.5">
              <View className="items-center">
                <Text
                  style={{ color: colors[colorScheme]?.cardForeground }}
                  className="text-lg font-bold"
                >
                  {profile.postsCount}
                </Text>
                <Text
                  style={{ color: colors[colorScheme]?.cardForeground }}
                  className="text-xs text-gray-500"
                >
                  Posts
                </Text>
              </View>
              <View className="items-center">
                <Text
                  style={{ color: colors[colorScheme]?.cardForeground }}
                  className="text-lg font-bold"
                >
                  {profile.followersCount}
                </Text>
                <Text
                  style={{ color: colors[colorScheme]?.cardForeground }}
                  className="text-xs text-gray-500"
                >
                  Followers
                </Text>
              </View>
              <View className="items-center">
                <Text
                  style={{ color: colors[colorScheme]?.cardForeground }}
                  className="text-lg font-bold"
                >
                  {profile.followingCount}
                </Text>
                <Text
                  style={{ color: colors[colorScheme]?.cardForeground }}
                  className="text-xs text-gray-500"
                >
                  Following
                </Text>
              </View>
            </View>
            <View className="flex-row justify-between mt-2.5">
              <TouchableOpacity
                className="flex-1 mr-2.5 py-2.5 bg-blue-500 rounded items-center"
                onPress={handleFollow}
              >
                <Text className="text-white text-base">
                  {isFollowing ? "Unfollow" : "Follow"}
                </Text>
              </TouchableOpacity>
              {/* <TouchableOpacity
                className="flex-1 mr-2.5 py-2.5 bg-blue-500 rounded items-center"
                onPress={handleCall}
              >
                <Text className="text-white text-base">
                  Call
                </Text>
              </TouchableOpacity>
              */}
              {/* <TouchableOpacity
                className="flex-1 py-2.5 bg-gray-300 rounded items-center"
                onPress={handleChat}
              >
                <Text className="text-gray-700 text-base">Chat</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity onPress={handleVideoPress}>
          <Video
            source={{ uri: item.video_url }}
            resizeMode="cover"
            isMuted
            shouldPlay={false}
            isLooping={false}
            style={{ width: POST_GRID_SIZE, height: POST_GRID_SIZE }}
          />
        </TouchableOpacity>
      )}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      contentContainerStyle={{ padding: 5 }}
    />
  );
}
