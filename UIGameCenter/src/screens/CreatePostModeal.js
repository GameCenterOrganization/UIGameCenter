import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

const { width } = Dimensions.get('window');

// Mockup de Juegos y Tags
const MOCK_GAMES = ['Valorant', 'League of Legends', 'Dota 2', 'Apex Legends', 'Counter-Strike 2'];
const MOCK_TAGS = ['Guía', 'Noticias', 'Bug', 'Pregunta', 'Discusión'];

const CreatePostModal = ({ onClose }) => {
    const [game, setGame] = useState(MOCK_GAMES[0]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [imageCount, setImageCount] = useState(0);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [gameSearch, setGameSearch] = useState('');

    const handlePublish = () => {
        if (!game || !title || !content) {
            Alert.alert('Error', 'Por favor, rellena los campos de Juego, Título y Contenido.');
            return;
        }
        Alert.alert('Publicado!', `Post creado para ${game}.`);
        onClose();
    };

    const toggleTag = (tag) => {
        setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    };
    
    // Simulación de subida de imágenes
    const handleImageUpload = () => {
        Alert.alert('Subir Imágenes', 'Funcionalidad de selección de imágenes pendiente.');
        setImageCount(imageCount + 1); // Simular que se añadió una imagen
    };

    const filteredGames = MOCK_GAMES.filter(g => g.toLowerCase().includes(gameSearch.toLowerCase()));

    return (
        <View style={styles.modalContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Crear Nuevo Post</Text>
                <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={28} color={COLORS.grayText} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.formContent}>
                {/* 1. Juego (Dropdown/Selector) */}
                <Text style={styles.label}>Juego *</Text>
                <TouchableOpacity style={styles.dropdownButton} onPress={() => setDropdownOpen(!dropdownOpen)}>
                    <Text style={styles.dropdownText}>{game || "Selecciona un juego..."}</Text>
                    <Ionicons name={dropdownOpen ? "chevron-up" : "chevron-down"} size={18} color={COLORS.white} />
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
                            {filteredGames.map((g) => (
                                <TouchableOpacity 
                                    key={g} 
                                    style={styles.dropdownItem} 
                                    onPress={() => { setGame(g); setDropdownOpen(false); setGameSearch(''); }}
                                >
                                    <Text style={styles.dropdownItemText}>{g}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
                
                {/* 2. Título */}
                <Text style={styles.label}>Título *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="¿Cuál es tu pregunta o tema?"
                    placeholderTextColor={COLORS.grayText}
                    value={title}
                    onChangeText={setTitle}
                />

                {/* 3. Contenido */}
                <Text style={styles.label}>Contenido *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe tu post en detalle..."
                    placeholderTextColor={COLORS.grayText}
                    multiline
                    value={content}
                    onChangeText={setContent}
                />

                {/* 4. Imágenes (Opcional) */}
                <Text style={styles.label}>Imágenes (Opcional)</Text>
                <TouchableOpacity style={styles.imageUploadArea} onPress={handleImageUpload}>
                    <Ionicons name="image-outline" size={30} color={COLORS.grayText} />
                    <Text style={styles.uploadText}>Haz clic para subir imágenes</Text>
                    <Text style={styles.uploadSubText}>PNG, JPG hasta 10MB.</Text>
                    {imageCount > 0 && <Text style={styles.uploadedCount}>{imageCount} {imageCount === 1 ? 'imagen' : 'imágenes'} lista(s).</Text>}
                </TouchableOpacity>
            </ScrollView>
            
            {/* Acciones */}
            <View style={styles.actions}>
                <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePublish} style={styles.publishButton}>
                    <Text style={styles.publishButtonText}>Publicar</Text>
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBackground,
    },
    title: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: 'bold',
    },
    formContent: {
        padding: 20,
    },
    label: {
        color: COLORS.white,
        fontSize: 14,
        marginBottom: 8,
        marginTop: 15,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: COLORS.inputBackground,
        color: COLORS.white,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top', 
    },
    // Dropdown (Selector de Juego)
    dropdownButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.inputBackground,
        borderRadius: 8,
        padding: 12,
        marginBottom: 5,
    },
    dropdownText: {
        color: COLORS.white,
        fontSize: 16,
    },
    dropdownList: {
        backgroundColor: COLORS.inputBackground,
        borderRadius: 8,
        padding: 5,
        marginBottom: 10,
        maxHeight: 150, 
    },
    dropdownSearch: {
        backgroundColor: COLORS.darkerBackground,
        color: COLORS.white,
        borderRadius: 4,
        padding: 8,
        marginBottom: 5,
    },
    dropdownScroll: {
        maxHeight: 100,
    },
    dropdownItem: {
        padding: 10,
    },
    dropdownItemText: {
        color: COLORS.white,
        fontSize: 15,
    },
    // Área de Subida de Imágenes
    imageUploadArea: {
        borderWidth: 2,
        borderColor: COLORS.grayText,
        borderStyle: 'dashed',
        borderRadius: 8,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    uploadText: {
        color: COLORS.grayText,
        marginTop: 5,
        fontSize: 14,
    },
    uploadSubText: {
        color: COLORS.grayText,
        fontSize: 12,
        marginBottom: 5,
    },
    uploadedCount: {
        color: COLORS.purple,
        fontWeight: 'bold',
        marginTop: 8,
    },
    // Acciones
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: COLORS.inputBackground,
    },
    cancelButton: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
    },
    cancelButtonText: {
        color: COLORS.grayText,
        fontWeight: 'bold',
        fontSize: 16,
    },
    publishButton: {
        backgroundColor: COLORS.purple,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    publishButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default CreatePostModal;
