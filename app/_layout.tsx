import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
export default function RootLayout() {
  return (
    <Stack>

      <Stack.Screen name="index" 
      options={{headerShown: true, headerTitle: "Home", headerStyle: {backgroundColor: "gray"}}}
      />
      <Stack.Screen name="Game1"
      options={{headerShown: true, headerTitle: "Guess Game", headerStyle: {backgroundColor: "gray"}}}
      />
    </Stack>
  );
}
