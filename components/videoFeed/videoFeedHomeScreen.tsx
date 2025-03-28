import React, { useRef, useState, useCallback } from "react";
import { Text, ActivityIndicator, View, Dimensions } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteVideos } from "@/hooks/useInfiniteVideos";

import { useIsFocused } from "@react-navigation/native";
import VideoPlayer from "../videoCard/videoPlayer";
import { colors } from "@/constants/colours";
import { useTheme } from "@/context/theme-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function VideoList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteVideos();

  const isScreenFocused = useIsFocused();
  const flatListRef = useRef<FlashList<any>>(null);
  const [visibleIndex, setVisibleIndex] = useState<number>(0);

  const { colorScheme } = useTheme();

  // Create viewability configurations with useRef
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 200,
  }).current;

  // Use useCallback to memoize functions that are passed as props
  const handleViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== undefined && index !== null) {
        setVisibleIndex(index);
      }
    }
  }, []);

  const handleVideoEnd = useCallback(() => {
    const nextIndex = visibleIndex + 1;
    if (nextIndex < (data?.pages.flatMap((page) => page.data) || []).length) {
      setVisibleIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }
  }, [visibleIndex, data]);

  const onMomentumScrollEnd = useCallback(
    (event) => {
      const offsetY = event.nativeEvent.contentOffset.y;
      let newIndex = Math.round(offsetY / SCREEN_HEIGHT);

      // Limit the change to one video at a time
      if (newIndex > visibleIndex + 1) {
        newIndex = visibleIndex + 1;
      } else if (newIndex < visibleIndex - 1) {
        newIndex = visibleIndex - 1;
      }

      setVisibleIndex(newIndex);
      flatListRef.current?.scrollToIndex({
        index: newIndex,
        animated: true,
      });
    },
    [visibleIndex, SCREEN_HEIGHT]
  );

  // Prepare early returns for loading and error states
  if (isLoading) return <ActivityIndicator size="large" color="blue" />;
  if (isError) return <Text>Error: {error?.message}</Text>;

  // Flatten pages into a single list - moved below all hooks
  const videos = data?.pages.flatMap((page) => page.data) || [];

  console.log("videos:", JSON.stringify(videos, null, 2));

  const renderItem = ({ item, index }) => (
    <View
      style={{
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT,
        backgroundColor: "black",
      }}
    >
      {item.video_url ? (
        <VideoPlayer
          post={item}
          isFocused={index === visibleIndex && isScreenFocused}
          onVideoEnd={handleVideoEnd}
        />
      ) : (
        <Text style={{ color: "red", alignSelf: "center", marginTop: 20 }}>
          No video available
        </Text>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors[colorScheme]?.background }}>
      <FlashList
        ref={flatListRef}
        data={videos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        estimatedItemSize={SCREEN_HEIGHT}
        pagingEnabled
        snapToAlignment="start"
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        scrollEventThrottle={16}
        disableIntervalMomentum={true}
        onMomentumScrollEnd={onMomentumScrollEnd}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialScrollIndex={0}
        removeClippedSubviews={true}
        getItemType={() => "video"}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <ActivityIndicator size="small" color="gray" />
          ) : null
        }
      />
    </View>
  );
}
