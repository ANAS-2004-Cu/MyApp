import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, statusBarHidden: true }} />
      <Stack.Screen name="Game1" options={{ headerShown: false, statusBarHidden: true }} />
      <Stack.Screen name="Game2" options={{ headerShown: false, statusBarHidden: true }} />
      <Stack.Screen name="Game3" options={{ headerShown: false, statusBarHidden: true }} />
      <Stack.Screen name="TempMail" options={{ headerShown: false, statusBarHidden: true }} />
      <Stack.Screen name="TempMailInbox" options={{ headerShown: false, statusBarHidden: true }} />
      <Stack.Screen name="EmailDetail" options={{ headerShown: false, statusBarHidden: true }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#578FCA",
  },
});
