import { Dimensions, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useRouter } from 'expo-router';

const ForgetPass = () => {
  const router = useRouter();

  const back = () => {
    router.replace('./Register');
  }
  return (
    <View style={styles.fl}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backbut} onPress={back}>
          <Text style={{ textAlign: "center" }}>&lt;</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Forgot Password</Text>
        <TextInput placeholder="Email Address" style={styles.input} />
        <TouchableOpacity style={styles.button} >
          <Text style={styles.buttonText}>continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ForgetPass
const styles = StyleSheet.create({
  container: {
    width: '98%',
    minHeight: Dimensions.get('window').height * 0.3,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
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
  input: {
    width: '95%',
    height: 40,
    backgroundColor: 'rgb(226, 226, 226)',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: Dimensions.get('window').height * 0.01,

  },
  title: {
    fontSize: 30,
    fontWeight: 400,
    marginBottom: Dimensions.get('window').height * 0.02,

    width: '95%',
    alignSelf: 'center',
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
})


