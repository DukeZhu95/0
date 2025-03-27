// app/(app)/(protected)/search.tsx

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import { router } from "expo-router";
import debounce from "lodash.debounce";
import React, { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  Text as RNText,
  Image,
} from "react-native";


import { colors } from "@/constants/colours";
import { useFont } from "@/context/font-context";
import { useSupabase } from "@/context/supabase-provider";
import { useTheme } from "@/context/theme-context";
import { useSearchUsers } from "@/hooks/useSearchUsers";
import { useSearchChallenges } from "@/hooks/useSearchChallenges";
import { useSearchSubmissions } from "@/hooks/useSearchSubmissions";

const { width } = Dimensions.get("window");
const POST_GRID_SIZE = width / 3 - 16;

type UserProfile = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
};

type Challenge = {
  id: string;
  title: string;
};

type Submission = {
  id: string;
  video_url: string;
  title: string;
  description: string;
  created_at: string;
  user_id: string;
  challenge_id: string;
  creator: UserProfile;
  challenge: Challenge;
};

type UserDetails = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  bio: string;
  location: string;
  created_at: string;
  updated_at: string;
};

type ChallengeDetails = {
  id: string;
  title: string;
  description: string;
  category: string;
  is_seasonal: boolean;
  is_sponsored: boolean;
  duet_video_url: string | null;
  video_url: string | null;
  created_at: string;
  updated_at: string;
};

const SEARCH_HISTORY_KEY = "SEARCH_HISTORY";
const MAX_HISTORY = 10;

