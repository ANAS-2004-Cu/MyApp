import { Text, View, StyleSheet, Button, TextInput, ImageBackground, FlatList } from "react-native";
import { useState, useRef } from 'react';
import { Link } from "expo-router";

export default function Index() {
  const data = ["game1", "game2", "game3", "game4", "game5"];

  return (
    <ImageBackground source={{ uri: "https://i.top4top.io/p_3338uctba1.jpg" }} style={styles.background} blurRadius={1}>
      <View style={styles.container}>
        <Text style={styles.header}>Home</Text>
        <FlatList 
          data={data}
          renderItem={({ item }) => <Text style={styles.flat}>{item}</Text>}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={true}
        />
        <Link href={"/Game1"} style={styles.text1}>
          Start Guess Game
        </Link>
        <Text style={styles.footer}>oiwadjwadjwadjo\ijdw</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    width: '100%',
    height: '100%',
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  text1: {
    fontSize: 20,
    color: "gold",
    fontWeight: "bold",
    textAlign: "center",
    fontFamily: "monospace",
    borderRadius: 5,
    marginTop: 20,
  },
  flat: {
    color: "gold",
    fontSize: 18,
    marginVertical: 5,
  },
  footer: {
    fontSize: 16,
    color: "white",
    marginTop: 20,
  },
});
