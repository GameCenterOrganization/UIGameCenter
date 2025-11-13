import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert, ActivityIndicator, TouchableOpacity, Image, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker'; 
import Icon from 'react-native-vector-icons/Ionicons'; 
import { getAuth } from 'firebase/auth'; 
import COLORS from '../constants/Colors'; 

const BASE_URL = 'http://192.168.0.6:8080';
const API_URL = `${BASE_URL}/api/group`; 

const getAuthToken = async () => {
    try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
            Alert.alert("Error de Autenticación", "No hay un usuario autenticado. Por favor, inicia sesión.");
            throw new Error("Usuario no autenticado"); 
        }
        
        const token = await user.getIdToken();
        return token; 
    } catch (error) {
        console.error("Error al obtener el token de Firebase:", error);
        Alert.alert("Error de Token", "No se pudo obtener el token de sesión. Intenta iniciar sesión de nuevo.");
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
                    Alert.alert('Permiso requerido', 'Necesitamos acceso a la galería para cambiar las imágenes.');
                }
            }
        })();
    }, []);

    const pickImage = async (type) => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'profile' ? [1, 1] : [16, 9],
            quality: 1,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            if (type === 'profile') {
                setProfilePicUri(uri);
                setNewProfilePic(uri);
            } else {
                setBannerUri(uri);
                setNewBanner(uri);
            }
        }
    };

    const handleUpdate = async () => {
        if (isLoading) return;

        if (!groupName.trim() || !subtitle.trim()) {
            Alert.alert('Error', 'El nombre y el subtítulo son obligatorios.');
            return;
        }

        if (isStreamerType && !streamLink.trim()) {
            Alert.alert('Error', 'El enlace de Stream es obligatorio para comunidades de Streamers.');
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
            
            const cleanPath = (uri) => uri ? uri.replace(BASE_URL, '') : null;

            if (!newProfilePic && initialData.profilePicUri) {
                formData.append('PROFILE_IMG_URL', cleanPath(initialData.profilePicUri)); 
            }

            if (!newBanner && initialData.bannerUri) {
                formData.append('BANNER_IMG_URL', cleanPath(initialData.bannerUri));
            }

            const appendImage = (uri, fieldName) => {
                  const uriParts = uri.split('.');
                  const fileType = uriParts[uriParts.length - 1]; 
                  const mimeType = fileType === 'png' ? 'image/png' : 'image/jpeg';

                  formData.append(fieldName, {
                      uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),  
                      name: `${fieldName}_${Date.now()}.${fileType}`,
                      type: mimeType, 
                  });
            };

            if (newProfilePic) {
                appendImage(newProfilePic, 'profileImage');
            }

            if (newBanner) {
                appendImage(newBanner, 'bannerImage');
            }

            const response = await fetch(`${API_URL}/update/${groupId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                Alert.alert('Éxito', 'Comunidad/Grupo actualizado correctamente.');
                
                if (route.params?.onGroupUpdated) {
                    route.params.onGroupUpdated();
                }

                navigation.goBack();
            } else {
                console.error("Server Error:", data.message || `Status: ${response.status}`);
                Alert.alert('Error al Actualizar', data.message || `Error ${response.status}: Verifica las validaciones.`);
            }
        } catch (error) {
            console.error('Error durante la actualización:', error.message);
            if (!error.message.includes("Usuario no autenticado")) {
                Alert.alert('Error de Conexión', 'No se pudo completar la solicitud.');
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
                
                <Text style={styles.label}>Subtítulo</Text>
                <TextInput
                    style={styles.input}
                    value={subtitle}
                    onChangeText={setSubtitle}
                    placeholder="Escribe un subtítulo..."
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
                            placeholder="Ej: https://twitch.tv/auronm"
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