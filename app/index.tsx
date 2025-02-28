import { Text, View, StyleSheet, Button, TextInput, ImageBackground, FlatList } from "react-native";
import { useState, useRef } from 'react';
import { Link } from "expo-router";

export default function Index() {
  const data = ["game1", "game2", "game3", "game4", "game5"];
  const DATA = [
    {
      id:"1",
      title:"Data Structures"
    },
    {
      id:"2",
      title:"STL"
    },
    {
      id:"3",
      title:"C++"
    },
    {
      id:"4",
      title:"Java"
    },
    {
      id:"5",
      title:"Python"
    },
    {
      id:"6",
      title:"CP"
    },
    {
      id:"7",
      title:"ReactJs"
    },
    {
      id:"8",
      title:"NodeJs"
    },
    {
      id:"9",
      title:"MongoDb"
    },
    {
      id:"10",
      title:"ExpressJs"
    },
    {
      id:"11",
      title:"PHP"
    },
    {
      id:"12",
      title:"MySql"
    },
  ];

  return (
    <ImageBackground source={{ uri: "https://i.top4top.io/p_3338uctba1.jpg" }} style={styles.background} blurRadius={1}>
      <View style={styles.container}>
        <Text style={styles.header}>Home</Text>
        <FlatList 
          data={data}
          renderItem={({ item }) => <Text style={styles.flat}>{item}</Text>}
          keyExtractor={(item, index) => index.toString()}
          scrollEnabled={true}/>
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
    flex: 2,
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
    fontFamily: "monospace",
    borderRadius: 5,
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
