import { useRef, useState, useEffect } from "react";
import { FlatList } from "react-native";
import { useIsFocused } from "@react-navigation/native";

export function useVideoFocus() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isScreenFocused = useIsFocused();

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
  };

  return {
    currentIndex,
    flatListRef,
    isScreenFocused,
    onViewableItemsChanged,
    viewabilityConfig,
  };
}
