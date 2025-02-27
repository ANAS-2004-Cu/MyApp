import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
export default function RootLayout() {
  return (
    <Stack>

      <Stack.Screen name="index" 
      options={{headerShown: true, headerTitle: "Homer", headerStyle: {backgroundColor: "gray"}}}
      />
      <Stack.Screen name="game"
      options={{headerShown: true, headerTitle: "Guess Game", headerStyle: {backgroundColor: "gray"}}}
      />
    </Stack>
  );
}
