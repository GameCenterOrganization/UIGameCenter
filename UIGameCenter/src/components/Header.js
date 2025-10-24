import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const MAX_HEADER_WIDTH = 1400;

const Header = ({ activeTab = 'Search', onTabPress }) => {
  const tabs = [
    { id: 'search', name: 'Search', icon: '🔍' },
    { id: 'comparison', name: 'Comparison', icon: '📈' },
    { id: 'marketplace', name: 'Marketplace', icon: '🛒' },
    { id: 'community', name: 'Community', icon: '💬' },
  ];

  const handleTabPress = (tabId) => {
    if (onTabPress) {
        onTabPress(tabId);
    } else if (tabId === 'search') {

      return; 
    } else {
      Alert.alert('Coming Soon', `The ${tabId} section will be available shortly.`);
    }
};

  const handleAccountPress = () => {
    Alert.alert('My Account', 'Account functionality coming soon.');
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        {/* Left - Logo and Tabs */}
        <View style={styles.headerLeft}>
          <Text style={styles.logo}>
            <Text style={styles.logoIcon}>🎮</Text> GameCenter 
          </Text>
          {/* Main Tabs*/}
          <View style={styles.headerTabs}>
            {tabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  activeTab.toLowerCase() === tab.name.toLowerCase() && styles.activeTab
                ]}
                onPress={() => handleTabPress(tab.id)}
              >
                <Text style={[
                  styles.tabText,
                  activeTab.toLowerCase() === tab.name.toLowerCase() && styles.activeTabText
                ]}>
                  {tab.icon} {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.headerRight}>
          {/* Small Search Bar in the Header*/}
          <View style={styles.headerSearch}>
            <Text style={styles.headerSearchIcon}>🔍</Text>
            <TextInput
              style={styles.headerSearchInput}
              placeholder="Search games..."
              placeholderTextColor="#777"
              editable={false} 
            />
          </View>

          <TouchableOpacity 
            style={styles.accountButton}
            onPress={handleAccountPress}
          >
            <Text style={styles.accountText}>👤 My Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#11121c',
    borderBottomWidth: 1,
    borderBottomColor: '#1a1b2c',
    width: '100%',
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: MAX_HEADER_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: 32,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    color: '#8b5cf6',
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 30, 
  },
  logoIcon: {
    fontSize: 24,
  },
  headerTabs: {
    flexDirection: 'row',
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    transitionDuration: '0.2s',
  },
  activeTab: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)', 
    borderColor: '#8b5cf6',
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
    justifyContent: 'flex-end',
  },
  headerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1b2c',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 180, 
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#3a3a4e',
  },
  headerSearchIcon: {
    color: '#777',
    fontSize: 12,
    marginRight: 4,
  },
  headerSearchInput: {
    color: '#ccc',
    fontSize: 12,
    padding: 0,
    flex: 1,
  },
  accountButton: {
    paddingHorizontal: 8,
  },
  accountText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',},
});

export default Header;