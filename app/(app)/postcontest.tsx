// // // PostContest.tsx
import { Ionicons } from "@expo/vector-icons";
import { Buffer } from "buffer";
import { Video as Compressor } from "react-native-compressor";
import { Video, AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import { supabase } from "@/config/supabase";
import { useAuth } from "@/context/supabase-provider";
import { sightengineModelsString } from "@/constants/helper";

global.Buffer = Buffer;

// Sightengine Configuration
const SIGHTENGINE_API_USER = process.env.EXPO_PUBLIC_SITE_ENGINE_API_USER;
const SIGHTENGINE_API_SECRET = process.env.EXPO_PUBLIC_SITE_ENGINE_API_SECRET;
const CALLBACK_URL = process.env.EXPO_PUBLIC_EDGE_FUNCTION_ENDPOINT;
const SIGHTENGINE_MODELS = sightengineModelsString

const SUPABASE_STORAGE_BUCKET = "social-challenges";

type VideoPlaybackStatus = AVPlaybackStatus & {
  durationMillis?: number;
};

type Params = {
  videoUri?: string;
  contestId?: string;
};

type Submission = {
  user_id: string;
  contest_id: string;
  video_url: string;
  title: string;
  description: string;
  created_at: string;
  is_contest_submission: boolean;
  moderation_status: string;
  sightengine_media_id?: string;
};

const PostContestScreen: React.FC = () => {
  const { videoUri, contestId } = useLocalSearchParams<Params>();
  const router = useRouter();
  const { user } = useAuth();

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [videoLoaded, setVideoLoaded] = useState<boolean>(false);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  useEffect(() => {
    if (!videoUri || !contestId) {
      console.log("Missing videoUri or contestId. Redirecting back.");
      Alert.alert("Error", "Missing video or contest information.");
      router.back();
    } else {
      console.log(`Received videoUri: ${videoUri} and contestId: ${contestId}`);
    }
  }, [videoUri, contestId]);

  const compressVideo = async (uri: string): Promise<string> => {
    try {
      setIsCompressing(true);
      console.log("Starting video compression...");

      const compressedUri = await Compressor.compress(uri, {
        compressionMethod: "auto",
        quality: "medium",
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

  const uploadVideo = async (
    uri: string,
    contestId: string
  ): Promise<string> => {
    console.log("Starting video upload...");
    try {
      // Compress video before upload
      const compressedUri = await compressVideo(uri);

      const fileExt = compressedUri.split(".").pop() || "mp4";
      const timestamp = Date.now(); // Unique timestamp
      const randomNum = Math.floor(Math.random() * 100000); // Random number to ensure uniqueness
      const fileName = `contest_video_${timestamp}_${randomNum}.${fileExt}`;
      const uploadPath = `contests/${contestId}/${fileName}`;

      const fileData = await FileSystem.readAsStringAsync(compressedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const binaryData = Buffer.from(fileData, "base64");

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(SUPABASE_STORAGE_BUCKET)
        .upload(uploadPath, binaryData, {
          contentType: "video/mp4",
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        throw uploadError;
      }

      const publicURL = `${supabase.storageUrl}/object/public/${SUPABASE_STORAGE_BUCKET}/${uploadData.path}`;
      console.log(`Public URL constructed: ${publicURL}`);

      return publicURL;
    } catch (error: any) {
      console.error("Error Uploading Video:", error.message);
      throw error;
    }
  };

  const moderateVideo = async (videoUrl: string) => {
    try {
      const response = await axios.get(
        "https://api.sightengine.com/1.0/video/check.json",
        {
          params: {
            stream_url: videoUrl,
            callback_url: CALLBACK_URL,
            models: SIGHTENGINE_MODELS,
            api_user: SIGHTENGINE_API_USER,
            api_secret: SIGHTENGINE_API_SECRET,
          },
        }
      );

      const { data } = response;
      console.log("Sightengine moderation initiated:", data);
      return data;
    } catch (err) {
      console.error("Sightengine error:", err?.response?.data || err.message);
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    console.log("Submit button pressed.");

    // Validate inputs and conditions
    if (!title.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter a title for your submission."
      );
      return;
    }

    if (!description.trim()) {
      Alert.alert(
        "Validation Error",
        "Please enter a description for your submission."
      );
      return;
    }

    if (!user || !user.id) {
      Alert.alert("Authentication Error", "You must be logged in to submit.");
      return;
    }

    if (videoDuration && videoDuration > 180) {
      Alert.alert(
        "Error",
        "Video exceeds maximum allowed duration of 3 minutes."
      );
      return;
    }

    setLoading(true);

    try {
      // 1. Upload video (includes compression)
      const uploadedVideoUrl = await uploadVideo(
        videoUri as string,
        contestId as string
      );

      // 2. Initiate moderation
      let sightengineData;
      try {
        sightengineData = await moderateVideo(uploadedVideoUrl);
      } catch (modErr) {
        console.error("Error initiating Sightengine moderation:", modErr);
        // Alert.alert("Moderation In Progress", "Your video is being moderated.");
      }

      // 3. Create submission object
      const newSubmission: Submission = {
        user_id: user.id,
        contest_id: contestId as string,
        video_url: uploadedVideoUrl,
        title: title.trim(),
        description: description.trim(),
        created_at: new Date().toISOString(),
        is_contest_submission: true,
        moderation_status: "pending",
        sightengine_media_id: sightengineData?.media?.id,
      };

      // 4. Insert submission into database
      const { error } = await supabase
        .from("submissions")
        .insert([newSubmission]);

      if (error) {
        console.error("Insert Error:", error.message);
        Alert.alert("Error", "Failed to save your submission.");
        return;
      }

      Alert.alert("Success", "Your submission has been posted successfully!");
      router.push({ pathname: "/contestDetails", params: { contestId } });
    } catch (error: any) {
      console.error("Error in handleSubmit:", error.message);
      Alert.alert(
        "Error",
        error.message || "An error occurred during submission."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderVideo = () => {
    return (
      <Video
        source={{ uri: videoUri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode="contain"
        shouldPlay={false}
        isLooping={false}
        style={styles.video}
        onPlaybackStatusUpdate={(status) => {
          if (
            status.isLoaded &&
            videoDuration === null &&
            typeof status.durationMillis === "number"
          ) {
            const durationSeconds = status.durationMillis / 1000;
            console.log(`Video Duration: ${durationSeconds} seconds`);
            setVideoDuration(durationSeconds);
          }

          if (status.isLoaded) {
            setVideoLoaded(true);
          }
        }}
      />
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Post Your Contest Entry</Text>

        {videoUri ? (
          <View style={styles.videoContainer}>
            {!videoLoaded && (
              <ActivityIndicator
                size="large"
                color="#00ff00"
                style={styles.videoLoader}
              />
            )}
            {renderVideo()}
          </View>
        ) : (
          <ActivityIndicator size="large" color="#00ff00" />
        )}

        <Text style={styles.status}>
          {videoDuration !== null
            ? `Video Duration: ${videoDuration.toFixed(2)} seconds`
            : "Loading video..."}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Title"
          placeholderTextColor="#aaa"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe your submission"
          placeholderTextColor="#aaa"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {isCompressing ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color="#ffffff" />
            {/* <Text style={styles.uploadingText}>Compressing video...</Text> */}
          </View>
        ) : loading ? (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={loading || isCompressing}
            accessibilityLabel="Submit Contest Entry"
          >
            <Ionicons
              name="cloud-upload-outline"
              size={20}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <Text style={styles.submitButtonText}>Submit Entry</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default PostContestScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E293B",
    padding: 16,
    justifyContent: "flex-start",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    paddingBottom: 20,
  },
  header: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  videoContainer: {
    width: "100%",
    height: 300,
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  videoLoader: {
    position: "absolute",
    top: "45%",
    left: "45%",
  },
  status: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#1E293B",
    color: "#fff",
    padding: 15,
    borderRadius: 8,
    borderWidth:1,
    borderColor:"#ccc",
    marginBottom: 20,
    minHeight: 50,
    textAlignVertical: "top",
    width: "100%",
  },
  textArea: {
    height: 100,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10B981",
    padding: 16,
    borderRadius: 8,
    justifyContent: "center",
    marginTop: 8,
    width: "100%",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  buttonIcon: {
    marginRight: 4,
  },
  uploadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#444",
    padding: 15,
    borderRadius: 8,
    width: "100%",
  },
  uploadingText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
  },
});
