import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable } from 'react-native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  useEffect(() => {
    if (isLogin) {
      navigation.setOptions({ title: 'Login' });
    } else {
      navigation.setOptions({ title: 'Sign Up' });
    }
  }, [isLogin, navigation]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in.
        try {
          await AsyncStorage.setItem('user', JSON.stringify(user));
        } catch (error) {
          console.error('Error saving user data to AsyncStorage:', error);
        }
      } else {
        // User is signed out.
        try {
          await AsyncStorage.removeItem('user');
        } catch (error) {
          console.error('Error removing user data from AsyncStorage:', error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      if (user) {
        await signOut(auth);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigation.replace('Home');
      }
    } catch (error) {
      setErrorMessage('Invalid email or password. Please try again.');
    }
  }

  const handleRegistration = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setSignUpSuccess(true); // Marks sign up as successful
      setEmail(''); // Clears email field
      setPassword(''); // Clears password field
    } catch (error) {
      setErrorMessage('Please enter email and password.');
    }
  }
  
  const handleContinue = () => {
    setSignUpSuccess(false); // Resets sign up success flag
    navigation.replace('Home'); // Navigates to the home screen
  }

  return (
    <View style={styles.appContainer}>
      {signUpSuccess ? (
        <View style={styles.successContainer}>
          <Text style={styles.successMessage}>Sign Up Successful!</Text>
          <Pressable style={styles.continueButton} onPress={handleContinue}>
            <Text style={styles.continueButtonText}>Continue</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.header}>
            <Text style={styles.headerText}>Flood</Text>
            <Text style={[styles.highlight, styles.headerText]}>Buddy</Text>
          </View>
          <View style={styles.authorisation}>
            <Pressable
              style={[styles.authorisationButton, isLogin ? styles.selectedButton : styles.unselectedButton]}
              onPress={() => { setIsLogin(true); setErrorMessage(''); }}
            >
              <Text style={[styles.authorisationButtonText, !isLogin && styles.underline]}>Login</Text>
            </Pressable>
            <Pressable
              style={[styles.authorisationButton, !isLogin ? styles.selectedButton : styles.unselectedButton]}
              onPress={() => { setIsLogin(false); setErrorMessage(''); }}
            >
              <Text style={[styles.authorisationButtonText, isLogin && styles.underline]}>Sign Up</Text>
            </Pressable>
          </View>
          <View style={styles.main}>
            <TextInput
              placeholder='Email'
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize='none'
            />
            <TextInput
              placeholder='Password'
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize='none'
            />
            {errorMessage ? <Text style={styles.errorMessage}>{errorMessage}</Text> : null}
            {isLogin ? (
              <Pressable>
                <Text style={{ color: '#00AEFF', paddingTop: 10 }}>Forgot Password?</Text>
              </Pressable>
            ) : null}
          </View>
          <View style={styles.footer}>
             <Pressable style={styles.footerButton} onPress={isLogin ? handleLogin : handleRegistration}>
                <Text style={styles.footerButtonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
              </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    width: '100%',
    height: '100%',
    padding: 50,
    flexDirection: 'column',
    flex: 1
  },
  header: {
    flexDirection: 'row',
    flex: 2,
    alignContent: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 48,
    fontWeight: 'bold',
    paddingTop: 35,
  },
  authorisation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flex: 1,
  },
  authorisationButton: {
    alignItems: 'center',
    width: '50%',
    height: 35,
    justifyContent: 'center',
  },
  authorisationButtonText: {
    color: 'black',
    fontSize: 27,
    fontWeight: '500',
    justifyContent: 'center',
    alignContent: 'center',
  },
  underline: {
    borderBottomColor: '#00AEFF',
  },
  selectedButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#00AEFF', // Blue color
  },
  unselectedButton: {
    borderBottomWidth: 3,
    borderBottomColor: '#D9D9D9', // Grey color
  },
  main: {
    flexDirection: 'column',
    flex: 6,
  },
  footer: {
    flexDirection: 'row',
    flex: 4,
    justifyContent: 'center',
    alignItems: 'flex-start'
  },
  footerButton: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#00AEFF',
    borderRadius: 100,
    backgroundColor: '#00AEFF',
    height: 50,
    width: 150,
  },
  footerButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 20,
  },
  highlight: {
    color: '#00AEFF',
  },
  input: {
    height: 75,
    padding: 20,
    marginTop: 50,
    backgroundColor: 'lightgrey',
    borderRadius: 5,
  },
  errorMessage: {
    color: 'red',
    paddingTop: 10,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successMessage: {
    color: '#00AEFF',
    fontSize: 30,
    fontWeight: 'bold',
    paddingTop: 10,
  },
  continueButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#00AEFF',
    borderWidth: 2,
    borderColor: '#00AEFF',
    borderRadius: 100,
    height: 50,
    width: 150,
  },
  continueButtonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
