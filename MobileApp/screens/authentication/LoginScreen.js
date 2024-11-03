import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, SafeAreaView, StatusBar, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: initialWidth, height: initialHeight } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [screenWidth, setScreenWidth] = useState(initialWidth);
  const [screenHeight, setScreenHeight] = useState(initialHeight);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window: { width, height } }) => {
      setScreenWidth(width);
      setScreenHeight(height);
    });

    return () => subscription?.remove();
  }, []);

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.1.13:8080/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorResponse = await response.text();
        throw new Error('Login failed. Please check your username and password.');
      }

      const data = await response.json();

      let token = response.headers.get('Authorization');
      if (!token && data.token) {
        token = data.token;
      }

      if (!token) {
        Alert.alert('Error', 'Token not found in response.');
        return;
      }

      const rawToken = token.replace('Bearer ', '');

      await AsyncStorage.setItem('authToken', rawToken);

      const userId = data.userId || '';
      let userType = '';

      if (data.role === 'ROLE_MISSTAFF') userType = 'misStaff';
      else if (data.role === 'ROLE_STUDENT') userType = 'student';
      else if (data.role === 'ROLE_EMPLOYEE') userType = 'employee';

      if (userId) await AsyncStorage.setItem('userId', userId);
      if (userType) await AsyncStorage.setItem('userType', userType);

      Alert.alert('Login Successful', 'Welcome!');
      navigation.navigate('Home', { token: rawToken, user: data });
    } catch (error) {
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem('userType');
      await AsyncStorage.removeItem('authToken');
      Alert.alert('Error', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />
      <ImageBackground
        source={require('../../../MobileApp/assets/login.png')}
        style={[styles.background, { width: screenWidth, height: screenHeight }]}
        resizeMode="cover"
      >
        <View style={styles.topBox}>
          <Image source={require('../../assets/loge_new 2.png')} style={styles.logo} />
        </View>

        <View style={styles.container}>
          <View style={styles.loginBox}>
            <Text style={styles.title}>Login</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholderTextColor="#888"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('RegisterFlow')}>
              <Text style={styles.registerLink}>Don't have an account? Click here</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  background: {
    justifyContent: 'center',
    marginTop: 40,
  },
  topBox: {
    position: 'absolute',
    top: 1,
    left: 0,
    right: 0,
    height: initialHeight * 0.07,
    backgroundColor: '#0C356A',
    zIndex: 1000,
  },
  logo: {
    width: initialWidth * 0.5,
    height: '100%',
    marginLeft: 10,
    resizeMode: 'contain',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '5%',
    paddingVertical: '10%',
  },
  loginBox: {
    width: '90%',
    padding: '5%',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
  },
  title: {
    fontSize: initialWidth > 400 ? 28 : 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  forgotText: {
    color: '#007bff',
    fontSize: initialWidth > 400 ? 16 : 14,
    marginBottom: 20,
    marginLeft: 130,
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    color: '#007bff',
    fontSize: 14,
  },
});

export default LoginScreen;