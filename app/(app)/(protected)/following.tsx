// // // // app/(app)/(protected)/following.tsx

// // // import { Ionicons } from "@expo/vector-icons";
// // // import { useLocalSearchParams, useRouter } from "expo-router";
// // // import React, { useState, useEffect, useCallback } from "react";
// // // import {
// // //   View,
// // //   Text,
// // //   FlatList,
// // //   ActivityIndicator,
// // //   TouchableOpacity,
// // //   Alert,
// // // } from "react-native";

// // // import { Image } from "@/components/image";
// // // import { supabase } from "@/config/supabase";

// // // type Following = {
// // //   id: string;
// // //   username: string;
// // //   first_name: string;
// // //   last_name: string;
// // //   profile_picture_url: string;
// // // };

// // // export default function Following() {
// // //   const { userId } = useLocalSearchParams<{ userId: string }>();
// // //   const router = useRouter();

// // //   const [following, setFollowing] = useState<Following[]>([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [error, setError] = useState<string | null>(null);

// // //   const fetchFollowing = useCallback(async () => {
// // //     try {
// // //       if (!userId) return;

// // //       setLoading(true);
// // //       setError(null);

// // //       const { data, error } = await supabase
// // //         .from("follows")
// // //         .select(
// // //           `following_id, users:users!follows_following_id_fkey (
// // //             id, username, first_name, last_name, profile_picture_url
// // //           )`
// // //         )
// // //         .eq("follower_id", userId);

// // //       if (error) throw error;

// // //       const formattedFollowing = data.map((item: any) => ({
// // //         id: item.users.id,
// // //         username: item.users.username,
// // //         first_name: item.users.first_name,
// // //         last_name: item.users.last_name,
// // //         profile_picture_url: item.users.profile_picture_url,
// // //       }));

// // //       setFollowing(formattedFollowing);
// // //     } catch (error: any) {
// // //       Alert.alert("Error", error.message);
// // //       setError(error.message);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   }, [userId]);

// // //   useEffect(() => {
// // //     fetchFollowing();
// // //   }, [fetchFollowing]);

// // //   const handleProfilePress = (followingId: string) => {
// // //     router.push(`/otheruserprofile?id=${followingId}`);
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <View className="flex-1 justify-center items-center">
// // //         <ActivityIndicator size="large" />
// // //       </View>
// // //     );
// // //   }

// // //   if (error) {
// // //     return (
// // //       <View className="flex-1 justify-center items-center">
// // //         <Text className="text-red-500">{error}</Text>
// // //       </View>
// // //     );
// // //   }

// // //   if (!following.length) {
// // //     return (
// // //       <View className="flex-1 justify-center items-center">
// // //         <Text className="text-gray-500">Not following anyone yet.</Text>
// // //       </View>
// // //     );
// // //   }

// // //   return (
// // //     <FlatList
// // //       data={following}
// // //       keyExtractor={(item) => item.id}
// // //       renderItem={({ item }) => (
// // //         <TouchableOpacity
// // //           onPress={() => handleProfilePress(item.id)}
// // //           activeOpacity={0.7}
// // //         >
// // //           <View className="flex-row items-center p-4 border-b border-gray-200">
// // //             <Image
// // //               source={{ uri: item.profile_picture_url }}
// // //               className="w-12 h-12 rounded-full bg-gray-300"
// // //             />
// // //             <View className="ml-4">
// // //               <Text className="text-lg font-semibold">
// // //                 {item.first_name} {item.last_name}
// // //               </Text>
// // //               <Text className="text-gray-500">@{item.username}</Text>
// // //             </View>
// // //           </View>
// // //         </TouchableOpacity>
// // //       )}
// // //     />
// // //   );
// // // }


// // // app/(app)/(protected)/following.tsx

// // import { Ionicons } from "@expo/vector-icons";
// // import { useLocalSearchParams, useRouter } from "expo-router";
// // import React, { useState, useEffect, useCallback } from "react";
// // import {
// //   View,
// //   Text,
// //   FlatList,
// //   ActivityIndicator,
// //   TouchableOpacity,
// //   Alert,
// // } from "react-native";

// // import { Image } from "@/components/image";
// // import { supabase } from "@/config/supabase";

// // type Following = {
// //   id: string;
// //   username: string;
// //   first_name: string;
// //   last_name: string;
// //   profile_picture_url: string;
// // };

// // export default function Following() {
// //   const { userId } = useLocalSearchParams<{ userId: string }>();
// //   const router = useRouter();

// //   const [following, setFollowing] = useState<Following[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState<string | null>(null);

// //   const fetchFollowing = useCallback(async () => {
// //     try {
// //       if (!userId) return;

// //       setLoading(true);
// //       setError(null);

