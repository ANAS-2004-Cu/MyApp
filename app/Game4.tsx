import { Text, View, StyleSheet, ImageBackground } from "react-native";
import { Link } from "expo-router";

export default function Game4() {
  return (
    <ImageBackground source={{ uri: "https://i.top4top.io/p_3338uctba1.jpg" }} style={styles.background} blurRadius={1}>
      <View style={styles.container}>
        <Text style={styles.text}>Game 4</Text>
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
