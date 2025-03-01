import { Text, View, StyleSheet, ImageBackground } from "react-native";
import { Link } from "expo-router";

export default function Game8() {
  return (
    <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.text}>Game 8</Text>
        <Link href="/" style={styles.link}>Go Back Home</Link>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontSize: 30,
    color: "gold",
    fontWeight: "bold",
    textAlign: "center",
  },
  link: {
    fontSize: 20,
    color: "cyan",
    marginTop: 20,
  },
});
