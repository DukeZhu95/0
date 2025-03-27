import { Stack, Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

export default function TabsNavigator() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Chats',
        }}
      />
      
    </Stack>
  );
}