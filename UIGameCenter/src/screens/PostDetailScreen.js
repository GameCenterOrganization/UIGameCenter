import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

const { width } = Dimensions.get('window');

// 👇 1. Sacamos ResponseSection FUERA de PostDetailScreen
const ResponseSection = ({ response, setResponse, imageAttached, setImageAttached, handlePublishResponse }) => (
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
      <TouchableOpacity onPress={() => setImageAttached(!imageAttached)} style={styles.attachImageButton}>
        <Ionicons 
          name={imageAttached ? "image" : "image-outline"} 
          size={24} 
          color={imageAttached ? COLORS.purple : COLORS.grayText} 
        />
      </TouchableOpacity>
    </View>
    <TouchableOpacity onPress={handlePublishResponse} style={styles.publishResponseButton}>
      <Text style={styles.publishResponseText}>Publicar Respuesta</Text>
    </TouchableOpacity>
  </View>
);

// 👇 2. También sacamos FullPostView (opcional, pero recomendado)
const FullPostView = ({ post }) => (
  <View style={styles.fullPostContainer}>
    <View style={styles.postHeader}>
      <View style={styles.authorInfo}>
        <View style={styles.authorAvatar} />
        <View>
          <Text style={styles.authorName}>{post.author}</Text>
          <Text style={styles.time}>{post.time}</Text>
        </View>
      </View>
      {post.isTrending && <Text style={styles.trendingTag}>✨ Tendencia</Text>}
    </View>

    <Text style={styles.postTitle}>{post.title}</Text>
    <Text style={styles.postDescription}>{post.description}</Text>
    
    <Image source={{ uri: post.imageUrl }} style={styles.mainImage} resizeMode="cover" />

    <View style={styles.interactionsFooter}>
      <View style={styles.interactionGroup}>
        <Ionicons name="heart-outline" size={20} color={COLORS.grayText} />
        <Text style={styles.interactionCount}>{post.likes}</Text>
      </View>
      <View style={styles.interactionGroup}>
        <Ionicons name="chatbubble-outline" size={20} color={COLORS.grayText} />
        <Text style={styles.interactionCount}>{post.comments}</Text>
      </View>
    </View>
  </View>
);

