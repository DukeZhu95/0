import ChatProvider from "@/providers/ChatProvider";
import { Stack } from "expo-router";

export default function InboxLayout() {
  return (
    <ChatProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "Chats",
            headerShown: true,
          }}
        />
        <Stack.Screen
          name="[cid]"
          options={{
            title: "Chats",
            headerShown: false,
          }}
        />
      </Stack>
    </ChatProvider>
  );
}
