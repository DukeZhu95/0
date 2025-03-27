import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Video, AVPlaybackStatus } from "expo-av";
import { colors } from "@/constants/colours";
import { useTheme } from "@/context/theme-context";
import { useFont } from "@/context/font-context";

interface PreviewScreenProps {
  imageUri: string | null;
  videoUri: string | null;
  onDeleteImage: () => void;
  onDeleteVideo: () => void;
  onNext: () => void;
  videoRef: React.RefObject<Video>;
  status: AVPlaybackStatus;
  toggleVideoPlayback: () => void;
}

const PreviewScreen: React.FC<PreviewScreenProps> = ({
  imageUri,
  videoUri,
  onDeleteImage,
  onDeleteVideo,
  onNext,
  videoRef,
  status,
  toggleVideoPlayback,
}) => {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();

  const getPlayPauseIcon = () =>
    !status.isLoaded || status.didJustFinish || !status.isPlaying
      ? "play-circle"
      : "pause-circle";

  return (
    <View style={{ flex: 1, backgroundColor: colors[colorScheme]?.primary }}>
      {imageUri ? (
        <View style={{ flex: 1 }}>
          <Image
            source={{ uri: imageUri }}
            style={{
              flex: 1,
              resizeMode: "contain",
              backgroundColor: colors[colorScheme]?.primary,
            }}
          />
          <LinearGradient
            colors={[colors[colorScheme]?.destructive, "blue"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 20,
              flexDirection: "row",
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={onDeleteImage}
            >
              <Text
                style={{
                  color: colors[colorScheme]?.destructiveForeground,
                  fontSize: 16,
                  fontFamily: selectedFont,
                }}
              >
                Delete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={onNext}
            >
              <Text
                style={{
                  color: colors[colorScheme]?.destructiveForeground,
                  fontSize: 16,
                  fontFamily: selectedFont,
                }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ) : videoUri ? (
        <View
          style={{ flex: 1, backgroundColor: colors[colorScheme]?.primary }}
        >
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={toggleVideoPlayback}
          >
            <Video
              ref={videoRef}
              style={{ flex: 1 }}
              source={{ uri: videoUri }}
              resizeMode={ResizeMode.CONTAIN}
              isLooping={false}
              useNativeControls={false}
              onPlaybackStatusUpdate={(newStatus) => setStatus(newStatus)}
            />
            <View
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: [{ translateX: -32 }, { translateY: -32 }],
              }}
            >
              <Ionicons
                name={getPlayPauseIcon()}
                size={64}
                color={colors[colorScheme]?.foreground}
              />
            </View>
          </TouchableOpacity>

          <LinearGradient
            colors={[colors[colorScheme]?.destructive, "blue"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
              flexDirection: "row",
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={() => setVideoUri(null)}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontSize: 16,
                  fontFamily: selectedFont,
                }}
              >
                Delete
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
              onPress={navigateToPostVideo}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontSize: 16,
                  fontFamily: selectedFont,
                }}
              >
                Next
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ) : null}
    </View>
  );
};

export default PreviewScreen;
