
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as VideoThumbnails from "expo-video-thumbnails";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Switch,
  Platform,
} from "react-native";
import { useSupabase } from "@/context/supabase-provider";
import { ResizeMode, Video, AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import { Video as Compressor } from "react-native-compressor";
import { KeyboardAvoidingView } from "react-native";
import { ScrollView } from "react-native";
import { supabase } from "@/config/supabase";

global.Buffer = Buffer;

type PostFormParams = {
  challengeVideoUri: string;
  userVideoUri: string;
  challengeVideoName: string;
  challengeVideoUser: string;
  challengeVideoUserProfilePic: string;
  videoId?: string; // Optional parameter
};

const SUPABASE_STORAGE_BUCKET = "social-challenges";

const PostForm: React.FC = () => {
  const router = useRouter();
  const {
    challengeVideoUri,
    userVideoUri,
    challengeVideoName,
    challengeVideoUser,
    challengeVideoUserProfilePic,
    videoId, // Optional
  } = useLocalSearchParams<PostFormParams>();

  const { user } = useSupabase();

  // State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isDuetMode, setIsDuetMode] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [userVideoThumbnail, setUserVideoThumbnail] = useState<string | null>(null);
  const [duetVideoThumbnail, setDuetVideoThumbnail] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);

  // Helper function to extract URI
  const extractUri = (uriParam: any): string | null => {
    if (typeof uriParam === "string" && uriParam.trim() !== "") {
      return uriParam;
    } else if (
      uriParam &&
      typeof uriParam.uri === "string" &&
      uriParam.uri.trim() !== ""
    ) {
      return uriParam.uri;
    }
    return null;
  };

  // Determine which video URI to use
  const userUri = extractUri(userVideoUri);
  const duetUri = extractUri(challengeVideoUri);

  // Debugging: Log the URIs and their types
  useEffect(() => {
    console.log("challengeVideoUri:", challengeVideoUri, typeof challengeVideoUri);
    console.log("userVideoUri:", userVideoUri, typeof userVideoUri);
    console.log("userUri:", userUri, typeof userUri);
    console.log("duetUri:", duetUri, typeof duetUri);
  }, [challengeVideoUri, userVideoUri, userUri, duetUri]);

  // Validate Parameters on Mount
  useEffect(() => {
    if (
      !challengeVideoUri ||
      !challengeVideoName ||
      !challengeVideoUser ||
      !challengeVideoUserProfilePic ||
      !userUri
    ) {
      Alert.alert(
        "Missing Information",
        "Some required information is missing. Please try again.",
        [
          {
            text: "Go Back",
            onPress: () => router.back(),
          },
        ],
        { cancelable: false }
      );
    }
  }, [
    challengeVideoUri,
    challengeVideoName,
    challengeVideoUser,
    challengeVideoUserProfilePic,
    userUri,
  ]);

  // Generate Thumbnails on Video URI Change
  useEffect(() => {
    (async () => {
      if (userUri && typeof userUri === "string" && userUri.startsWith("file://")) {
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(userUri, {
            time: 1000,
          });
          setUserVideoThumbnail(uri);
        } catch (e) {
          console.warn("Failed to generate thumbnail for user video:", e);
          setUserVideoThumbnail(null);
        }
      } else {
        setUserVideoThumbnail(null);
      }

      if (
        isDuetMode &&
        duetUri &&
        typeof duetUri === "string" &&
        duetUri.startsWith("file://")
      ) {
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(duetUri, {
            time: 1000,
          });
          setDuetVideoThumbnail(uri);
        } catch (e) {
          console.warn("Failed to generate thumbnail for duet video:", e);
          setDuetVideoThumbnail(null);
        }
      } else {
        setDuetVideoThumbnail(null);
      }
    })();
  }, [userUri, duetUri, isDuetMode]);

  // Compress video
  const compressVideo = async (uri: string): Promise<string> => {
    try {
      setIsCompressing(true);
      console.log("Starting video compression...");

      const compressedUri = await Compressor.compress(uri, {
        compressionMethod: "auto",
        quality: "medium", // Options: "low", "medium", "high"
      });

      console.log("Compression completed:", compressedUri);
      return compressedUri;
    } catch (error) {
      console.error("Error compressing video:", error);
      return uri; // Fallback to original if compression fails
    } finally {
      setIsCompressing(false);
    }
  };

  // Upload video to Supabase
  const uploadVideo = async (uri: string): Promise<string> => {
    try {
      const compressedUri = await compressVideo(uri);
      const fileName = `video_${Date.now()}.mp4`;
      const filePath = `videos/${fileName}`;

      const fileData = await FileSystem.readAsStringAsync(compressedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binaryData = Buffer.from(fileData, "base64");

      const { data: uploadResult, error: uploadError } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(filePath, binaryData, {
          contentType: "video/mp4",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        throw uploadError;
      }

      const publicURL = `${supabase.storageUrl}/object/public/${SUPABASE_STORAGE_BUCKET}/${filePath}`;
      console.log("Video uploaded:", publicURL);

      return publicURL;
    } catch (error) {
      console.error("Error Uploading Video:", error.message);
      throw error;
    }
  };

  // Save metadata to Supabase
  const saveToSupabase = async (videoUrl: string) => {
    if (!user) {
      throw new Error("User is not authenticated.");
    }

    const { data, error } = await supabase.from("submissions").insert([
      {
        user_id: user.id,
        video_url: videoUrl,
        title,
        description,
        moderation_status: "pending", // Default to pending until moderation result
      },
    ]);

    if (error) {
      console.error("Database Insert Error:", error.message);
      throw error;
    }

    console.log("Video metadata saved to submissions:", data);
  };

  // Handle Post Submission
  const handlePost = async () => {
    if (!userUri) {
      Alert.alert("No Video Selected", "Please select or record a video before posting.");
      return;
    }

    if (!title.trim()) {
      Alert.alert("Title Required", "Please enter a title for your post.");
      return;
    }

    setIsPosting(true);

    try {
      console.log("Starting upload process...");

      // Upload User Video
      const userVideoUrl = await uploadVideo(userUri);
      console.log(`User Video URL Obtained: ${userVideoUrl}`);

      // Save Metadata to Supabase
      await saveToSupabase(userVideoUrl);

      Alert.alert("Success", "Your post has been uploaded successfully!");
      router.push("/(app)/(protected)"); // Adjust the route as needed
    } catch (error: any) {
      console.error("Failed to post:", error);
      Alert.alert(
        "Upload Failed",
        error.message || "There was an issue uploading your post. Please try again."
      );
    } finally {
      setIsPosting(false);
    }
  };

  // Handle Cancel
  const handleCancel = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 40}
      >
       <ScrollView contentContainerStyle={{ flexGrow: 1 }}
           keyboardShouldPersistTaps="handled">
         {/* Header */}
         <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={isPosting || !userUri || !title.trim()}
            style={[
              styles.postButton,
              isPosting || !userUri || !title.trim() ? styles.postButtonDisabled : {},
            ]}
          >
            {isPosting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Add a title..."
          style={styles.titleInput}
        />

        {/* Duet Mode Toggle */}
        {/* <View style={styles.duetToggleContainer}>
          <Text style={styles.duetToggleText}>Duet Mode</Text>
          <Switch
            value={isDuetMode}
            onValueChange={() => setIsDuetMode((prev) => !prev)}
          />
        </View> */}

        {/* Video Preview */}
        <View style={styles.videoPreviewContainer}>
          {isDuetMode && duetUri ? (
            <View style={styles.duetVideoContainer}>
              {/* User's Video Thumbnail */}
              <Image
                source={{ uri: userVideoThumbnail || "" }}
                style={styles.duetVideo}
              />
              {/* Challenge Video Thumbnail */}
              <Image
                source={{ uri: duetVideoThumbnail || duetUri }}
                style={styles.duetVideo}
              />
            </View>
          ) : (
            <Image
              source={{ uri: userVideoThumbnail || "" }}
              style={styles.singleVideo}
            />
          )}
        </View>

        {/* Description Input */}
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description..."
          multiline
          style={styles.descriptionInput}
        />
       </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "black",
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  postButton: {
    padding: 8,
  },
  postButtonText: {
    color: "#0095f6",
    fontSize: 16,
    fontWeight: "600",
  },
  postButtonDisabled: {
    opacity: 0.5,
  },
  titleInput: {
    height: 50,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: "black",
    marginHorizontal: 16,
    marginTop: 16,
  },
  duetToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginTop: 16,
  },
  duetToggleText: {
    color: "white",
    fontSize: 16,
  },
  videoPreviewContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  singleVideo: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },
  duetVideoContainer: {
    flexDirection: "row",
    height: 300,
  },
  duetVideo: {
    flex: 1,
    margin: 2,
    resizeMode: "cover",
  },
  descriptionInput: {
    height: 100,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: "black",
    marginHorizontal: 16,
    marginTop: 16,
    textAlignVertical: "top",
  },
});