import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { supabase } from "@/config/supabase"; // Ensure correct path
import { useAuth } from "@/context/supabase-provider"; // Ensure correct path

interface BlockedUser {
  blocked_id: string;
  username: string;
  profile_picture_url?: string | null;
}

const Blocked: React.FC = () => {
  const { user } = useAuth();
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to fetch blocked users
  const fetchBlockedUsers = async () => {
    try {
      if (!user) return;
      setLoading(true);

      const { data, error } = await supabase
        .from("user_blocks")
        .select("blocked_id, users:blocked_id (username, profile_picture_url)") // Explicit relationship
        .eq("blocker_id", user.id);

      if (error) {
        console.error("Error fetching blocked users:", error.message);
        Alert.alert("Error", "Failed to fetch blocked users.");
        return;
      }

      if (data) {
        setBlockedUsers(
          data.map((item) => ({
            blocked_id: item.blocked_id,
            username: item.users?.username || "Unknown User",
            profile_picture_url: item.users?.profile_picture_url || null,
          }))
        );
      }
    } catch (error: any) {
      console.error("Error fetching blocked users:", error.message);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // Function to unblock a user
  const handleUnblockUser = async (blockedUserId: string) => {
    try {
      if (!user) return;

      const { error } = await supabase
        .from("user_blocks")
        .delete()
        .eq("blocker_id", user.id)
        .eq("blocked_id", blockedUserId);

      if (error) {
        console.error("Error unblocking user:", error.message);
        Alert.alert("Error", "Failed to unblock the user.");
        return;
      }

      setBlockedUsers((prevUsers) =>
        prevUsers.filter((user) => user.blocked_id !== blockedUserId)
      );

      Alert.alert("Success", "User has been unblocked.");
    } catch (error: any) {
      console.error("Error unblocking user:", error.message);
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  // Fetch blocked users when the component mounts
  useEffect(() => {
    fetchBlockedUsers();
  }, []);

  return (
    <View className="flex-1 p-4 bg-gray-100">
      <Text className="text-xl font-bold mb-4">Blocked Users</Text>

      {loading ? (
        <Text className="text-center text-gray-600">Loading...</Text>
      ) : (
        <FlatList
          data={blockedUsers}
          keyExtractor={(item) => item.blocked_id}
          renderItem={({ item }) => (
            <View className="flex-row items-center p-4 border-b border-gray-300">
              {/* Profile Picture */}
              {item.profile_picture_url ? (
                <Image
                  source={{ uri: item.profile_picture_url }}
                  className="w-10 h-10 rounded-full mr-3"
                />
              ) : (
                <View className="w-10 h-10 rounded-full bg-gray-300 justify-center items-center mr-3">
                  <Text>{item.username.charAt(0).toUpperCase()}</Text>
                </View>
              )}

              {/* Username */}
              <Text className="flex-1 text-lg font-semibold">{item.username}</Text>

              {/* Unblock Button */}
              <TouchableOpacity
                onPress={() => handleUnblockUser(item.blocked_id)}
                className="px-4 py-2 bg-blue-500 rounded"
              >
                <Text className="text-white">Unblock</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-600 mt-4">No blocked users found.</Text>
          }
        />
      )}
    </View>
  );
};

export default Blocked;
