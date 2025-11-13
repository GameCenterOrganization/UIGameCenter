import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
  Modal,
} from 'react-native';
import { useAuth } from '../screens/UserScreen/Auth/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Header = ({ activeTab = 'Búsqueda', searchText, onSearchChange, onClearSearch }) => {
  const navigation = useNavigation();
  const { logout, currentUser } = useAuth(); 
  const [localSearchText, setLocalSearchText] = useState(searchText || '');
  const [menuVisible, setMenuVisible] = useState(false);
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 800; 

  const tabs = [
    { id: 'search', name: 'Búsqueda' },
    { id: 'marketplace', name: 'Marketplace' },
    { id: 'comunidad', name: 'Comunidad' },
  ];

  const handleTabPress = (tabId) => {
    setMenuVisible(false);
    if (tabId === 'comunidad') navigation.navigate('Community');
    if (tabId === 'search') navigation.navigate('Home');
  };

  const handleAccountPress = () => {
    setMenuVisible(false); 
    if (!currentUser) navigation.navigate('Login');
    else navigation.navigate('Profile');
  };

  const handleLogout = async () => {
    setMenuVisible(false); 
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      console.error("Error al cerrar sesión:", e);
    }
  };

  return (
    <View style={[styles.header, isLargeScreen ? styles.headerLarge : styles.headerMobile]}>
      
      <View style={styles.leftSection}>
        {!isLargeScreen && (
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.menuButton}>
            <Ionicons name="menu" size={26} color="white" />
          </TouchableOpacity>
        )}
        <Text style={styles.logo}>GameCenter</Text>
      </View>

      {isLargeScreen && (
        <View style={styles.headerTabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.name && styles.activeTab]}
              onPress={() => handleTabPress(tab.id)}
            >
              <Text style={[styles.tabText, activeTab === tab.name && styles.activeTabText]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.headerRight}>
        
        {isLargeScreen && (
          <View style={styles.searchContainer}>
            <TextInput
              style={[styles.searchInput, styles.searchLarge]}
              placeholder="Buscar juegos..."
              placeholderTextColor="#888"
              value={localSearchText}
              onChangeText={(text) => {
                setLocalSearchText(text);
                onSearchChange && onSearchChange(text);
              }}
            />
            {localSearchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setLocalSearchText('');
                  onClearSearch && onClearSearch();
                }}
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        
        <TouchableOpacity style={styles.accountButton} onPress={handleAccountPress}>
          <Text style={styles.accountText}>Mi Cuenta</Text>
        </TouchableOpacity>

        {currentUser && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={menuVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
          activeOpacity={1}
        >
          <View style={styles.modalContent}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={styles.modalItem}
                onPress={() => handleTabPress(tab.id)}
              >
                <Text style={styles.modalText}>{tab.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#0f121f',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerLarge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerMobile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 40,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    marginRight: 6,
  },
  logo: {
    color: '#8b5cf6', 
    fontSize: 20,
    fontWeight: 'bold',
  },

  headerTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#1a1c2c',
  },
  activeTab: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
    fontWeight: 'bold',
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  searchContainer: {
    position: 'relative',
    marginRight: 8, 
  },
  searchInput: {
    backgroundColor: '#2a2a3e',
    color: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  searchLarge: {
    width: 180,
    fontSize: 13,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 6,
  },
  clearButtonText: {
    color: '#bbb',
    fontSize: 13,
  },
  
  accountButton: {
    paddingHorizontal: 0, 
    marginHorizontal: 4, 
  },
  accountText: {
    color: 'white',
    fontSize: 13,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8, 
  },
  logoutText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    paddingTop: 60, 
  },
  modalContent: {
    backgroundColor: '#1a1c2c',
    marginHorizontal: 30,
    borderRadius: 10,
    paddingVertical: 10,
    alignSelf: 'flex-start', 
    minWidth: 150,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  modalText: {
    color: 'white',
    fontSize: 16,
  },
});

export default Header;