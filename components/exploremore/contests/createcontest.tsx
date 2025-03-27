// components/exploremore/contests/createcontest.tsx
import * as DocumentPicker from "expo-document-picker";
import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";

import { supabase } from "@/config/supabase";
import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useTheme } from "@/context/theme-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useSupabase } from "@/context/supabase-provider";
import DatePicker from "react-native-date-picker";
import { useLocalSearchParams } from "expo-router";
import { Switch } from "react-native";

export default function NewContestScreen() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  const { user } = useSupabase();
  const { category } = useLocalSearchParams();

  // const [session, setSession] = useState(null);

  // Basic fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // New Dates
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [isSponsored, setIsSponsored] = useState(false); // Default: Not Sponsored
  const [sponsorName, setSponsorName] = useState("");

  // State to control date picker visibility
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Rewards
  // const [winnerReward, setWinnerReward] = useState("100");
  // const [participantReward, setParticipantReward] = useState("10");

  // Explanation Video
  const [localVideoUri, setLocalVideoUri] = useState<string | null>(null);
  const [explanationVideoUrl, setExplanationVideoUrl] = useState<string | null>(
    null
  );
  const [uploading, setUploading] = useState(false);

  // const handlePickVideo = async () => {
  //   try {
  //     const result = await DocumentPicker.getDocumentAsync({
  //       type: "video/*",
  //       copyToCacheDirectory: true,
  //     });
  //     if (result.type === "cancel") return;
  //     setLocalVideoUri(result.uri);
  //   } catch (error) {
  //     Alert.alert(
  //       t("newContest.alerts.error.title"),
  //       t("newContest.alerts.error.pickVideoMessage")
  //     );
  //   }
  // };

  // const handleUploadVideo = async () => {
  //   if (!localVideoUri) {
  //     Alert.alert(
  //       t("newContest.alerts.error.title"),
  //       t("newContest.fields.explanationVideo.noVideoSelected")
  //     );
  //     return;
  //   }
  //   setUploading(true);
  //   try {
  //     const fileName = `contest_videos/${Date.now()}_intro.mp4`;
  //     const file = {
  //       uri: localVideoUri,
  //       type: "video/mp4",
  //       name: fileName,
  //     };

  //     const { error } = await supabase.storage
  //       .from("contest-videos")
  //       .upload(fileName, file);

  //     if (error) throw error;

  //     const { publicURL, error: publicUrlError } = supabase.storage
  //       .from("contest-videos")
  //       .getPublicUrl(fileName);

  //     if (publicUrlError) throw publicUrlError;

  //     setExplanationVideoUrl(publicURL);
  //     Alert.alert(
  //       t("newContest.alerts.success.title"),
  //       t("newContest.alerts.success.videoUploadMessage")
  //     );
  //   } catch (error) {
  //     Alert.alert(
  //       t("newContest.alerts.error.title"),
  //       t("newContest.alerts.error.uploadVideoMessage")
  //     );
  //   }
  //   setUploading(false);
  // };

  const handleCreateContest = async () => {
    console.log("create contest button pressed");

    if (!title.trim()) {
      Alert.alert(
        t("newContest.alerts.validation.title"),
        t("newContest.fields.title.validation")
      );
      return;
    }

    if (isSponsored && sponsorName.trim() === "") {
      return Alert.alert(
        t("newContest.alerts.error.title"),
        t("newContest.alerts.error.sponsorNameRequired")
      );
    }

    if (!startDate) {
      Alert.alert(
        t("newContest.alerts.validation.title"),
        t("newContest.alerts.validation.startDateRequired")
      );
      return;
    }

    if (!endDate) {
      Alert.alert(
        t("newContest.alerts.validation.title"),
        t("newContest.alerts.validation.endDateRequired")
      );
      return;
    }

    if (endDate <= startDate) {
      Alert.alert(
        t("newContest.alerts.validation.title"),
        t("newContest.alerts.validation.invalidDates")
      );
      return;
    }

    try {
      const { error } = await supabase.from("contests").insert([
        {
          creator_id: user?.id,
          title,
          description,
          category,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_sponsored: isSponsored,
          sponsor_name: isSponsored ? sponsorName : null,
          // winner_reward: parseInt(winnerReward, 10) || 100,
          // participant_reward: parseInt(participantReward, 10) || 10,
          // explanation_video_url: explanationVideoUrl || null,
        },
      ]);

      if (error) throw error;

      Alert.alert(
        t("newContest.alerts.success.title"),
        t("newContest.alerts.success.createContestMessage")
      );
      router.replace("/(app)/(protected)/contest");
    } catch (error) {
      Alert.alert(
        t("newContest.alerts.error.title"),
        t("newContest.alerts.error.createContestMessage")
      );
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors[colorScheme]?.foreground }}
      className=" px-4 h-full"
    >
      <Text
        style={{
          fontSize: 18,
          paddingBottom: 16,
          fontWeight: "bold",
          color: colors[colorScheme]?.primary,
        }}
      >
        {category && `Contest for: ${category}`}
      </Text>
      {/* Title */}
      <View className="mb-4">
        <Text
          style={{
            color: colors[colorScheme]?.primary,
            fontFamily: selectedFont,
          }}
          className=" mb-1"
        >
          {t("newContest.fields.title.label")}
        </Text>
        <TextInput
          style={{
            fontFamily: selectedFont,
            backgroundColor: colors[colorScheme]?.input,
            color: colors[colorScheme]?.primary,
            borderColor: colors[colorScheme]?.border,
          }}
          className=" p-3 rounded-lg shadow-sm"
          placeholder={t("newContest.fields.title.placeholder")}
          placeholderTextColor={colors[colorScheme]?.mutedForeground}
          value={title}
          onChangeText={setTitle}
        />
      </View>
      {/* Description */}
      <View className="mb-4">
        <Text
          style={{
            fontFamily: selectedFont,
            color: colors[colorScheme]?.primary,
          }}
          className="text-white mb-1"
        >
          {t("newContest.fields.description.label")}
        </Text>
        <TextInput
          style={{
            fontFamily: selectedFont,
            backgroundColor: colors[colorScheme]?.input,
            color: colors[colorScheme]?.primary,
            borderColor: colors[colorScheme]?.border,
          }}
          className=" p-3 rounded-lg shadow-sm h-32 text-base"
          placeholder={t("newContest.fields.description.placeholder")}
          placeholderTextColor={colors[colorScheme]?.mutedForeground}
          value={description}
          onChangeText={setDescription}
          multiline
        />
      </View>
      {/* Sponsored Toggle */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text
          style={{
            fontFamily: selectedFont,
            color: colors[colorScheme]?.primary,
          }}
          className="text-base"
        >
          {t("newContest.fields.sponsored.label")}
        </Text>
        <Switch
          value={isSponsored}
          onValueChange={(value) => {
            setIsSponsored(value);
            if (!value) setSponsorName(""); // Clear sponsor name if toggle is off
          }}
          trackColor={{
            false: colors[colorScheme]?.muted,
            true: colors[colorScheme]?.accent,
          }}
          thumbColor={isSponsored ? colors[colorScheme]?.primary : "#ccc"}
        />
      </View>
      {/* Sponsor Name Input (Only if Sponsored) */}
      {isSponsored && (
        <>
          <Text
            style={{
              color: colors[colorScheme]?.primary,
              fontFamily: selectedFont,
            }}
            className=" mb-1"
          >
            {t("newContest.fields.sponsored.sponsorName")}
          </Text>
          <TextInput
            value={sponsorName}
            onChangeText={setSponsorName}
            placeholder={t("newContest.fields.sponsored.placeholder")}
            placeholderTextColor={colors[colorScheme]?.muted}
            style={{
              marginBottom: 8,
              fontFamily: selectedFont,
              color: colors[colorScheme]?.primary,
              borderColor: colors[colorScheme]?.border,
            }}
            className="border p-3 rounded-lg text-base"
          />
        </>
      )}
      {/* Explanation Video */}
      {/* <View className="mb-6">
        <Text
          style={{
            fontFamily: selectedFont,
            color: colors[colorScheme]?.primary,
          }}
          className=" mb-2"
        >
          {t("newContest.fields.explanationVideo.label")}
        </Text>
        {localVideoUri ? (
          <Text
            style={{
              fontFamily: selectedFont,
              color: colors[colorScheme]?.accent,
            }}
            className=" mb-2"
          >
            {t("newContest.fields.explanationVideo.picked", {
              filename: localVideoUri.split("/").pop(),
            })}
          </Text>
        ) : (
          <Text
            style={{
              fontFamily: selectedFont,
              color: colors[colorScheme]?.mutedForeground,
            }}
            className=" mb-2"
          >
            {t("newContest.fields.explanationVideo.noVideoSelected")}
          </Text>
        )}
        <TouchableOpacity
          style={{
            fontFamily: selectedFont,
            // color: colors[colorScheme]?.accent,
            backgroundColor: colors[colorScheme]?.accent,
          }}
          className={`p-3 rounded-lg mb-3 flex-row items-center justify-center ${uploading ? "opacity-50" : ""}`}
          onPress={handlePickVideo}
          disabled={uploading}
        >
          <Text
            style={{
              fontFamily: selectedFont,
              color: colors[colorScheme]?.foreground,
            }}
            className=" font-semibold"
          >
            {t("newContest.fields.explanationVideo.chooseVideoButton")}
          </Text>
        </TouchableOpacity>
        {localVideoUri && !explanationVideoUrl && (
          <TouchableOpacity
            className={`bg-indigo-500 p-3 rounded-lg flex-row items-center justify-center ${
              uploading ? "opacity-50" : ""
            }`}
            onPress={handleUploadVideo}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{
                  fontFamily: selectedFont,
                  color: colors[colorScheme]?.primary,
                }}
                className=" font-semibold"
              >
                {t("newContest.fields.explanationVideo.uploadVideoButton")}
              </Text>
            )}
          </TouchableOpacity>
        )}
        {explanationVideoUrl && (
          <Text
            style={{
              fontFamily: selectedFont,
              color: colors[colorScheme]?.accent,
            }}
            className=" mt-3"
          >
            {t("newContest.fields.explanationVideo.uploaded")}
          </Text>
        )}
      </View> */}
      {/* 6. Start Date Section with Native Date Picker */}
      <View className="mb-4">
        <Text
          style={{
            fontFamily: selectedFont,
            color: colors[colorScheme]?.primary,
          }}
          className="mb-1"
        >
          {t("newContest.fields.startDate.label")}
        </Text>

        {/* 7. Touchable field to show date picker */}
        <TouchableOpacity
          onPress={() => setShowStartDatePicker(true)}
          style={{
            fontFamily: selectedFont,
            backgroundColor: colors[colorScheme]?.input,
            color: colors[colorScheme]?.foreground,
            borderColor: colors[colorScheme]?.border,
          }}
          className="p-3 rounded-lg shadow-sm"
        >
          <Text
            style={{
              fontFamily: selectedFont,
              color: startDate
                ? colors[colorScheme]?.mutedForeground
                : colors[colorScheme]?.primary,
            }}
          >
            {startDate
              ? startDate.toLocaleDateString()
              : t("newContest.fields.startDate.placeholder")}
          </Text>
        </TouchableOpacity>

        {/* 8. Native Date Picker */}
        {/* Start Date Picker */}
        {showStartDatePicker && Platform.OS === "ios" && (
          <DatePicker
            modal
            date={startDate || new Date()}
            mode="date"
            open={showStartDatePicker}
            onConfirm={(date) => {
              setShowStartDatePicker(false);
              setStartDate(date);
            }}
            onCancel={() => setShowStartDatePicker(false)}
          />
        )}

        {showStartDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowStartDatePicker(false);
              if (selectedDate) {
                setStartDate(selectedDate);
              }
            }}
            minimumDate={new Date()} // Prevent past dates
          />
        )}
      </View>
      {/* 9. End Date Section with Similar Implementation */}
      <View className="mb-6">
        <Text
          style={{
            fontFamily: selectedFont,
            color: colors[colorScheme]?.primary,
          }}
          className="mb-1"
        >
          {t("newContest.fields.endDate.label")}
        </Text>

        <TouchableOpacity
          onPress={() => setShowEndDatePicker(true)}
          style={{
            fontFamily: selectedFont,
            backgroundColor: colors[colorScheme]?.input,
            color: colors[colorScheme]?.foreground,
            borderColor: colors[colorScheme]?.border,
          }}
          className="p-3 rounded-lg shadow-sm"
        >
          <Text
            style={{
              fontFamily: selectedFont,
              color: endDate
                ? colors[colorScheme]?.mutedForeground
                : colors[colorScheme]?.primary,
            }}
          >
            {endDate
              ? endDate.toLocaleDateString()
              : t("newContest.fields.endDate.placeholder")}
          </Text>
        </TouchableOpacity>

        {/* End Date Picker */}
        {showEndDatePicker && Platform.OS === "ios" && (
          <DatePicker
            modal
            date={endDate || new Date()}
            mode="date"
            open={showEndDatePicker}
            onConfirm={(date) => {
              setShowEndDatePicker(false);
              setEndDate(date);
            }}
            onCancel={() => setShowEndDatePicker(false)}
          />
        )}

        {showEndDatePicker && Platform.OS === "android" && (
          <DateTimePicker
            value={endDate || new Date()}
            mode="date"
            display="spinner"
            onChange={(event, selectedDate) => {
              setShowEndDatePicker(false);
              if (selectedDate) {
                // Ensure end date is not before start date
                if (startDate && selectedDate < startDate) {
                  Alert.alert(
                    "Invalid Date",
                    "End date cannot be before start date"
                  );
                  return;
                }
                setEndDate(selectedDate);
              }
            }}
            minimumDate={startDate || new Date()} // Prevent dates before start date
          />
        )}
      </View>
      {/* Winner Reward */}
      {/* <View className="mb-4 hidden">
        <Text
          style={{
            fontFamily: selectedFont,
            color: colors[colorScheme]?.primary,
          }}
          className=" mb-1"
        >
          {t("newContest.fields.winnerReward.label")}
        </Text>
        <TextInput
          style={{
            fontFamily: selectedFont,
            backgroundColor: colors[colorScheme]?.input,
            color: colors[colorScheme]?.foreground,
            borderColor: colors[colorScheme]?.border,
          }}
          className=" p-3 rounded-lg shadow-sm"
          placeholder={t("newContest.fields.winnerReward.placeholder")}
          placeholderTextColor={colors[colorScheme]?.mutedForeground}
          keyboardType="numeric"
          value={winnerReward}
          onChangeText={setWinnerReward}
        />
      </View> */}
      {/* Create Button */}
      <TouchableOpacity
        style={{
          fontFamily: selectedFont,
          backgroundColor: colors[colorScheme]?.accent,
        }}
        className={`py-4 rounded-lg shadow-md ${uploading ? "opacity-50" : ""}`}
        onPress={handleCreateContest}
        disabled={uploading}
      >
        <Text
          style={{
            fontFamily: selectedFont,
            color: colors[colorScheme]?.foreground,
          }}
          className="text-center text-xl font-bold"
        >
          {t("newContest.buttons.createContest")}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
