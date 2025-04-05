import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false, statusBarHidden: true }} />
      <Stack.Screen name="Login" options={{ headerShown: false }} />
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="Register" options={{ headerShown: false }} />
      <Stack.Screen name="ForgetPass" options={{ headerShown: false }} />
      <Stack.Screen name="Game1" options={{ headerShown: false, statusBarHidden: true }} />
      <Stack.Screen name="Game2" options={{ headerShown: false, statusBarHidden: true }} />
      <Stack.Screen name="Game3" options={{ headerShown: false, statusBarHidden: true }} />
      <Stack.Screen name="Game4" options={{ headerShown: false, statusBarHidden: true }} />
      <Stack.Screen name="Game5" options={{ headerShown: false, statusBarHidden: true }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#578FCA",
  },
});
