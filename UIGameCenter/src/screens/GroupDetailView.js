import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView,
    Image, TouchableOpacity, TextInput,
    SafeAreaView, Modal, Switch, Linking, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import COLORS from '../constants/Colors';
import GroupPostItem from '../components/GroupPostItem';
import MemberListingRow from '../components/MemberListingRow';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import * as ImagePicker from 'expo-image-picker';

const BASE_URL = "http://localhost:8080";
const API_URL = `${BASE_URL}/api/group`;

const getFirebaseToken = async () => {
    const auth = getAuth();
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            try {
                if (user) {
                    const token = await user.getIdToken();
                    resolve(token);
                } else {
                    resolve(null);
                }
            } catch (err) {
                console.error("Error obteniendo token firebase:", err);
                resolve(null);
            }
        });
    });
};

const mapApiToGroupDetail = (group) => {
    const isStreamer = !!group.streamerInfo;
    const isLive = isStreamer && group.streamerInfo?.IS_LIVE_BOOL;
    const membersTotal = group.GROUP_MEMBER_COUNT ? group.GROUP_MEMBER_COUNT.toLocaleString('es-ES') : '0';
    return {
        id: group.ID_GROUP,
        name: group.GROUP_NAME_DSC,
        subtitle: group.SUBTITLE_DSC || 'Sin descripción.',
        communityType: group.COMMUNITY_TYPE_DSC,
        membersTotal: membersTotal,
        isStreamer: isStreamer,
        bannerUri: group.BANNER_IMG_URL
            ? `${BASE_URL}${group.BANNER_IMG_URL}`
            : `https://picsum.photos/600/200?random=${group.ID_GROUP}_bg`,
        profilePicUri: group.PROFILE_IMG_URL
            ? `${BASE_URL}${group.PROFILE_IMG_URL}`
            : `https://picsum.photos/100/100?random=${group.ID_GROUP}_pfp`,
        membersOnline: isStreamer ? '3,400' : '1,234',
        isLive: isLive,
        streamLink: isStreamer ? group.streamerInfo.STREAM_URL : null,
        liveSpectators: isLive ? (group.streamerInfo.LIVE_SPECTATORS_INT ? group.streamerInfo.LIVE_SPECTATORS_INT.toLocaleString('es-ES') : 'N/A') : null,
    };
};

const MEMBERS_DATA = [
    { id: 'm1', username: 'GamerPro123', role: 'Admin', avatarUri: 'https://picsum.photos/40/40?random=a', isOnline: true },
    { id: 'm2', username: 'ProPlayer99', role: 'Moderador', avatarUri: 'https://picsum.photos/40/40?random=b', isOnline: true },
    { id: 'm3', username: 'ElStreamerPro', role: 'Miembro', avatarUri: 'https://picsum.photos/40/40?random=c', isOnline: true },
    { id: 'm4', username: 'NoobMaster', role: 'Miembro', avatarUri: 'https://picsum.photos/40/40?random=d', isOnline: false },
];


const POSTS_DATA = [
    { id: 'p1', username: 'GamerPro123', time: 'Hace 2 horas', content: '¿Alguien para ranked? Necesitamos 2 más para el equipo. Nivel Platino o superior.', likes: 24, comments: 8, shares: 2, userAvatarUri: 'https://picsum.photos/50/50?random=p1' },
    { id: 'p2', username: 'ProPlayer99', time: 'Ayer', content: 'Gran torneo el fin de semana. ¡Felicidades a los ganadores!', likes: 105, comments: 3, shares: 1, userAvatarUri: 'https://picsum.photos/50/50?random=p2' },
];

