import React from 'react';
import { useAuth } from './AuthContext';

import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function ProtectedRoute({ children, navigation }) {
  const { currentUser } = useAuth();

  React.useEffect(() => {
    if (!currentUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  }, [currentUser, navigation]);

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9b7aff" />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f1220',
  },
});