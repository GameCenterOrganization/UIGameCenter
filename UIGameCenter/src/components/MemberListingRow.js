import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

/**
 * @param {object} props
 * @param {object} props.member 
 * @param {string | null} props.userRole 
 * @param {function} props.onAdminAction 
 * @param {function} props.onPressProfile 
 * @param {boolean} props.isCurrentUser
 */
const MemberListingRow = ({ member, onPressProfile, userRole, onAdminAction, isCurrentUser }) => {
    const { username, role, avatarUri, isOnline } = member;
    
    const isSpecialRole = role === 'ADMIN' || role === 'MODERATOR'; 
    const roleColor = role === 'ADMIN' ? COLORS.red : (role === 'MODERATOR' ? COLORS.purple : COLORS.grayText);
    
    const canAdminister = userRole === 'ADMIN' || userRole === 'MODERATOR';

    let showAdminButton = false;
    if (canAdminister && !isCurrentUser) {
        if (userRole === 'ADMIN') {
            showAdminButton = true;
        } else if (userRole === 'MODERATOR' && role === 'MEMBER') {
            showAdminButton = true;
        }
    }


    return (
        <TouchableOpacity style={styles.container} activeOpacity={0.8} onPress={onPressProfile}>
            
            <View style={styles.avatarContainer}>
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
                {isOnline && <View style={styles.onlineIndicator} />}
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.usernameText}>{username} {isCurrentUser && <Text style={{color: COLORS.purple, fontSize: 13}}>(Tú)</Text>}</Text>
                <Text style={[styles.roleText, { color: roleColor, fontWeight: isSpecialRole ? '700' : '500' }]}>{role}</Text>
            </View>

            <View style={styles.actionsContainer}>
                <TouchableOpacity onPress={onPressProfile} style={styles.profileButton}>
                    <Text style={styles.profileButtonText}>Ver perfil</Text>
                </TouchableOpacity>

                {showAdminButton && (
                    <TouchableOpacity 
                        onPress={(e) => { e.stopPropagation(); onAdminAction(member); }} 
                        style={styles.adminButton}
                    >
                        <Ionicons name="ellipsis-vertical" size={24} color={COLORS.grayText} />
                    </TouchableOpacity>
                )}
            </View>

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

    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
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
    
    adminButton: {
        padding: 5,
        marginLeft: 5,
    },
});

export default MemberListingRow;