export default function Search() {
  const { colorScheme } = useTheme();
  const { selectedFont } = useFont();
  const { t } = useTranslation();
  const { user } = useSupabase();

  const [query, setQuery] = useState("");
  const [previousSearches, setPreviousSearches] = useState<string[]>([]);

  // Load Previous Searches on Mount
  useEffect(() => {
    const loadPreviousSearches = async () => {
      try {
        const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
        if (history) {
          setPreviousSearches(JSON.parse(history));
        }
      } catch (err: any) {
        console.error("Failed to load search history:", err.message);
      }
    };

    loadPreviousSearches();
  }, []);

  // Save Search Term to History
  const saveSearchTerm = useCallback(async (term: string) => {
    try {
      setPreviousSearches((prev) => {
        let updatedHistory = [term, ...prev.filter((t) => t !== term)];
        if (updatedHistory.length > MAX_HISTORY) {
          updatedHistory = updatedHistory.slice(0, MAX_HISTORY);
        }
        AsyncStorage.setItem(
          SEARCH_HISTORY_KEY,
          JSON.stringify(updatedHistory)
        ).catch((err) =>
          console.error("Failed to save search term to AsyncStorage:", err)
        );
        return updatedHistory;
      });
    } catch (err: any) {
      console.error("Failed to save search term:", err.message);
    }
  }, []);

  // Debounced Search Function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm: string) => {
      if (searchTerm.trim().length === 0) return;
      await saveSearchTerm(searchTerm);
    }, 500),
    [saveSearchTerm]
  );

  useEffect(() => {
    debouncedSearch(query);
    return debouncedSearch.cancel;
  }, [query, debouncedSearch]);

  // Custom Hooks for Data Fetching
  const {
    data: users = [],
    isLoading: isUsersLoading,
    error: usersError,
  } = useSearchUsers(query);
  const {
    data: challenges = [],
    isLoading: isChallengesLoading,
    error: challengesError,
  } = useSearchChallenges(query);
  const {
    data: submissions = [],
    isLoading: isSubmissionsLoading,
    error: submissionsError,
  } = useSearchSubmissions(query);

  const handleClearSearch = useCallback(() => {
    setQuery("");
  }, []);

  const handleVideoPress = useCallback((submissionId: string) => {
    router.push(`/submissionDetails?submissionId=${submissionId}`);
  }, []);

  const handleUserPress = useCallback(
    (item: UserDetails) => {
      if (user?.id === item.id) {
        router.push("/(app)/(protected)/menu/profile");
      } else {
        router.push(`/otheruserprofile?id=${item.id}`);
      }
    },
    [user]
  );

  const handleChallengePress = useCallback((challengeId: string) => {
    router.push(`/challengeDetails?challengeId=${challengeId}`);
  }, []);

  const handleSelectPreviousSearch = useCallback((term: string) => {
    setQuery(term);
  }, []);

  const renderSubmission = useCallback(
    ({ item }: { item: Submission }) => (
      <TouchableOpacity
        onPress={() => handleVideoPress(item.id)}
        activeOpacity={0.7}
        accessibilityLabel={`t("search.accessibility.viewVideo") ${item.title}`}
        style={{ width: "100%", height: "100%" }}
      >
        {item.video_url ? (
          <Video
            source={{ uri: item.video_url }}
            resizeMode="cover"
            shouldPlay={false}
            isLooping={false}
            onError={(error) => {
              console.log("Video Error:", error);
              Alert.alert(
                t("search.submissions.title"),
                t("search.submissions.message")
              );
            }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <RNText>No Video</RNText>
        )}
        {/* Display User and Challenge Info */}
        {item.title && (
          <RNText
            style={{
              fontFamily: selectedFont,
              color: colors[colorScheme]?.secondary,
            }}
          >
            {item.title}
          </RNText>
        )}
        {item.creator?.username && (
          <RNText
            style={{
              fontFamily: selectedFont,
              color: colors[colorScheme]?.secondary,
            }}
          >
            @{item.creator?.username}
          </RNText>
        )}
        {item.challenge?.title && (
          <RNText
            style={{
              fontFamily: selectedFont,
              color: colors[colorScheme]?.secondary,
            }}
          >
            Challenge: {item.challenge?.title}
          </RNText>
        )}
      </TouchableOpacity>
    ),
    [handleVideoPress]
  );

  const renderUser = useCallback(
    ({ item }: { item: UserDetails }) => (
      <TouchableOpacity
        onPress={() => handleUserPress(item)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          borderBottomWidth: 1,
          borderColor: colors[colorScheme]?.border,
        }}
        accessibilityLabel={`t("search.accessibility.viewProfile") ${item.username}`}
      >
        {/* Profile Picture */}
        {item.profile_picture_url ? (
          <Image
            source={{ uri: item.profile_picture_url }}
            style={{ width: 40, height: 40, borderRadius: 20 }}
          />
        ) : (
          <Ionicons name="person-circle-outline" size={40} color="#ccc" />
        )}
        {/* User Info */}
        <View style={{ marginLeft: 10 }}>
          <RNText
            style={{
              color: colors[colorScheme]?.secondary,
              fontFamily: selectedFont,
            }}
          >
            @{item.username}
          </RNText>
          <RNText
            style={{
              color: colors[colorScheme]?.secondary,
              fontFamily: selectedFont,
            }}
          >
            {item.first_name} {item.last_name}
          </RNText>
        </View>
      </TouchableOpacity>
    ),
    [handleUserPress]
  );

  const renderChallenge = useCallback(
    ({ item }: { item: ChallengeDetails }) => (
      <TouchableOpacity
        onPress={() => handleChallengePress(item.id)}
        activeOpacity={0.7}
        accessibilityLabel={`t("search.accessibility.viewChallenge") ${item.title}`}
        style={{ width: "100%", height: "100%" }}
      >
        {item.duet_video_url || item.video_url ? (
          <Video
            source={{ uri: item.duet_video_url || item.video_url }}
            resizeMode="cover"
            shouldPlay={false}
            isLooping={false}
            onError={(error) => {
              console.log("Video Error:", error);
              Alert.alert(
                t("search.challenges.videoError.title"),
                t("search.challenges.videoError.message")
              );
            }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : (
          <RNText>No Video</RNText>
        )}
        {/* Overlay Information */}
        {item.title && <RNText>{item.title}</RNText>}
        {item.category && (
          <RNText>
            {t("search.category")} {item.category}
          </RNText>
        )}
        {item.is_seasonal && <RNText>{t("search.seasonalTag")}</RNText>}
        {item.is_sponsored && <RNText>{t("search.sponsoredTag")}</RNText>}
      </TouchableOpacity>
    ),
    [handleChallengePress]
  );

  const renderPreviousSearch = useCallback(
    ({ item }: { item: string }) => (
      <TouchableOpacity
        onPress={() => handleSelectPreviousSearch(item)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 10,
          paddingHorizontal: 16,
        }}
        accessibilityLabel={`t("search.repeatSearch") ${item}`}
      >
        <RNText style={{ color: colors[colorScheme]?.secondary }}>
          {item}
        </RNText>
      </TouchableOpacity>
    ),
    [handleSelectPreviousSearch]
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors[colorScheme].background }}>
      {/* Search Input with Clear Button */}
      <View style={{ paddingHorizontal: 16 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t("search.inputPlaceholder")}
          style={{
            backgroundColor: colors[colorScheme].input,
            padding: 10,
            borderRadius: 8,
            fontSize: 16,
          }}
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={handleClearSearch}
            style={{ position: "absolute", right: 20, top: 15 }}
          >
            <Ionicons
              name="close-circle-outline"
              size={24}
              color={colors[colorScheme]?.primary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Content Based on Search State */}
      {isUsersLoading || isChallengesLoading || isSubmissionsLoading ? (
        <ActivityIndicator
          size="large"
          color={colors[colorScheme].primary}
          style={{ marginTop: 20 }}
        />
      ) : usersError || challengesError || submissionsError ? (
        <RNText>{t("search.error.generic")}</RNText>
      ) : query.trim().length === 0 ? (
        <View>
          <RNText
            style={{
              padding: 16,
              fontWeight: "bold",
              color: colors[colorScheme]?.secondary,
            }}
          >
            {t("search.previousSearches")}
          </RNText>
          {previousSearches.length === 0 ? (
            <RNText
              style={{ padding: 16, color: colors[colorScheme]?.secondary }}
            >
              {t("search.noPreviousSearches")}
            </RNText>
          ) : (
            <FlatList
              data={previousSearches}
              keyExtractor={(item) => item}
              renderItem={renderPreviousSearch}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={["submissions", "users", "challenges"]}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            switch (item) {
              case "submissions":
                return (
                  <>
                    <RNText
                      style={{
                        padding: 16,
                        fontWeight: "bold",
                        color: colors[colorScheme]?.secondary,
                      }}
                    >
                      {t("search.submissions.title")}
                    </RNText>
                    {submissions.length === 0 ? (
                      <RNText
                        style={{
                          padding: 16,
                          color: "#aaa",
                          fontFamily: selectedFont,
                        }}
                      >
                        {t("search.submissions.noResults")}
                      </RNText>
                    ) : (
                      <FlatList
                        data={submissions}
                        keyExtractor={(submission) => submission.id}
                        renderItem={renderSubmission}
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                          <View style={{ height: 8 }} />
                        )}
                      />
                    )}
                  </>
                );
              case "users":
                return (
                  <>
                    <RNText
                      style={{
                        padding: 16,
                        fontWeight: "bold",
                        color: colors[colorScheme]?.secondary,
                      }}
                    >
                      {t("search.users.title")}
                    </RNText>
                    {users.length === 0 ? (
                      <RNText
                        style={{
                          padding: 16,
                          color: "#aaa",
                          fontFamily: selectedFont,
                        }}
                      >
                        {t("search.users.noResults")}
                      </RNText>
                    ) : (
                      <FlatList
                        data={users}
                        keyExtractor={(user) => user.id}
                        renderItem={renderUser}
                      />
                    )}
                  </>
                );
              case "challenges":
                return (
                  <>
                    <RNText
                      style={{
                        padding: 16,
                        fontWeight: "bold",
                        color: colors[colorScheme]?.secondary,
                      }}
                    >
                      {t("search.challenges.title")}
                    </RNText>
                    {challenges.length === 0 ? (
                      <RNText
                        style={{
                          padding: 16,
                          color: "#aaa",
                          fontFamily: selectedFont,
                        }}
                      >
                        {t("search.challenges.noResults")}
                      </RNText>
                    ) : (
                      <FlatList
                        data={challenges}
                        keyExtractor={(challenge) => challenge.id}
                        renderItem={renderChallenge}
                        showsHorizontalScrollIndicator={false}
                        ItemSeparatorComponent={() => (
                          <View style={{ height: 8 }} />
                        )}
                      />
                    )}
                  </>
                );
              default:
                return null;
            }
          }}
        />
      )}
    </View>
  );
}
