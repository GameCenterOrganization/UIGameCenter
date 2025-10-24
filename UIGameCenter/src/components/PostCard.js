import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';
const CARD_PADDING = width < 768 ? 40 : 100;
const CARD_INNER_PADDING = 30;
const IMAGE_WIDTH = width - CARD_PADDING - CARD_INNER_PADDING;
const IMAGE_HEIGHT = width < 768 ? 200 : 300;

const PostCard = ({ post, onPress, currentUser, onDelete }) => {
  const { 
    POST_TITLE_DSC, 
    POST_CONTENT_DSC, 
    GAME_TITLE_DSC, 
    user, 
    images, 
    POST_DATE,
    commentCount,
    ID_POST
  } = post;


  const isOwner = currentUser && (
    user?.UID_FIREBASE === currentUser.uid ||
    user?.EMAIL_DSC?.toLowerCase() === currentUser.email?.toLowerCase()
  );

  const imageList = images && images.length > 0 ? images.slice(0, 5).map(img => img.IMG_URL) : [];
  const scrollViewRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const postDate = new Date(dateString);
    const now = new Date();
    const diffMs = now - postDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;

    return postDate.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: postDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const handleScroll = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / IMAGE_WIDTH);
    setCurrentIndex(index);
  };

  const scrollToIndex = (index) => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: index * IMAGE_WIDTH,
        animated: true,
      });
      setCurrentIndex(index);
    }
  };

  return (
    <TouchableOpacity onPress={() => onPress(post)} style={styles.card} activeOpacity={0.95}>
      <View style={styles.header}>
        <View style={styles.gameInfo}>
          <View style={styles.gameLogoPlaceholder}>
            <Text style={styles.gameLogoText}>{(GAME_TITLE_DSC || "G")[0]}</Text>
          </View>
          <Text style={styles.gameName}>{GAME_TITLE_DSC || "Juego"}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {POST_DATE && <Text style={styles.dateText}>{formatDate(POST_DATE)}</Text>}
          {isOwner && (
            <TouchableOpacity onPress={() => onDelete(ID_POST)} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={22} color={COLORS.red} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.title}>{POST_TITLE_DSC}</Text>
      <Text style={styles.description} numberOfLines={2}>{POST_CONTENT_DSC}</Text>

      {imageList.length > 0 && (
        <View style={styles.imageContainer}>
          {isWeb && imageList.length > 1 && currentIndex > 0 && (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonLeft]}
              onPress={() => scrollToIndex(currentIndex - 1)}>
              <Ionicons name="chevron-back" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}
          
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={IMAGE_WIDTH}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            style={styles.imageScrollView}>
            {imageList.map((uri, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: `http://localhost:8080${uri}` }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              </View>
            ))}
          </ScrollView>

          {isWeb && imageList.length > 1 && currentIndex < imageList.length - 1 && (
            <TouchableOpacity 
              style={[styles.navButton, styles.navButtonRight]}
              onPress={() => scrollToIndex(currentIndex + 1)}>
              <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
            </TouchableOpacity>
          )}

          {imageList.length > 1 && (
            <View style={styles.imageDots}>
              {imageList.map((_, index) => (
                <View 
                  key={index} 
                  style={[styles.dot, currentIndex === index && styles.activeDot]} 
                />
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.authorInfo}>
          {user?.PROFILE_PIC ? (
            <Image source={{ uri: `http://localhost:8080${user.PROFILE_PIC}` }} style={styles.authorAvatar} />
          ) : (
            <View style={styles.authorAvatar} />
          )}
          <Text style={styles.authorName}>{user?.USERNAME_DSC || "Anónimo"}</Text>
        </View>
        <View style={styles.interactions}>
          <Ionicons name="heart-outline" size={16} color={COLORS.grayText} />
          <Text style={styles.interactionCount}>0</Text>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.grayText} style={{ marginLeft: 15 }} />
          <Text style={styles.interactionCount}>{commentCount || 0}</Text>
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
    marginBottom: 10 
  },
  deleteButton: { marginLeft: 10, backgroundColor: 'rgba(255,0,0,0.15)', borderRadius: 6, padding: 4 },
  gameInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  gameLogoPlaceholder: {
    width: 24, height: 24, borderRadius: 5, marginRight: 8,
    backgroundColor: COLORS.purple, justifyContent: 'center', alignItems: 'center',
  },
  gameLogoText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  gameName: { color: COLORS.white, fontSize: 14, fontWeight: 'bold', flex: 1 },
  dateText: { color: COLORS.grayText, fontSize: 12, fontWeight: '500' },
  title: { color: COLORS.white, fontSize: width < 768 ? 18 : 20, fontWeight: 'bold', marginBottom: 5 },
  description: { color: COLORS.grayText, fontSize: 14, marginBottom: 10 },
  imageContainer: { width: '100%', marginBottom: 10, position: 'relative' },
  imageScrollView: { width: '100%', height: IMAGE_HEIGHT },
  imageWrapper: { width: IMAGE_WIDTH, height: IMAGE_HEIGHT },
  mainImage: { width: '100%', height: '100%', borderRadius: 8, backgroundColor: COLORS.inputBackground },
  navButton: {
    position: 'absolute', top: '50%', transform: [{ translateY: -20 }],
    zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)',
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
    ...Platform.select({ web: { cursor: 'pointer' } })
  },
  navButtonLeft: { left: 10 },
  navButtonRight: { right: 10 },
  imageDots: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', position: 'absolute', bottom: 10, left: 0, right: 0 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 3 },
  activeDot: { backgroundColor: 'rgba(255,255,255,0.9)', width: 8, height: 8, borderRadius: 4 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  authorInfo: { flexDirection: 'row', alignItems: 'center' },
  authorAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.grayText, marginRight: 8 },
  authorName: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  interactions: { flexDirection: 'row', alignItems: 'center' },
  interactionCount: { color: COLORS.grayText, fontSize: 12, marginLeft: 4 },
});

export default PostCard;
