import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import { MapScreen } from './screens/MapScreen.js';
import { AuthScreen } from './screens/AuthScreen.js';
import { LogBox } from 'react-native';

const Stack = createNativeStackNavigator();
LogBox.ignoreAllLogs();

const MyStack = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Login" component={AuthScreen}options = {{headerShown: false}}></Stack.Screen>
        <Stack.Screen name="Home"  component={MapScreen} options = {{headerShown: false}}></Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  )
}
export default function App() {
  


  return (
    <MyStack></MyStack>
  );
}