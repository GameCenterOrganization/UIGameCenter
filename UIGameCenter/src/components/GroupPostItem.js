import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

const mockPost = {
    userAvatarUri: 'https://picsum.photos/50/50?random=user1',
    username: 'GamerPro123',
    time: 'Hace 2 horas',
    content: '¿Alguien para ranked? Necesitamos 2 más para el equipo. Nivel Platino o superior.',
    likes: 24,
    comments: 8,
    shares: 2,
};

const GroupPostItem = ({ post = mockPost, onPress }) => {
    const { userAvatarUri, username, time, content, likes, comments, shares } = post;

    return (
        <View style={styles.cardContainer}>

            <View style={styles.postHeader}>
                <Image source={{ uri: userAvatarUri }} style={styles.avatar} />
                <View style={styles.userInfo}>
                    <Text style={styles.usernameText}>{username}</Text>
                    <Text style={styles.timeText}>{time}</Text>
                </View>
                <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={20} color={COLORS.grayText} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onPress} style={styles.postBody}>
                <Text style={styles.contentText}>{content}</Text>
            </TouchableOpacity>


            <View style={styles.postFooter}>

                <TouchableOpacity style={styles.interactionButton}>
                    <Ionicons name="thumbs-up-outline" size={18} color={COLORS.grayText} />
                    <Text style={styles.interactionText}>{likes}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.interactionButton}>
                    <Ionicons name="chatbubble-outline" size={18} color={COLORS.grayText} />
                    <Text style={styles.interactionText}>{comments}</Text>
                </TouchableOpacity>
  
                <TouchableOpacity style={styles.interactionButton}>
                    <Ionicons name="share-social-outline" size={18} color={COLORS.grayText} />
                    <Text style={styles.interactionText}>{shares}</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        backgroundColor: COLORS.darkerBackground, 
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
    },
    
    // --- Header ---
    postHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.purple, 
    },
    userInfo: {
        flex: 1,
        marginLeft: 10,
    },
    usernameText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
    timeText: {
        color: COLORS.grayText,
        fontSize: 12,
    },

    postBody: {
        paddingVertical: 5,
    },
    contentText: {
        color: COLORS.white,
        fontSize: 15,
        lineHeight: 20,
    },

    // --- Footer
    postFooter: {
        flexDirection: 'row',
        marginTop: 15,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.inputBackground, 
    },
    interactionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    interactionText: {
        color: COLORS.grayText,
        fontSize: 13,
        marginLeft: 6,
    },
});

export default GroupPostItem;