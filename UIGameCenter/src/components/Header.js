import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useAuth } from '../screens/UserScreen/Auth/AuthContext';
import { useNavigation } from '@react-navigation/native';

const Header = ({ activeTab = 'Búsqueda', searchText, onSearchChange, onClearSearch }) => {
  const navigation = useNavigation();
  const { logout, currentUser } = useAuth();
  const [localSearchText, setLocalSearchText] = useState(searchText || '');

  const tabs = [
    { id: 'search', name: 'Búsqueda', icon: '' },
    { id: 'comparador', name: 'Comparador', icon: '' },
    { id: 'marketplace', name: 'Marketplace', icon: '' },
    { id: 'comunidad', name: 'Comunidad', icon: '' },
  ];

  const handleTabPress = (tabId) => {
    if (tabId === 'search') return;
    Alert.alert('Próximamente', `La sección ${tabId} estará disponible pronto.`);
  };

  const handleAccountPress = () => {
    if (!currentUser) {
      navigation.navigate('Login');
    } else {
      navigation.navigate('Profile');
    }
  };

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
    <View style={styles.header}>
      {/* Logo */}
      <View style={styles.headerLeft}>
        <Text style={styles.logo}>🎮 GameCenter</Text>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.headerTabs}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.name && styles.activeTab
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab.name && styles.activeTabText
            ]}>
              {tab.icon} {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Right side - Search, Account & Logout */}
      <View style={styles.headerRight}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar juegos..."
          placeholderTextColor="#888"
          value={localSearchText}
          onChangeText={(text) => {
            setLocalSearchText(text);
            onSearchChange && onSearchChange(text);
          }}
        />
        {localSearchText.length > 0 && (
          <TouchableOpacity onPress={() => {
            setLocalSearchText('');
            onClearSearch && onClearSearch();
          }}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity 
          style={styles.accountButton}
          onPress={handleAccountPress}
        >
          <Text style={styles.accountText}>👤 Mi Cuenta</Text>
        </TouchableOpacity>
        {currentUser && (
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  headerLeft: {
    flex: 1,
  },
  logo: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTabs: {
    flexDirection: 'row',
    flex: 2,
    justifyContent: 'center',
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
  },
  searchInput: {
    backgroundColor: '#2a2a3e',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    width: 150,
    fontSize: 12,
  },
  clearButtonText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  accountButton: {
    paddingHorizontal: 8,
  },
  accountText: {
    color: 'white',
    fontSize: 12,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default Header;
