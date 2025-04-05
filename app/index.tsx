import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter, Stack } from 'expo-router';

const WelcomeScreen = () => {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      return router.push('./Login'); // Ensure the route matches the defined path
    }, 5000);

    return () => clearTimeout(timer);
  }, []);


  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.content}>
          <Image source={require('../assets/images/pngwing.com.png')} style={styles.logo} />
          <Text style={styles.title}>SUPERMALL</Text>
        </View>


      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAE5D3',
    paddingHorizontal: 20,
  },
  content: {
    bottom: 50,
    alignItems: 'center',
  },
  title: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#4A3222',
    marginTop: 1,
  },
  logo: {
    width: 90,
    height: 100,
    resizeMode: 'contain',
  }
});

export default WelcomeScreen;

