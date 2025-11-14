import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, Platform, Dimensions, ActivityIndicator, Alert, Modal } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import COLORS from '../constants/Colors';
import { BASE_URL } from '@env';

const { width } = Dimensions.get('window');

const getApiBaseUrl = () => {
  if (Platform.OS === 'android') {
    return `${BASE_URL}/api`;
  } else if (Platform.OS === 'ios') {
    return `${BASE_URL}/api`;
  } else {
    return `${BASE_URL}/api`;
  }
};

const API_BASE_URL = getApiBaseUrl();
const POSTS_URL = `${API_BASE_URL}/post`;
const COMMENTS_URL = `${API_BASE_URL}/comments`;

const getImageBaseUrl = () => {
  if (Platform.OS === 'android') {
    return `${BASE_URL}`;
  } else if (Platform.OS === 'ios') {
    return `${BASE_URL}`;
  } else {
    return `${BASE_URL}`;
  }
};

const IMAGE_BASE_URL = getImageBaseUrl();

const ImageModal = ({ visible, images, initialIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const navigateImage = (direction) => {
    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (!visible || !images || images.length === 0) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose} />
        
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={28} color={COLORS.white} />
        </TouchableOpacity>

        {images.length > 1 && (
          <View style={styles.modalImageCounter}>
            <Text style={styles.modalImageCounterText}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        )}

        <View style={styles.modalImageContainer}>
          <Image
            source={{ uri: images[currentIndex] }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>

        {images.length > 1 && (
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
        {images.length > 1 && (
          <View style={styles.thumbnailContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailScroll}
            >
              {images.map((uri, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentIndex(index)}
                  style={[
                    styles.thumbnail,
                    currentIndex === index && styles.thumbnailActive
                  ]}
                >
                  <Image
                    source={{ uri }}
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
  );
};

const ResponseSection = ({ response, setResponse, imageAttached, setImageAttached, handlePublishResponse, loading }) => (
  <View style={styles.responseContainer}>
    <Text style={styles.responseTitle}>Comparte tu opinión o consejo</Text>
    <View style={styles.responseInputWrapper}>
      <TextInput
        style={styles.responseInput}
        placeholder="Escribe tu respuesta..."
        placeholderTextColor={COLORS.grayText}
        value={response}
        onChangeText={setResponse}
        multiline
        textAlignVertical="top"
      />
      <TouchableOpacity onPress={setImageAttached} style={styles.attachImageButton}>
        <Ionicons 
          name={imageAttached ? "image" : "image-outline"} 
          size={24} 
          color={imageAttached ? COLORS.purple : COLORS.grayText} 
        />
      </TouchableOpacity>
    </View>
    {imageAttached && (
      <View style={styles.imagePreviewContainer}>
        <Image source={{ uri: imageAttached.uri }} style={styles.imagePreview} />
        <TouchableOpacity onPress={() => setImageAttached(null)} style={styles.removeImageButton}>
          <Ionicons name="close-circle" size={24} color={COLORS.red} />
        </TouchableOpacity>
      </View>
    )}
    <TouchableOpacity 
      onPress={handlePublishResponse} 
      style={[styles.publishResponseButton, loading && { opacity: 0.6 }]}
      disabled={loading}
    >
      {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.publishResponseText}>Publicar Respuesta</Text>}
    </TouchableOpacity>
  </View>
);

const FullPostView = ({ post, onImagePress }) => (
  <View style={styles.fullPostContainer}>
    <View style={styles.postHeader}>
      <View style={styles.authorInfo}>
        {post.user?.PROFILE_PIC ? (
          <Image source={{ uri: `${IMAGE_BASE_URL}${post.user.PROFILE_PIC}` }} style={styles.authorAvatar} />
        ) : (
          <View style={[styles.authorAvatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {(post.user?.USERNAME_DSC || post.user?.FIRST_NAME_DSC || 'U')[0].toUpperCase()}
            </Text>
          </View>
        )}
        <View>
          <Text style={styles.authorName}>
            {post.user?.USERNAME_DSC || `${post.user?.FIRST_NAME_DSC || ''} ${post.user?.LAST_NAME_DSC || ''}`.trim() || 'Usuario'}
          </Text>
          <Text style={styles.time}>{new Date(post.POST_DATE).toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: 'short', 
            year: 'numeric' 
          })}</Text>
        </View>
      </View>
    </View>
    <Text style={styles.postTitle}>{post.POST_TITLE_DSC}</Text>
    <Text style={styles.postDescription}>{post.POST_CONTENT_DSC}</Text>
    
    {post.images?.length > 0 && (
      <View style={styles.imagesGallery}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.imagesScrollContent}
          snapToInterval={width < 768 ? width - 80 : 420}
          decelerationRate="fast"
        >
          {post.images.map((img, index) => (
            <TouchableOpacity 
              key={img.ID_POST_IMG || index}
              onPress={() => onImagePress(index)}
              activeOpacity={0.9}
              style={styles.postImageWrapper}
            >
              <Image 
                source={{ uri: `${IMAGE_BASE_URL}${img.IMG_URL}` }} 
                style={styles.postImage} 
                resizeMode="cover" 
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
        {post.images.length > 1 && (
          <View style={styles.imageCountBadge}>
            <Ionicons name="images" size={14} color={COLORS.white} />
            <Text style={styles.imageCountText}>{post.images.length}</Text>
          </View>
        )}
      </View>
    )}
  </View>
);

const CommentsSection = ({ comments, currentUser, onDeleteComment, deletingCommentId, onImagePress }) => {
  return (
    <View style={styles.commentsListContainer}>
      <Text style={styles.commentsCount}>Respuestas ({comments.length})</Text>
      {comments.length === 0 ? (
        <Text style={styles.noCommentsText}>Aún no hay respuestas. ¡Sé el primero en comentar!</Text>
      ) : (
        comments.map(comment => {
          const isOwner = currentUser && (
            comment.user?.FIREBASE_UID === currentUser.uid ||
            comment.user?.EMAIL_DSC?.toLowerCase() === currentUser.email?.toLowerCase()
          );
          const isDeleting = deletingCommentId === comment.ID_COMMENT;
          
          return (
            <View key={comment.ID_COMMENT} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAuthorInfo}>
                  {comment.user?.PROFILE_PIC ? (
                    <Image source={{ uri: `${IMAGE_BASE_URL}${comment.user.PROFILE_PIC}` }} style={styles.commentAvatar} />
                  ) : (
                    <View style={[styles.commentAvatar, styles.avatarPlaceholder]}>
                      <Text style={styles.commentAvatarText}>
                        {(comment.user?.USERNAME_DSC || comment.user?.FIRST_NAME_DSC || 'U')[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentAuthorName}>
                      {comment.user?.USERNAME_DSC || `${comment.user?.FIRST_NAME_DSC || ''} ${comment.user?.LAST_NAME_DSC || ''}`.trim() || 'Usuario'}
                    </Text>
                    <Text style={styles.commentTime}>
                      {new Date(comment.COMMENT_DATE).toLocaleDateString('es-ES', { 
                        day: '2-digit', 
                        month: 'short', 
                        year: 'numeric' 
                      })}
                    </Text>
                  </View>
                  {isOwner && (
                    <TouchableOpacity 
                      onPress={() => onDeleteComment(comment.ID_COMMENT)}
                      style={styles.deleteCommentButton}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <ActivityIndicator size="small" color={COLORS.red} />
                      ) : (
                        <Ionicons name="trash-outline" size={20} color={COLORS.red} />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              <Text style={styles.commentText}>{comment.COMMENT_CONTENT_DSC}</Text>
              {comment.images?.[0]?.IMG_URL && (
                <TouchableOpacity 
                  onPress={() => onImagePress(0, comment.images)}
                  activeOpacity={0.9}
                >
                  <Image 
                    source={{ uri: `${IMAGE_BASE_URL}${comment.images[0].IMG_URL}` }} 
                    style={styles.commentImage} 
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              )}
            </View>
          );
        })
      )}
    </View>
  );
};

const PostDetailScreen = ({ navigation }) => {
  const route = useRoute();
  const { postId, post: postFromParams } = route.params || {};
  const auth = getAuth();

  const [post, setPost] = useState(postFromParams || null);
  const [comments, setComments] = useState([]);
  const [response, setResponse] = useState('');
  const [imageAttached, setImageAttached] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!postFromParams);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  
  // Image modal states
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [modalImages, setModalImages] = useState([]);
  const [modalInitialIndex, setModalInitialIndex] = useState(0);

  const actualPostId = postId || postFromParams?.ID_POST;
  const currentUser = auth.currentUser;

  const fetchPostAndComments = async () => {
    if (!actualPostId) {
      console.error('No se proporcionó postId');
      Alert.alert('Error', 'No se pudo identificar el post.');
      setFetching(false);
      return;
    }

    try {
      setFetching(true);

      const postUrl = `${POSTS_URL}/${actualPostId}`;
      console.log('Intentando cargar post desde:', postUrl);

      if (!postFromParams) {
        const postRes = await fetch(postUrl);
        
        if (!postRes.ok) {
          const errorText = await postRes.text();
          console.error('Error del servidor:', errorText);
          throw new Error(`Error al cargar el post: ${postRes.status} - ${errorText}`);
        }
        
        const postData = await postRes.json();
        setPost(postData);
      }

      const commentsUrl = `${COMMENTS_URL}/post?postId=${actualPostId}`;
      const commentsRes = await fetch(commentsUrl);
      
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData.comments || []);
      } else {
        setComments([]);
      }

    } catch (error) {
      console.error('Error completo:', error);
      Alert.alert('Error', error.message || 'No se pudo cargar el post.');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { 
    fetchPostAndComments(); 
  }, [actualPostId]);

  const openPostImageModal = (index) => {
    const images = post.images.map(img => `${IMAGE_BASE_URL}${img.IMG_URL}`);
    setModalImages(images);
    setModalInitialIndex(index);
    setImageModalVisible(true);
  };

  const openCommentImageModal = (index, commentImages) => {
    const images = commentImages.map(img => `${IMAGE_BASE_URL}${img.IMG_URL}`);
    setModalImages(images);
    setModalInitialIndex(index);
    setImageModalVisible(true);
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      'Eliminar comentario',
      '¿Estás seguro de que deseas eliminar este comentario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (!currentUser) {
              return Alert.alert('Error', 'Debes iniciar sesión para eliminar comentarios.');
            }

            try {
              setDeletingCommentId(commentId);
              
              const token = await currentUser.getIdToken();
              console.log('Token obtenido correctamente desde Firebase');
              
              const response = await fetch(`${COMMENTS_URL}/delete/${commentId}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              });

              if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
              }

              const data = await response.json();
              setComments(prev => prev.filter(c => c.ID_COMMENT !== commentId));
              Alert.alert('Éxito', data.message || 'Comentario eliminado correctamente.');

            } catch (error) {
              console.error('Error al eliminar comentario:', error);
              Alert.alert('Error', error.message || 'No se pudo eliminar el comentario. Verifica tu conexión.');
            } finally {
              setDeletingCommentId(null);
            }
          }
        }
      ]
    );
  };

  const handlePublishResponse = async () => {
    if (!response.trim()) {
      return Alert.alert('Atención', 'El comentario no puede estar vacío.');
    }

    const currentUser = auth.currentUser;
    if (!currentUser) {
      return Alert.alert('Error', 'Debes iniciar sesión para comentar.');
    }

    try {
      setLoading(true);
      
      const token = await currentUser.getIdToken();

      const formData = new FormData();
      formData.append('ID_POST', actualPostId);
      formData.append('COMMENT_CONTENT_DSC', response);
      
      const title = response.trim().substring(0, 50) + (response.length > 50 ? '...' : '');
      formData.append('COMMENT_TITLE_DSC', title);

      if (imageAttached) {
        if (Platform.OS === 'web') {
          if (imageAttached.file) {
            formData.append('image', imageAttached.file);
          }
        } else {
          const uriParts = imageAttached.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          
          formData.append('image', {
            uri: Platform.OS === 'android' ? imageAttached.uri : imageAttached.uri.replace('file://', ''),
            name: `comment_${Date.now()}.${fileType}`,
            type: `image/${fileType}`,
          });
        }
      }

      const res = await fetch(`${COMMENTS_URL}/register`, {
        method: 'POST',
        body: formData,
        headers: { 
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al publicar comentario');
      }

      const commentsUrl = `${COMMENTS_URL}/post?postId=${actualPostId}`;
      const commentsRes = await fetch(commentsUrl);
      
      if (commentsRes.ok) {
        const commentsData = await commentsRes.json();
        setComments(commentsData.comments || []);
      } else {
        setComments(prev => [...prev, data.comment]);
      }
      
      setResponse('');
      setImageAttached(null);
      
      Alert.alert('Éxito', 'Tu respuesta ha sido publicada.');

    } catch (error) {
      console.error('Error al publicar:', error);
      Alert.alert('Error', error.message || 'No se pudo publicar la respuesta.');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setImageAttached({
              uri: event.target.result,
              file: file,
            });
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso necesario', 'Necesitamos permiso para acceder a tus fotos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });

      if (!result.canceled) {
        setImageAttached(result.assets[0]);
      }
    }
  };

  if (fetching) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={COLORS.purple} />
        <Text style={styles.loadingText}>Cargando post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.errorText}>No se pudo cargar el post</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonError}>
          <Text style={styles.backButtonErrorText}>Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.gameNameHeader} numberOfLines={1}>
          {post?.GAME_TITLE_DSC || 'Detalle del Post'}
        </Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FullPostView post={post} onImagePress={openPostImageModal} />
        
        <ResponseSection
          response={response}
          setResponse={setResponse}
          imageAttached={imageAttached}
          setImageAttached={pickImage}
          handlePublishResponse={handlePublishResponse}
          loading={loading}
        />
        
        <CommentsSection 
          comments={comments} 
          currentUser={currentUser}
          onDeleteComment={handleDeleteComment}
          deletingCommentId={deletingCommentId}
          onImagePress={openCommentImageModal}
        />
      </ScrollView>

      <ImageModal
        visible={imageModalVisible}
        images={modalImages}
        initialIndex={modalInitialIndex}
        onClose={() => setImageModalVisible(false)}
      />
    </View>
  );
};

export default PostDetailScreen;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.darkBackground 
  },
  navigationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: COLORS.darkerBackground,
    paddingTop: Platform.OS === 'android' ? 30 : 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.inputBackground,
  },
  gameNameHeader: { 
    color: COLORS.white, 
    fontSize: 18, 
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
  },
  backButton: { 
    padding: 5 
  },
  scrollContent: {
    paddingHorizontal: width < 768 ? 20 : 50,
    paddingBottom: 30,
    ...Platform.select({ 
      web: { 
        maxWidth: 1000, 
        alignSelf: 'center', 
        width: '100%' 
      } 
    })
  },
  fullPostContainer: { 
    backgroundColor: COLORS.darkerBackground, 
    padding: 20, 
    borderRadius: 12, 
    marginTop: 15, 
    marginBottom: 25 
  },
  postHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  authorInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  authorAvatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: COLORS.grayText, 
    marginRight: 12 
  },
  avatarPlaceholder: {
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  authorName: { 
    color: COLORS.white, 
    fontSize: 15, 
    fontWeight: 'bold' 
  },
  time: { 
    color: COLORS.grayText, 
    fontSize: 13, 
    marginTop: 3,
  },
  postTitle: { 
    color: COLORS.white, 
    fontSize: width < 768 ? 22 : 28, 
    fontWeight: 'bold', 
    marginBottom: 12,
    lineHeight: width < 768 ? 28 : 36,
  },
  postDescription: { 
    color: COLORS.grayText, 
    fontSize: 16, 
    lineHeight: 24,
    marginBottom: 15 
  },
  imagesGallery: {
    marginTop: 15,
    position: 'relative',
  },
  imagesScrollContent: {
    paddingRight: 10,
  },
  postImageWrapper: {
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  postImage: { 
    width: width < 768 ? width - 80 : 400,
    height: width < 768 ? 240 : 300,
    backgroundColor: COLORS.inputBackground 
  },
  imageCountBadge: {
    position: 'absolute',
    top: 12,
    right: 22,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 5,
  },
  imageCountText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '600',
  },
  responseContainer: { 
    padding: 18, 
    marginBottom: 25, 
    backgroundColor: COLORS.darkerBackground, 
    borderRadius: 12 
  },
  responseTitle: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 12 
  },
  responseInputWrapper: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    backgroundColor: COLORS.inputBackground, 
    borderRadius: 10, 
    marginBottom: 12 
  },
  responseInput: { 
    flex: 1, 
    minHeight: 100, 
    color: COLORS.white, 
    fontSize: 15, 
    padding: 15, 
    paddingRight: 5, 
    textAlignVertical: 'top' 
  },
  attachImageButton: { 
    padding: 12, 
    alignSelf: 'flex-end', 
    marginBottom: 5 
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.inputBackground,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 15,
    padding: 2,
  },
  publishResponseButton: { 
    backgroundColor: COLORS.purple, 
    borderRadius: 10, 
    paddingVertical: 14, 
    alignSelf: 'flex-end', 
    minWidth: 170, 
    alignItems: 'center' 
  },
  publishResponseText: { 
    color: COLORS.white, 
    fontWeight: 'bold', 
    fontSize: 15 
  },
  commentsListContainer: { 
    marginBottom: 15 
  },
  commentsCount: { 
    color: COLORS.white, 
    fontSize: 19, 
    fontWeight: 'bold', 
    marginBottom: 18 
  },
  noCommentsText: {
    color: COLORS.grayText,
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 30,
  },
  commentCard: { 
    backgroundColor: COLORS.darkerBackground, 
    padding: 16, 
    borderRadius: 10, 
    marginBottom: 12 
  },
  commentHeader: { 
    marginBottom: 10 
  },
  commentAuthorInfo: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.grayText,
    marginRight: 12,
  },
  commentAvatarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentAuthorName: { 
    color: COLORS.white, 
    fontWeight: 'bold', 
    fontSize: 14 
  },
  commentTime: { 
    color: COLORS.grayText, 
    fontSize: 12,
    marginTop: 2,
  },
  commentText: { 
    color: COLORS.white, 
    fontSize: 15, 
    lineHeight: 22,
    marginBottom: 10 
  },
  commentImage: {
    width: '100%',
    height: 220,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: COLORS.inputBackground,
  },
  deleteCommentButton: {
    marginLeft: 10,
    backgroundColor: 'rgba(255,0,0,0.15)',
    borderRadius: 8,
    padding: 8,
  },
  loadingText: {
    color: COLORS.grayText,
    marginTop: 10,
    fontSize: 15,
  },
  errorText: {
    color: COLORS.grayText,
    fontSize: 16,
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: COLORS.purple,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  backButtonErrorText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },

  // Image Modal Styles
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
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