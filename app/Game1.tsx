import { Text, View,StyleSheet, Button, TextInput, ImageBackground } from "react-native";
import { useState, useRef } from 'react';
import { Link } from "expo-router";


export default function GAme1() {
const [value, Setvalue] = useState(-1);
const rest = useRef<TextInput>(null);
const [tries, Settries] = useState(0);
const [randomNumber,SetrandomNumber]=useState(Math.floor(Math.random() * 100));
const [perfect,SetPerfect] = useState(false)
const [higher,Sethigher] = useState(false)
const [lower,Setlower] = useState(false)
const [toobig,Settoobig] = useState(false)
const [empty,Setempty] = useState(false)
const [limit,Setlimit] = useState(false)
const [hit,Sethit] = useState(true)
const [sohigher,Setsohigher] = useState(false)
const [solower,Setsolower] = useState(false)

function reset(){
    console.log(randomNumber);
    SetrandomNumber( Math.floor(Math.random() * 100));
    Setvalue(-1)
    Settries(0)
    SetPerfect(false)
    Sethigher(false)
    Setlower(false)
    Settoobig(false)
    Setempty(false)
    Setlimit(false)
    Sethit(true)
    Setsohigher(false)
    Setsolower(false)
}
function  Setries(){
  Settries(tries+1)
}
function check (){
    console.log(randomNumber)
      if (value==-1){
        Setempty(true)
        SetPerfect(false)
        Sethigher(false)
        Setlower(false)
        Settoobig(false)
        Setsohigher(false)
        Setsolower(false)
      }
      else if (value>99||value<-1){
        Settoobig(true)
        Setempty(false)
        SetPerfect(false)
        Sethigher(false)
        Setlower(false)
      }
      else if (randomNumber==value){
        if(hit){
            Setries()
            Sethit(false)
        }
        Settoobig(false)
        Setempty(false)
        SetPerfect(true)
        Sethigher(false)
        Setlower(false)
      }
      else if (randomNumber>value){
        Setries()
        if((Math.abs(randomNumber-value)<=10)){
          Setsohigher(true)
          Sethigher(false)
        }
        else{
          Sethigher(true)
          Setsohigher(false)
        }
        Setsolower(false)
        Setlower(false)
        SetPerfect(false)
        Settoobig(false)
        Setempty(false)
      }
      else if (randomNumber<value){
        Setries()
        if((Math.abs(randomNumber-value)<=10)){
          Setsolower(true)
          Setlower(false)
        }
        else{
          Setlower(true)
          Setsolower(false)

        }
        Setsohigher(false)
        SetPerfect(false)
        Sethigher(false)
        Settoobig(false)
        Setempty(false)
      }
}
function limittries(){
    if (tries<10 && hit){
      return check()
    }
    else{
      return Setlimit(true)
    }
}
function TextReset(){
  limittries()
  rest.current?.clear()
  Setvalue(-1)
}
return (
  <ImageBackground source={{uri: "https://i.top4top.io/p_3338uctba1.jpg"}} style={{width: '100%', height: '100%'}} blurRadius={1}>
    <View style={styles.container}>
      <View style={styles.divstyle}></View>

      <View style={styles.box1}>
      <ImageBackground source={{uri: "https://j.top4top.io/p_3338gj9ws1.jpg"}} style={{width: '100%', height: '100%'}} blurRadius={2} borderRadius={60}>

        <Text style={styles.text1}>Enter your guess between 0 and 99:</Text>
        <View style={styles.inbutbox}>
          <TextInput style={styles.input}
            placeholder="Enter your guess"
            placeholderTextColor="gray"
            keyboardType="numeric"
            ref={rest}
            onChangeText={(text) => {
              console.log(text);
              Setvalue(Number(text));
            }}
            >
          </TextInput>
          <View style={styles.bottom1}>
          <Button title="CHECK" onPress={TextReset} />
          </View>        
        </View>
        </ImageBackground>

      </View>
      <View style={styles.divstyle}></View>

      <View style={styles.box2}>
      <Text style={styles.text2}>Your guesses: {tries} ,Remain {10-tries}</Text>
      </View>

      <View style={styles.divstyle}></View>

      <View style={styles.box3}>

      <ImageBackground source={{uri: "https://f.top4top.io/p_3341ulscq1.jpg"}} style={{width: '100%', height: '100%'}} blurRadius={3} borderRadius={60}>

      <Text style={styles.text3}>{
      perfect ? "Got It!🎉 Perfect Guess. \n"+ `The Number was ✨${randomNumber}✨.` 
      : limit ? `You Have Reached The Limit Of 10 Tries.🤯\nThe Number was\n☠️${randomNumber}☠️.`
      : solower ? "Your Guess Is So Close😲\nBut Still High.📈\nTry Going Lower.🥺"
      : sohigher ? "Your Guess Is So Close😲\nBut Still Low.📉\nTry Going Lower.🥺"
      : lower ? "Your Guess Is Too High.📈\nTry Going Lower.🥺"
      : higher? "Your Guess Is Too Low.📉\nTry Going Higher.🥺"
      : empty? "Please Enter A Number 😐"
      : toobig? "Please Enter A Number\nBetween 0 and 99.😔"
      : "Lower OR Higher\n🎮Game🎮"}</Text>

      </ImageBackground>

      </View>

      <View style={styles.divstyle}></View>

      <View style={styles.box4}>
        <View style={styles.bottom2}>      
          <Button title="RESET" onPress={reset}/>
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
  box1: {
    width: "96%",
    height: "42%",
    // backgroundColor: "#FF00FE",
    borderRadius: 5,

  },
  box2: {
    width: "90%",
    height: "3%",
    // backgroundColor: "#2CFEFD",
    borderRadius: 5,
  },
  box3: {
    width: "96%",
    height: "43%",
    // backgroundColor: "#FCFF12",
    borderRadius: 5,
  },
  box4: {
    width: "90%",
    height: "4.5%",
    // backgroundColor: "#2CFEFD",
    borderRadius: 5,
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
  text3:{
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
  text4:{
    fontSize: 20,
    width: "100%",
    height: "100%",
    textAlign: "center",
    textAlignVertical: "center",
    alignContent: "center",
  },
  bottom2:{
    height: "100%",
    width: "17%",
    alignSelf: "center",
  },
  bottom1:{
    height: "100%",
    width: "17%",
    alignSelf: "center",
  },
  input:{
    backgroundColor:"white",
    width: 150,
    height: 35,
    alignSelf: "center",
    textAlign: "left",
    borderBottomLeftRadius: 5,
    borderTopLeftRadius: 5,
  },
  inbutbox:{
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  }
})
