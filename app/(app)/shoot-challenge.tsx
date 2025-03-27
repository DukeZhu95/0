// RecordChallenge.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
  Animated,
  Image,
  BackHandler,
  Platform,
} from "react-native";
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome,
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Audio, Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CameraView, // Retained as per instruction
  CameraType, // Using string literals
  useCameraPermissions,
  FlashMode, // Using string literals
} from "expo-camera";
import * as FileSystem from "expo-file-system";
import { router, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/context/theme-context";
import { useFont } from "@/context/font-context";
import { useTranslation } from "react-i18next";
import { colors } from "@/constants/colours";
import { useFocusEffect } from "expo-router";

type VideoPlaybackStatus = AVPlaybackStatus & {
  durationMillis?: number;
};

type SoundType = {
  id: string;
  name: string;
  artist: string;
  uri: string;
  year: number;
  isLocal: boolean;
};

const RecordChallenge: React.FC = () => {
  // **Extract additional parameters here**
  const {
    challengeVideoUri,
    challengeVideoName,
    challengeVideoUser,
    challengeVideoUserProfilePic,
  } = useLocalSearchParams(); // Receive additional params
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  // Refs
  const cameraRef = useRef<CameraView>(null);
  const videoRef = useRef<Video>(null);
  const soundRef = useRef<Audio.Sound>(new Audio.Sound());

  // Animated value for recording progress
  const animationProgress = useRef(new Animated.Value(0)).current;
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // State variables
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [flashMode, setFlashMode] = useState<FlashMode>("off");
  const [audioPermission, setAudioPermission] = useState<boolean>(false);

  const [expandedMenu, setExpandedMenu] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [isScannerActive, setIsScannerActive] = useState<boolean>(false);

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingTime, setRecordingTime] = useState<number>(180);
  const [timerSet, setTimerSet] = useState<boolean>(false);

  const [zoom, setZoom] = useState<number>(0); // Default zoom level (0 = no zoom)

  const [recordingElapsedTime, setRecordingElapsedTime] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<ReturnType<
    typeof setInterval
  > | null>(null);
  const [focusPoint, setFocusPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);

  const [pickedVideoUri, setPickedVideoUri] = useState<string | null>(null); // **New State**
  const [checkingVideo, setCheckingVideo] = useState<boolean>(false); // **New State**

  const [status, setStatus] = useState<AVPlaybackStatus>({
    isLoaded: false,
    isPlaying: false,
  });

  const [isSoundModalVisible, setIsSoundModalVisible] =
    useState<boolean>(false);
  const [selectedSound, setSelectedSound] = useState<SoundType | null>(null);
  const [myMusic, setMyMusic] = useState<SoundType[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const [isTimerModalVisible, setIsTimerModalVisible] =
    useState<boolean>(false);

  // State for challengeVideoUri
  const [challengeVideo, setChallengeVideo] = useState<string | null>(
    challengeVideoUri || null
  );

  // **Store additional challenge video details in state**
  const [challengeVideoNameState, setChallengeVideoNameState] = useState<
    string | null
  >(challengeVideoName || null);
  const [challengeVideoUserState, setChallengeVideoUserState] = useState<
    string | null
  >(challengeVideoUser || null);
  const [
    challengeVideoUserProfilePicState,
    setChallengeVideoUserProfilePicState,
  ] = useState<string | null>(challengeVideoUserProfilePic || null);

  // Effect for loading music
  useEffect(() => {
    loadMyMusic();
  }, []);

  const loadMyMusic = async (): Promise<void> => {
    try {
      const storedMusic = await AsyncStorage.getItem("@my_music");
      if (storedMusic !== null) {
        setMyMusic(JSON.parse(storedMusic));
      }
    } catch (error) {
      console.log("Error loading my music:", error);
    }
  };

  const saveMyMusic = async (music: SoundType[]): Promise<void> => {
    try {
      await AsyncStorage.setItem("@my_music", JSON.stringify(music));
    } catch (error) {
      console.log("Error saving my music:", error);
    }
  };

  // Effect to handle menu label visibility
  useEffect(() => {
    if (expandedMenu) {
      setShowLabels(true);
      const timeout = setTimeout(() => {
        setShowLabels(false);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [expandedMenu]);
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        console.log("Back button pressed");

        // Ensure recording stops before navigating back
        if (isRecording) {
          stopRecording();
        }

        // Unload sounds to prevent errors
        if (soundRef.current) {
          soundRef.current
            .unloadAsync()
            .catch((error) => console.log("Error unloading sound:", error));
        }

        // Unload video
        if (videoRef.current) {
          videoRef.current
            .unloadAsync()
            .catch((error) => console.log("Error unloading video:", error));
        }

        // Stop timers
        stopTimer();
        resetAnimation();
        resetTimer();

        router.back(); // Navigate back safely
        return true; // Prevent default behavior
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [isRecording])
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current
          .unloadAsync()
          .catch((error) => console.log("Error unloading sound:", error));
      }
      if (videoRef.current) {
        videoRef.current
          .unloadAsync()
          .catch((error) => console.log("Error unloading video:", error));
      }
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  // **Adjusted startRecording Function**
  useEffect(() => {
    (async () => {
      // Request Camera Permission
      const { status: cameraStatus } = await requestPermission();
      if (cameraStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Camera access is needed to record video."
        );
      }

      // Request Microphone Permission
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      setAudioPermission(audioStatus === "granted");

      if (audioStatus !== "granted") {
        Alert.alert(
          "Permission Required",
          "Audio recording permission is required to record video with sound."
        );
      }
    })();
  }, []);

  const startRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      resetTimer();
      startTimer();

      Animated.timing(animationProgress, {
        toValue: 1,
        duration: recordingTime * 1000, // **Use selected timer duration**
        useNativeDriver: false,
      }).start();

      if (selectedSound) {
        await soundRef.current.unloadAsync();
        await soundRef.current.loadAsync({ uri: selectedSound.uri });
        await soundRef.current.playAsync();
      }

      const videoRecordPromise = cameraRef.current.recordAsync({
        maxDuration: recordingTime, // **Use timer duration**
        codec: Platform.OS === "ios" ? "avc1" : "hvc1",
        fps: 30,
        videoBitrate: 888000,
        maxFileSize: 78 * 1024 * 1024,
        mute: selectedSound !== null,
        resolution: "480p",
        compressionMethod: "auto",
        quality: 0.5, // Moderate quality for size control
      });

      if (videoRecordPromise) {
        const data = await videoRecordPromise;
        console.log("Video recorded:", data.uri);

        // Check file size after recording
        const fileInfo = await FileSystem.getInfoAsync(data?.uri);
        if (fileInfo.exists) {
          console.log(`File Size: ${fileInfo.size} bytes`);
          // For iOS, save to cache and set video URI directly
          if (Platform.OS === "ios") {
            const cachedUri = await saveToCache(data.uri);
            if (cachedUri) {
              setVideoUri(cachedUri);
              setCheckingVideo(false);
              setPickedVideoUri(null);
            }
          } else {
            // For Android, continue with existing flow
            setPickedVideoUri(data.uri);
            setCheckingVideo(true);
          }
        }

        setIsRecording(false);
        stopTimer();
        resetAnimation();
        resetTimer();

        if (selectedSound) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        }
      }
    } catch (error) {
      console.error("Error while recording video:", error);
      Alert.alert(
        "Recording Error",
        "An error occurred while recording the video."
      );
      setIsRecording(false);
      stopTimer();
      resetAnimation();
      resetTimer();
    }
  };

  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
      setIsRecording(false);
      stopTimer();
      resetAnimation();
      resetTimer(); // Reset the timer
      // **Stop the sound when recording stops**
      if (selectedSound) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        setSelectedSound(null);
      }
    }
  };

  const saveToCache = async (uri: string): Promise<string | null> => {
    try {
      const extension = uri.split(".").pop();
      const cachePath = `${
        FileSystem.cacheDirectory
      }file_${Date.now()}.${extension}`;

      // For iOS, ensure we're copying from the correct path
      const sourcePath =
        Platform.OS === "ios" ? uri.replace("file://", "") : uri;

      await FileSystem.copyAsync({ from: sourcePath, to: cachePath });
      console.log("File saved to cache:", cachePath);
      return cachePath;
    } catch (error) {
      console.error("Error saving to cache:", error);
      Alert.alert("Error", "Failed to save file to cache.");
      return null;
    }
  };

  const startTimer = () => {
    if (timerInterval) return;
    const interval = setInterval(() => {
      setRecordingElapsedTime((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const stopTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const resetTimer = () => {
    setRecordingElapsedTime(0);
  };

  const resetAnimation = () => {
    Animated.timing(animationProgress, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  function toggleRecording() {
    if (isRecording) {
      setIsRecording(false);
      stopRecording();
      stopTimer();
      resetAnimation();
      resetTimer(); // **Reset timer when stopping a recording**
    } else {
      setIsRecording(true);
      startRecording();
      // Removed duplicate startTimer and animation as it's now handled in startRecording
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const mm = mins < 10 ? `0${mins}` : mins;
    const ss = secs < 10 ? `0${secs}` : secs;
    return `${mm}:${ss}`;
  };

  function openTimerModal() {
    setIsTimerModalVisible(true);
  }

  function closeTimerModal() {
    setIsTimerModalVisible(false);
  }

  function confirmTimer(selectedTime: number) {
    setRecordingTime(selectedTime);
    setTimerSet(true);
    setIsTimerModalVisible(false);
    console.log(`Timer set to ${selectedTime} seconds`);
  }

  function openSoundModal() {
    setIsSoundModalVisible(true);
  }

  function closeSoundModal() {
    setIsSoundModalVisible(false);
  }

  async function selectLocalSound() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true, // Ensure file is copied to cache
      });

      console.log("Document Picker Result:", result); // Debugging

      if (result.canceled || !result.assets || result.assets.length === 0) {
        console.log("No sound selected.");
        return;
      }

      const pickedFile = result.assets[0]; // Get the selected file
      let fileUri = pickedFile.uri;

      // **Convert `content://` URI to a file path for playback**
      if (fileUri.startsWith("content://")) {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        console.log("File Info:", fileInfo);
        if (!fileInfo.exists) {
          console.error("File not found:", fileUri);
          Alert.alert("Error", "Could not load selected sound.");
          return;
        }
        fileUri = fileInfo.uri; // Ensure it's accessible
      }

      const newSound: SoundType = {
        id: Date.now().toString(),
        name: pickedFile.name ?? "Unknown",
        artist: "Unknown Artist",
        uri: fileUri, // Use the converted URI
        year: new Date().getFullYear(),
        isLocal: true,
      };

      console.log("Selected Sound:", newSound); // Debugging

      setSelectedSound(newSound); // Ensure this updates state
      setIsPlaying(false); // Reset play state

      // **Play sound immediately after selection**
      await playSound(newSound);

      // Save to local storage
      const updatedMyMusic = [newSound, ...myMusic];
      setMyMusic(updatedMyMusic);
      await saveMyMusic(updatedMyMusic);

      Alert.alert("Success", `${newSound.name} added to My Music`);
      closeSoundModal(); // **Ensure modal closes**
    } catch (error) {
      console.log("Error selecting local sound:", error);
      Alert.alert("Error", "Failed to select a sound.");
    }
  }

  const playSound = async (sound: SoundType) => {
    try {
      if (!sound || !sound.uri) {
        console.log("No sound to play.");
        return;
      }

      console.log("Playing Sound:", sound.uri); // Debugging

      if (isPlaying) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        setIsPlaying(false);
        return;
      }

      // **Ensure sound file exists**
      const fileInfo = await FileSystem.getInfoAsync(sound.uri);
      if (!fileInfo.exists) {
        console.error("Sound file does not exist:", sound.uri);
        Alert.alert("Error", "Selected sound file is not available.");
        return;
      }

      await soundRef.current.unloadAsync();
      await soundRef.current.loadAsync({ uri: sound.uri });
      await soundRef.current.playAsync();
      setIsPlaying(true);
      setSelectedSound(sound);

      soundRef.current.setOnPlaybackStatusUpdate(
        (playbackStatus: AVPlaybackStatus) => {
          if (playbackStatus.isLoaded && playbackStatus.didJustFinish) {
            setIsPlaying(false);
            setSelectedSound(null);
            soundRef.current
              .unloadAsync()
              .catch((error) => console.log("Error unloading sound:", error));
          }
        }
      );
    } catch (error) {
      console.log("Error playing sound:", error);
      Alert.alert("Error", "Failed to play the selected sound.");
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "We need permission to access your gallery."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 0.1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const chosenUri = result.assets[0].uri;
      // **Set pickedVideoUri instead of videoUri directly**
      setPickedVideoUri(chosenUri);
      setCheckingVideo(true);
    }
  };

  const navigateToPostVideo = () => {
    if (
      videoUri &&
      challengeVideo &&
      challengeVideoNameState &&
      challengeVideoUserState &&
      challengeVideoUserProfilePicState
    ) {
      router.push({
        pathname: "/postform",
        params: {
          challengeVideoUri: challengeVideo,
          challengeVideoName: challengeVideoNameState,
          challengeVideoUser: challengeVideoUserState,
          challengeVideoUserProfilePic: challengeVideoUserProfilePicState,
          userVideoUri: videoUri,
        },
      });
    } else {
      Alert.alert(
        "Error",
        "Missing required challenge video details or user video. Please record or select a video first."
      );
    }
  };

  // **Implement onVideoLoad Handler**
  const onVideoLoad = (videoStatus: AVPlaybackStatus) => {
    const status = videoStatus as VideoPlaybackStatus;
    if (checkingVideo && status.durationMillis && pickedVideoUri) {
      const durationSeconds = status.durationMillis / 1000;
      if (durationSeconds <= 120) {
        // 2 minutes
        saveToCache(pickedVideoUri).then((saved) => {
          if (saved) {
            setVideoUri(saved);
          }
        });
      } else {
        Alert.alert(
          "Video exceeds limit.",
          "Please select a video that is 2 minutes or shorter."
        );
      }
      setCheckingVideo(false);
      setPickedVideoUri(null);
    } else {
      // Alert.alert("Error", "Unable to determine video duration.");
      setCheckingVideo(false);
      setPickedVideoUri(null);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prevFacing) => (prevFacing === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    if (Platform.OS === "ios" || Platform.OS === "android") {
      setFlashMode((current) => {
        const newFlashMode = current === "off" ? "torch" : "off"; // Use 'torch' instead of 'on'
        return newFlashMode;
      });
    } else {
      Alert.alert(
        "Flash not supported",
        "Flash is not supported on this platform."
      );
    }
  };

  const toggleMenu = () => {
    setExpandedMenu((prev) => !prev);
  };

  const toggleGrid = () => {
    setShowGrid((prev) => !prev);
  };

  const showCamera = permission?.granted && audioPermission;
  const isPreviewing = videoUri !== null || imageUri !== null;

  const toggleVideoPlayback = async () => {
    if (!status.isLoaded) return;
    try {
      if (status.didJustFinish) {
        await videoRef.current?.setPositionAsync(0);
        await videoRef.current?.playAsync();
      } else if (status.isPlaying) {
        await videoRef.current?.pauseAsync();
      } else {
        await videoRef.current?.playAsync();
      }
    } catch (error) {
      console.error("Error toggling video playback:", error);
      Alert.alert("Error", "Unable to play or pause the video.");
    }
  };

  // Determine which icon to show for playback
  const getPlayPauseIcon = () => {
    if (!status.isLoaded) return "play-circle";
    if (status.didJustFinish || !status.isPlaying) return "play-circle";
    return "pause-circle";
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors[colorScheme]?.primary }}
    >
      {/* Permission Screen */}
      {!showCamera ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors[colorScheme]?.primary,
          }}
        >
          <Text
            style={{
              color: colors[colorScheme]?.foreground,
              fontSize: 16,
              marginBottom: 20,
              fontFamily: selectedFont,
            }}
          >
            We need your permission to use the camera and microphone
          </Text>
          <TouchableOpacity
            onPress={async () => {
              await requestPermission();
              const audioPermissionResponse =
                await Audio.requestPermissionsAsync();
              setAudioPermission(audioPermissionResponse.status === "granted");
            }}
            style={{
              backgroundColor: colors[colorScheme]?.background,
              padding: 10,
              borderRadius: 5,
            }}
          >
            <Text
              style={{
                color: colors[colorScheme]?.foreground,
                fontFamily: selectedFont,
                fontSize: 16,
              }}
            >
              Grant Permissions
            </Text>
          </TouchableOpacity>
        </View>
      ) : isPreviewing ? (
        /* Video or Image Preview Screen */
        <View
          style={{ flex: 1, backgroundColor: colors[colorScheme]?.primary }}
        >
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
                  onPress={() => setImageUri(null)}
                  activeOpacity={0.7}
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
                  onPress={() => router.push("/postvideo")}
                  activeOpacity={0.7}
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
      ) : (
        /* Live Camera Screen */
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing={facing}
          flash={flashMode}
          enableTorch={flashMode === "torch"}
          mode="video"
          videoQuality="480p"
          // onTouchStart={handleFocus}
          zoom={zoom}
        >
          {/* **Hidden Video component to load and check video duration** */}
          {pickedVideoUri && (
            <Video
              style={{ width: 0, height: 0 }}
              source={{ uri: pickedVideoUri }}
              onPlaybackStatusUpdate={onVideoLoad}
            />
          )}

          {/* Display Timer at the Top if Recording */}
          {isRecording && (
            <View
              style={{
                position: "absolute",
                top: 50,
                left: 0,
                right: 0,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontFamily: selectedFont,
                  fontSize: 24,
                }}
              >
                {formatTime(recordingElapsedTime)}
              </Text>
            </View>
          )}

          {/* Gallery Button */}
          <TouchableOpacity
            onPress={pickFromGallery}
            style={{
              position: "absolute",
              bottom: 20,
              right: 20,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              padding: 10,
              borderRadius: 20,
            }}
          >
            <Ionicons
              name="images"
              size={24}
              color={colors[colorScheme]?.foreground}
            />
          </TouchableOpacity>

          {focusPoint && (
            <Animated.View
              style={{
                position: "absolute",
                left: `${focusPoint.x * 100}%`,
                top: `${focusPoint.y * 100}%`,
                width: 50,
                height: 50,
                borderWidth: 2,
                borderColor: "yellow",
                borderRadius: 25,
                transform: [{ translateX: -25 }, { translateY: -25 }],
                opacity: focusPoint ? 1 : 0, // Fade out animation
              }}
            />
          )}

          {showGrid && (
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              {/* Vertical Grid Lines */}
              {[1, 2].map((i) => (
                <View
                  key={`v-${i}`}
                  style={{
                    position: "absolute",
                    left: `${(i / 3) * 100}%`,
                    width: 2,
                    height: "100%",
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                  }}
                />
              ))}

              {/* Horizontal Grid Lines */}
              {[1, 2].map((i) => (
                <View
                  key={`h-${i}`}
                  style={{
                    position: "absolute",
                    top: `${(i / 3) * 100}%`,
                    width: "100%",
                    height: 2,
                    backgroundColor: "rgba(255, 255, 255, 0.6)",
                  }}
                />
              ))}
            </View>
          )}

          {/* {isDirectorMode && (
                  <View
                    style={{
                      position: "absolute",
                      top: 50,
                      left: 20,
                      backgroundColor: "black",
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderRadius: 10,
                      opacity: 0.7,
                    }}
                  >
                    <Text
                      style={{ color: "yellow", fontSize: 14, fontWeight: "bold" }}
                    >
                      🎬 Director Mode
                    </Text>
                  </View>
                )} */}

          {/* Side Menu */}
          {/* //  {!isScannerActive && !isRecording && ( */}
          {!isScannerActive && (
            <View
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                borderRadius: 20,
                padding: 10,
              }}
            >
              {/* Toggle Camera Facing */}
              <TouchableOpacity
                onPress={toggleCameraFacing}
                style={{ marginBottom: 10 }}
                disabled={isRecording}
              >
                <Ionicons
                  name="camera-outline"
                  size={24}
                  color={
                    isRecording
                      ? colors[colorScheme]?.mutedForeground
                      : colors[colorScheme]?.foreground
                  }
                />
                {showLabels && (
                  <Text
                    style={{
                      color: colors[colorScheme]?.foreground,
                      fontSize: 12,
                    }}
                  >
                    Camera
                  </Text>
                )}
              </TouchableOpacity>

              {/* Toggle Flash */}
              <TouchableOpacity
                onPress={toggleFlash}
                style={{ marginBottom: 10 }}
              >
                <Ionicons
                  name={
                    flashMode === "off" ? "flash-off-outline" : "flash-outline"
                  }
                  size={24}
                  color={colors[colorScheme]?.foreground}
                />
                {showLabels && (
                  <Text
                    style={{
                      color: colors[colorScheme]?.foreground,
                      fontSize: 12,
                    }}
                  >
                    Flash
                  </Text>
                )}
              </TouchableOpacity>

              {/* Sound Selection */}
              <TouchableOpacity
                onPress={openSoundModal}
                style={{ marginBottom: 10 }}
              >
                {!selectedSound && (
                  <MaterialCommunityIcons
                    name="music-note-outline"
                    size={24}
                    color={colors[colorScheme]?.foreground}
                  />
                )}
                {!selectedSound && showLabels && (
                  <Text
                    style={{
                      color: colors[colorScheme]?.foreground,
                      fontSize: 12,
                    }}
                  >
                    Sounds
                  </Text>
                )}
                {selectedSound && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: 5,
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10, // Makes it fully rounded
                        backgroundColor: colors[colorScheme]?.background, // Change to desired background color
                        justifyContent: "center",
                        alignItems: "center",
                        // marginRight: 4, // Adds spacing
                      }}
                    >
                      <Text
                        style={{
                          color: colors[colorScheme]?.foreground,
                          fontSize: 14,
                          fontWeight: "bold",
                        }}
                      >
                        {selectedSound.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => selectedSound && playSound(selectedSound)}
                      style={{ marginLeft: 5 }}
                    >
                      <Ionicons
                        name={isPlaying ? "pause-circle" : "play-circle"}
                        size={24}
                        color={colors[colorScheme]?.foreground}
                      />
                    </TouchableOpacity>
                    {/* Remove Sound Button */}
                    <TouchableOpacity
                      onPress={() => setSelectedSound(null)}
                      style={{ marginLeft: 3 }}
                    >
                      <Ionicons name="close-circle" size={24} color="red" />
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>

              {/* Expanded Menu Items */}
              {expandedMenu && (
                <>
                  {/* Timer */}
                  <TouchableOpacity
                    onPress={openTimerModal}
                    style={{ marginBottom: 10 }}
                  >
                    <Ionicons
                      name="timer-outline"
                      size={24}
                      color={timerSet ? "yellow" : "white"}
                    />
                    {showLabels && (
                      <Text
                        style={{
                          color: colors[colorScheme]?.foreground,
                          fontSize: 12,
                          fontFamily: selectedFont,
                        }}
                      >
                        Timer: {timerSet ? `${recordingTime}s` : "Off"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Director Mode */}
                  <TouchableOpacity
                    onPress={() => setIsDirectorMode((prev) => !prev)}
                    style={{ marginBottom: 10 }}
                    disabled
                  >
                    <FontAwesome
                      name="video-camera"
                      size={24}
                      color={
                        isDirectorMode
                          ? "yellow"
                          : colors[colorScheme]?.mutedForeground
                      }
                    />
                    {showLabels && (
                      <Text
                        style={{
                          color: colors[colorScheme]?.foreground,
                          fontSize: 12,
                          fontFamily: selectedFont,
                        }}
                      >
                        {isDirectorMode ? "Director Mode: ON" : "Director Mode"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Focus */}
                  {/* <TouchableOpacity s  */}

                  {/* Grid */}
                  <TouchableOpacity
                    onPress={toggleGrid}
                    style={{ marginBottom: 10 }}
                  >
                    <Ionicons
                      name="grid-outline"
                      size={24}
                      color={
                        showGrid ? "yellow" : colors[colorScheme]?.foreground
                      }
                    />
                    {showLabels && (
                      <Text
                        style={{
                          color: colors[colorScheme]?.foreground,
                          fontSize: 12,
                        }}
                      >
                        {showGrid ? "Grid: ON" : "Grid"}
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Zoom In Button */}
                  <TouchableOpacity
                    onPress={() => setZoom((prev) => Math.min(prev + 0.1, 1))} // Increase zoom
                    style={{ marginBottom: 10 }}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color={colors[colorScheme]?.foreground}
                    />
                    {showLabels && (
                      <Text
                        style={{
                          color: colors[colorScheme]?.foreground,
                          fontSize: 12,
                        }}
                      >
                        Zoom In
                      </Text>
                    )}
                  </TouchableOpacity>

                  {/* Zoom Out Button */}
                  <TouchableOpacity
                    onPress={() => setZoom((prev) => Math.max(prev - 0.1, 0))} // Decrease zoom
                    style={{ marginBottom: 10 }}
                  >
                    <Ionicons
                      name="remove-circle-outline"
                      size={24}
                      color={colors[colorScheme]?.foreground}
                    />
                    {showLabels && (
                      <Text
                        style={{
                          color: colors[colorScheme]?.foreground,
                          fontSize: 12,
                        }}
                      >
                        Zoom Out
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* Collapse Button */}
              <TouchableOpacity onPress={toggleMenu}>
                <Ionicons
                  name={
                    expandedMenu ? "chevron-up-outline" : "chevron-down-outline"
                  }
                  size={24}
                  color={colors[colorScheme]?.foreground}
                />
              </TouchableOpacity>
            </View>
          )}

          {/* Overlay with Record Button */}
          <View
            style={{
              position: "absolute",
              bottom: 20,
              left: 0,
              right: 0,
              alignItems: "center",
            }}
          >
            <TouchableOpacity onPress={toggleRecording} activeOpacity={0.7}>
              <LinearGradient
                colors={["#fff", "#1f5c71", "#fff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Animated.View
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: 30,
                    backgroundColor: isRecording
                      ? animationProgress.interpolate({
                          inputRange: [0, 1],
                          outputRange: ["rgba(255,0,0,1)", "rgba(255,0,0,1)"],
                        })
                      : "transparent",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {isRecording ? (
                    <Ionicons
                      name="stop"
                      size={24}
                      color={colors[colorScheme]?.foreground}
                    />
                  ) : (
                    <Ionicons
                      name="videocam-sharp"
                      size={24}
                      color={colors[colorScheme]?.foreground}
                    />
                  )}
                </Animated.View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </CameraView>
      )}

      {/* Sound Modal */}
      <Modal visible={isSoundModalVisible} transparent animationType="slide">
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
              backgroundColor: colors[colorScheme]?.primary,
              padding: 20,
              borderRadius: 10,
              width: "80%",
            }}
          >
            <Text
              style={{
                color: colors[colorScheme]?.foreground,
                fontSize: 18,
                marginBottom: 10,
                fontFamily: selectedFont,
              }}
            >
              Select Sound
            </Text>
            <Text
              style={{
                color: colors[colorScheme]?.foreground,
                fontSize: 14,
                marginBottom: 20,
                fontFamily: selectedFont,
              }}
            >
              Choose a sound from local storage or online library
            </Text>

            <TouchableOpacity
              onPress={selectLocalSound}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Ionicons
                name="folder-open-outline"
                size={24}
                color={colors[colorScheme]?.foreground}
              />
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontSize: 16,
                  marginLeft: 10,
                  fontFamily: selectedFont,
                }}
              >
                Select from Local Storage
              </Text>
            </TouchableOpacity>

            <View
              style={{
                height: 1,
                backgroundColor: colors[colorScheme]?.foreground,
                marginVertical: 10,
              }}
            />

            <TouchableOpacity
              onPress={closeSoundModal}
              style={{
                backgroundColor: "#1f5c71",
                padding: 10,
                borderRadius: 5,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontSize: 16,
                  fontFamily: selectedFont,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Timer Modal */}
      <Modal visible={isTimerModalVisible} transparent animationType="slide">
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
              backgroundColor: colors[colorScheme]?.primary,
              padding: 20,
              borderRadius: 10,
              width: "80%",
            }}
          >
            <Text
              style={{
                color: colors[colorScheme]?.foreground,
                fontSize: 18,
                marginBottom: 10,
                fontFamily: selectedFont,
              }}
            >
              Select Timer Duration
            </Text>

            {/* Timer Options */}
            {[10, 30, 60, 120].map((time) => (
              <TouchableOpacity
                key={time}
                onPress={() => confirmTimer(time)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 10,
                  padding: 10,
                  borderRadius: 5,
                  backgroundColor:
                    recordingTime === time ? "blue" : "transparent",
                }}
              >
                <Text
                  style={{
                    color: colors[colorScheme]?.foreground,
                    fontSize: 16,
                    fontFamily: selectedFont,
                  }}
                >
                  {time} seconds
                </Text>
              </TouchableOpacity>
            ))}

            {/* Close Modal */}
            <TouchableOpacity
              onPress={closeTimerModal}
              style={{
                backgroundColor: "#1f5c71",
                padding: 10,
                borderRadius: 5,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontSize: 16,
                  fontFamily: selectedFont,
                }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default RecordChallenge;
