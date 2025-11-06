// src/components/MemberListingRow.js
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

const MemberListingRow = ({ member, onPressProfile }) => {
    const { username, role, avatarUri, isOnline } = member;
    const isSpecialRole = role === 'Admin' || role === 'Moderador';
    const roleColor = isSpecialRole ? COLORS.purple : COLORS.grayText;

    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.8}>
            
            <View style={styles.avatarContainer}>
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
                {isOnline && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.usernameText}>{username}</Text>
                <Text style={[styles.roleText, { color: roleColor }]}>{role}</Text>
            </View>

            <TouchableOpacity onPress={onPressProfile} style={styles.profileButton}>
                <Text style={styles.profileButtonText}>Ver perfil</Text>
            </TouchableOpacity>

        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 5,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBackground,
        backgroundColor: COLORS.darkBackground,
    },
    
    // --- Avatar ---
    avatarContainer: {
        position: 'relative',
        marginRight: 10,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.darkerBackground, 
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#4cd964', 
        borderWidth: 2,
        borderColor: COLORS.darkBackground,
    },
    
    // --- Info ---
    infoContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    usernameText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 15,
    },
    roleText: {
        fontSize: 12,
        marginTop: 2,
    },

    profileButton: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    profileButtonText: {
        color: COLORS.purple, 
        fontWeight: '700',
        fontSize: 13,
    },
});

export default MemberListingRow;