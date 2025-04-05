import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { signIn } from '../config';
const Login = () => {
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const signin = async () => {
    try {
      await signIn(mail, password);
      console.log("User signed in successfully");
      router.replace('/home');
    } catch (error) {
      alert("Login failed, please check your email and password");
      console.error("Login failed:", error);
    }
  }
  const reg = () => {
    router.replace('./Register');
  }
  return (
    <View style={styles.fl}>
      <View style={styles.container}>
        <Text style={styles.title}>Sign in</Text>

        <TextInput placeholder="Email Address" style={styles.input} onChangeText={(text) => { setMail(text); }} keyboardType="email-address"/>
        <TextInput placeholder="Password" style={styles.input} secureTextEntry onChangeText={(text) => { setPassword(text);}} />

        <TouchableOpacity style={styles.button} onPress={signin}>
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>
        <View style={styles.semif}>

          <Text style={styles.text}>Don't have an account?</Text>

          <TouchableOpacity style={styles.createButton} onPress={reg}>
            <Text style={styles.createButtonText}>Create One</Text>

          </TouchableOpacity>
        </View>
        {/* <View style={styles.fbl}> */}
        <TouchableOpacity style={styles.button1a} >
          <FontAwesome name='apple' size={30} style={styles.icon}></FontAwesome>

          <Text style={styles.button1text}>Continue With Apple</Text>

        </TouchableOpacity>
        <TouchableOpacity style={styles.button1} >
          <FontAwesome name='google' size={30} style={styles.icon}></FontAwesome>

          <Text style={styles.button1text}>Continue With Google</Text>

        </TouchableOpacity>
        <TouchableOpacity style={styles.button1} >
          <FontAwesome name='facebook' color='white' size={25} style={styles.faceicon}></FontAwesome>

          <Text style={styles.button1text}>Continue With Facebook</Text>

        </TouchableOpacity>
        {/* </View> */}
      </View>
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {

    width: '98%',
    minHeight: Dimensions.get('window').height * 0.8,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 400,
    marginBottom: 20,

    width: '95%',
    alignSelf: 'center',
  },
  input: {
    width: '95%',
    height: 40,
    backgroundColor: 'rgb(226, 226, 226)',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: Dimensions.get('window').height * 0.01,
  },
  button: {
    width: '95%',
    height: 53,
    borderRadius: 100,
    backgroundColor: 'rgb(243, 155, 83)',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Dimensions.get('window').height * 0.01,
  },
  button1: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%',
    height: 53,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    backgroundColor: 'rgb(236, 235, 235)',
    position: 'relative',

    marginTop: Dimensions.get('window').height * 0.01,

  },
  button1a: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '95%',
    height: 53,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    backgroundColor: 'rgb(236, 235, 235)',
    position: 'relative',

    marginTop: Dimensions.get('window').height * 0.06,

  },
  button1text: {
    color: 'black',
    fontWeight: 'bold',
  },
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  text: {
    marginTop: Dimensions.get('window').height * 0.02,
  },
  createButton: {
    marginTop: Dimensions.get('window').height * 0.02,
  },
  createButtonText: {
    fontWeight: 'bold',
    color: 'black',
  },
  semif: {
    width: '95%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginTop: Dimensions.get('window').height * 0.005,

  },
  fl: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    position: 'absolute',
    left: '3%',
  },
  faceicon: {
    position: 'absolute',
    left: '3%',

    borderRadius: 50,
    width: 35,
    height: 35,
    backgroundColor: 'rgb(24, 119, 242)',

    textAlign: 'center',
    textAlignVertical: 'center',

  },



});
