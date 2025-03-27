// DuetChallenge.tsx

import React, { useState, useEffect, useRef } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Alert,
  Switch,
} from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Camera, CameraView } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import * as MediaLibrary from "expo-media-library";
import { supabase } from "@/config/supabase"; // Adjust the path as necessary

const { width, height } = Dimensions.get("window");
const GALLERY_THUMB_SIZE = width / 3;

// Define MediaAsset and Album types
type MediaAsset = {
  id: string;
  uri: string;
  mediaType: "photo" | "video";
  duration?: number;
};

type Album = {
  id: string;
  title: string;
};

interface Submission {
  id: string;
  user_id: string;
  title: string;
  video_url: string;
  description: string;
  // Add other relevant fields as necessary
}

interface User {
  id: string;
  username: string;
  profile_picture_url: string;
  // Add other relevant fields as necessary
}

const DuetChallenge: React.FC = () => {
  const router = useRouter();

  // 1. Extract `challengeVideoUri` and `videoId` from Local Search Parameters
  const { challengeVideoUri, videoId, initialDuetMode } =
    useLocalSearchParams();

  // 2. Parse `initialDuetMode` to boolean
  const parsedInitialDuetMode = initialDuetMode === "true";

  // Refs
  const cameraRef = useRef<Camera>(null);
  const challengeVideoRef = useRef<Video>(null);

  // State for Challenge Video Details
  const [challengeVideoName, setChallengeVideoName] = useState<string | null>(
    null
  );
  const [challengeVideoUser, setChallengeVideoUser] = useState<string | null>(
    null
  );
  const [challengeVideoUserProfilePic, setChallengeVideoUserProfilePic] =
    useState<string | null>(null);

  // State
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState<"front" | "back">("front");
  const [flashMode, setFlashMode] = useState<"off" | "torch">("off");
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUri, setRecordedVideoUri] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [galleryAssets, setGalleryAssets] = useState<MediaAsset[]>([]);
  const [isLoadingAlbums, setIsLoadingAlbums] = useState(false);
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [activeTab, setActiveTab] = useState("POST");

  // Duet Mode State
  const [isDuetMode, setIsDuetMode] = useState<boolean>(parsedInitialDuetMode); // Initialize as parsed value

  // Challenge Video Playback State
  const [isChallengeVideoPaused, setIsChallengeVideoPaused] = useState(false);

  // Pause Overlay State
  const [showPauseOverlay, setShowPauseOverlay] = useState(false);

  // Double-Tap Detection
  const lastTap = useRef<number | null>(null);

  // PanResponder for Swipe Detection
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (
        evt: GestureResponderEvent,
        gestureState: PanResponderGestureState
      ) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300; // milliseconds
        if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
          // Detected Double-Tap
          toggleDuetMode();
          lastTap.current = null;
        } else {
          lastTap.current = now;
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        // No action on move
      },
      onPanResponderRelease: (evt, gestureState) => {
        const SWIPE_THRESHOLD = 50; // Adjust as needed
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          // Horizontal Swipe
          if (gestureState.dx > SWIPE_THRESHOLD) {
            // Swipe Right
            toggleCameraFacing();
          } else if (gestureState.dx < -SWIPE_THRESHOLD) {
            // Swipe Left
            toggleCameraFacing();
          }
        }
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {},
      onShouldBlockNativeResponder: () => true,
    })
  ).current;

  // Permission and Initial Load
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await Camera.requestCameraPermissionsAsync();
      const mediaLibraryPermission =
        await MediaLibrary.requestPermissionsAsync();
      setHasPermission(
        cameraStatus === "granted" &&
          mediaLibraryPermission.status === "granted"
      );

      if (mediaLibraryPermission.status === "granted") {
        loadAlbums();
      }

      if (videoId) {
        fetchChallengeVideoDetails(videoId);
      } else {
        Alert.alert("Error", "No video ID provided for the challenge.");
      }
    })();
  }, [videoId]);

  // Function to Fetch Challenge Video Details from Supabase
  const fetchChallengeVideoDetails = async (id: string) => {
    try {
      // Fetch from submissions table with correct column names
      const { data: submissionData, error: submissionError } = await supabase
        .from<Submission>("submissions")
        .select("title, user_id") // Correct column names
        .eq("id", id)
        .single();

      if (submissionError || !submissionData) {
        console.error("Error fetching submission:", submissionError);
        Alert.alert("Error", "Failed to fetch challenge video details.");
        return;
      }

      setChallengeVideoName(submissionData.title); // Use 'title' instead of 'videoName'

      // Fetch user details from users table with correct column names
      const { data: userData, error: userError } = await supabase
        .from<User>("users")
        .select("username, profile_picture_url") // Correct column name
        .eq("id", submissionData.user_id) // Use 'user_id' instead of 'userId'
        .single();

      if (userError || !userData) {
        console.error("Error fetching user:", userError);
        Alert.alert("Error", "Failed to fetch challenge video user details.");
        return;
      }

      setChallengeVideoUser(userData.username);
      setChallengeVideoUserProfilePic(userData.profile_picture_url); // Use 'profile_picture_url' instead of 'profilePicUri'
    } catch (error) {
      console.error("Unexpected error:", error);
      Alert.alert(
        "Error",
        "An unexpected error occurred while fetching challenge details."
      );
    }
  };

  // Camera Controls Functions
  const toggleDuetMode = () => {
    setIsDuetMode((prev) => !prev);
  };

  const toggleCameraFacing = () => {
    setCameraType((prevFacing) => (prevFacing === "back" ? "front" : "back"));
  };

  const toggleFlash = () => {
    setFlashMode((prevFlash) => (prevFlash === "off" ? "torch" : "off"));
  };

  // Load Albums
  const loadAlbums = async () => {
    setIsLoadingAlbums(true);
    try {
      const albumsResult = await MediaLibrary.getAlbumsAsync({
        includeSmartAlbums: true,
      });

      const allVideosAlbum: Album = { id: "all", title: "Recents" };
      setAlbums([
        allVideosAlbum,
        ...albumsResult.map((album) => ({
          id: album.id,
          title: album.title,
        })),
      ]);

      setSelectedAlbum(allVideosAlbum);
      loadGalleryAssets(allVideosAlbum);
    } catch (error) {
      console.error("Failed to load albums:", error);
      Alert.alert("Error", "Failed to load albums.");
    } finally {
      setIsLoadingAlbums(false);
    }
  };

  // Load Gallery Assets
  const loadGalleryAssets = async (album: Album) => {
    setIsLoadingAssets(true);
    try {
      const options = {
        mediaType: ["video"] as const,
        first: 50,
        sortBy: ["creationTime"] as const,
      };

      const assets =
        album.id === "all"
          ? await MediaLibrary.getAssetsAsync(options)
          : await MediaLibrary.getAssetsAsync({
              ...options,
              album: album.id,
            });

      setGalleryAssets(
        assets.assets.map((asset) => ({
          id: asset.id,
          uri: asset.uri,
          mediaType: asset.mediaType,
          duration: asset.duration,
        }))
      );
    } catch (error) {
      console.error("Failed to load assets:", error);
      Alert.alert("Error", "Failed to load media assets.");
    } finally {
      setIsLoadingAssets(false);
    }
  };

  // Handle Touch to Toggle Challenge Video Playback
  const handleChallengeVideoToggle = () => {
    setIsChallengeVideoPaused((prev) => !prev);
    setShowPauseOverlay((prev) => !prev); // Toggle overlay visibility
  };

  // Render Header
  const renderHeader = () => (
    <SafeAreaView style={styles.headerContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.closeButton}
          accessible={true}
          accessibilityLabel="Close"
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inspired by</Text>
        {/* Modify the Next Button to Pass All Required Parameters */}
        <TouchableOpacity
          onPress={() => {
            if (!selectedAsset) {
              Alert.alert(
                "No Video Selected",
                "Please select a video from the gallery."
              );
              return;
            }
            if (
              !challengeVideoUri ||
              !challengeVideoName ||
              !challengeVideoUser ||
              !challengeVideoUserProfilePic
            ) {
              Alert.alert(
                "Missing Challenge Details",
                "Challenge video details are missing."
              );
              return;
            }
            router.push({
              pathname: "/postform",
              params: {
                challengeVideoUri, // Pass the challenge video's URI
                challengeVideoName, // Pass the challenge video's name
                challengeVideoUser, // Pass the challenge video's user
                challengeVideoUserProfilePic, // Pass the challenge video's user profile picture URI
                userVideoUri: selectedAsset.uri, // Pass the selected user's video URI
                videoId, // Pass the videoId if required
              },
            });
          }}
          style={styles.nextButton}
          disabled={
            !selectedAsset ||
            !challengeVideoUri ||
            !challengeVideoName ||
            !challengeVideoUser ||
            !challengeVideoUserProfilePic
          }
          accessible={true}
          accessibilityLabel="Proceed to post form"
        >
          <Text
            style={[
              styles.nextButtonText,
              (!selectedAsset ||
                !challengeVideoUri ||
                !challengeVideoName ||
                !challengeVideoUser ||
                !challengeVideoUserProfilePic) &&
                styles.nextButtonDisabled,
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  // Render Gallery Item
  const renderGalleryItem = ({ item }: { item: MediaAsset }) => (
    <TouchableOpacity
      onPress={() => setSelectedAsset(item)}
      style={[
        styles.galleryThumb,
        selectedAsset?.id === item.id && styles.selectedThumb,
      ]}
      accessible={true}
      accessibilityLabel={`Select media asset ${item.id}`}
    >
      <Image source={{ uri: item.uri }} style={styles.thumbImage} />
      {item.duration && (
        <View style={styles.videoDurationBadge}>
          <Text style={styles.videoDurationText}>
            {Math.floor(item.duration)}s
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  // Render Gallery Section with Overlay Buttons
  const renderGallerySection = () => (
    <View style={styles.galleryContainer}>
      <View style={styles.galleryHeader}>
        <TouchableOpacity
          style={styles.recentsDropdown}
          onPress={() => setShowAlbumModal(true)}
          accessible={true}
          accessibilityLabel="Select Album"
        >
          <Text style={styles.recentsText}>
            {selectedAlbum?.title || "Recents"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Overlay Buttons */}
      <View style={styles.galleryButtons}>
        {/* 1. Add Switch Button: Toggle Duet Mode */}
        {/* <View style={styles.duetSwitchContainer}>
          <Ionicons
            name="duplicate-outline"
            size={24}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Switch
            value={isDuetMode}
            onValueChange={toggleDuetMode}
            thumbColor={isDuetMode ? "#0095f6" : "#f4f3f4"}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            accessible={true}
            accessibilityLabel="Toggle Duet Mode"
          />
        </View> */}

        {/* 2. Camera Outline Button: Navigate to Shoot Challenge */}
        <TouchableOpacity
          onPress={() => {
            if (
              !challengeVideoUri ||
              !videoId ||
              !challengeVideoName ||
              !challengeVideoUser ||
              !challengeVideoUserProfilePic
            ) {
              Alert.alert(
                "Missing Challenge Details",
                "Challenge video details are missing."
              );
              return;
            }
            router.push({
              pathname: "/shoot-challenge",
              params: {
                challengeVideoUri, // Pass the challenge video URI
                challengeVideoName, // Pass the challenge video name
                challengeVideoUser, // Pass the challenge video user
                challengeVideoUserProfilePic, // Pass the challenge video user profile picture URI
                videoId, // Pass the videoId if required by /shoot-challenge
              },
            });
          }}
          style={styles.galleryButton}
          accessible={true}
          accessibilityLabel="Record a Challenge Video"
        >
          <Ionicons name="videocam-sharp" size={24} color="white" />
          <Text style={styles.buttonText}>REC</Text>
        </TouchableOpacity>
      </View>

      {isLoadingAssets ? (
        <ActivityIndicator size="large" color="#0095f6" style={styles.loader} />
      ) : (
        <FlatList
          data={galleryAssets}
          renderItem={renderGalleryItem}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.galleryList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );

  // Render Preview Area
  const renderPreviewArea = () => {
    if (isDuetMode) {
      return (
        <View
          style={styles.duetPreviewContainer}
          {...panResponder.panHandlers} // Attach PanResponder
        >
          {/* Left Side: User's Selected Asset or Camera */}
          <View style={styles.duetLeftPane}>
            {selectedAsset ? (
              <Video
                source={{ uri: selectedAsset.uri }}
                style={styles.duetVideo}
                resizeMode={ResizeMode.COVER}
                shouldPlay={false}
                isLooping
                accessible={true}
                accessibilityLabel="Your Selected Video"
              />
            ) : (
              <CameraView
                ref={cameraRef}
                style={styles.duetCamera}
                type={cameraType === "front" ? "front" : "back"}
                flashMode={flashMode === "off" ? "off" : "torch"}
                accessible={true}
                accessibilityLabel="Camera View"
              />
            )}
          </View>

          {/* Right Side: Challenge Video with Touch to Pause/Play */}
          <TouchableOpacity
            style={styles.duetRightPane}
            activeOpacity={1}
            onPress={handleChallengeVideoToggle}
            accessible={true}
            accessibilityLabel="Challenge Video"
          >
            {challengeVideoUri ? (
              <Video
                ref={challengeVideoRef}
                source={{ uri: challengeVideoUri }}
                style={styles.duetVideo}
                resizeMode={ResizeMode.COVER}
                shouldPlay={true} // Auto-play challenge video
                isLooping={true}
                isMuted={true} // Mute to prevent audio interference
                paused={isChallengeVideoPaused}
                accessible={true}
                accessibilityLabel="Challenge Video"
              />
            ) : (
              <View style={[styles.videoThumbnail, styles.videoPlaceholder]}>
                <Ionicons name="videocam-off" size={64} color="#555" />
                <Text style={styles.placeholderText}>No challenge video</Text>
              </View>
            )}
            {/* Optional Overlay to Indicate Pause State */}
            {showPauseOverlay && (
              <View style={styles.pauseOverlay}>
                <Ionicons
                  name="pause-circle"
                  size={64}
                  color="rgba(255,255,255,0.7)"
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    // Normal Mode: Single Preview Area
    return (
      <View
        style={styles.previewArea}
        {...panResponder.panHandlers} // Attach PanResponder
      >
        {selectedAsset ? (
          <Video
            source={{ uri: selectedAsset.uri }}
            style={styles.previewVideo}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping
            accessible={true}
            accessibilityLabel="Selected Video"
          />
        ) : (
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            type={cameraType === "front" ? "front" : "back"}
            flashMode={flashMode === "off" ? "off" : "torch"}
            accessible={true}
            accessibilityLabel="Camera View"
          />
        )}
      </View>
    );
  };

  // Permission Check
  if (hasPermission === null) {
    return <View style={styles.container} />;
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>
          No access to camera or media library
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {renderHeader()}

      <View style={styles.mainContent}>
        {renderPreviewArea()}

        {/* Gallery Section */}
        {renderGallerySection()}
      </View>

      {/* Bottom Tab Bar */}
      {/* <View style={styles.tabBar}>
        {["POST", "STORY", "REEL", "LIVE"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
            accessible={true}
            accessibilityLabel={`Switch to ${tab} Tab`}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View> */}

      {/* Album Selection Modal */}
      <Modal
        visible={showAlbumModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAlbumModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowAlbumModal(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Album</Text>
              <TouchableOpacity
                onPress={() => setShowAlbumModal(false)}
                accessible={true}
                accessibilityLabel="Close Album Selection"
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {albums.map((album) => (
                <TouchableOpacity
                  key={album.id}
                  style={[
                    styles.albumOption,
                    selectedAlbum?.id === album.id &&
                      styles.selectedAlbumOption,
                  ]}
                  onPress={() => {
                    setSelectedAlbum(album);
                    loadGalleryAssets(album);
                    setShowAlbumModal(false);
                  }}
                  accessible={true}
                  accessibilityLabel={`Select Album ${album.title}`}
                >
                  <Text style={styles.albumOptionText}>{album.title}</Text>
                  {selectedAlbum?.id === album.id && (
                    <Ionicons name="checkmark" size={24} color="#0095f6" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "black",
  },
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    backgroundColor: "black",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    height: 44,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  nextButton: {
    padding: 8,
  },
  nextButtonText: {
    color: "#0095f6",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  mainContent: {
    flex: 1,
  },
  previewArea: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#1a1a1a",
  },
  camera: {
    flex: 1,
  },
  duetCamera: {
    flex: 1,
  },
  previewVideo: {
    width: "100%",
    height: "100%",
  },
  cameraControls: {
    position: "absolute",
    top: 20,
    right: 20,
    alignItems: "center",
  },
  galleryContainer: {
    flex: 1,
    backgroundColor: "#000",
    position: "relative", // Ensure absolute positioning of buttons is relative to this container
  },
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  recentsDropdown: {
    flexDirection: "row",
    alignItems: "center",
  },
  recentsText: {
    color: "white",
    fontSize: 16,
    marginRight: 8,
  },
  galleryButtons: {
    position: "absolute",
    top: 1, // Adjust as needed
    right: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10, // Ensure buttons are above the gallery content
    alignItems: "center", // Align items vertically
  },
  duetSwitchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16, // Space between switch and REC button
  },
  galleryButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Semi-transparent background
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
  },
  buttonText: {
    color: "#f23535",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  loader: {
    marginTop: 20,
  },
  galleryList: {
    paddingHorizontal: 4,
  },
  galleryThumb: {
    width: GALLERY_THUMB_SIZE - 8,
    height: GALLERY_THUMB_SIZE - 8,
    margin: 4,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedThumb: {
    borderColor: "#0095f6",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  videoDurationBadge: {
    position: "absolute",
    bottom: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoDurationText: {
    color: "white",
    fontSize: 12,
  },
  recordingControls: {
    position: "absolute",
    bottom: 80,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingButton: {
    borderColor: "red",
  },
  recordButtonInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "red",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    borderTopWidth: 1,
    borderColor: "#333",
    backgroundColor: "#000",
  },
  tabItem: {
    paddingVertical: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderColor: "#0095f6",
  },
  tabText: {
    color: "white",
    fontSize: 16,
  },
  activeTabText: {
    color: "#0095f6",
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 10,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#333",
  },
  modalTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  albumOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  selectedAlbumOption: {
    backgroundColor: "rgba(0, 149, 246, 0.1)",
  },
  albumOptionText: {
    color: "white",
    fontSize: 16,
  },
  errorText: {
    color: "white",
    fontSize: 16,
  },

  // Duet Mode Styles
  duetPreviewContainer: {
    flex: 1,
    flexDirection: "row",
  },
  duetLeftPane: {
    flex: 1,
    borderRightWidth: 1,
    borderColor: "#333",
  },
  duetRightPane: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  duetVideo: {
    width: "100%",
    height: "100%",
  },
  pauseOverlay: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    top: "40%",
    left: "40%",
  },
  videoThumbnail: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  videoPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
  },
  placeholderText: {
    color: "#555",
    marginTop: 8,
    fontSize: 16,
  },
  previewArea: {
    width: "100%",
    aspectRatio: 1,
    backgroundColor: "#1a1a1a",
  },
  camera: {
    flex: 1,
  },
  duetCamera: {
    flex: 1,
  },
  previewVideo: {
    width: "100%",
    height: "100%",
  },
});

export default DuetChallenge;
