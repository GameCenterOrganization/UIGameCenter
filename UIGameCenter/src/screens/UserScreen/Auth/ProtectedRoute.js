// src/screens/UserScreen/Auth/ProtectedRoute.js
import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const navigation = useNavigation();

  // 🔹 Mientras carga el estado de Firebase
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#9b7aff" />
      </View>
    );
  }

  // 🔹 Si no hay usuario → mandar al Login
  useEffect(() => {
    if (!currentUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [currentUser, navigation]);

  // 🔹 Usuario autenticado → renderizamos hijos
  if (!currentUser) {
    return null; // mientras hace el reset
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
