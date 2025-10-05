import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

const { width } = Dimensions.get('window'); 

const PostCard = ({ post, onPress }) => {
    const { gameLogo, gameName, title, description, imageUrl, author, time, likes, comments, isTrending } = post;

    return (
        <TouchableOpacity onPress={() => onPress(post)} style={styles.card}>
            <View style={styles.header}>
                <View style={styles.gameInfo}>
                    {/* Placeholder para Logo del juego */}
                    <View style={styles.gameLogoPlaceholder}>
                        <Text style={styles.gameLogoText}>{gameName.substring(0, 1)}</Text>
                    </View>
                    <Text style={styles.gameName}>{gameName}</Text>
                </View>
                {isTrending && (
                    <View style={styles.trendingTag}>
                        <Text style={styles.trendingText}>✨ Tendencia</Text>
                    </View>
                )}
            </View>
            
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description} numberOfLines={2}>{description}</Text>
            
          
            <Image source={{ uri: imageUrl }} style={styles.mainImage} resizeMode="cover" />

            <View style={styles.footer}>
                <View style={styles.authorInfo}>
                 
                    <View style={styles.authorAvatar} />
                    <Text style={styles.authorName}>{author}</Text>
                    <Text style={styles.time}>· {time}</Text>
                </View>
                <View style={styles.interactions}>
                    <Ionicons name="heart-outline" size={16} color={COLORS.grayText} />
                    <Text style={styles.interactionCount}>{likes}</Text>
                    <Ionicons name="chatbubble-outline" size={16} color={COLORS.grayText} style={{ marginLeft: 15 }} />
                    <Text style={styles.interactionCount}>{comments}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 10,
        padding: 15,
        marginBottom: 16,
        width: '100%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5.46,
        elevation: 9,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    gameInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gameLogoPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 5,
        marginRight: 8,
        backgroundColor: COLORS.purple,
        justifyContent: 'center',
        alignItems: 'center',
    },
    gameLogoText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    gameName: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    trendingTag: {
        backgroundColor: COLORS.purple,
        borderRadius: 15,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    trendingText: {
        color: COLORS.white,
        fontSize: 11,
        fontWeight: 'bold',
    },
    title: {
        color: COLORS.white,
        fontSize: width < 768 ? 18 : 20, 
        fontWeight: 'bold',
        marginBottom: 5,
    },
    description: {
        color: COLORS.grayText,
        fontSize: 14,
        marginBottom: 10,
    },
    mainImage: {
        width: '100%',
        height: width < 768 ? 180 : 250,
        borderRadius: 8,
        marginBottom: 10,
        backgroundColor: COLORS.inputBackground,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.grayText, 
        marginRight: 8,
    },
    authorName: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: 'bold',
        marginRight: 4,
    },
    time: {
        color: COLORS.grayText,
        fontSize: 12,
    },
    interactions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    interactionCount: {
        color: COLORS.grayText,
        fontSize: 12,
        marginLeft: 4,
    }
});

export default PostCard;