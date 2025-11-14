import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/UserScreen/LoginScreen/LoginScreen';
import RegisterScreen from '../screens/UserScreen/RegisterScreen/RegisterScreen';
import UserProfileScreen from '../screens/UserScreen/ProfileScreen/UserProfileScreen';
import ProtectedRoute from '../screens/UserScreen/Auth/ProtectedRoute';

import CommunityScreen from '../screens/CommunityScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import GroupDiscoveryScreen from '../screens/GroupDiscoveryScreen';
import GroupDetailView from '../screens/GroupDetailView';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import EditGroupScreen from '../screens/EditGroupScreen';
import GameDetailsScreen from '../components/GameDetailsScreen';

// === EVENTOS ===
import CreateEventScreen from '../screens/CreateEventScreen'; // ← NUEVA PANTALLA
import EventDetailScreen from '../screens/EventDetailScreen';         // ← DETALLE DEL EVENTO

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        
        {/* === AUTENTICACIÓN === */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* === PANTALLAS PÚBLICAS === */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="GroupDiscovery" component={GroupDiscoveryScreen} />

        {/* === GRUPOS === */}
        <Stack.Screen name="GroupDetail" component={GroupDetailView} />
        <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
        <Stack.Screen name="EditGroupScreen" component={EditGroupScreen} />
        <Stack.Screen name="CreateEvent" component={CreateEventScreen} />
        <Stack.Screen name="GameDetails" component={GameDetailsScreen} />
        <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    
        <Stack.Screen name="Profile">
          {props => (
            <ProtectedRoute>
              <UserProfileScreen {...props} />
            </ProtectedRoute>
          )}
        </Stack.Screen>

        <Stack.Screen name="Settings">
          {props => (
            <ProtectedRoute>
              <SettingsScreen {...props} />
            </ProtectedRoute>
          )}
        </Stack.Screen>

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;