const AvisarDirectoModal = ({ isVisible, onClose }) => {
    const [streamTitle, setStreamTitle] = useState('');
    const [isLiveNow, setIsLiveNow] = useState(false);

    const handleAvisar = () => {
        if (isLiveNow) {
            console.log('Avisando directo INMEDIATO con título:', streamTitle);
        } else {
            console.log('Programando directo con título:', streamTitle);
        }
        onClose();
    };

    const modalStyles = StyleSheet.create({
        centeredView: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        modalView: {
            margin: 20,
            backgroundColor: COLORS.darkBackground,
            borderRadius: 10,
            padding: 35,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            width: '90%',
        },
        modalTitle: {
            marginBottom: 20,
            textAlign: 'center',
            fontSize: 20,
            fontWeight: 'bold',
            color: COLORS.white,
        },
        toggleRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            marginBottom: 20,
            paddingVertical: 10,
        },
        toggleText: {
            color: COLORS.grayText,
            fontSize: 16,
        },
        input: {
            width: '100%',
            padding: 12,
            borderWidth: 1,
            borderColor: COLORS.inputBackground,
            borderRadius: 8,
            color: COLORS.white,
            backgroundColor: COLORS.inputBackground,
            marginBottom: 15,
        },
        dateButton: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            backgroundColor: COLORS.inputBackground,
            borderRadius: 8,
            width: '100%',
            justifyContent: 'center',
            marginBottom: 20,
        },
        dateButtonText: {
            color: COLORS.purple,
            marginLeft: 10,
            fontWeight: '600',
        },
        buttonRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: 10,
        },
        button: {
            borderRadius: 8,
            padding: 10,
            elevation: 2,
            flex: 1,
            marginHorizontal: 5,
        },
        cancelButton: {
            backgroundColor: COLORS.inputBackground,
            borderWidth: 1,
            borderColor: COLORS.grayText,
        },
        programButton: {
            backgroundColor: COLORS.purple,
        },
        textStyle: {
            color: COLORS.white,
            textAlign: 'center',
            fontWeight: '600',
        },
    });

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={onClose}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.modalTitle}>
                        {isLiveNow ? 'Avisar Directo AHORA' : 'Programar Directo/Evento'}
                    </Text>
                    <View style={modalStyles.toggleRow}>
                        <Text style={modalStyles.toggleText}>¿Estás en directo ahora?</Text>
                        <Switch
                            trackColor={{ false: COLORS.grayText, true: COLORS.purple }}
                            thumbColor={COLORS.white}
                            onValueChange={setIsLiveNow}
                            value={isLiveNow}
                        />
                    </View>
                    <TextInput
                        style={modalStyles.input}
                        placeholder="Título del Stream/Evento (Ej: Ranked con subs)"
                        placeholderTextColor={COLORS.grayText}
                        value={streamTitle}
                        onChangeText={setStreamTitle}
                    />
                    {!isLiveNow && (
                        <TouchableOpacity style={modalStyles.dateButton}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.purple} />
                            <Text style={modalStyles.dateButtonText}>Seleccionar Fecha y Hora</Text>
                        </TouchableOpacity>
                    )}
                    <View style={modalStyles.buttonRow}>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.cancelButton]}
                            onPress={onClose}
                        >
                            <Text style={modalStyles.textStyle}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[modalStyles.button, modalStyles.programButton]}
                            onPress={handleAvisar}
                            disabled={streamTitle.length < 3}
                        >
                            <Text style={[modalStyles.textStyle, { fontWeight: '800' }]}>
                                {isLiveNow ? 'Confirmar Aviso' : 'Programar'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const GroupDetailView = ({ navigation, route }) => {
    const [activeTab, setActiveTab] = useState('Publicaciones');
    const [isAvisarModalVisible, setIsAvisarModalVisible] = useState(false);
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [newPostText, setNewPostText] = useState("");
    const [imageUri, setImageUri] = useState(null);
    const groupId = route.params?.groupData?.id;

    const handleStreamPress = () => {
        if (groupData?.streamLink) {
            Linking.openURL(groupData.streamLink).catch(err =>
                Alert.alert("Error", "No se pudo abrir el enlace: " + groupData.streamLink)
            );
        }
    };

    const handleSettingsPress = () => {
        navigation.navigate('EditGroupScreen', { groupId: groupData.id, initialData: groupData });
    };

    const fetchGroupDetail = useCallback(async () => {
        if (!groupId) {
            setLoading(false);
            Alert.alert("Error", "ID del grupo no proporcionado. Asegúrate de pasar 'groupData.id' en la navegación.");
            return;
        }
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/${groupId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar el detalle del grupo');
            }
            const data = await response.json();
            const mappedDetail = mapApiToGroupDetail(data.group);
            setGroupData(mappedDetail);
        } catch (error) {
            console.error('Error fetching group detail:', error);
            Alert.alert('Error de API', error.message || 'Hubo un error al cargar el detalle de la comunidad.');
            setGroupData(null);
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    const fetchGroupPosts = async () => {
        try {
            const res = await fetch(`${API_URL}/${groupId}/posts`);
            const data = await res.json();
            if (!res.ok) {
                console.error("Error fetching posts:", data);
                return;
            }
            
        } catch (err) {
            console.error("Error cargando publicaciones:", err);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchGroupDetail();
            fetchGroupPosts();
            return () => { };
        }, [fetchGroupDetail, groupId])
    );

    const constructImageUri = (imageObj) => {
        if (!imageObj) return null;
        
        const possibleFields = [
            'IMG_URL', 'IMG_URL_DSC', 'IMAGE_URL', 'path', 'filename',
            'image_path', 'image_url', 'url', 'file_path', 'full_path', 'uri'
        ];
        for (const field of possibleFields) {
            if (imageObj[field]) {
                let url = imageObj[field];
                if (!url.startsWith('http')) {
                    if (url.startsWith('/')) {
                        url = `${BASE_URL}${url}`;
                    } else {
                        url = `${BASE_URL}/${url}`;
                    }
                }
                return url;
            }
        }
        
        for (const [key, value] of Object.entries(imageObj)) {
            if (typeof value === 'string' &&
                (value.includes('image') || value.includes('img') ||
                 value.includes('.jpg') || value.includes('.png') || value.includes('.jpeg') ||
                 value.includes('/images/'))) {
                let url = value;
                if (!url.startsWith('http')) {
                    if (url.startsWith('/')) {
                        url = `${BASE_URL}${url}`;
                    } else {
                        url = `${BASE_URL}/${url}`;
                    }
                }
                return url;
            }
        }
        return null;
    };

    const renderContent = () => {
        if (!groupData) return null;
        if (activeTab === 'Publicaciones') {
            return (
                <View>
                    <View style={styles.createPostContainer}>
                        <Text style={styles.userAvatarInitial}>TU</Text>
                        <TextInput
                            placeholder="¿Qué quieres compartir con el grupo?"
                            placeholderTextColor={COLORS.grayText}
                            style={styles.postInput}
                            multiline
                            value={newPostText}
                            onChangeText={setNewPostText}
                        />
                        <View style={styles.postActions}>
                            <TouchableOpacity style={styles.imageButton} onPress={async () => {
                                const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                if (!permission.granted) {
                                    Alert.alert("Permiso denegado", "Debes permitir acceso a la galería para subir imágenes.");
                                    return;
                                }
                                const result = await ImagePicker.launchImageLibraryAsync({
                                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                                    allowsEditing: true,
                                    quality: 0.8,
                                });
                                if (!result.canceled) setImageUri(result.assets[0].uri);
                            }}>
                                <Ionicons name="image-outline" size={24} color={COLORS.grayText} />
                                <Text style={styles.imageButtonText}>Imagen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.postButton} onPress={async () => {
                                if (!newPostText.trim()) return Alert.alert("Escribe algo para publicar");
                                try {
                                    const token = await getFirebaseToken();
                                    if (!token) return Alert.alert("No autenticado", "Inicia sesión para publicar.");
                                    const formData = new FormData();
                                    formData.append("POST_CONTENT_DSC", newPostText);
                                    
                                    if (imageUri) {
                                        const response = await fetch(imageUri);
                                        const blob = await response.blob();
                                        const filename = `photo_${Date.now()}.jpg`;
                                        formData.append("image", blob, filename);
                                        
                                    }
                                    
                                    const res = await fetch(`${API_URL}/${groupId}/posts`, {
                                        method: 'POST',
                                        headers: {
                                            "Authorization": `Bearer ${token}`,
                                        },
                                        body: formData,
                                    });
                                    
                                    const data = await res.json();
                                    
                                    if (!res.ok) {
                                        throw new Error(data.message || "Error creando publicación");
                                    }
                                    if (data.post) {
                                        
                                        setPosts(prev => [data.post, ...prev]);
                                        setNewPostText("");
                                        setImageUri(null);
                                        
                                    }
                                } catch (err) {
                                    console.error("Error creating post:", err);
                                    Alert.alert("Error al publicar", err.message || "Revisa la consola");
                                }
                            }}>
                                <Text style={styles.postButtonText}>Publicar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {imageUri && (
                        <View style={{ position: 'relative', marginBottom: 10 }}>
                            <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200, borderRadius: 10 }} />
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    borderRadius: 15,
                                    width: 30,
                                    height: 30,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                                onPress={() => setImageUri(null)}
                            >
                                <Ionicons name="close" size={20} color={COLORS.white} />
                            </TouchableOpacity>
                        </View>
                    )}
                    {posts.length > 0 ? (
                        posts.map(post => {
                            
                            let imageUri = null;
                            if (post.images && Array.isArray(post.images) && post.images.length > 0) {
                                
                                imageUri = constructImageUri(post.images[0]);
                                
                            } else if (post.images && typeof post.images === 'object' && !Array.isArray(post.images)) {
                                
                                imageUri = constructImageUri(post.images);
                            }
                            
                            return (
                                <GroupPostItem
                                    key={post.ID_GROUP_POST || post.id}
                                    post={{
                                        id: post.ID_GROUP_POST || post.id,
                                        username: post.user?.USERNAME_DSC || post.username || "Miembro",
                                        time: post.POST_DATE ? new Date(post.POST_DATE).toLocaleString() : (post.time || ''),
                                        content: post.POST_CONTENT_DSC || post.content,
                                        imageUri: imageUri, 
                                        userAvatarUri: post.user?.PROFILE_PIC ? `${BASE_URL}${post.user.PROFILE_PIC}` : `https://picsum.photos/50/50?random=${post.ID_GROUP_POST || post.id}`,
                                        likes: post.likesCount || post.likes || 0,
                                        comments: post.commentsCount || post.comments || 0,
                                    }}
                                    onPress={() => { }}
                                />
                            );
                        })
                    ) : (
                        <Text style={{ color: COLORS.white, textAlign: 'center', padding: 20 }}>
                            No hay publicaciones en este grupo
                        </Text>
                    )}
                </View>
            );
        }
        if (activeTab === 'Miembros') {
            return (
                <View style={styles.membersListContainer}>
                    <Text style={styles.membersCountText}>Miembros del grupo</Text>
                    <Text style={styles.membersCountSubText}>{groupData.membersTotal} miembros • {groupData.membersOnline} en línea</Text>
                    {MEMBERS_DATA.map(member => (
                        <MemberListingRow key={member.id} member={member} onPressProfile={() => { }} />
                    ))}
                </View>
            );
        }
        if (activeTab === 'Eventos') {
            return (
                <View style={styles.placeholderContainer}>
                    <Text style={styles.placeholderText}>Aquí se mostrarán los Eventos Programados del Grupo.</Text>
                    <TouchableOpacity
                        style={styles.eventActionButton}
                        onPress={() => navigation.navigate('ProgramarEvento')}
                    >
                        <Text style={styles.eventActionButtonText}>Programar Evento</Text>
                    </TouchableOpacity>
                </View>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.purple} />
                <Text style={{ color: COLORS.grayText, marginTop: 10, fontSize: 16 }}>Cargando detalles del grupo...</Text>
            </SafeAreaView>
        );
    }

    if (!groupData) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
                <Ionicons name="alert-circle-outline" size={50} color={COLORS.red} />
                <Text style={{ color: COLORS.white, marginTop: 20, fontSize: 18, textAlign: 'center' }}>
                    Error al cargar el grupo.
                </Text>
                <Text style={{ color: COLORS.grayText, marginTop: 10, fontSize: 14, textAlign: 'center' }}>
                    Verifica tu conexión y que el ID del grupo sea correcto ({groupId || 'ID Faltante'}).
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: 30, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: COLORS.purple, borderRadius: 8 }}
                >
                    <Text style={{ color: COLORS.white, fontWeight: '700' }}>Volver</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <AvisarDirectoModal
                isVisible={isAvisarModalVisible}
                onClose={() => setIsAvisarModalVisible(false)}
            />
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.headerContainer}>
                    <Image source={{ uri: groupData.bannerUri }} style={styles.bannerImage} />
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    <View style={styles.groupInfoBox}>
                        <View style={styles.groupHeaderRow}>
                            <Image source={{ uri: groupData.profilePicUri }} style={styles.profileImage} />
                            <View style={styles.titleContainer}>
                                <Text style={styles.groupTitleText}>{groupData.name}</Text>
                                <Text style={styles.groupSubtitleText}>{groupData.communityType}</Text>
                            </View>
                        </View>
                        <Text style={styles.groupDescriptionText}>{groupData.subtitle}</Text>
                        <View style={styles.groupContentRow}>
                            <View style={styles.statsAndActions}>
                                <View style={styles.statsRow}>
                                    <Text style={styles.statText}>
                                        {groupData.membersTotal} miembros • {groupData.membersOnline} en línea
                                    </Text>
                                </View>
                                <View style={styles.actionButtonsRow}>
                                    {groupData.isLive && groupData.isStreamer && (
                                        <View style={styles.liveBadge}>
                                            <Text style={styles.liveBadgeText}>
                                                EN VIVO - {groupData.liveSpectators || '??'} espectadores
                                            </Text>
                                        </View>
                                    )}
                                    {groupData.isStreamer && groupData.streamLink && (
                                        <TouchableOpacity
                                            style={styles.streamActionButton}
                                            onPress={handleStreamPress}
                                        >
                                            <Ionicons name="logo-twitch" size={20} color={COLORS.white} />
                                            <Text style={styles.actionText}>Ver Stream</Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity style={styles.actionIcon}>
                                        <Ionicons name="notifications-outline" size={20} color={COLORS.white} />
                                        <Text style={styles.actionText}>Notificaciones</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.actionIcon}>
                                        <Ionicons name="share-social-outline" size={20} color={COLORS.white} />
                                        <Text style={styles.actionText}>Compartir</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.actionIcon}
                                        onPress={handleSettingsPress}
                                    >
                                        <Ionicons name="settings-outline" size={20} color={COLORS.white} />
                                        <Text style={styles.actionText}>Configuración</Text>
                                    </TouchableOpacity>
                                    {groupData.isStreamer && (
                                        <TouchableOpacity
                                            style={styles.actionIcon}
                                            onPress={() => setIsAvisarModalVisible(true)}
                                        >
                                            <Ionicons name="calendar-outline" size={20} color={COLORS.white} />
                                            <Text style={styles.actionText}>Avisar Directo</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.tabContainer}>
                    {['Publicaciones', 'Miembros', 'Eventos'].map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.contentArea}>
                    {renderContent()}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.darkBackground },
    headerContainer: {
        backgroundColor: COLORS.darkerBackground,
        paddingBottom: 15,
    },
    bannerImage: {
        width: '100%',
        height: 180,
        backgroundColor: COLORS.inputBackground,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 15,
        zIndex: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 5,
    },
    groupInfoBox: {
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    groupHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: -50,
    },
    titleContainer: {
        flex: 1,
        marginLeft: 10,
    },
    groupTitleText: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: '900',
        marginBottom: 2,
    },
    groupSubtitleText: {
        color: COLORS.grayText,
        fontSize: 14,
        fontWeight: '500',
    },
    groupDescriptionText: {
        color: COLORS.white,
        fontSize: 14,
        fontWeight: '400',
        marginBottom: 15,
        marginTop: 5,
        lineHeight: 20,
    },
    groupContentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 3,
        borderColor: COLORS.darkerBackground,
        backgroundColor: COLORS.inputBackground,
        marginRight: 10,
    },
    statsAndActions: {
        flex: 1,
    },
    statsRow: {
        marginBottom: 8,
    },
    statText: {
        color: COLORS.grayText,
        fontSize: 13,
        fontWeight: '600',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 8,
    },
    liveBadge: {
        backgroundColor: COLORS.red,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginRight: 5,
    },
    liveBadgeText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 12,
    },
    streamActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.purple,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    actionIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBackground,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
    },
    actionText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 5,
    },
    tabContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: COLORS.darkerBackground,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBackground,
        paddingVertical: 5,
    },
    tabButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        marginHorizontal: 5,
    },
    activeTabButton: {
        borderBottomWidth: 3,
        borderBottomColor: COLORS.purple,
    },
    tabText: {
        color: COLORS.grayText,
        fontWeight: '600',
    },
    activeTabText: {
        color: COLORS.white,
        fontWeight: '700',
    },
    contentArea: {
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    createPostContainer: {
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
    },
    userAvatarInitial: {
        position: 'absolute',
        top: 15,
        left: 15,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.purple,
        textAlign: 'center',
        lineHeight: 30,
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
    postInput: {
        minHeight: 60,
        paddingLeft: 50,
        color: COLORS.white,
        fontSize: 15,
        paddingTop: 5,
        paddingBottom: 5,
    },
    postActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: COLORS.inputBackground,
        marginTop: 5,
    },
    imageButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
    },
    imageButtonText: {
        color: COLORS.grayText,
        marginLeft: 5,
        fontSize: 13,
    },
    postButton: {
        backgroundColor: COLORS.purple,
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 8,
    },
    postButtonText: {
        color: COLORS.white,
        fontWeight: '700',
    },
    membersListContainer: {},
    membersCountText: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 2,
    },
    membersCountSubText: {
        color: COLORS.grayText,
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 15,
    },
    placeholderContainer: {
        padding: 40,
        alignItems: 'center',
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 10,
        marginTop: 20,
    },
    placeholderText: {
        color: COLORS.grayText,
        textAlign: 'center',
        fontSize: 15,
        marginBottom: 20,
    },
    eventActionButton: {
        backgroundColor: COLORS.purple,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    eventActionButtonText: {
        color: COLORS.white,
        fontWeight: '700',
    }
});

export default GroupDetailView;
