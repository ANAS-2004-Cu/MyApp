import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { register } from '../config';


const Register = () => {
  const [Username, setUsername] = useState("");
  const [mail, setMail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const back = () => {
    router.replace('./Login');
  }

  const reg = async () => {
    try {
      await register(mail, password);
      alert("User registered successfully,Please login");
      console.log("User registered successfully");
      router.replace('/Login');
    } catch (error) {
      alert("Registration failed, please check your email and password");
      console.error("Registration failed:", error);
    }
  }

  const reset = () => {
    router.replace('./ForgetPass');

  }
  return (
    <View style={styles.fl}>

      <View style={styles.container}>
        <TouchableOpacity style={styles.backbut} onPress={back}>
          <Text style={{ textAlign: "center" }}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
        <TextInput placeholder="Username" style={styles.input} onChangeText={(text) => { setUsername(text) }} />
        <TextInput placeholder="Email Address" style={styles.input} keyboardType="email-address" onChangeText={(text) => { setMail(text) }} />
        <TextInput placeholder="Password" style={styles.input} secureTextEntry onChangeText={(text) => { setPassword(text) }} />

        <TouchableOpacity style={styles.button} onPress={reg} >
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
        <View style={styles.semif}>

          <Text style={styles.text}>Forgot Password?</Text>

          <TouchableOpacity style={styles.createButton} onPress={reset}>
            <Text style={styles.createButtonText}>Reset</Text>

          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

export default Register;

const styles = StyleSheet.create({
  container: {
    width: '98%',
    minHeight: Dimensions.get('window').height * 0.5,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: 400,
    marginBottom: Dimensions.get('window').height * 0.02,


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
  buttonText: {
    color: 'black',
    fontWeight: 'bold',
  },
  text: {
    marginTop: Dimensions.get('window').height * 0.015,
  },
  createButton: {
    marginTop: Dimensions.get('window').height * 0.015,
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
    marginTop: Dimensions.get('window').height * 0.01,
  },
  backbut: {
    paddingTop: 5,
    marginLeft: '2.5%',
    alignSelf: "flex-start",
    width: 30,
    height: 30,
    borderRadius: 50,
    backgroundColor: 'rgb(231, 227, 227)',
  },
  fl: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
  },

});
