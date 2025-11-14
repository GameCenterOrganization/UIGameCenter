import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, useWindowDimensions, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { getAuth } from 'firebase/auth';
import COLORS from '../constants/Colors';
import { BASE_URL } from '@env';

import { showMessage } from "react-native-flash-message";

const TYPE_JUEGO = 'GAME';
const TYPE_STREAMER = 'STREAMER';

const showAlert = (title, message) => {
  showMessage({
    message: title,
    description: message,
    type: "default",
    backgroundColor: COLORS.darkerBackground, 
    color: COLORS.white, 
    textStyle: { fontWeight: 'bold' },
    titleStyle: { fontSize: 16, fontWeight: '800' },
    duration: 3500,
    icon: 'danger',
    style: { paddingTop: 40 },
  });
};

const CreateGroupScreen = ({ navigation, route }) => {
    const { width } = useWindowDimensions();
    const isWide = width > 800;
    const [groupType, setGroupType] = useState(TYPE_JUEGO);
    const [groupName, setGroupName] = useState('');
    const [groupSubtitle, setGroupSubtitle] = useState('');
    const [streamerLink, setStreamerLink] = useState('');
    
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [bannerImageFile, setBannerImageFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const profileInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const handleWebFileChange = (event, setImageFile) => {
        const file = event.target.files[0];
        if (file) {
            setImageFile({
                uri: URL.createObjectURL(file),
                type: file.type,
                name: file.name,
                file,
            });
        }
    };

    const pickImage = async (setImageFile, aspect, inputRef) => {
        if (Platform.OS === 'web') {
            inputRef.current.click();
            return;
        }

        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            showAlert("Permiso Denegado", "Necesitas dar permiso para acceder a la galería de fotos.");
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: aspect,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets[0]) {
            const asset = result.assets[0];
            
            setImageFile({
                uri: asset.uri,
                type: 'image/jpeg',
                name: asset.fileName || `group_${Date.now()}.jpg`,
            });
        }
    };

    const pickProfileImage = () => pickImage(setProfileImageFile, [1, 1], profileInputRef);
    const pickBannerImage = () => pickImage(setBannerImageFile, [4, 2], bannerInputRef);

    const handleSubmit = async () => {
        if (isLoading) return;

        if (!groupName || !groupSubtitle || !profileImageFile) {
            showAlert("Error", "Por favor, completa todos los campos obligatorios (Nombre, Subtítulo/Descripción e Ícono de Grupo).");
            return;
        }
        
        if (groupType === TYPE_STREAMER && !streamerLink) {
            showAlert("Error", "Para comunidades de Streamers, el enlace es obligatorio.");
            return;
        }
        
        setIsLoading(true);

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) {
                showAlert('Error', 'Debes iniciar sesión para crear un grupo.');
                setIsLoading(false);
                return;
            }
            const token = await user.getIdToken();
            const formData = new FormData();
            
            formData.append('GROUP_NAME_DSC', groupName);
            formData.append('SUBTITLE_DSC', groupSubtitle);
            formData.append('COMMUNITY_TYPE_DSC', groupType);
            
            if (groupType === TYPE_STREAMER) {
                formData.append('STREAM_URL', streamerLink);
            }

            if (profileImageFile) {
                if (Platform.OS === 'web' && profileImageFile.file) {
                    formData.append('profileImage', profileImageFile.file, profileImageFile.name);
                } else {
                    formData.append('profileImage', {
                        uri: profileImageFile.uri,
                        type: profileImageFile.type,
                        name: profileImageFile.name,
                    });
                }
            }
            
            if (bannerImageFile) {
                if (Platform.OS === 'web' && bannerImageFile.file) {
                    formData.append('bannerImage', bannerImageFile.file, bannerImageFile.name);
                } else {
                    formData.append('bannerImage', {
                        uri: bannerImageFile.uri,
                        type: bannerImageFile.type,
                        name: bannerImageFile.name,
                    });
                }
            }

            console.log('Enviando desde:', Platform.OS);
            console.log('FormData preparado:', {
                groupName,
                groupSubtitle,
                groupType,
                hasProfileFile: Platform.OS === 'web' ? !!profileImageFile?.file : !!profileImageFile,
                hasBannerFile: Platform.OS === 'web' ? !!bannerImageFile?.file : !!bannerImageFile,
            });

            const response = await fetch(`${BASE_URL}/api/group/register`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                showAlert("Éxito", `Grupo "${groupName}" creado con éxito.`);
                
                if (route.params?.onGroupCreated) {
                    route.params.onGroupCreated();
                }
                
                navigation.goBack();
            } else {
                console.error("Error API:", result);
                showAlert("Error al crear", result.message || "Ocurrió un error en el servidor.");
            }

        } catch (error) {
            console.error("Error de Red/Petición:", error);
            showAlert("Error de Conexión", error.message || "No se pudo conectar con el servidor o la red falló.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {Platform.OS === 'web' && (
                <>
                    <input
                        type="file"
                        accept="image/*"
                        ref={profileInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => handleWebFileChange(e, setProfileImageFile)}
                    />
                    <input
                        type="file"
                        accept="image/*"
                        ref={bannerInputRef}
                        style={{ display: 'none' }}
                        onChange={(e) => handleWebFileChange(e, setBannerImageFile)}
                    />
                </>
            )}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Crear Grupo de Juego</Text>
            </View>

            <ScrollView contentContainerStyle={[styles.scrollContent, !isWide && { paddingBottom: 80 }]}>
                <View style={[styles.contentWrapper, !isWide && { flexDirection: 'column' }]}>
                
                    <View style={[styles.formContainer, !isWide && { marginRight: 0 }]}>
                        <Text style={styles.sectionTitle}>Información del Grupo</Text>

                        <View style={styles.typeSelector}>
                            <TouchableOpacity onPress={() => {setGroupType(TYPE_JUEGO); setStreamerLink('');}} style={styles.radioContainer}>
                                <View style={[styles.radio, groupType === TYPE_JUEGO && styles.radioActive]}>
                                    {groupType === TYPE_JUEGO && <View style={styles.radioDot} />}
                                </View>
                                <Text style={styles.radioText}>Grupo de Juego (Comunidad)</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setGroupType(TYPE_STREAMER)} style={styles.radioContainer}>
                                <View style={[styles.radio, groupType === TYPE_STREAMER && styles.radioActive]}>
                                    {groupType === TYPE_STREAMER && <View style={styles.radioDot} />}
                                </View>
                                <Text style={styles.radioText}>Comunidad de Streamer</Text>
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>Nombre del Grupo</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ej: Fortnite Latinos"
                            placeholderTextColor={COLORS.grayText}
                            value={groupName}
                            onChangeText={setGroupName}
                            maxLength={50}
                        />
                        <Text style={styles.charLimit}>{groupName.length}/50 caracteres</Text>
                        
                        {groupType === TYPE_STREAMER && (
                            <>
                                <Text style={styles.inputLabel}>Link de Streamer (Obligatorio)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="https://twitch.tv/mi_streamer"
                                    placeholderTextColor={COLORS.grayText}
                                    value={streamerLink}
                                    onChangeText={setStreamerLink}
                                />
                            </>
                        )}
                        
                        <Text style={styles.inputLabel}>Subtítulo / Descripción Corta (Obligatorio)</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Una frase corta que describa el grupo o sus reglas principales..."
                            placeholderTextColor={COLORS.grayText}
                            value={groupSubtitle}
                            onChangeText={setGroupSubtitle}
                            multiline
                            maxLength={250}
                        />
                        <Text style={styles.charLimit}>{groupSubtitle.length}/250 caracteres</Text>
                        
                        <Text style={styles.inputLabel}>Icono del Grupo (Obligatorio)</Text>
                        <TouchableOpacity style={styles.uploadBox} onPress={pickProfileImage}>
                            <Ionicons name={profileImageFile ? "checkmark-circle" : "cloud-upload-outline"} size={30} color={profileImageFile ? COLORS.purple : COLORS.grayText} />
                            <Text style={styles.uploadText}>
                                {profileImageFile ? `✅ ${profileImageFile.name}` : 'Haz clic para subir'}
                            </Text>
                            <Text style={styles.uploadSubText}>PNG, JPG hasta 5MB (Aspecto 1:1)</Text>
                        </TouchableOpacity>

                        <Text style={styles.inputLabel}>Imagen del Banner (Opcional)</Text>
                        <TouchableOpacity style={styles.uploadBox} onPress={pickBannerImage}>
                            <Ionicons name={bannerImageFile ? "checkmark-circle" : "cloud-upload-outline"} size={30} color={bannerImageFile ? COLORS.purple : COLORS.grayText} />
                            <Text style={styles.uploadText}>
                                {bannerImageFile ? `✅ ${bannerImageFile.name}` : 'Haz clic para subir'}
                            </Text>
                            <Text style={styles.uploadSubText}>PNG, JPG hasta 5MB (Aspecto 4:2 recomendado)</Text>
                        </TouchableOpacity>

                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()} disabled={isLoading}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.createButton} onPress={handleSubmit} disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator color={COLORS.white} />
                                ) : (
                                    <Text style={styles.createButtonText}>Crear Grupo</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={[styles.sidebarContainer, !isWide && { borderLeftWidth: 0, paddingLeft: 0, marginTop: 30 }]}>
                        <Text style={styles.sectionTitle}>Consejos</Text>
                        <View style={styles.tipBox}>
                            <Ionicons name="information-circle-outline" size={20} color={COLORS.purple} />
                            <Text style={styles.tipText}>Usa un nombre descriptivo y un subtítulo claro para atraer miembros.</Text>
                        </View>
                        <Text style={styles.tipTitle}>Mínimos Requeridos:</Text>
                        <View style={styles.bulletList}>
                            <Text style={styles.bulletText}>• Nombre del grupo</Text>
                            <Text style={styles.bulletText}>• Subtítulo (Descripción Corta)</Text>
                            <Text style={styles.bulletText}>• Icono (Imagen de Perfil)</Text>
                        </View>
                        <Text style={styles.monetizationText}>Los grupos creados pueden monetizar con GameCenter Plus</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.darkBackground },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: COLORS.darkerBackground,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBackground,
    },
    backButton: { marginRight: 15 },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    scrollContent: { padding: 20 },
    contentWrapper: { flexDirection: 'row', justifyContent: 'space-between' },
    formContainer: { flex: 2, marginRight: 20 },
    sidebarContainer: { flex: 1, paddingLeft: 20, borderLeftWidth: 1, borderLeftColor: COLORS.inputBackground },

    sectionTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 15 },
    inputLabel: { color: COLORS.grayText, fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 5 },
    input: {
        backgroundColor: COLORS.inputBackground,
        color: COLORS.white,
        padding: 10,
        borderRadius: 8,
        fontSize: 15,
    },
    textArea: {
        backgroundColor: COLORS.inputBackground,
        color: COLORS.white,
        padding: 10,
        borderRadius: 8,
        fontSize: 15,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    charLimit: { color: COLORS.grayText, fontSize: 12, textAlign: 'right', marginTop: 4 },
    typeSelector: { marginBottom: 15 },
    radioContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.grayText, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
    radioActive: { borderColor: COLORS.purple },
    radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.purple },
    radioText: { color: COLORS.white, fontSize: 14 },

    uploadBox: {
        backgroundColor: COLORS.inputBackground,
        height: 120,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: COLORS.grayText,
    },
    uploadText: { color: COLORS.white, fontWeight: '600', fontSize: 14, marginTop: 5 },
    uploadSubText: { color: COLORS.grayText, fontSize: 12 },

    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 30, gap: 10, paddingTop: 20 },
    cancelButton: { paddingVertical: 10, paddingHorizontal: 20 },
    cancelButtonText: { color: COLORS.grayText, fontWeight: '700' },
    createButton: { backgroundColor: COLORS.purple, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    createButtonText: { color: COLORS.white, fontWeight: '700' },
    tipBox: { flexDirection: 'row', backgroundColor: COLORS.purple + '20', padding: 15, borderRadius: 8, marginBottom: 20 },
    tipText: { color: COLORS.white, fontSize: 14, marginLeft: 10, flexShrink: 1 },
    tipTitle: { color: COLORS.white, fontWeight: '700', marginBottom: 10 },
    bulletList: { marginBottom: 15 },
    bulletText: { color: COLORS.white, fontSize: 13, marginBottom: 5 },
    monetizationText: { color: COLORS.grayText, fontSize: 11, marginTop: 20, borderTopWidth: 1, borderTopColor: COLORS.inputBackground, paddingTop: 10 },
});

export default CreateGroupScreen;