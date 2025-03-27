// app/(app)/inbox/index.tsx
import { Link, Stack, router } from "expo-router";
import { ChannelList } from "stream-chat-expo";
import { FontAwesome5 } from "@expo/vector-icons";
import { useAuth } from "@/context/supabase-provider";

export default function InboxScreen() {
  const { user } = useAuth();
  console.log("user from inbox:", user);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href={"/(app)/(protected)/(home)/users"} asChild>
              <FontAwesome5
                name="users"
                size={22}
                color="gray"
                style={{ marginHorizontal: 15 }}
              />
            </Link>
          ),
        }}
      />
      <ChannelList
        filters={{ members: { $in: [user.id] } }}
        onSelect={(channel) =>
          router.push(`/(app)/(protected)/inbox/${channel.cid}`)
        }
      />
    </>
  );
}