// //       const { data, error } = await supabase
// //         .from("follows")
// //         .select(
// //           `following_id, users:users!follows_following_id_fkey (
// //             id, username, first_name, last_name, profile_picture_url
// //           )`
// //         )
// //         .eq("follower_id", userId);

// //       if (error) throw error;

// //       const formattedFollowing = data.map((item: any) => ({
// //         id: item.users.id,
// //         username: item.users.username,
// //         first_name: item.users.first_name,
// //         last_name: item.users.last_name,
// //         profile_picture_url: item.users.profile_picture_url,
// //       }));

// //       setFollowing(formattedFollowing);
// //     } catch (error: any) {
// //       Alert.alert("Error", error.message);
// //       setError(error.message);
// //     } finally {
// //       setLoading(false);
// //     }
// //   }, [userId]);

// //   useEffect(() => {
// //     fetchFollowing();
// //   }, [fetchFollowing]);

// //   const handleProfilePress = (followingId: string) => {
// //     router.push(`/otheruserprofile?id=${followingId}`);
// //   };

// //   if (loading) {
// //     return (
// //       <View className="flex-1 justify-center items-center bg-white">
// //         <ActivityIndicator size="large" color="#1DA1F2" />
// //       </View>
// //     );
// //   }

// //   if (error) {
// //     return (
// //       <View className="flex-1 justify-center items-center bg-white">
// //         <Text className="text-red-500 font-semibold">{error}</Text>
// //       </View>
// //     );
// //   }

// //   if (!following.length) {
// //     return (
// //       <View className="flex-1 justify-center items-center bg-white">
// //         <Text className="text-gray-500 font-medium">Not following anyone yet.</Text>
// //       </View>
// //     );
// //   }

// //   return (
// //     <View className="flex-1 bg-white">
// //       <FlatList
// //         data={following}
// //         keyExtractor={(item) => item.id}
// //         renderItem={({ item }) => (
// //           <TouchableOpacity
// //             onPress={() => handleProfilePress(item.id)}
// //             activeOpacity={0.8}
// //             className="flex-row items-center p-4 border-b border-gray-200"
// //           >
// //             <Image
// //               source={{ uri: item.profile_picture_url }}
// //               className="w-14 h-14 rounded-full bg-gray-300"
// //             />
// //             <View className="ml-4 flex-1">
// //               <Text className="text-lg font-semibold text-gray-900">
// //                 {item.first_name} {item.last_name}
// //               </Text>
// //               <Text className="text-gray-500">@{item.username}</Text>
// //             </View>
// //             <Ionicons name="chevron-forward" size={20} color="#AAB8C2" />
// //           </TouchableOpacity>
// //         )}
// //       />
// //     </View>
// //   );
// // }


// // app/(app)/(protected)/following.tsx

// import { Ionicons, Entypo } from "@expo/vector-icons";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import React, { useState, useEffect, useCallback } from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   ActivityIndicator,
//   TouchableOpacity,
//   Alert,
//   Modal,
// } from "react-native";

// import { Image } from "@/components/image";
// import { supabase } from "@/config/supabase";

// type Following = {
//   id: string;
//   username: string;
//   first_name: string;
//   last_name: string;
//   profile_picture_url: string;
//   isBlocked?: boolean;
// };

// const reportReasons = ["Spam", "Harassment", "Hate Speech", "Violence", "Other"];

// export default function Following() {
//   const { userId } = useLocalSearchParams<{ userId: string }>();
//   const router = useRouter();

//   const [following, setFollowing] = useState<Following[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isReportModalVisible, setReportModalVisible] = useState(false);
//   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
//   const [reportReason, setReportReason] = useState("");

//   const fetchFollowing = useCallback(async () => {
//     try {
//       if (!userId) return;

//       setLoading(true);
//       setError(null);

//       const { data, error } = await supabase
//         .from("follows")
//         .select(
//           `following_id, users:users!follows_following_id_fkey (
//             id, username, first_name, last_name, profile_picture_url
//           )`
//         )
//         .eq("follower_id", userId);

//       if (error) throw error;

//       const formattedFollowing = data.map((item: any) => ({
//         id: item.users.id,
//         username: item.users.username,
//         first_name: item.users.first_name,
//         last_name: item.users.last_name,
//         profile_picture_url: item.users.profile_picture_url,
//         isBlocked: false, // Default to false
//       }));

//       setFollowing(formattedFollowing);
//     } catch (error: any) {
//       Alert.alert("Error", error.message);
//       setError(error.message);
//     } finally {
//       setLoading(false);
//     }
//   }, [userId]);

//   useEffect(() => {
//     fetchFollowing();
//   }, [fetchFollowing]);

//   const handleProfilePress = (followingId: string) => {
//     router.push(`/otheruserprofile?id=${followingId}`);
//   };

//   const handleFollowUnfollow = async (id: string) => {
//     const isFollowing = following.some((user) => user.id === id);
//     const updatedFollowing = following.filter((user) => user.id !== id);

