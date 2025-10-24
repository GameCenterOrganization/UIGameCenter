import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const navigation = useNavigation();

  
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9b7aff" />
      </View>
    );
  }

  
  useEffect(() => {
    if (!currentUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [currentUser, navigation]);

  
  if (!currentUser) {
    return null; 
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f1220",
  },
});
