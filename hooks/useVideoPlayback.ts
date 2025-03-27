// hooks/useVideoPlayback

import { useState, useEffect } from "react";
import { Video } from "expo-av";

export const useVideoPlayback = (videoRef, isFocused) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isFocused) {
        videoRef.current.playAsync();
        setIsPlaying(true);
      } else {
        videoRef.current.pauseAsync();
        setIsPlaying(false);
      }
    }
  }, [isFocused]);

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        videoRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
    videoRef.current?.setIsMutedAsync(!isMuted);
  };

  return { isPlaying, togglePlayback, isMuted, toggleMute };
};
