import { PropsWithChildren, useEffect, useState } from "react";
import { ActivityIndicator } from "react-native";
import { StreamChat } from "stream-chat";
import { Chat, OverlayProvider } from "stream-chat-expo";

import { supabase } from "@/config/supabase";
import { useSupabase } from "@/context/supabase-provider";

const client = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY);

export default function ChatProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const { profile } = useSupabase();
  // console.log("profile from supabase:", profile);

  useEffect(() => {
    if (!profile) {
      console.log("No profile yet");
      if (isReady) {
        // Disconnect if switching from a profile to no profile (logout)
        client.disconnectUser();
        setIsReady(false);
      }
      return;
    }

    const connect = async () => {
      try {
        const { data, error } = await supabase.functions.invoke(
          "stream-token",
          {
            body: JSON.stringify({
              username: profile.username,
              profile_picture_url: profile.profile_picture_url,
            }),
          }
        );
        if (error) throw error;
        const token = data.token;
        console.log("Generated token:", token);

        // Disconnect any existing user first
        if (client.userID) {
          console.log("Disconnecting previous user:", client.userID);
          await client.disconnectUser();
        }

        console.log("Connecting userid and name:", profile.id, profile.username);

        // console.log("token user:", await tokenProvider());
        console.log("token user:", token);

        console.log("Connecting userid:", profile.id);

        await client.connectUser(
          {
            id: profile.id,
            name: profile.username,
            image: profile.profile_picture_url,
          },
          // tokenProvider
          token
        );
        console.log("Connected user:client_id", client.userID);
        setIsReady(true);
      } catch (error) {
        console.error("Failed to connect user:", error);
      }
    };

    connect();

    return () => {
      if (isReady) {
        client.disconnectUser();
        console.log("Disconnected user");
      }
      setIsReady(false);
    };
  }, [profile?.id]);

  if (!isReady) {
    return <ActivityIndicator />;
  }

  return (
    <OverlayProvider>
      <Chat client={client}>{children}</Chat>
    </OverlayProvider>
  );
}