//     setFollowing(isFollowing ? updatedFollowing : [...following, { ...updatedFollowing, id }]);

//     try {
//       if (isFollowing) {
//         await supabase.from("follows").delete().eq("following_id", id).eq("follower_id", userId);
//       } else {
//         await supabase.from("follows").insert([{ follower_id: userId, following_id: id }]);
//       }
//     } catch (error: any) {
//       Alert.alert("Error", "Something went wrong.");
//     }
//   };

//   const handleBlockUser = (id: string) => {
//     setFollowing((prev) =>
//       prev.map((user) => (user.id === id ? { ...user, isBlocked: true } : user))
//     );
//   };

//   const handleReportUser = async () => {
//     if (!selectedUserId || !reportReason) return;

//     try {
//       await supabase.from("user_reports").insert([
//         {
//           reported_user_id: selectedUserId,
//           reporter_id: userId,
//           reason: reportReason,
//         },
//       ]);

//       Alert.alert("Success", "User reported successfully.");
//       setReportModalVisible(false);
//       setReportReason("");
//     } catch (error: any) {
//       Alert.alert("Error", "Failed to report user.");
//     }
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white">
//         <ActivityIndicator size="large" color="#1DA1F2" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white">
//         <Text className="text-red-500 font-semibold">{error}</Text>
//       </View>
//     );
//   }

//   if (!following.length) {
//     return (
//       <View className="flex-1 justify-center items-center bg-white">
//         <Text className="text-gray-500 font-medium">Not following anyone yet.</Text>
//       </View>
//     );
//   }

//   return (
//     <View className="flex-1 bg-white">
//       <FlatList
//         data={following}
//         keyExtractor={(item) => item.id}
//         renderItem={({ item }) => (
//           <View className="flex-row items-center p-4 border-b border-gray-200">
//             <TouchableOpacity
//               onPress={() => handleProfilePress(item.id)}
//               activeOpacity={0.7}
//               disabled={item.isBlocked}
//               className="flex-row items-center flex-1"
//             >
//               <Image
//                 source={{ uri: item.profile_picture_url }}
//                 className={`w-14 h-14 rounded-full bg-gray-300 ${
//                   item.isBlocked ? "opacity-50" : ""
//                 }`}
//               />
//               <View className="ml-4">
//                 <Text className={`text-lg font-semibold ${item.isBlocked ? "text-gray-400" : "text-gray-900"}`}>
//                   {item.first_name} {item.last_name}
//                 </Text>
//                 <Text className="text-gray-500">@{item.username}</Text>
//               </View>
//             </TouchableOpacity>

//             {/* Actions */}
//             <TouchableOpacity
//               onPress={() => handleFollowUnfollow(item.id)}
//               className="px-4 py-2 bg-blue-500 rounded-full"
//             >
//               <Text className="text-white font-medium">{following.some((u) => u.id === item.id) ? "Unfollow" : "Follow"}</Text>
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => handleBlockUser(item.id)}>
//               <Entypo name="block" size={24} color="red" />
//             </TouchableOpacity>

//             <TouchableOpacity onPress={() => { setSelectedUserId(item.id); setReportModalVisible(true); }}>
//               <Entypo name="flag" size={20} color="#FFA500" />
//             </TouchableOpacity>
//           </View>
//         )}
//       />

//       {/* Report Modal */}
//       <Modal visible={isReportModalVisible} transparent animationType="slide">
//         <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
//           <View className="bg-white p-6 rounded-lg w-3/4">
//             <Text className="text-lg font-semibold mb-3">Report User</Text>
//             {reportReasons.map((reason) => (
//               <TouchableOpacity
//                 key={reason}
//                 onPress={() => setReportReason(reason)}
//                 className={`py-2 border-b ${
//                   reportReason === reason ? "bg-gray-200" : ""
//                 }`}
//               >
//                 <Text>{reason}</Text>
//               </TouchableOpacity>
//             ))}

//             <View className="flex-row justify-between mt-4">
//               <TouchableOpacity
//                 onPress={() => setReportModalVisible(false)}
//                 className="px-4 py-2 bg-gray-300 rounded"
//               >
//                 <Text>Cancel</Text>
//               </TouchableOpacity>
//               <TouchableOpacity
//                 onPress={handleReportUser}
//                 className="px-4 py-2 bg-red-500 rounded"
//               >
//                 <Text className="text-white">Submit</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </Modal>
//     </View>
//   );
// }

import { Ionicons, Entypo } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";

import { Image } from "@/components/image";
import { supabase } from "@/config/supabase";

type Following = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  profile_picture_url: string;
  isBlocked?: boolean;
};

const reportReasons = [
  "Nudity",
  "Pornography",
  "Violence",
  "Hate Speech",
  "Harassment",
  "Spam",
  "Other",
];

