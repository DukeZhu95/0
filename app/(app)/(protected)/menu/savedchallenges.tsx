import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { supabase } from "@/config/supabase";
import { useSupabase } from "@/context/supabase-provider";
import { colors } from "@/constants/colours";
import { useTheme } from "@/context/theme-context";
import { useFont } from "@/context/font-context";
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

const SavedChallenges = () => {
    const { user } = useSupabase();
    const { colorScheme } = useTheme();
    const { selectedFont } = useFont();
    const { t } = useTranslation();

    const [savedChallenges, setSavedChallenges] = useState([]);
    const [error, setError] = useState(null);
    const [refreshing, setRefreshing] = useState(false);
  
    // Function to fetch items from Supabase
    const fetchSavedChallenges = async () => {
      try {
        const { data, error } = await supabase
          .from('saved_videos')
          .select(`
            id,
            saved_at,
            submissions:submissions(id, video_url, title, description),
            challenges:challenges(id, video_url, title, description)
          `)
          .eq("user_id", user.id)
          .order("saved_at", { ascending: false });
        
        if (error) {
          setError(error.message);
        } else {
          setSavedChallenges(data);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    // Fetch items once the component mounts
    useEffect(() => {
      const fetchData = () => {
        fetchSavedChallenges();
      };
      
      // Initial fetch
      fetchData();
      
      // Set up an interval to fetch data every 5 seconds
      const intervalId = setInterval(fetchData, 5000);

      // Clean up the interval when the component unmounts
      return () => {
        clearInterval(intervalId);
      };
    }, []);

    const onRefresh = async () => {
      setRefreshing(true);
      await fetchSavedChallenges();
      setRefreshing(false);
    };

    const removeSavedChallenge = async (id) => {
      try {
        const { error } = await supabase
          .from('saved_videos')
          .delete()
          .eq('id', id);
        
        if (error) {
          setError(error.message);
        } else {
          fetchSavedChallenges();
        }
      } catch (err) {
        setError(err.message);
      }
    };
  
    // Render an error message if there was a problem fetching the data
    if (error) {
      return (
        <View style={[styles.container, { backgroundColor: colors[colorScheme]?.background }]}>
          <Text style={[styles.errorText, { color: colors[colorScheme]?.destructive }]}>
            Error: {error}
          </Text>
        </View>
      );
    }
  
    // Render each item in the FlatList
    const renderItem = ({ item }) => (
      <Card
        variant="elevated"
        padding="sm"
        className="my-2 mx-2"
        style={{ backgroundColor: colors[colorScheme]?.foreground, borderColor: colors[colorScheme]?.accent }}
      >
        <Pressable 
          onPress={() => router.push({
            pathname: "/(app)/joinchallenge",
            params: {
              videoId: item.submissions.id,
              challengeVideoUri: item.submissions.video_url,
            }})
          }
          className="px-4"
        >            
          <View style={styles.challengeContent}>
            <View style={styles.challengeInfo}>
              <Text 
                style={[
                  styles.challengeTitle,
                  {
                    color: colors[colorScheme]?.background,
                    fontFamily: selectedFont,
                    fontWeight: "bold"
                  }
                ]}
                numberOfLines={2}
              >
                {item.submissions.title}
              </Text>
              {item.submissions.description && (
                <Text 
                  style={[
                    styles.challengeDescription,
                    {
                      color: colors[colorScheme]?.mutedForeground,
                      fontFamily: selectedFont,
                    }
                  ]}
                  numberOfLines={2}
                >
                  {item.submissions.description}
                </Text>
              )}
            </View>
            
            <Pressable 
              onPress={() => removeSavedChallenge(item.id)}
              style={({ pressed }) => [
                styles.unsaveButton,
                {
                  backgroundColor: colors[colorScheme]?.destructive,
                  opacity: pressed ? 0.8 : 1,
                }
              ]}
            >
              <Ionicons 
                name="bookmark" 
                size={24} 
                color={colors[colorScheme]?.background} 
              />
            </Pressable>
          </View>
        </Pressable>
      </Card>
    );
  
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors[colorScheme]?.background }]}>
        <FlatList
          data={savedChallenges}
          keyExtractor={(challenge) => challenge.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons 
                name="bookmark-outline" 
                size={64} 
                color={colors[colorScheme]?.mutedForeground} 
              />
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: colors[colorScheme]?.mutedForeground,
                    fontFamily: selectedFont,
                  }
                ]}
              >
                No challenges saved yet
              </Text>
            </View>
          )}
        />
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    listContainer: {
      padding: 8,
    },
    challengeContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    challengeInfo: {
      flex: 1,
      marginRight: 12,
    },
    challengeTitle: {
      fontSize: 18,
      marginBottom: 8,
    },
    challengeDescription: {
      fontSize: 14,
      lineHeight: 20,
    },
    unsaveButton: {
      padding: 12,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    emptyText: {
      fontSize: 16,
      marginTop: 12,
      textAlign: 'center',
    },
    errorText: {
      fontSize: 16,
      textAlign: 'center',
      padding: 20,
    },
  });
  
  export default SavedChallenges;