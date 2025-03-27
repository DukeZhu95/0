// components/exploremore/contests/submit.tsx
import { Video } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import tw from "twrnc";

import { supabase } from "@/config/supabase";


export default function SubmitContest() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>(); // Extract contest ID from query params

  const [session, setSession] = useState(null);
  const [contest, setContest] = useState(null);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchSessionAndContest = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);

      if (id) {
        fetchContest(id);
      }
    };
    fetchSessionAndContest();
  }, [id]);

  const fetchContest = async (contestId: string) => {
    try {
      const { data: cData, error: cError } = await supabase
        .from("contests")
        .select("*")
        .eq("id", contestId)
        .single();

      if (cError) throw cError;
      setContest(cData);
    } catch (error) {
      console.error("Error fetching contest:", error);
      Alert.alert("Error", "Failed to load contest details.");
      router.replace("/app/contests");
    }
  };

  const handlePickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "video/*",
        copyToCacheDirectory: true,
      });
      if (result.type === "cancel") return;
      setVideoUri(result.uri);
    } catch (error) {
      console.error("Error picking video:", error);
      Alert.alert("Error", "Failed to pick video.");
    }
  };

  const handleUploadVideo = async () => {
    if (!videoUri) {
      Alert.alert("No Video", "Please select a video first.");
      return;
    }
    setUploading(true);
    try {
      const fileName = `contest_submissions/${Date.now()}_submission.mp4`;
      const file = {
        uri: videoUri,
        type: "video/mp4",
        name: fileName,
      };

      const { data, error } = await supabase.storage
        .from("contest-submissions")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;

      const { publicURL, error: publicUrlError } = supabase.storage
        .from("contest-submissions")
        .getPublicUrl(fileName);

      if (publicUrlError) throw publicUrlError;

      setVideoUrl(publicURL);
      Alert.alert("Success", "Video uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload video.");
    }
    setUploading(false);
  };

  const handleSubmit = async () => {
    if (!videoUrl) {
      Alert.alert("Validation Error", "Please upload a video before submitting.");
      return;
    }

    try {
      const { data, error } = await supabase.from("submissions").insert([
        {
          contest_id: id,
          user_id: session?.user?.id,
          video_url: videoUrl,
          description: description || null,
          is_contest_submission: true,
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Submission successful!");
      router.replace(`/contests/${id}`);
    } catch (error) {
      console.error("Error submitting:", error);
      Alert.alert("Error", "Failed to submit your entry.");
    }
  };

  if (!session) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-slate-900 p-4`}>
        <Text style={tw`text-white`}>You must be signed in to submit to a contest.</Text>
      </View>
    );
  }

  if (!contest) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-slate-900 p-4`}>
        <Text style={tw`text-white`}>Loading contest details...</Text>
      </View>
    );
  }

  // Ensure contest is active
  const now = new Date();
  const start = contest.start_date ? new Date(contest.start_date) : null;
  const end = contest.end_date ? new Date(contest.end_date) : null;

  if (start && now < start) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-slate-900 p-4`}>
        <Text style={tw`text-white`}>This contest hasn't started yet.</Text>
      </View>
    );
  }

  if (end && now > end) {
    return (
      <View style={tw`flex-1 justify-center items-center bg-slate-900 p-4`}>
        <Text style={tw`text-white`}>This contest has ended.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={tw`flex-1 bg-slate-900`} contentContainerStyle={tw`p-4 pb-20`}>
      <Text style={tw`text-white text-2xl font-bold mb-4`}>Submit to Contest: {contest.title}</Text>

      {/* Video Submission */}
      <Text style={tw`text-white mb-1`}>Your Video</Text>
      {videoUri ? (
        <Text style={tw`text-green-400 mb-1`}>Picked: {videoUri}</Text>
      ) : (
        <Text style={tw`text-slate-400 mb-1`}>No video selected.</Text>
      )}
      <TouchableOpacity
        style={tw`bg-slate-700 p-2 rounded mb-2`}
        onPress={handlePickVideo}
        disabled={uploading}
      >
        <Text style={tw`text-white`}>Choose Video</Text>
      </TouchableOpacity>
      {videoUri && !videoUrl && (
        <TouchableOpacity
          style={tw`bg-blue-500 p-2 rounded mb-4`}
          onPress={handleUploadVideo}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={tw`text-white`}>Upload Video</Text>
          )}
        </TouchableOpacity>
      )}
      {videoUrl && (
        <View style={tw`mb-4`}>
          <Text style={tw`text-green-400 mb-1`}>Uploaded Video:</Text>
          <Video
            source={{ uri: videoUrl }}
            rate={1.0}
            volume={1.0}
            isMuted={false}
            resizeMode="cover"
            shouldPlay={false}
            isLooping
            style={tw`w-full h-64 bg-slate-800 rounded`}
            useNativeControls
          />
        </View>
      )}

      {/* Description */}
      <Text style={tw`text-white mb-1`}>Description (Optional)</Text>
      <TextInput
        style={tw`bg-slate-800 text-white p-2 rounded mb-4`}
        placeholder="Describe your submission..."
        placeholderTextColor="#94a3b8"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={tw`bg-green-500 p-3 rounded`}
        onPress={handleSubmit}
        disabled={uploading}
      >
        <Text style={tw`text-white text-lg font-bold text-center`}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}