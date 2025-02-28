import { Text, View, StyleSheet, Button, TextInput, ImageBackground } from "react-native";
import { useState, useRef } from 'react';
import { Href, Link,useRouter} from "expo-router";

export default function Game1() {
  const router = useRouter();
  const [value, setValue] = useState(-1);
  const rest = useRef<TextInput>(null);
  const [tries, setTries] = useState(0);
  const [randomNumber, setRandomNumber] = useState(Math.floor(Math.random() * 100));
  const [perfect, setPerfect] = useState(false);
  const [higher, setHigher] = useState(false);
  const [lower, setLower] = useState(false);
  const [tooBig, setTooBig] = useState(false);
  const [empty, setEmpty] = useState(false);
  const [limit, setLimit] = useState(false);
  const [hit, setHit] = useState(true);
  const [soHigher, setSoHigher] = useState(false);
  const [soLower, setSoLower] = useState(false);

  function reset() {
    console.log(randomNumber);
    setRandomNumber(Math.floor(Math.random() * 100));
    setValue(-1);
    setTries(0);
    setPerfect(false);
    setHigher(false);
    setLower(false);
    setTooBig(false);
    setEmpty(false);
    setLimit(false);
    setHit(true);
    setSoHigher(false);
    setSoLower(false);
  }

  function incrementTries() {
    setTries(tries + 1);
  }

  function check() {
    console.log(randomNumber);
    if (value === -1) {
      setEmpty(true);
      setPerfect(false);
      setHigher(false);
      setLower(false);
      setTooBig(false);
      setSoHigher(false);
      setSoLower(false);
    } else if (value > 99 || value < -1) {
      setTooBig(true);
      setEmpty(false);
      setPerfect(false);
      setHigher(false);
      setLower(false);
      setSoHigher(false);
      setSoLower(false);
    } else if (randomNumber === value) {
      if (hit) {
        incrementTries();
        setHit(false);
      }
      setTooBig(false);
      setEmpty(false);
      setPerfect(true);
      setHigher(false);
      setLower(false);
    } else if (randomNumber > value) {
      incrementTries();
      if (Math.abs(randomNumber - value) <= 10) {
        setSoHigher(true);
        setHigher(false);
      } else {
        setHigher(true);
        setSoHigher(false);
      }
      setSoLower(false);
      setLower(false);
      setPerfect(false);
      setTooBig(false);
      setEmpty(false);
    } else if (randomNumber < value) {
      incrementTries();
      if (Math.abs(randomNumber - value) <= 10) {
        setSoLower(true);
        setLower(false);
      } else {
        setLower(true);
        setSoLower(false);
      }
      setSoHigher(false);
      setPerfect(false);
      setHigher(false);
      setTooBig(false);
      setEmpty(false);
    }
  }

  function limitTries() {
    if (tries < 10 && hit) {
      return check();
    } else {
      return setLimit(true);
    }
  }

  function textReset() {
    limitTries();
    rest.current?.clear();
    setValue(-1);
  }

  return (
    <ImageBackground source={{ uri: "https://i.top4top.io/p_3338uctba1.jpg" }} style={styles.background} blurRadius={1}>
      <View style={styles.container}>
        <View style={styles.divstyle}></View>
        <View style={styles.box1}>
          <ImageBackground source={{ uri: "https://j.top4top.io/p_3338gj9ws1.jpg" }} style={styles.imageBackground} blurRadius={2} borderRadius={60}>
            <Text style={styles.text1}>Enter your guess between 0 and 99:</Text>
            <View style={styles.inbutbox}>
              <TextInput
                style={styles.input}
                placeholder="Enter your guess"
                placeholderTextColor="gray"
                keyboardType="numeric"
                ref={rest}
                onChangeText={(text) => {
                  console.log(text);
                  setValue(Number(text));
                }}
              />
              <View style={styles.bottom1}>
                <Button title="CHECK" onPress={textReset} />
              </View>
            </View>
          </ImageBackground>
        </View>
        <View style={styles.divstyle}></View>
        <View style={styles.box2}>
          <Text style={styles.text2}>Your guesses: {tries} ,Remain {10 - tries}</Text>
        </View>
        <View style={styles.divstyle}></View>
        <View style={styles.box3}>
          <ImageBackground source={{ uri: "https://f.top4top.io/p_3341ulscq1.jpg" }} style={styles.imageBackground} blurRadius={3} borderRadius={60}>
            <Text style={styles.text3}>
              {perfect ? `Got It!🎉 Perfect Guess. \nThe Number was ✨${randomNumber}✨.` :
                limit ? `You Have Reached The Limit Of 10 Tries.🤯\nThe Number was\n☠️${randomNumber}☠️.` :
                  soLower ? "Your Guess Is So Close😲\nBut Still High.📈\nTry Going Lower.🥺" :
                    soHigher ? "Your Guess Is So Close😲\nBut Still Low.📉\nTry Going Lower.🥺" :
                      lower ? "Your Guess Is Too High.📈\nTry Going Lower.🥺" :
                        higher ? "Your Guess Is Too Low.📉\nTry Going Higher.🥺" :
                          empty ? "Please Enter A Number 😐" :
                            tooBig ? "Please Enter A Number\nBetween 0 and 99.😔" :
                              "Lower OR Higher\n🎮Game🎮"}
            </Text>
          </ImageBackground>
        </View>
        <View style={styles.divstyle}></View>
        <View style={styles.box4}>
          <View style={styles.home}>
          {/* <Link href="/" style={styles.home}> */}
              <Button title="HOME" onPress={() => router.push('/')}/>
          {/* </Link> */}
          </View>
          <View style={styles.reset}>
            <Button title="RESET" onPress={reset} />
          </View>
        </View>
        <View style={styles.divstyle}></View>
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
  box1: {
    width: "96%",
    height: "42%",
    borderRadius: 5,
  },
  box2: {
    width: "90%",
    height: "3%",
    borderRadius: 5,
  },
  box3: {
    width: "96%",
    height: "43%",
    borderRadius: 5,
  },
  box4: {
    flex: 2,
    width: "100%",
    height: "4.5%",
    borderRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
  },
  divstyle: {
    width: "100%",
    height: "1%",
  },
  text1: {
    fontSize: 18,
    marginTop: 100,
    marginBottom: 10,
    color: "gold",
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "bottom",
    alignContent: "center",
  },
  text2: {
    fontSize: 17,
    width: "100%",
    height: "100%",
    color: "cyan",
    fontWeight: "bold",
    textAlign: "center",
    textAlignVertical: "center",
    alignContent: "center",
  },
  text3: {
    fontSize: 30,
    color: "gold",
    fontWeight: "bold",
    fontFamily: "monospace",
    width: "100%",
    height: "100%",
    textAlign: "center",
    textAlignVertical: "center",
    alignContent: "center",
  },
  text4: {
    fontSize: 20,
    width: "100%",
    height: "100%",
    textAlign: "center",
    textAlignVertical: "center",
    alignContent: "center",
  },
  reset: {
    height: "100%",
    width: "17%",
    // alignSelf: "center",
    marginLeft: 40,
  },
  home:{
    height: "100%",
    width: "17%",
    marginRight: 40,
  },
  bottom1: {
    height: "100%",
    width: "17%",
    alignSelf: "center",
  },
  input: {
    backgroundColor: "white",
    width: 150,
    height: 35,
    alignSelf: "center",
    textAlign: "left",
    borderBottomLeftRadius: 5,
    borderTopLeftRadius: 5,
  },
  inbutbox: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
});
