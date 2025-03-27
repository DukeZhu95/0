import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ScrollView,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  FlatList,
  Platform,
} from "react-native";
import { Video as Compressor } from "react-native-compressor"; // ✅ Import video compressor

import { useLocalSearchParams, useRouter } from "expo-router";
import { ResizeMode, Video, AVPlaybackStatus } from "expo-av";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { Buffer } from "buffer";
import { useSupabase } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";
import { useTranslation } from "react-i18next";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";
import { colors } from "@/constants/colours";

import * as tus from "tus-js-client";
import { sightengineModelsString } from "@/constants/helper";

// Make Buffer available in React Native
global.Buffer = Buffer;

// ----- Sightengine Config -----
const SIGHTENGINE_API_USER = process.env.EXPO_PUBLIC_SITE_ENGINE_API_USER;
const SIGHTENGINE_API_SECRET = process.env.EXPO_PUBLIC_SITE_ENGINE_API_SECRET;
const CALLBACK_URL = process.env.EXPO_PUBLIC_EDGE_FUNCTION_ENDPOINT;
const SIGHTENGINE_MODELS = sightengineModelsString
// ^ Adjust models per your needs. Additional models like "violence", "self-harm", etc.

// Supabase bucket name
const SUPABASE_STORAGE_BUCKET = "social-challenges";

type Params = {
  videoUri?: string;
};

