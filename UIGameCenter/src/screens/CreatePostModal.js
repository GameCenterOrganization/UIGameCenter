import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import COLORS from '../constants/Colors';

const { width } = Dimensions.get('window');
const API_URL = 'http://192.168.0.6:8080/api/post';
const MOCK_GAMES = ['Valorant', 'League of Legends', 'Dota 2', 'Apex Legends', 'Counter-Strike 2'];
const MAX_IMAGES = 5;
const MAX_FILE_SIZE_MB = 10;

const CreatePostModal = ({ onClose, onPostCreated }) => {
  const [game, setGame] = useState(MOCK_GAMES[0]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [gameSearch, setGameSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);


  const handleImageUpload = async () => {
    if (selectedImages.length >= MAX_IMAGES) {
      Alert.alert('Límite de imágenes', `Solo puedes subir hasta ${MAX_IMAGES} imágenes.`);
      return;
    }

    if (Platform.OS === 'web') {
      fileInputRef.current.click();
      return;
    }

    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });

    if (!result.canceled && result.assets) {
      const images = result.assets.slice(0, MAX_IMAGES - selectedImages.length).map(asset => ({
        uri: asset.uri,
        name: asset.fileName || asset.uri.split('/').pop(),
        type: 'image/jpeg',
      }));
      setSelectedImages(prev => [...prev, ...images]);
    }
  };


  const handleWebFileChange = (event) => {
    const files = Array.from(event.target.files).slice(0, MAX_IMAGES - selectedImages.length);
    const mapped = files.map(file => ({
      uri: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      file, 
    }));
    setSelectedImages(prev => [...prev, ...mapped]);
  };


  const removeImage = (uri) => {
    setSelectedImages(prev => prev.filter(img => img.uri !== uri));
  };


  const handlePublish = async () => {
    if (isLoading) return;

    if (!game || !title || !content) {
      Alert.alert('Error', 'Por favor completa todos los campos requeridos.');
      return;
    }

    setIsLoading(true);

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        Alert.alert('Error', 'Debes iniciar sesión para publicar.');
        setIsLoading(false);
        return;
      }

      const token = await user.getIdToken();

      const formData = new FormData();
      formData.append('GAME_TITLE_DSC', game);
      formData.append('POST_TITLE_DSC', title);
      formData.append('POST_CONTENT_DSC', content);

      selectedImages.forEach((img) => {
      
        if (Platform.OS === 'web' && img.file) {
          formData.append('images', img.file, img.name);
        } else {
          formData.append('images', {
            uri: img.uri,
            type: img.type,
            name: img.name,
          });
        }
      });

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Publicado ', 'El post se creó exitosamente.');
        if (onPostCreated) onPostCreated();
        onClose();
      } else {
        Alert.alert('Error', data.message || 'No se pudo crear el post.');
      }
    } catch (err) {
      console.error('Error al publicar:', err);
      Alert.alert('Error', 'No se pudo conectar con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredGames = MOCK_GAMES.filter(g => g.toLowerCase().includes(gameSearch.toLowerCase()));

  return (
    <View style={styles.modalContainer}>
    
      {Platform.OS === 'web' && (
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleWebFileChange}
        />
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Crear Nuevo Post</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={28} color={COLORS.grayText} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.formContent}>
        <Text style={styles.label}>Juego *</Text>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setDropdownOpen(!dropdownOpen)}>
          <Text style={styles.dropdownText}>{game}</Text>
          <Ionicons name={dropdownOpen ? 'chevron-up' : 'chevron-down'} size={18} color={COLORS.white} />
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={styles.dropdownList}>
            <TextInput
              style={styles.dropdownSearch}
              placeholder="Buscar juego..."
              placeholderTextColor={COLORS.grayText}
              value={gameSearch}
              onChangeText={setGameSearch}
            />
            <ScrollView style={styles.dropdownScroll}>
              {filteredGames.map(g => (
                <TouchableOpacity key={g} style={styles.dropdownItem} onPress={() => {
                  setGame(g);
                  setDropdownOpen(false);
                }}>
                  <Text style={styles.dropdownItemText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <Text style={styles.label}>Título *</Text>
        <TextInput
          style={styles.input}
          placeholder="Título del post..."
          placeholderTextColor={COLORS.grayText}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Contenido *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Describe tu post..."
          placeholderTextColor={COLORS.grayText}
          multiline
          value={content}
          onChangeText={setContent}
        />

        <Text style={styles.label}>Imágenes (opcional)</Text>
        <TouchableOpacity style={styles.imageUploadArea} onPress={handleImageUpload}>
          <Ionicons name="image-outline" size={30} color={COLORS.grayText} />
          <Text style={styles.uploadText}>Haz clic para subir imágenes</Text>
          <Text style={styles.uploadSubText}>Máx {MAX_IMAGES} archivos, {MAX_FILE_SIZE_MB}MB cada uno</Text>
        </TouchableOpacity>

        {selectedImages.length > 0 && (
          <View style={styles.imagePreviewContainer}>
            {selectedImages.map((img) => (
              <View key={img.uri} style={styles.imagePill}>
                <Text style={styles.imagePillText} numberOfLines={1}>{img.name}</Text>
                <TouchableOpacity onPress={() => removeImage(img.uri)}>
                  <Ionicons name="close-circle" size={18} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onClose} style={styles.cancelButton} disabled={isLoading}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePublish} style={styles.publishButton} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={COLORS.white} /> : (
            <Text style={styles.publishButtonText}>Publicar ({selectedImages.length}/{MAX_IMAGES})</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.darkerBackground,
    borderRadius: 10,
    ...Platform.select({
      web: { width: width < 768 ? '90%' : 600, maxHeight: '90%', alignSelf: 'center' },
    }),
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.inputBackground },
  title: { color: COLORS.white, fontSize: 22, fontWeight: 'bold' },
  formContent: { padding: 20 },
  label: { color: COLORS.white, fontSize: 14, marginBottom: 8, marginTop: 15, fontWeight: 'bold' },
  input: { backgroundColor: COLORS.inputBackground, color: COLORS.white, borderRadius: 8, padding: 12, fontSize: 16 },
  textArea: { minHeight: 120, textAlignVertical: 'top' },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.inputBackground, borderRadius: 8, padding: 12 },
  dropdownText: { color: COLORS.white, fontSize: 16 },
  dropdownList: { backgroundColor: COLORS.inputBackground, borderRadius: 8, padding: 5, marginBottom: 10, maxHeight: 150 },
  dropdownSearch: { backgroundColor: COLORS.darkerBackground, color: COLORS.white, borderRadius: 4, padding: 8, marginBottom: 5 },
  dropdownScroll: { maxHeight: 100 },
  dropdownItem: { padding: 10 },
  dropdownItemText: { color: COLORS.white, fontSize: 15 },
  imageUploadArea: { borderWidth: 2, borderColor: COLORS.grayText, borderStyle: 'dashed', borderRadius: 8, padding: 20, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  uploadText: { color: COLORS.grayText, marginTop: 5, fontSize: 14 },
  uploadSubText: { color: COLORS.grayText, fontSize: 12, marginBottom: 5 },
  imagePreviewContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  imagePill: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBackground, borderRadius: 15, paddingVertical: 5, paddingLeft: 10, paddingRight: 5, marginBottom: 5 },
  imagePillText: { color: COLORS.white, fontSize: 12, marginRight: 5, maxWidth: width * 0.4 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20, borderTopWidth: 1, borderTopColor: COLORS.inputBackground },
  cancelButton: { paddingHorizontal: 15, paddingVertical: 10, marginRight: 10 },
  cancelButtonText: { color: COLORS.grayText, fontWeight: 'bold', fontSize: 16 },
  publishButton: { backgroundColor: COLORS.purple, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  publishButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16 },
});

export default CreatePostModal;
