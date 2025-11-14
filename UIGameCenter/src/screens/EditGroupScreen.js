import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; 
import * as FileSystem from 'expo-file-system';
import Icon from 'react-native-vector-icons/Ionicons'; 
import { getAuth } from 'firebase/auth'; 
import COLORS from '../constants/Colors'; 

import { showMessage } from "react-native-flash-message"; 

import { BASE_URL } from '@env';
const API_URL = `${BASE_URL}/api/group`;

const showAlert = (title, message, type = "info") => {
    let backgroundColor = COLORS.darkerBackground;
    let icon = 'info';

    if (type === 'error') {
        backgroundColor = COLORS.red; 
        icon = 'danger';
    } else if (type === 'success') {
        backgroundColor = COLORS.purple; 
        icon = 'success';
    } else if (type === 'warning') {
        backgroundColor = COLORS.yellow; 
        icon = 'warning';
    }

    showMessage({
        message: title,
        description: message,
        type: type === 'error' ? 'danger' : (type === 'success' ? 'success' : 'default'),
        backgroundColor: backgroundColor, 
        color: COLORS.white,
        textStyle: { fontWeight: 'bold' },
        titleStyle: { fontSize: 16, fontWeight: '800' },
        duration: 3500,
        icon: icon, 
        style: { paddingTop: 40 },
    });
};

const getAuthToken = async () => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            showAlert("Error de Autenticación", "No hay un usuario autenticado. Por favor, inicia sesión.", 'error');
            throw new Error("Usuario no autenticado"); 
        }
        
        const token = await user.getIdToken();
        return token; 
    } catch (error) {
        console.error("Error al obtener el token de Firebase:", error);
        showAlert("Error de Token", "No se pudo obtener el token de sesión. Intenta iniciar sesión de nuevo.", 'error');
        throw error;  
    }
};
const uriToBase64 = async (uri) => {
    try {
        if (uri.startsWith('blob:')) {
            console.log('Convirtiendo blob a base64...');
            
            const response = await fetch(uri);
            const blob = await response.blob();
            
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result;
                    resolve(base64data);
                };
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        } else if (Platform.OS !== 'web' && uri.startsWith('file://')) {
            const base64 = await FileSystem.readAsStringAsync(uri, {
                encoding: FileSystem.EncodingType.Base64,
            });
            return `data:image/jpeg;base64,${base64}`;
        } else {
            return uri;
        }
    } catch (error) {
        console.error('Error convirtiendo URI:', error);
        throw error;
    }
};

const EditGroupScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    
    const { groupId, initialData } = route.params;

    const initialStreamLink = initialData.streamLink 
        || (initialData.streamerInfo && initialData.streamerInfo.STREAMER_LINK_DSC) 
        || '';

    const [groupName, setGroupName] = useState(initialData.name || '');
    const [subtitle, setSubtitle] = useState(initialData.subtitle || '');
    const [streamLink, setStreamLink] = useState(initialStreamLink); 
    const [isStreamerType] = useState(initialData.communityType === 'STREAMER'); 
    
    const [profilePicUri, setProfilePicUri] = useState(initialData.profilePicUri || null);
    const [bannerUri, setBannerUri] = useState(initialData.bannerUri || null);
    const [newProfilePic, setNewProfilePic] = useState(null); 
    const [newBanner, setNewBanner] = useState(null);       
    
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        navigation.setOptions({ 
            headerShown: true, 
            title: `Editar ${initialData.name}`,
            headerStyle: { backgroundColor: COLORS.darkerBackground }, 
            headerTintColor: COLORS.white, 
        });
    }, [initialData.name, navigation]);

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    showAlert('Permiso requerido', 'Necesitamos acceso a la galería para cambiar las imágenes.', 'warning');
                }
            }
        })();
    }, []);

    const pickImage = async (type) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'profile' ? [1, 1] : [16, 9],
            quality: 0.8, 
            base64: false, 
        });

        console.log('Imagen seleccionada:', { type, result });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            console.log('URI de imagen:', uri);
            
            if (type === 'profile') {
                setProfilePicUri(uri);
                setNewProfilePic(uri);
                console.log('Nueva foto de perfil establecida');
            } else {
                setBannerUri(uri);
                setNewBanner(uri);
                console.log('Nuevo banner establecido');
            }
        }
    };

    const handleUpdate = async () => {
        if (isLoading) return;

        if (!groupName.trim() || !subtitle.trim()) {
            showAlert('Error', 'El nombre y el subtítulo son obligatorios.', 'warning');
            return;
        }

        if (isStreamerType && !streamLink.trim()) {
            showAlert('Error', 'El enlace de Stream es obligatorio para comunidades de Streamers.', 'warning');
            return;
        }

        setIsLoading(true);

        try {
            const authToken = await getAuthToken();
            
            const formData = new FormData();
            
            formData.append('GROUP_NAME_DSC', groupName);
            formData.append('SUBTITLE_DSC', subtitle);
            formData.append('COMMUNITY_TYPE_DSC', initialData.communityType); 
            
            if (isStreamerType) {
                formData.append('STREAM_URL', streamLink); 
            }

            if (newProfilePic) {
                const filename = newProfilePic.split('/').pop() || 'profile.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const fileType = match ? match[1] : 'jpg';
                
                if (newProfilePic.startsWith('blob:')) {
                    const base64Data = await uriToBase64(newProfilePic);
                    const response = await fetch(base64Data);
                    const blob = await response.blob();
                    
                    formData.append('profileImage', blob, `profile_${Date.now()}.${fileType}`);
                
                } else {
                    formData.append('profileImage', {
                        uri: newProfilePic,
                        name: `profile_${Date.now()}.${fileType}`,
                        type: `image/${fileType}`,
                    });
                   
                }
            }

            if (newBanner) {
                const filename = newBanner.split('/').pop() || 'banner.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const fileType = match ? match[1] : 'jpg';
                
                if (newBanner.startsWith('blob:')) {
              
                    const base64Data = await uriToBase64(newBanner);
                    
                    const response = await fetch(base64Data);
                    const blob = await response.blob();
                    
                    formData.append('bannerImage', blob, `banner_${Date.now()}.${fileType}`);
                   
                } else {
                  
                    formData.append('bannerImage', {
                        uri: newBanner,
                        name: `banner_${Date.now()}.${fileType}`,
                        type: `image/${fileType}`,
                    });
                    console.log('Archivo nativo de banner agregado al FormData');
                }
            }

            console.log('Enviando request a:', `${API_URL}/update/${groupId}`);

            const response = await fetch(`${API_URL}/update/${groupId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData,
            });

            console.log('Respuesta del servidor:', response.status);

            const data = await response.json();
            console.log('Data del servidor:', data);

            if (response.ok) {
                showAlert('Éxito', 'Comunidad/Grupo actualizado correctamente.', 'success');
                
                if (route.params?.onGroupUpdated) {
                    route.params.onGroupUpdated(); 
                }

                navigation.goBack();
            } else {
                console.error("Server Error:", data.message || `Status: ${response.status}`);
                showAlert('Error al Actualizar', data.message || `Error ${response.status}: Verifica las validaciones.`, 'error');
            }
        } catch (error) {
            console.error('Error durante la actualización:', error);
            console.error('Stack:', error.stack);
            if (!error.message.includes("Usuario no autenticado")) {
                showAlert('Error de Conexión', 'No se pudo completar la solicitud: ' + error.message, 'error');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            
            <TouchableOpacity onPress={() => pickImage('banner')} style={styles.bannerContainer}>
                {bannerUri && (
                    <Image source={{ uri: bannerUri }} style={styles.bannerImage} />
                )}
                <View style={styles.imageOverlay}>
                    <Icon name="camera-outline" size={30} color={COLORS.white} />
                    <Text style={styles.imageOverlayText}>Cambiar Banner</Text>
                </View>
            </TouchableOpacity>

            <View style={styles.profileContainer}>
                <TouchableOpacity onPress={() => pickImage('profile')} style={styles.profilePicWrapper}>
                    {profilePicUri && (
                        <Image source={{ uri: profilePicUri }} style={styles.profilePic} />
                    )}
                    <View style={styles.profileOverlay}>
                        <Icon name="pencil-outline" size={20} color={COLORS.white} />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
                <Text style={styles.label}>Nombre del Grupo/Comunidad</Text>
                <TextInput
                    style={styles.input}
                    value={groupName}
                    onChangeText={setGroupName}
                    placeholder="Escribe un nombre..."
                    placeholderTextColor={COLORS.grayText}
                />
                
                <Text style={styles.label}>Descripcion</Text>
                <TextInput
                    style={styles.input}
                    value={subtitle}
                    onChangeText={setSubtitle}
                    placeholder="Escribe una Descripcion..."
                    placeholderTextColor={COLORS.grayText}
                    maxLength={100}
                />
                
                <Text style={styles.label}>Tipo de Comunidad</Text>
                <TextInput
                    style={styles.inputDisabled}
                    value={isStreamerType ? "STREAMER" : "JUEGO"}
                    editable={false} 
                />
                
                {isStreamerType && (
                    <>
                        <Text style={styles.label}>Enlace de Stream (URL)</Text>
                        <TextInput
                            style={styles.input}
                            value={streamLink}
                            onChangeText={setStreamLink}
                            placeholder="Ej: https://twitch.tv/tu-perfil"
                            placeholderTextColor={COLORS.grayText}
                            keyboardType="url"
                        />
                    </>
                )}
                
            </View>

            <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]} 
                onPress={handleUpdate}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                ) : (
                    <Text style={styles.buttonText}>Guardar Cambios</Text>
                )}
            </TouchableOpacity>

            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.darkBackground, 
    },
    bannerContainer: {
        height: 200,
        backgroundColor: COLORS.darkerBackground,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerImage: {
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    imageOverlay: {
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
    imageOverlayText: {
        color: COLORS.white,
        marginTop: 5,
        fontWeight: 'bold',
    },
    profileContainer: {
        alignItems: 'center',
        marginTop: -50, 
        marginBottom: 20,
    },
    profilePicWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 4,
        borderColor: COLORS.darkBackground, 
        overflow: 'hidden',
    },
    profilePic: {
        width: '100%',
        height: '100%',
    },
    profileOverlay: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: COLORS.purple, 
        borderRadius: 15,
        padding: 5,
    },
    formSection: {
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 14,
        color: COLORS.white,
        marginTop: 15,
        marginBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: COLORS.inputBackground, 
        color: COLORS.white,
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
    },
    inputDisabled: {
        backgroundColor: COLORS.darkerBackground, 
        color: COLORS.grayText,
        padding: 10,
        borderRadius: 5,
        fontSize: 16,
    },
    debugPanel: {
        marginTop: 20,
        padding: 15,
        backgroundColor: 'rgba(255,255,0,0.1)',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'yellow',
    },
    debugTitle: {
        color: 'yellow',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    debugText: {
        color: COLORS.white,
        fontSize: 14,
        marginTop: 4,
    },
    button: {
        backgroundColor: COLORS.purple, 
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 20,
        marginTop: 30,
    },
    buttonDisabled: {
        backgroundColor: '#7a5ecc', 
    },
    buttonText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default EditGroupScreen;