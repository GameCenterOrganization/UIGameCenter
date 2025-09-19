import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/UserScreen/LoginScreen/LoginScreen';
import RegisterScreen from '../screens/UserScreen/RegisterScreen/RegisterScreen';
import UserProfileScreen from '../screens/UserScreen/ProfileScreen/UserProfileScreen';
import ProtectedRoute from '../screens/UserScreen/Auth/ProtectedRoute';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Settings">
          {props => (
            <ProtectedRoute component={SettingsScreen} navigation={props.navigation} {...props} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Profile">
          {props => (
            <ProtectedRoute component={UserProfileScreen} navigation={props.navigation} {...props} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
