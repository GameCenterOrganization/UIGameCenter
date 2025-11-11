import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

const GroupCardComponent = ({ group, onPress }) => {
    const { title, subtitle, members, imageUri, isTrending, isStreamer, isLive, liveSpectators } = group;

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


                <TouchableOpacity style={styles.joinButton}>
                    <Text style={styles.joinButtonText}>Unirme</Text>
                </TouchableOpacity>
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

    // --- Banner y Badges ---
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
});

export default GroupCardComponent;