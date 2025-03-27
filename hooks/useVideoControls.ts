// hooks/useVideoControls

import { useState } from "react";

export const useVideoControls = () => {
  const [isMuted, setIsMuted] = useState(true);

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  return { isMuted, toggleMute };
};
