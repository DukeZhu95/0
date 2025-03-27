import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { supabase } from "@/config/supabase";
import {
  Ionicons,
  SimpleLineIcons,
  Entypo,
  AntDesign,
} from "@expo/vector-icons";
import { Image } from "@/components/image";
import { useSupabase } from "@/context/supabase-provider";

type Activity = {
  id: string;
  awarded_at: string;
  badge: {
    id: string;
    name: string;
    description: string;
    image_url: string;
    created_at: string;
    value: number;
    status: string;
  };
};

const CoinSection = () => {
  const router = useRouter();
  const { user } = useSupabase(); // Access the authenticated user
  const [badges, setBadges] = useState(0);
  const [participation, setParticipation] = useState(0);
  const [likes, setLikes] = useState(0);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCoins, setUserCoins] = useState(0);

  const formatCoins = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"; // 1.0M, 2.5M
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"; // 1.0K, 50.3K
    }
    return num.toLocaleString();
  };

  useEffect(() => {
    if (!user) {
      setError("User is not authenticated.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userID = user.id; // Use the authenticated user's ID

        // Fetch badges count
        const { data: badgesData, error: badgesError } = await supabase
          .from("user_badges")
          .select("id")
          .eq("user_id", userID);
        if (badgesError) throw badgesError;
        setBadges(badgesData.length || 0);

        // Fetch participation count
        const { data: participationData, error: participationError } =
          await supabase
            .from("challenge_participants")
            .select("id")
            .eq("user_id", userID);
        if (participationError) throw participationError;
        setParticipation(participationData.length || 0);

        // Fetch likes count
        const { data: likesData, error: likesError } = await supabase
          .from("likes")
          .select("id")
          .eq("user_id", userID);
        if (likesError) throw likesError;
        setLikes(likesData.length || 0);

        // Fetch recent activities with badge details
        const { data: activityData, error: activityError } = await supabase
          .from("awarded_badges")
          .select(
            `
            id,
            awarded_at,
            badges (
              id,
              name,
              description,
              image_url,
              created_at,
              value,
              status
            )
          `
          )
          .eq("user_id", userID)
          .order("awarded_at", { ascending: false });

        if (activityError) throw activityError;

        const formattedActivities =
          activityData?.map((item: any) => ({
            id: item.id,
            awarded_at: item.awarded_at,
            badge: item.badges,
          })) || [];

        setRecentActivities(formattedActivities);

        // Fetch user coins
        const { data: coinsData, error: coinsError } = await supabase
          .from("users")
          .select("coins, total_coins_earned")
          .eq("id", userID);
        if (coinsError) throw coinsError;
        setUserCoins(
          (coinsData[0]?.coins || 0) + (coinsData[0]?.total_coins_earned || 0)
        );
      } catch (err: any) {
        setError(err.message);
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       setError(null);

  //       // Fetch badges count
  //       const { data: badgesData, error: badgesError } = await supabase
  //         .from("user_badges")
  //         .select("id")
  //         .eq("user_id", userID);
  //       if (badgesError) throw badgesError;
  //       setBadges(badgesData.length || 0);

  //       // Fetch participation count
  //       const { data: participationData, error: participationError } =
  //         await supabase
  //           .from("challenge_participants")
  //           .select("id")
  //           .eq("user_id", userID);
  //       if (participationError) throw participationError;
  //       setParticipation(participationData.length || 0);

  //       // Fetch likes count
  //       const { data: likesData, error: likesError } = await supabase
  //         .from("likes")
  //         .select("id")
  //         .eq("user_id", userID);
  //       if (likesError) throw likesError;
  //       setLikes(likesData.length || 0);

  //       // Fetch recent activities with badge details
  //       const { data: activityData, error: activityError } = await supabase
  //         .from("awarded_badges")
  //         .select(
  //           `
  //       id,
  //       awarded_at,
  //       badges (
  //         id,
  //         name,
  //         description,
  //         image_url,
  //         created_at,
  //         value,
  //         status
  //       )
  //     `
  //         )
  //         .eq("user_id", userID)
  //         .order("awarded_at", { ascending: false });

  //       if (activityError) throw activityError;

  //       const formattedActivities = activityData.map((item: any) => ({
  //         id: item.id,
  //         awarded_at: item.awarded_at,
  //         badge: item.badges,
  //       }));

  //       setRecentActivities(formattedActivities || []);

  //       // Fetch user coins
  //       const { data: coinsData, error: coinsError } = await supabase
  //         .from("users")
  //         .select("coins, total_coins_earned")
  //         .eq("id", userID);
  //       if (coinsError) throw coinsError;
  //       setUserCoins(coinsData[0].coins + coinsData[0].total_coins_earned || 0);
  //     } catch (err: any) {
  //       setError(err.message);
  //       Alert.alert("Error", err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [userID]);

  const badgeImages: Record<string, any> = {
    // "badge1.png": require("../../../assets/badges/badge1.png"),
    "badge1.png": require("@/assets/images/empty.png"),
  };

  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" color="#075E72" />
  //     </View>
  //   );
  // }

  // if (error) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <Text style={{ color: "red", fontSize: 16 }}>{error}</Text>
  //     </View>
  //   );
  // }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#F7F7F7" }}>
      {/* Coin */}
      <View
        style={{
          backgroundColor: "#075E72",
          paddingVertical: 32,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          height: 400,
        }}
      >
        <Image
          source={require("@/assets/images/shadowncoin.png")}
          style={{
            position: "absolute",
            width: 400,
            height: 240,
            alignSelf: "center",
            top: "65%",
            left: "40%",
            transform: [{ translateX: -155 }],
          }}
        />
        <Image
          source={require("@/assets/images/coin.png")}
          style={{
            width: 280,
            height: 280,
            borderRadius: 50,
            marginBottom: 16,
            alignSelf: "center",
          }}
        />
        <Text
          style={{
            position: "absolute",
            top: "39.5%",
            left: "45%",
            transform: [{ translateX: -25 }],
            fontSize: 36,
            fontWeight: "bold",
            color: "gold",
            textShadowColor: "rgba(0, 0, 0, 0.5)",
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 4,
          }}
        >
          {formatCoins(userCoins)}
        </Text>
        <View
          style={{
            position: "absolute",
            bottom: -60,
            left: 20,
            right: 20,
            backgroundColor: "white",
            borderRadius: 20,
            paddingVertical: 20,
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
          }}
        >
          <View style={{ alignItems: "center" }}>
            <SimpleLineIcons name="badge" size={24} color="#E45664" />
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
              {badges}
            </Text>
            <Text style={{ fontSize: 14, color: "#777" }}>Badges</Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <Entypo name="add-user" size={24} color="#E45664" />
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
              {participation}
            </Text>
            <Text style={{ fontSize: 14, color: "#777" }}>Participation</Text>
          </View>

          <View style={{ alignItems: "center" }}>
            <AntDesign name="heart" size={24} color="#E45664" />
            <Text style={{ fontSize: 20, fontWeight: "bold", color: "#333" }}>
              {likes}
            </Text>
            <Text style={{ fontSize: 14, color: "#777" }}>Likes</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          padding: 16,
          marginTop: 70,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "bold" }}>
          Recent Activity
        </Text>
      </View>

      <View
        style={{
          backgroundColor: "white",
          borderRadius: 10,
          marginHorizontal: 16,
          padding: 16,
          elevation: 4,
        }}
      >
        {recentActivities.map((activity) => (
          <View
            key={activity.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginVertical: 8,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={
                  badgeImages[activity.badge.image_url] ||
                  badgeImages["default.png"]
                }
                style={{ width: 40, height: 40 }}
              />
              <View style={{ marginLeft: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {activity.badge.name}
                </Text>
                <Text style={{ color: "gray" }}>
                  {activity.badge.description}
                </Text>
              </View>
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: activity.badge.status == "accepted" ? "green" : "red",
              }}
            >
              + UWC {activity.badge.value}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default CoinSection;