export default function Following() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();

  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalVisible, setReportModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  // 🔥 Fetch Following List, Excluding Blocked Users
  const fetchFollowing = useCallback(async () => {
    try {
      if (!userId) return;

      setLoading(true);
      setError(null);

      // 🔥 Step 1: Fetch Blocked Users
      const { data: blockedUsers, error: blockedError } = await supabase
        .from("user_blocks")
        .select("blocked_id")
        .eq("blocker_id", userId);

      if (blockedError) throw blockedError;
      const blockedUserIds = blockedUsers?.map((b) => b.blocked_id) || [];

      // 🔥 Step 2: Fetch Following, Excluding Blocked Users
      let query = supabase
        .from("follows")
        .select(
          `following_id, users:users!follows_following_id_fkey (
            id, username, first_name, last_name, profile_picture_url
          )`
        )
        .eq("follower_id", userId);

      if (blockedUserIds.length > 0) {
        query = query.not("users.id", "in", `(${blockedUserIds.join(",")})`);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formattedFollowing = data.map((item: any) => ({
        id: item.users.id,
        username: item.users.username,
        first_name: item.users.first_name,
        last_name: item.users.last_name,
        profile_picture_url: item.users.profile_picture_url,
        isBlocked: false,
      }));

      setFollowing(formattedFollowing);
    } catch (error: any) {
      Alert.alert("Error", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFollowing();
  }, [fetchFollowing]);

  // 🔥 Handle Blocking a User
  const handleBlockUser = async (id: string) => {
    try {
      if (!userId) return; // ✅ Ensure userId is available

      // 🔥 Insert block into Supabase
      const { error } = await supabase.from("user_blocks").insert([
        {
          blocker_id: userId,
          blocked_id: id,
        },
      ]);

      if (error) {
        Alert.alert("Error", "Failed to block user.");
        return;
      }

      // ✅ Remove Blocked User from List & Refetch
      setFollowing((prev) => prev.filter((user) => user.id !== id));
      setTimeout(() => fetchFollowing(), 300); // ✅ Refresh list after blocking
    } catch (error) {
      Alert.alert("Error", "Something went wrong.");
    }
  };

  // 🔥 Handle Follow/Unfollow
  const handleFollowUnfollow = async (id: string) => {
    const isFollowing = following.some((user) => user.id === id);
    const updatedFollowing = following.filter((user) => user.id !== id);

    setFollowing(
      isFollowing
        ? updatedFollowing
        : [...following, { ...updatedFollowing, id }]
    );

    try {
      if (isFollowing) {
        await supabase
          .from("follows")
          .delete()
          .eq("following_id", id)
          .eq("follower_id", userId);
      } else {
        await supabase
          .from("follows")
          .insert([{ follower_id: userId, following_id: id }]);
      }
    } catch (error: any) {
      Alert.alert("Error", "Something went wrong.");
    }
  };

  // 🔥 Handle Reporting a User
  const handleReportUser = async () => {
    if (!selectedUserId || !reportReason) return;

    try {
      await supabase.from("user_reports").insert([
        {
          reported_user_id: selectedUserId,
          reporter_id: userId,
          reason: reportReason,
        },
      ]);

      Alert.alert("Success", "User reported successfully.");
      setReportModalVisible(false);
      setReportReason("");
    } catch (error: any) {
      Alert.alert("Error", "Failed to report user.");
    }
  };

  // 🔥 UI Rendering
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#1DA1F2" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={following}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-row items-center p-4 border-b border-gray-200">
            <TouchableOpacity
              onPress={() => router.push(`/otheruserprofile?id=${item.id}`)}
              disabled={item.isBlocked}
              className="flex-row items-center flex-1"
            >
              <Image
                source={{ uri: item.profile_picture_url }}
                className={`w-14 h-14 rounded-full bg-gray-300 ${
                  item.isBlocked ? "opacity-50" : ""
                }`}
              />
              <View className="ml-4">
                <Text
                  className={`text-lg font-semibold ${item.isBlocked ? "text-gray-400" : "text-gray-900"}`}
                >
                  {item.first_name} {item.last_name}
                </Text>
                <Text className="text-gray-500">@{item.username}</Text>
              </View>
            </TouchableOpacity>

            {/* Actions */}
            <TouchableOpacity
              onPress={() => handleFollowUnfollow(item.id)}
              className="px-4 py-2 bg-blue-500 rounded-full"
            >
              <Text className="text-white font-medium">
                {following.some((u) => u.id === item.id)
                  ? "Unfollow"
                  : "Follow"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleBlockUser(item.id)}>
              <Entypo name="block" size={24} color="red" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSelectedUserId(item.id);
                setReportModalVisible(true);
              }}
            >
              <Entypo name="flag" size={20} color="#FFA500" />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}
