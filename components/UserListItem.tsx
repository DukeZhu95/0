
import { Audio } from 'expo-av';
import { Image, Text, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import { useChatContext } from "stream-chat-expo";
import { router } from "expo-router";
import { useAuth } from '@/context/supabase-provider';

interface Props {
  size?: number;
  user: {
    id: string;
    username: string;
    profile_picture_url?: string | null;
  };
}

const UserListItem = ({ user, size = 50 }: Props) => {
  const { client } = useChatContext();
  const avatarSize = { height: size, width: size };
  const { profile: me } = useAuth();

  const onPress = async () => {
    try {
      
      console.log("Starting chat with:", user.id, user.username);

      const channel = client.channel("messaging", {
        members: [me.id, user.id],
      });

      await channel.watch();
      // const channelId = channel.cid.replace(":", "-");
      console.log("Navigating to:", channel.cid);
      router.replace(`/(app)/(protected)/inbox/${channel.cid}`);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  const userInitial = user.username?.charAt(0)?.toUpperCase() || "?";

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        padding: 15,
        backgroundColor: "white",
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 4,
      }}
    >
      {user.profile_picture_url ? (
        <Image
          source={{ uri: user.profile_picture_url }}
          accessibilityLabel="Avatar"
          style={[avatarSize, styles.avatar, styles.image]}
        />
      ) : (
        <View style={[avatarSize, styles.avatar, styles.noImage]}>
          <Text style={styles.initialText}>{userInitial}</Text>
        </View>
      )}
      <Text style={{ fontWeight: "600" }}>{user.username}</Text>
    </TouchableOpacity>
  );
};

export default UserListItem;

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 25,
    overflow: "hidden",
    maxWidth: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    objectFit: "cover",
    paddingTop: 0,
  },
  noImage: {
    backgroundColor: "#ccc",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "rgb(200, 200, 200)",
  },
  initialText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});
