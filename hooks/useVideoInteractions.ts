// hooks/useVideoInteractions

import { useState, useEffect } from "react";
import { supabase } from "@/config/supabase";
import { Share, Alert } from "react-native";

export const useVideoInteractions = (videoId) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    fetchLikes();
    fetchComments();
  }, [videoId]);

  const fetchLikes = async () => {
    const { count } = await supabase
      .from("likes")
      .select("*", { count: "exact" })
      .eq("video_id", videoId);

    setLikesCount(count || 0);
  };

  const fetchComments = async () => {
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact" })
      .eq("video_id", videoId);

    setCommentsCount(count || 0);
  };

  const likeVideo = async () => {
    await supabase.from("likes").insert([{ video_id: videoId }]);
    setIsLiked(true);
    setLikesCount((prev) => prev + 1);
  };

  const unlikeVideo = async () => {
    await supabase.from("likes").delete().eq("video_id", videoId);
    setIsLiked(false);
    setLikesCount((prev) => Math.max(prev - 1, 0));
  };

  const shareVideo = async (url) => {
    try {
      await Share.share({ message: `Check out this video: ${url}` });
    } catch {
      Alert.alert("Error", "Failed to share video.");
    }
  };

  return {
    isLiked,
    likesCount,
    commentsCount,
    likeVideo,
    unlikeVideo,
    shareVideo,
  };
};
