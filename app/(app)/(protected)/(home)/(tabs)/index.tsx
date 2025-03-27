// import { Link, Stack, router } from 'expo-router';
// import { ChannelList } from 'stream-chat-expo';
// import { useAuth } from '../../../providers/AuthProvider';
// import { FontAwesome5 } from '@expo/vector-icons';

// export default function MainTabScreen() {
//   const { user } = useAuth();
//   return (
//     <>
//       <Stack.Screen
//         options={{
//           headerRight: () => (
//             <Link href={'/(home)/users'} asChild>
//               <FontAwesome5
//                 name="users"
//                 size={22}
//                 color="gray"
//                 style={{ marginHorizontal: 15 }}
//               />
//             </Link>
//           ),
//         }}
//       />
//       <ChannelList
//         filters={{ members: { $in: [user.id] } }}
//         onSelect={(channel) => router.push(`/channel/${channel.cid}`)}
//       />
//     </>
//   );
// }

import { Link, Redirect, Stack, router } from 'expo-router';
import { ChannelList } from 'stream-chat-expo';
// import { useAuth } from '@/providers/AuthProvider';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '@/context/supabase-provider';

export default function MainTabScreen() {
  const { user } = useAuth();
  console.log("user from maintabscreen:", user.id);
  
  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <Link href={'/(app)/(protected)/(home)/users'} asChild>
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
        onSelect={(channel) => router.push(`/channel/${channel.cid}`)}
      />
    </>
  );
}