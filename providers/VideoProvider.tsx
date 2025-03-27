import {
  StreamVideoClient,
  StreamVideo,
} from "@stream-io/video-react-native-sdk";
import { PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";


import { supabase } from "@/config/supabase";
import { useAuth, useSupabase } from "@/context/supabase-provider";

const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY;

export default function VideoProvider({ children }: PropsWithChildren) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(
    null
  );
  // const { profile } = useAuth();
const { profile } = useSupabase();
  console.log("profile-vid from supabase:", profile);

  useEffect(() => {
    if (!profile) {
      if (videoClient) {
        videoClient.disconnectUser();
        setVideoClient(null);
      }
      return;
    }

    const initVideoClient = async () => {
      const user = {
        id: profile.id,
        name: profile.username,
        image: profile.profile_picture_url,
      };

      const { data, error } = await supabase.functions.invoke("stream-token", {
        body: JSON.stringify({
          username: profile.username,
          profile_picture_url: profile.profile_picture_url,
        }),
      });
      if (error) throw error;
      const token = data.token;
      console.log("video token:", token);

      const client = StreamVideoClient.getOrCreateInstance({
        apiKey,
        user,
        token,
      });

      console.log("apikey:", apiKey);
      
      // const client = new StreamVideoClient({ apiKey, user, tokenProvider });
      setVideoClient(client);
    };

    initVideoClient();

    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
      }
    };
  }, [profile?.id]);

  if (!videoClient) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
