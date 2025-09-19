import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '../screens/UserScreen/Auth/AuthContext';


const HomeScreen = ({ navigation }) => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
     navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pantalla de Inicio</Text>
      <Text>Bienvenido, {currentUser?.email}</Text>

      <Button
        title="Ir a Perfil"
        onPress={() => navigation.navigate('Profile')}
      />
      <Button
        title="Ir a Configuración"
        onPress={() => navigation.navigate('Settings')}
      />
      
     
      <Button title="Cerrar Sesión" onPress={handleLogout} color="#ff3b30" />
      
    </View>
   
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default HomeScreen;