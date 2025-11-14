import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/screens/UserScreen/Auth/AuthContext';
import FlashMessage from 'react-native-flash-message';

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
      <FlashMessage position="top" />
    </AuthProvider>
  );
}