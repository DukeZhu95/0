import { Stack } from "expo-router";

export default function MenuLayout() {
 
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index" // This will render menu/index.tsx
      />
      <Stack.Screen
        name="coin" // For coin page
      />
      <Stack.Screen
        name="faq" // For coin page
      />
      <Stack.Screen
        name="notifications" // For notifications page
      />
      <Stack.Screen
        name="settings" // For settings page
      />
      <Stack.Screen
        name="profile" // For settings page
      />
      <Stack.Screen
        name="terms-policies" // For settings page
      />
      <Stack.Screen
        name="savedchallenges" // For settings page
      />
      {/* Add other menu screens you need */}
    </Stack>
  );
}
