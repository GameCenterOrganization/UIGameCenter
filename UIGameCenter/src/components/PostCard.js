import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

const { width } = Dimensions.get('window');
const isWeb = Platform.OS === 'web';

// Calculamos el ancho del card y de las imágenes
const CARD_PADDING = width < 768 ? 16 : 40;
const CARD_WIDTH = width < 768 ? width - (CARD_PADDING * 2) : Math.min(700, width - (CARD_PADDING * 2));
const IMAGE_WIDTH = CARD_WIDTH - 30; // 15px padding de cada lado
const IMAGE_HEIGHT = IMAGE_WIDTH * 0.6; // Proporción 16:10 para mejor visualización

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
        {/* Header */}
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

        {/* Title & Description */}
        <Text style={styles.title} numberOfLines={2}>{POST_TITLE_DSC}</Text>
        <Text style={styles.description} numberOfLines={3}>{POST_CONTENT_DSC}</Text>

        {/* Images Gallery */}
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

            {/* Navigation Arrows - Only on Web */}
            {isWeb && imageList.length > 1 && (
              <>
                {currentIndex > 0 && (
                  <TouchableOpacity 
                    style={[styles.navButton, styles.navButtonLeft]}
                    onPress={(e) => {
                      e.stopPropagation();
                      scrollToIndex(currentIndex - 1);
                    }}
                  >
                    <Ionicons name="chevron-back" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                )}
                
                {currentIndex < imageList.length - 1 && (
                  <TouchableOpacity 
                    style={[styles.navButton, styles.navButtonRight]}
                    onPress={(e) => {
                      e.stopPropagation();
                      scrollToIndex(currentIndex + 1);
                    }}
                  >
                    <Ionicons name="chevron-forward" size={24} color={COLORS.white} />
                  </TouchableOpacity>
                )}
              </>
            )}

            {/* Dots Indicator */}
            {imageList.length > 1 && (
              <View style={styles.imageDots}>
                {imageList.map((_, index) => (
                  <View 
                    key={index} 
                    style={[
                      styles.dot, 
                      currentIndex === index && styles.activeDot
                    ]} 
                  />
                ))}
              </View>
            )}

            {/* Image Counter */}
            {imageList.length > 1 && (
              <View style={styles.imageCounter}>
                <Text style={styles.imageCounterText}>
                  {currentIndex + 1}/{imageList.length}
                </Text>
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

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={closeImageModal}
          />
          
          {/* Close Button */}
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={closeImageModal}
          >
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>

          {/* Image Counter in Modal */}
          {imageList.length > 1 && (
            <View style={styles.modalImageCounter}>
              <Text style={styles.modalImageCounterText}>
                {selectedImageIndex + 1} / {imageList.length}
              </Text>
            </View>
          )}

          {/* Main Image */}
          <View style={styles.modalImageContainer}>
            <Image
              source={{ uri: `http://localhost:8080${imageList[selectedImageIndex]}` }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>

          {/* Navigation Arrows */}
          {imageList.length > 1 && (
            <>
              <TouchableOpacity 
                style={[styles.modalNavButton, styles.modalNavButtonLeft]}
                onPress={() => navigateImage('prev')}
              >
                <Ionicons name="chevron-back" size={32} color={COLORS.white} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalNavButton, styles.modalNavButtonRight]}
                onPress={() => navigateImage('next')}
              >
                <Ionicons name="chevron-forward" size={32} color={COLORS.white} />
              </TouchableOpacity>
            </>
          )}

          {/* Thumbnail Strip */}
          {imageList.length > 1 && (
            <View style={styles.thumbnailContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.thumbnailScroll}
              >
                {imageList.map((uri, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedImageIndex(index)}
                    style={[
                      styles.thumbnail,
                      selectedImageIndex === index && styles.thumbnailActive
                    ]}
                  >
                    <Image
                      source={{ uri: `http://localhost:8080${uri}` }}
                      style={styles.thumbnailImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.darkerBackground,
    borderRadius: 12,
    padding: 15,
    width: CARD_WIDTH,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  
  // Header
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
    marginRight: 12,
  },
  gameLogoPlaceholder: {
    width: 32,
    height: 32,
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
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateText: { 
    color: COLORS.grayText, 
    fontSize: 13, 
    fontWeight: '500',
  },
  deleteButton: { 
    backgroundColor: 'rgba(255,0,0,0.15)', 
    borderRadius: 6, 
    padding: 6,
  },

  // Content
  title: { 
    color: COLORS.white, 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 8,
    lineHeight: 24,
  },
  description: { 
    color: COLORS.grayText, 
    fontSize: 14, 
    marginBottom: 12,
    lineHeight: 20,
  },

  // Images
  imageContainer: { 
    width: '100%', 
    marginBottom: 12, 
    position: 'relative',
    borderRadius: 10,
    overflow: 'hidden',
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
  
  // Navigation
  navButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({ 
      web: { cursor: 'pointer' } 
    }),
  },
  navButtonLeft: { left: 12 },
  navButtonRight: { right: 12 },
  
  // Indicators
  imageDots: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    position: 'absolute', 
    bottom: 12, 
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
    width: 20,
    height: 6,
  },
  imageCounter: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  imageCounterText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },

  // Footer
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBackground,
  },
  authorInfo: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flex: 1,
  },
  authorAvatar: { 
    width: 32, 
    height: 32, 
    borderRadius: 16, 
    backgroundColor: COLORS.grayText, 
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
    fontWeight: '500',
  },

  // Image Modal
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImageCounter: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalImageCounterText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  modalImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    maxWidth: 1200,
    maxHeight: '80%',
  },
  modalNavButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -25 }],
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalNavButtonLeft: {
    left: 20,
  },
  modalNavButtonRight: {
    right: 20,
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  thumbnailScroll: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginHorizontal: 4,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: COLORS.purple,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
});

export default PostCard;