// src/screens/GroupDetailView.js
import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, 
    Image, TouchableOpacity, TextInput, 
    SafeAreaView, Modal, Switch, Linking, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';
import GroupPostItem from '../components/GroupPostItem'; 
import MemberListingRow from '../components/MemberListingRow'; 
import { getAuth } from 'firebase/auth'; 

const BASE_URL = "http://192.168.0.9:8080"; 
const API_URL = `${BASE_URL}/api/group`;

const getFirebaseToken = async () => {
    try {
        const user = getAuth().currentUser;
        if (user) {
            return await user.getIdToken();
        }
        return null;
    } catch (error) {
        console.error("Error fetching Firebase token:", error);
        return null;
    }
};

const mapApiToGroupDetail = (group) => {
    const isStreamer = !!group.streamerInfo;
    const isLive = isStreamer && group.streamerInfo?.IS_LIVE_BOOL; 
    
    const membersTotal = group.GROUP_MEMBER_COUNT ? group.GROUP_MEMBER_COUNT.toLocaleString('es-ES') : '0';

    return {
        id: group.ID_GROUP, 
        name: group.GROUP_NAME_DSC,
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
        streamLink: isStreamer ? group.streamerInfo.STREAM_LINK_DSC : null,
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
    
    const groupId = route.params?.groupData?.id; 

    const handleStreamPress = () => {
        if (groupData?.streamLink) {
            Linking.openURL(groupData.streamLink).catch(err => 
                Alert.alert("Error", "No se pudo abrir el enlace: " + groupData.streamLink)
            );
        }
    };
    
    const fetchGroupDetail = useCallback(async () => {
        if (!groupId) {
            setLoading(false);
            Alert.alert("Error", "ID del grupo no proporcionado.");
            return;
        }

        setLoading(true);
        try {
           

            const response = await fetch(`${API_URL}/${groupId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': token ? `Bearer ${token}` : '', 
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

    useEffect(() => {
        fetchGroupDetail();
    }, [fetchGroupDetail]);
    
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
                        />
                        <View style={styles.postActions}>
                            <TouchableOpacity style={styles.imageButton}>
                                <Ionicons name="image-outline" size={24} color={COLORS.grayText} />
                                <Text style={styles.imageButtonText}>Imagen</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.postButton}>
                                <Text style={styles.postButtonText}>Publicar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                 
                    {POSTS_DATA.map(post => (
                        <GroupPostItem key={post.id} post={post} onPress={() => {/* Navegar a detalle del post */}} />
                    ))}
                </View>
            );
        }

        if (activeTab === 'Miembros') {
            return (
                <View style={styles.membersListContainer}>
                    <Text style={styles.membersCountText}>Miembros del grupo</Text>
                    <Text style={styles.membersCountSubText}>{groupData.membersTotal} miembros • {groupData.membersOnline} en línea</Text>
                    {MEMBERS_DATA.map(member => (
                        <MemberListingRow key={member.id} member={member} onPressProfile={() => {/* Navegar a perfil */}} />
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



    if (loading || !groupData) {
        return (
            <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={COLORS.purple} />
                <Text style={{ color: COLORS.grayText, marginTop: 10, fontSize: 16 }}>Cargando detalles del grupo...</Text>
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

                {/* -------------------- Header y Banners -------------------- */}
                <View style={styles.headerContainer}>
           
                    <Image source={{ uri: groupData.bannerUri }} style={styles.bannerImage} />
                    
                  
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                    
                    <View style={styles.groupInfoBox}>
                        <Text style={styles.groupTitleText}>Grupo: {groupData.name}</Text>
                        <Text style={styles.groupSubtitleText}>{groupData.communityType}</Text>
                        
                        <View style={styles.groupContentRow}>
                    
                            <Image source={{ uri: groupData.profilePicUri }} style={styles.profileImage} />
                            
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
                                            <Ionicons name="videocam-outline" size={20} color={COLORS.white} />
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

                                
                                    {groupData.isStreamer ? (
                                        <TouchableOpacity 
                                            style={styles.actionIcon}
                                            onPress={() => setIsAvisarModalVisible(true)}
                                        >
                                            <Ionicons name="calendar-outline" size={20} color={COLORS.white} />
                                            <Text style={styles.actionText}>Avisar Directo</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <TouchableOpacity style={styles.actionIcon}>
                                            <Ionicons name="settings-outline" size={20} color={COLORS.white} />
                                            <Text style={styles.actionText}>Configuración</Text>
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

    // --- Header ---
    headerContainer: {
        backgroundColor: COLORS.darkerBackground,
        paddingBottom: 10,
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
    groupTitleText: {
        color: COLORS.white,
        fontSize: 20,
        fontWeight: '900',
        marginBottom: 2,
    },
    groupSubtitleText: {
        color: COLORS.grayText,
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 10,
    },
    groupContentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: COLORS.darkerBackground,
        backgroundColor: COLORS.inputBackground,
        marginTop: -40, 
        marginRight: 10,
    },
    statsAndActions: {
        flex: 1,
        marginTop: 5,
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

    // --- Tab View ---
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

    // --- Content Area ---
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


const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalView: {
        margin: 20,
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxWidth: 400,
    },
    modalTitle: {
        marginBottom: 20,
        textAlign: 'center',
        color: COLORS.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
        padding: 8,
        backgroundColor: COLORS.inputBackground,
        borderRadius: 10,
    },
    toggleText: {
        color: COLORS.white,
        fontSize: 15,
    },
    input: {
        width: '100%',
        marginBottom: 15,
        padding: 10,
        backgroundColor: COLORS.inputBackground,
        borderRadius: 10,
        color: COLORS.white,
        fontSize: 15,
        minHeight: 45,
    },
    dateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 10,
        marginBottom: 20,
        backgroundColor: COLORS.inputBackground,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.purple,
    },
    dateButtonText: {
        color: COLORS.purple,
        marginLeft: 10,
        fontWeight: '700',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    button: {
        borderRadius: 10,
        padding: 10,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: COLORS.inputBackground,
    },
    programButton: {
        backgroundColor: COLORS.purple,
    },
    textStyle: {
        color: COLORS.white,
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default GroupDetailView;