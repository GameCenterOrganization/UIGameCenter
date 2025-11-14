import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

const CARD_PADDING = width < 768 ? 16 : 40;
const CARD_MAX_WIDTH = isWeb ? 800 : 700;
const CARD_WIDTH = Math.min(width - (CARD_PADDING * 2), CARD_MAX_WIDTH);
const IMAGE_WIDTH = CARD_WIDTH - 30;
const IMAGE_HEIGHT = width > 1200 ? IMAGE_WIDTH * 0.55 : IMAGE_WIDTH * 0.6; 

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
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  const openImageModal = (index) => {
    setSelectedImageIndex(index);
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };

  const navigateImage = (direction) => {
    const newIndex = direction === 'next' 
      ? (selectedImageIndex + 1) % imageList.length 
      : (selectedImageIndex - 1 + imageList.length) % imageList.length;
    setSelectedImageIndex(newIndex);
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={() => onPress(post)} style={styles.card} activeOpacity={0.95}>
        <View style={styles.header}>
          <View style={styles.gameInfo}>
            <View style={styles.gameLogoPlaceholder}>
              <Text style={styles.gameLogoText}>{(GAME_TITLE_DSC || "G")[0]}</Text>
            </View>
            <Text style={styles.gameName} numberOfLines={1}>{GAME_TITLE_DSC || "Juego"}</Text>
          </View>
          <View style={styles.headerRight}>
            {POST_DATE && <Text style={styles.dateText}>{formatDate(POST_DATE)}</Text>}
            {isOwner && (
              <TouchableOpacity 
                onPress={(e) => {
                  e.stopPropagation();
                  onDelete(ID_POST);
                }} 
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.red} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>{POST_TITLE_DSC}</Text>
        <Text style={styles.description} numberOfLines={3}>{POST_CONTENT_DSC}</Text>

        {imageList.length > 0 && (
          <View style={styles.imageContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              snapToInterval={IMAGE_WIDTH}
              decelerationRate="fast"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.imageScrollContent}
            >
              {imageList.map((uri, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.imageWrapper}
                  onPress={(e) => {
                    e.stopPropagation();
                    openImageModal(index);
                  }}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: `http://localhost:8080${uri}` }}
                    style={styles.mainImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Dots */}
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

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.authorInfo}>
            {user?.PROFILE_PIC ? (
              <Image 
                source={{ uri: `http://localhost:8080${user.PROFILE_PIC}` }} 
                style={styles.authorAvatar} 
              />
            ) : (
              <View style={[styles.authorAvatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {(user?.USERNAME_DSC || "A")[0].toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.authorName}>{user?.USERNAME_DSC || "Anónimo"}</Text>
          </View>
          
          <View style={styles.interactions}>
            <View style={styles.interactionItem}>
              <Ionicons name="heart-outline" size={18} color={COLORS.grayText} />
              <Text style={styles.interactionCount}>0</Text>
            </View>
            <View style={styles.interactionItem}>
              <Ionicons name="chatbubble-outline" size={18} color={COLORS.grayText} />
              <Text style={styles.interactionCount}>{commentCount || 0}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: COLORS.darkerBackground,
    borderRadius: 12,
    padding: 20,
    width: CARD_WIDTH,
    maxWidth: 800,
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12,
  },
  gameInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1,
  },
  gameLogoPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameLogoText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: 'bold',
  },
  gameName: { 
    color: COLORS.white, 
    fontSize: 15, 
    fontWeight: '700',
  },
  dateText: { 
    color: COLORS.grayText, 
    fontSize: 13, 
  },
  title: { 
    color: COLORS.white, 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 8,
  },
  description: { 
    color: COLORS.grayText, 
    fontSize: 14, 
    marginBottom: 12,
  },
  imageContainer: { 
    width: '100%', 
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  imageScrollContent: {
    alignItems: 'center',
  },
  imageWrapper: { 
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    backgroundColor: COLORS.inputBackground,
  },
  mainImage: { 
    width: '100%', 
    height: '100%',
  },
  imageDots: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    position: 'absolute', 
    bottom: 10, 
    left: 0, 
    right: 0,
  },
  dot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    backgroundColor: 'rgba(255,255,255,0.5)', 
    marginHorizontal: 3,
  },
  activeDot: { 
    backgroundColor: COLORS.white,
    width: 18,
    height: 6,
  },
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBackground,
  },
  authorInfo: { 
    flexDirection: 'row', 
    alignItems: 'center',
  },
  authorAvatar: { 
    width: 34, 
    height: 34, 
    borderRadius: 17, 
    marginRight: 10,
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  authorName: { 
    color: COLORS.white, 
    fontSize: 14, 
    fontWeight: '600',
  },
  interactions: { 
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 16,
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  interactionCount: { 
    color: COLORS.grayText, 
    fontSize: 13,
  },
});

export default PostCard;