export default function PostVideo() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  const { videoUri } = useLocalSearchParams<Params>();
  const router = useRouter();
  const { user } = useSupabase();
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadInstance, setUploadInstance] = useState(null); // Store tus upload instance for pause/resume
  const [compressedVideoUri, setCompressedVideoUri] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("name");
        if (error) throw error;

        console.log("Fetched categories:", data);
        if (data && data.length > 0) {
          setCategories(data.map((category) => category.name));
        } else {
          setCategories([]); // Ensure state is updated if no data is found
        }
      } catch (err) {
        console.error("Error fetching categories:", err.message);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel("moderation-status-channel")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "submissions" },
          (payload) => {
            console.log("Change received!", payload);
            if (
              payload.new.moderation_status === "approved" &&
              payload.new.user_id === user.id
            ) {
              rewardUser();
            }
          }
        )
        .subscribe();
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const rewardUser = async () => {
    if (!user) return;
    await supabase.from("coin_transactions").insert([
      {
        user_id: user.id,
        type: "credit",
        amount: 10,
        reason: "Challenz Video upload",
      },
    ]);
    Alert.alert("Congrats!", "Your video was uploaded.!");
  };

  useEffect(() => {
    if (!videoUri) {
      Alert.alert("No Video Selected", "Please select a video to post.");
      router.back();
    }
  }, [videoUri, router]);

  /**
   * Utility to extract a filename from the local file URI.
   * If none is found, create a fallback name.
   */
  const getFileName = (uri: string): string => {
    return uri.split("/").pop() || `video_${Date.now()}.mp4`;
  };

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

  const uploadVideoResumable = async (uri: string): Promise<string> => {
    try {
      // Compress the video before upload
      const compressedUri = await compressVideo(uri);
      const fileName = getFileName(compressedUri);
      const filePath = `videos/${fileName}`;

      // Read the compressed file as binary data
      const fileData = await FileSystem.readAsStringAsync(compressedUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const binaryData = Buffer.from(fileData, "base64");

      // Upload the compressed video to Supabase Storage
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

      // Construct public URL for the uploaded video
      const publicURL = `${supabase.storageUrl}/object/public/${SUPABASE_STORAGE_BUCKET}/${filePath}`;
      console.log("Video uploaded:", publicURL);

      return publicURL; // Return the uploaded video URL without sending to Supabase
    } catch (error) {
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
      return data; // Return moderation response to be handled in handlePost
    } catch (err) {
      console.error("Sightengine error:", err?.response?.data || err.message);
      throw err;
    }
  };

  const saveToSupabase = async (
    videoUrl: string,
    sightengineMediaId?: string
  ) => {
    if (!user) {
      throw new Error("User is not authenticated.");
    }

    const { data, error } = await supabase.from("submissions").insert([
      {
        user_id: user.id,
        video_url: videoUrl,
        title,
        description,
        category: selectedCategory,
        sightengine_media_id: sightengineMediaId,
        moderation_status: "pending", // Default to pending until moderation result
      },
    ]);

    if (error) {
      console.error("Database Insert Error:", error.message);
      throw error;
    }

    console.log("Video metadata saved to submissions:", data);
  };

  const handlePost = async () => {
    if (isUploading) return; // Prevent duplicate submissions
    setIsUploading(true);

    try {
      if (!videoUri) {
        Alert.alert("Error", "No video selected.");
        return;
      }
      if (videoDuration === null) {
        Alert.alert("Error", "Unable to determine video duration.");
        return;
      }
      if (videoDuration > 180) {
        Alert.alert(
          "Error",
          "Video exceeds the maximum allowed duration of 3 minutes."
        );
        return;
      }
      if (!user) {
        Alert.alert("Error", "User is not authenticated.");
        return;
      }
      if (!title.trim()) {
        Alert.alert("Error", "Please enter a title for your video.");
        return;
      }
      if (!description.trim()) {
        Alert.alert("Error", "Please enter a description for your video.");
        return;
      }

      // Step 1: Upload video (which includes compression)
      const videoUrl = await uploadVideoResumable(videoUri);

      // Step 2: Send video for moderation
      let sightengineData;
      try {
        sightengineData = await moderateVideo(videoUrl);
      } catch (modErr) {
        console.error("Error initiating Sightengine moderation:", modErr);
        Alert.alert("Moderation In Progress", "Your video is being moderated.");
      }

      // Step 3: Save video metadata to Supabase with moderation details
      const mediaId = sightengineData?.media?.id;
      await saveToSupabase(videoUrl, mediaId);
      Alert.alert("Success", "Video posted successfully.");

      // Navigate away after successful post
      router.push("/(app)/(protected)");
    } catch (error) {
      console.error("Error in handlePost:", error.message);
      Alert.alert("Error", error.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Renders the <Video> preview.
   * Captures the duration once loaded to enforce your max length check.
   */
  const renderVideo = () => {
    return (
      <Video
        source={{ uri: videoUri }}
        rate={1.0}
        volume={1.0}
        isMuted={false}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={false}
        isLooping={false}
        style={{
          width: "100%",
          height: "100%",
        }}
        onPlaybackStatusUpdate={(status: AVPlaybackStatus) => {
          if (
            status.isLoaded &&
            videoDuration === null &&
            typeof status.durationMillis === "number"
          ) {
            setVideoDuration(status.durationMillis / 1000);
          }
          if (status.isLoaded) {
            setVideoLoaded(true);
          }
        }}
      />
    );
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: colors[colorScheme]?.foreground,
        padding: 20,
      }}
    >
      {" "}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 40}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          showsVerticalScrollIndicator={false}
        >
          {videoUri ? (
            <View
              style={{
                width: "50%",
                height: 280,
                marginBottom: 20,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors[colorScheme]?.mutedForeground,
                borderRadius: 10,
                overflow: "hidden",
                position: "relative",
              }}
            >
              {!videoLoaded && (
                <ActivityIndicator
                  size="large"
                  color={colors[colorScheme]?.background}
                  style={{
                    position: "absolute",
                    top: "45%",
                    left: "45%",
                  }}
                />
              )}
              {renderVideo()}
            </View>
          ) : (
            <ActivityIndicator
              size="large"
              color={colors[colorScheme]?.background}
            />
          )}

          <Text
            style={{
              color: colors[colorScheme]?.primary,
              fontSize: 16,
              fontFamily: selectedFont,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {videoDuration !== null
              ? `Video Duration: ${videoDuration.toFixed(2)} seconds`
              : "Loading video..."}
          </Text>
          <Text
            style={{
              color: colors[colorScheme]?.primary,
              width: "100%",
            }}
          >
            Title
          </Text>
          <TextInput
            style={{
              backgroundColor: colors[colorScheme]?.input,
              color: colors[colorScheme]?.primary,
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
              minHeight: 50,
              width: "100%",
            }}
            placeholder="Challenge Video Title"
            placeholderTextColor={colors[colorScheme]?.mutedForeground}
            value={title}
            multiline
            onChangeText={setTitle}
          />
          <Text
            style={{
              color: colors[colorScheme]?.primary,
              width: "100%",
            }}
          >
            Description
          </Text>
          <TextInput
            style={{
              backgroundColor: colors[colorScheme]?.input,
              color: colors[colorScheme]?.primary,
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
              minHeight: 60,
              width: "100%",
            }}
            placeholder="Describe your video"
            placeholderTextColor={colors[colorScheme]?.mutedForeground}
            value={description}
            multiline
            onChangeText={setDescription}
          />

          <Text
            style={{
              color: colors[colorScheme]?.primary,
              width: "100%",
            }}
          >
            Category
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            style={{
              backgroundColor: colors[colorScheme]?.input,
              padding: 15,
              borderRadius: 8,
              marginBottom: 20,
              width: "100%",
            }}
          >
            <Text
              style={{
                color: selectedCategory
                  ? colors[colorScheme]?.primary
                  : colors[colorScheme]?.mutedForeground,
              }}
            >
              {selectedCategory || "Select a Category"}
            </Text>
          </TouchableOpacity>
          <Modal
            visible={modalVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setModalVisible(false)}
          >
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "rgba(0,0,0,0.5)",
                padding: 16,
              }}
            >
              <View
                style={{
                  width: "100%",
                  maxHeight: "80%",
                  backgroundColor: colors[colorScheme]?.background,
                  borderRadius: 10,
                  padding: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    marginBottom: 20,
                    textAlign: "center",
                    color: colors[colorScheme]?.foreground,
                    fontFamily: selectedFont,
                  }}
                >
                  Select a Category
                </Text>
                <FlatList
                  data={categories}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={{ paddingVertical: 12, alignItems: "center" }}
                      onPress={() => {
                        setSelectedCategory(item);
                        setModalVisible(false);
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          color: colors[colorScheme]?.foreground,
                          fontFamily: selectedFont,
                        }}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  )}
                  style={{ marginBottom: 20 }}
                />
                <TouchableOpacity
                  onPress={() => setModalVisible(false)}
                  style={{
                    backgroundColor: "#e53935",
                    paddingVertical: 12,
                    borderRadius: 5,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      textAlign: "center",
                      fontSize: 16,
                      fontFamily: selectedFont,
                    }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/*  */}
          {isCompressing ? (
            <TouchableOpacity
              style={{
                backgroundColor: colors[colorScheme]?.background,
                padding: 15,
                borderRadius: 8,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
              onPress={handlePost}
              disabled={isUploading || isCompressing}
            >
              <ActivityIndicator
                size="large"
                color={colors[colorScheme]?.foreground}
              />
            </TouchableOpacity>
          ) : isUploading ? (
            <TouchableOpacity
              style={{
                backgroundColor: colors[colorScheme]?.background,
                padding: 15,
                borderRadius: 8,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
              onPress={handlePost}
              disabled={isUploading || isCompressing}
            >
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontSize: 16,
                  fontWeight: "bold",
                  marginLeft: 10,
                }}
              >
                Uploading...
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{
                backgroundColor: colors[colorScheme]?.background,
                padding: 15,
                borderRadius: 8,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                width: "100%",
              }}
              onPress={handlePost}
              disabled={isUploading || isCompressing}
            >
              {/* <Ionicons
              name="checkmark-outline"
              size={20}
              color={colors[colorScheme]?.foreground}
            /> */}
              <Text
                style={{
                  color: colors[colorScheme]?.foreground,
                  fontSize: 16,
                  fontWeight: "bold",
                  marginLeft: 10,
                }}
              >
                {isUploading ? "Uploading..." : "Post Video"}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