// 👇 3. Y CommentsSection
const CommentsSection = () => {
  const MOCK_COMMENTS = [
    { id: 'c1', author: 'ValorantPro', time: 'hace 1 hora', text: 'Para principiantes, te recomiendo Sage o Brimstone. Sage es excelente porque sus habilidades de curación y resurrección son muy valiosas y fáciles de usar. Es el mejor support para empezar.', likes: 45 },
    { id: 'c2', author: 'AgentMaster', time: 'hace 45 minutos', text: 'Yo empecé con Sage y fue la mejor decisión. Te permite aprender el juego sin la presión de tener que hacer muchas kills. Una vez que mejores tu aim, puedes probar con duelistas como Phoenix o Reyna.', likes: 32 },
  ];

  return (
    <View style={styles.commentsListContainer}>
      <Text style={styles.commentsCount}>Respuestas ({MOCK_COMMENTS.length})</Text>
      {MOCK_COMMENTS.map(comment => (
        <View key={comment.id} style={styles.commentCard}>
          <View style={styles.commentHeader}>
            <View style={styles.commentAuthorInfo}>
              <View style={styles.authorAvatar} />
              <View>
                <Text style={styles.commentAuthorName}>{comment.author}</Text>
                <Text style={styles.commentTime}>· {comment.time}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.commentText}>{comment.text}</Text>
          <View style={styles.commentActions}>
            <TouchableOpacity style={styles.commentActionButton}>
              <Ionicons name="heart-outline" size={16} color={COLORS.grayText} />
              <Text style={styles.commentActionText}>{comment.likes}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.commentActionButton}>
              <Ionicons name="chatbubble-outline" size={16} color={COLORS.grayText} />
              <Text style={styles.commentActionText}>Responder</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
};

// 👇 4. Ahora PostDetailScreen queda limpio
const PostDetailScreen = ({ navigation }) => {
  const route = useRoute();
  const { post } = route.params || { post: {} }; 
  const [response, setResponse] = useState('');
  const [imageAttached, setImageAttached] = useState(false);

  const handlePublishResponse = () => {
    if (!response.trim()) {
      alert('El comentario no puede estar vacío.');
      return;
    }
    alert('Respuesta publicada (simulada)');
    setResponse('');
    setImageAttached(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navigationHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color={COLORS.white} />
        </TouchableOpacity>
        <Text style={styles.gameNameHeader}>{post.gameName || 'Detalle del Post'}</Text>
        <View style={{ width: 26 }} /> 
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <FullPostView post={post} />
        <ResponseSection 
          response={response}
          setResponse={setResponse}
          imageAttached={imageAttached}
          setImageAttached={setImageAttached}
          handlePublishResponse={handlePublishResponse}
        />
        <CommentsSection />
      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.darkBackground,
    },
    // Cabecera de Navegación
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
    },
    backButton: {
        padding: 5,
    },
    scrollContent: {
        paddingHorizontal: width < 768 ? 20 : 50,
        paddingBottom: 30,
        ...Platform.select({ web: { maxWidth: 1000, alignSelf: 'center', width: '100%' } })
    },
    // Vista del Post Principal
    fullPostContainer: {
        backgroundColor: COLORS.darkerBackground,
        padding: 20,
        borderRadius: 10,
        marginTop: 15,
        marginBottom: 25,
    },
    postHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    authorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    authorAvatar: {
        width: 35,
        height: 35,
        borderRadius: 17.5,
        backgroundColor: COLORS.grayText,
        marginRight: 10,
    },
    authorName: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: 'bold',
    },
    time: {
        color: COLORS.grayText,
        fontSize: 12,
        marginLeft: 5,
    },
    trendingTag: {
        backgroundColor: COLORS.purple,
        color: COLORS.white,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 15,
        fontSize: 12,
        fontWeight: 'bold',
    },
    postTitle: {
        color: COLORS.white,
        fontSize: width < 768 ? 22 : 28,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    postDescription: {
        color: COLORS.grayText,
        fontSize: 16,
        marginBottom: 10,
    },
    extendedContent: {
        paddingVertical: 10,
    },
    extendedText: {
        color: COLORS.white,
        fontSize: 15,
        marginBottom: 5,
    },
    extendedTextBold: {
        color: COLORS.white,
        fontSize: 15,
        fontWeight: 'bold',
        marginTop: 10,
    },
    listItem: {
        color: COLORS.white,
        fontSize: 15,
        marginLeft: 10,
        marginBottom: 3,
    },
    mainImage: {
        width: '100%',
        height: width < 768 ? 200 : 350,
        borderRadius: 8,
        marginTop: 15,
        backgroundColor: COLORS.inputBackground,
    },
    interactionsFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderTopWidth: 1,
        borderTopColor: COLORS.inputBackground,
        paddingTop: 10,
        marginTop: 15,
    },
    interactionGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 25,
    },
    interactionCount: {
        color: COLORS.grayText,
        fontSize: 14,
        marginLeft: 5,
    },
    // Sección para Responder
    responseContainer: {
        padding: 15,
        marginBottom: 25,
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 10,
    },
    responseTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    responseInputWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: COLORS.inputBackground,
        borderRadius: 8,
        marginBottom: 10,
    },
    responseInput: {
        flex: 1,
        minHeight: 80,
        color: COLORS.white,
        fontSize: 14,
        padding: 12,
        paddingRight: 5,
        textAlignVertical: 'top',
    },
    attachImageButton: {
        padding: 10,
        alignSelf: 'flex-end',
        marginBottom: 5,
    },
    publishResponseButton: {
        backgroundColor: COLORS.purple,
        borderRadius: 8,
        paddingVertical: 12,
        alignSelf: 'flex-end',
        minWidth: 150,
        alignItems: 'center',
    },
    publishResponseText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 15,
    },

    // Respuestas/Comentarios
    commentsListContainer: {
        marginBottom: 15,
    },
    commentsCount: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    commentCard: {
        backgroundColor: COLORS.darkerBackground,
        padding: 15,
        borderRadius: 8,
        marginBottom: 15,
    },
    commentHeader: {
        marginBottom: 8,
    },
    commentAuthorInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentAuthorName: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 13,
    },
    commentTime: {
        color: COLORS.grayText,
        fontSize: 12,
    },
    commentText: {
        color: COLORS.white,
        fontSize: 14,
        marginBottom: 15,
    },
    commentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: COLORS.inputBackground,
        paddingTop: 10,
    },
    commentActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    commentActionText: {
        color: COLORS.grayText,
        fontSize: 12,
        marginLeft: 5,
        fontWeight: 'bold',
    },
});

export default PostDetailScreen;
