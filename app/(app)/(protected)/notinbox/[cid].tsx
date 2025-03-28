// app/(app)/inbox/[cid].tsx
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Channel as ChannelType } from "stream-chat";
import {
  Channel,
  MessageInput,
  MessageList,
  useChatContext,
} from "stream-chat-expo";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useStreamVideoClient } from "@stream-io/video-react-native-sdk";

import { Text } from "react-native";
import { useAuth } from "@/context/supabase-provider";

const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export default function ChannelScreen() {
  const { profile } = useAuth();
  const [channel, setChannel] = useState<ChannelType | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(
    null
  );
  const { cid } = useLocalSearchParams<{ cid: string }>();
  const { client } = useChatContext();
  const videoClient = useStreamVideoClient();

  useEffect(() => {
    const requestMicPermission = async () => {
      const { status } = await Audio.requestPermissionsAsync();
      setHasMicPermission(status === "granted");
      if (status !== "granted") {
        console.log("Microphone permission denied");
      }
    };
    requestMicPermission();
  }, []);

  useEffect(() => {
    const fetchChannel = async () => {
      const channels = await client.queryChannels({ cid });
      setChannel(channels[0]);
    };
    fetchChannel();
  }, [cid]);

  const joinCall = useCallback(async () => {
    console.log("call pressed");
    if (!channel || !videoClient) {
      console.log("Channel or video client not ready");
      return;
    }

    const members = Object.values(channel.state.members).map((member) => ({
      user_id: member.user_id,
    }));
    console.log("Members:", JSON.stringify(members, null, 2));

    const callId = generateUUID();
    console.log("Generated callId:", callId);

    try {
      const call = videoClient.call("default", callId);
      await call.getOrCreate({
        ring: true,
        data: { members },
      });
      console.log("Call created successfully");
      // router.replace("/(home)/call");
      console.log("navigation triggered");
    } catch (error) {
      console.error("Error creating call:", error);
    }
  }, [channel, videoClient]);

  // Get the other member's name (excluding current user)
  const getOtherMemberName = () => {
    if (!channel || !profile?.user_id) return <Text>Channel</Text>; // Fallback if no channel or user ID
    const members = Object.values(channel.state.members);
    const otherMember = members.find(
      (member) => member.user_id !== profile.user_id
    );
    return otherMember?.user?.name || otherMember?.user_id || "Unknown"; // Use name if available, else user_id
  };

  if (!channel || hasMicPermission === null) {
    return <ActivityIndicator />;
  }

  if (!channel || hasMicPermission === null) {
    return <ActivityIndicator />;
  }

  return (
    <Channel channel={channel} audioRecordingEnabled={hasMicPermission}>
      {/* <Stack.Screen
        options={{
          title: "Channel",
          headerRight: () => (
            <Ionicons name="call" size={20} color="gray" onPress={joinCall} />
          ),
        }}
      /> */}
      <Stack.Screen options={{ title: "Channel", headerShown:false }} />
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          height: 40,
          paddingHorizontal: 10,
          zIndex: 1,
        }}
      >
        <Text>{getOtherMemberName()}</Text>
        <TouchableOpacity onPress={joinCall}>
          <Ionicons name="call" size={20} color="red" />
        </TouchableOpacity>
      </View>
      <MessageList />
      <SafeAreaView edges={["bottom"]}>
        <MessageInput />
      </SafeAreaView>
    </Channel>
  );
}
