// import { useEffect, useState } from 'react';
// import { FlatList, Text } from 'react-native';
// import { supabase } from '@/config/supabase';

// import UserListItem from '@/components/UserListItem';
// import { useSupabase } from '@/context/supabase-provider';

// export default function UsersScreen() {
//   const [users, setUsers] = useState([]);
//   const { user } = useSupabase();

//   useEffect(() => {
//     const fetchUsers = async () => {
//       let { data: profiles, error } = await supabase
//         .from('users')
//         .select('*')
//         .neq('id', user.id); // exclude me

//       setUsers(profiles);
//     };
//     fetchUsers();
//   }, []);

//   return (
//     <FlatList
//       data={users}
//       contentContainerStyle={{ gap: 5 }}
//       renderItem={({ item }) => <UserListItem user={item} />}
//     />
//   );
// }

import { FlatList, Text } from 'react-native';
import UserListItem from '@/components/UserListItem';
import { useSupabase } from '@/context/supabase-provider';
import { useUserFollowingDetails } from '@/hooks/useUserFollowingDetail';

export default function UsersScreen() {
  const { user } = useSupabase();
  const { data: followingUsers, isLoading, error } = useUserFollowingDetails(user?.id);

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error fetching following list</Text>;

  return (
    <FlatList
      data={followingUsers}
      contentContainerStyle={{ gap: 5 }}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <UserListItem user={item} />}
      ListEmptyComponent={<Text>No following users found.</Text>}
    />
  );
}
