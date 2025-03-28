import { Text, View, StyleSheet, ImageBackground, FlatList } from "react-native";
import { Href, Link } from "expo-router";

export default function Index() {
  const data = [
    { id: "1", title: "Guess Game", to: "/Game1" as Href },
    { id: "2", title: "X_O (Normal)", to: "/Game2" as Href },
    { id: "3", title: "X_O (Advanced)", to: "/Game3" as Href },
    { id: "4", title: "MY CALC", to: "/Game4" as Href },
    { id: "5", title: "Game 5", to: "/Game5" as Href },
    { id: "6", title: "Game 6", to: "/Game6" as Href },
    { id: "7", title: "Game 7", to: "/Game7" as Href },
    { id: "8", title: "Game 8", to: "/Game8" as Href },
    { id: "9", title: "Game 9", to: "/Game9" as Href },
    { id: "10", title: "Game 10", to: "/Game10" as Href },
    { id: "11", title: "Game 11", to: "/Game11" as Href },
  ];

  const Item = ({ title, to }: { title: string; to: Href }) => (
    <View style={styles.item}>
      <ImageBackground source={require("../assets/images/home1.png")} style={styles.sbackground}>
        <Link href={to} style={styles.text1}>
          <Text style={styles.text1}>{title}</Text>
        </Link>
      </ImageBackground>
    </View>
  );

  return (
    <ImageBackground source={require("../assets/images/background.jpg")} style={styles.background}>
      <View style={styles.container}>
        <FlatList
          data={data}
          renderItem={({ item }) => <Item title={item.title} to={item.to} />}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          style={{width: "100%"}}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: "100%",
    width: "100%",
  },
  background: {
    width: '100%',
    height: '100%',
  },
  sbackground: {
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  text1: {
    height: 50,
    width: 230,
    fontSize: 20,
    color: "#78F0BC",
    fontWeight: "bold",
    fontFamily: "arial",
    borderRadius: 5,
    textAlign: "center",
    padding: 12,
  },
  item: {
    padding: 5,
    height: 70,
    width: 400,
    marginVertical: 10,
    marginHorizontal: 1,
    borderRadius: 5,
    alignSelf: "center",
  },
});
