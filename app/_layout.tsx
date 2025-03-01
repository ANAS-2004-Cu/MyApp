import { Stack } from "expo-router";
import { StyleSheet } from "react-native";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerShown: false, statusBarHidden: true}} 
      />
      <Stack.Screen 
        name="Game1"
        options={{ 
          headerShown: true, 
          headerTitle: "Guess Game", 
          headerStyle: styles.header, 
          headerTitleAlign: "center", 
          statusBarHidden: true, 
          headerShadowVisible: false 
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "gray",
  },
});
