import { Stack } from "expo-router";
import ChatProvider from "@/providers/ChatProvider";

import VideoProvider from "@/providers/VideoProvider";
import CallProvider from "@/providers/CallProvider";

export default function HomeLayout() {

  return (
    <ChatProvider>
      <VideoProvider>
        <CallProvider>
          <Stack>
            <Stack.Screen name='users' options={{title:"Friends", headerShown: true}} />
            <Stack.Screen name="call" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
        </CallProvider>
      </VideoProvider>
    </ChatProvider>
  );
}
