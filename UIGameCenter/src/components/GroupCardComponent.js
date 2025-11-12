import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const BASE_URL = "http://192.168.0.6:8080";
const JOIN_API_URL = `${BASE_URL}/api/group`;

const getFirebaseToken = async () => {
    try {
        const user = getAuth().currentUser;
        if (user) {
            return await user.getIdToken();
        }
        return null;
    } catch (error) {
        console.error("Error al obtener el token de Firebase:", error);
        return null;
    }
};

const GroupCardComponent = ({ group, onPress, onJoinSuccess }) => {
    const { id, title, subtitle, members, imageUri, isTrending, isStreamer, isLive, liveSpectators, isMember } = group;

    const handleJoinGroup = async () => {
        try {
            const token = await getFirebaseToken(); 
            if (!token) {
                Alert.alert('Error', 'No se pudo verificar tu identidad. Por favor, reinicia la aplicación.');
                return;
            }

            const response = await axios.post(
                `${JOIN_API_URL}/${id}/join`, 
                {}, 
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200 || response.status === 201) {
                if (onJoinSuccess) {
                    onJoinSuccess(group);
                }
            }
        } catch (error) {
            console.log('Error al unirse al grupo:', error.response?.data || error.message);
            
            if (error.response?.status === 409) {
                Alert.alert('Aviso', 'Ya eres miembro de este grupo.');
            } else {
                Alert.alert('Error', error.response?.data?.error || 'No se pudo unir al grupo. Inténtalo de nuevo.');
            }
        }
    };

    return (
        <TouchableOpacity style={styles.cardContainer} onPress={onPress}>
            <View style={styles.bannerContainer}>
                <Image
                    source={{ uri: imageUri }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                />

                {isStreamer && isLive && (
                    <View style={styles.liveBadge}>
                        <Text style={styles.liveBadgeText}>EN VIVO • {liveSpectators}</Text>
                    </View>
                )}

                {isTrending && (
                    <View style={styles.trendingBadge}>
                        <Ionicons name="trending-up" size={12} color={COLORS.purple} />
                        <Text style={styles.trendingBadgeText}>Trending</Text>
                    </View>
                )}
            </View>

            <View style={styles.contentContainer}>
                <Text style={styles.titleText}>{title}</Text>
                <Text style={styles.subtitleText}>{subtitle}</Text>

                <View style={styles.membersRow}>
                    <Ionicons name="people-outline" size={16} color={COLORS.grayText} />
                    <Text style={styles.membersText}>{members} miembros</Text>
                </View>

                {!isMember ? (
                    <TouchableOpacity 
                        style={styles.joinButton} 
                        onPress={(e) => {
                            e.stopPropagation();
                            handleJoinGroup();
                        }}
                    >
                        <Text style={styles.joinButtonText}>Unirme</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.memberBadge}>
                        <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                        <Text style={styles.memberBadgeText}>Miembro</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: '48%',
        marginBottom: 16,
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 10,
        overflow: 'hidden',
    },
    bannerContainer: {
        height: 100,
        backgroundColor: COLORS.inputBackground,
        position: 'relative',
    },
    bannerImage: {
        ...StyleSheet.absoluteFillObject,
    },
    liveBadge: {
        position: 'absolute',
        top: 8,
        left: 8,
        backgroundColor: COLORS.red,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    liveBadgeText: {
        color: COLORS.white,
        fontSize: 10,
        fontWeight: '700',
    },
    trendingBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 4,
    },
    trendingBadgeText: {
        color: COLORS.purple,
        fontSize: 10,
        fontWeight: '700',
        marginLeft: 4,
    },
    contentContainer: {
        padding: 10,
        minHeight: 120,
        position: 'relative',
    },
    titleText: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: '700',
    },
    subtitleText: {
        color: COLORS.grayText,
        fontSize: 12,
        marginBottom: 10,
    },
    membersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 'auto',
    },
    membersText: {
        color: COLORS.grayText,
        fontSize: 12,
        marginLeft: 4,
    },
    joinButton: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: COLORS.purple,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    joinButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 12,
    },
    memberBadge: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: COLORS.green,
    },
    memberBadgeText: {
        color: COLORS.green,
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 4,
    },
});

export default GroupCardComponent;