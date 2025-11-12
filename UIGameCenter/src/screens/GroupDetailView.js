// src/views/GroupDetailView.js (Código Completo Actualizado)

import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, 
    Image, TouchableOpacity, TextInput, 
    SafeAreaView, Modal, Switch, Linking, Alert, ActivityIndicator,Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; 
import axios from 'axios'; 
import COLORS from '../constants/Colors';
import GroupPostItem from '../components/GroupPostItem'; 
import MemberListingRow from '../components/MemberListingRow'; 
import { getAuth } from 'firebase/auth'; 

const getBaseUrl = () => {
    if (Platform.OS === 'web') {
        return "http://localhost:8080";
    } else {
        return "http://192.168.0.6:8080";
    }
};

const BASE_URL = getBaseUrl();
const API_URL = `${BASE_URL}/api/group`;
const MEMBER_API_URL = `${BASE_URL}/api/group`;

const VALID_ROLES = ["ADMIN", "MODERATOR", "MEMBER"];

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
    
    const membersTotal = group.MEMBER_COUNT ? group.MEMBER_COUNT.toLocaleString('es-ES') : '0';
    const currentFirebaseUid = getAuth().currentUser?.uid; 

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
        creatorUserId: group.ID_USER_CREATOR, 
        currentFirebaseUid: currentFirebaseUid,
    };
};

const POSTS_DATA = [
    { id: 'p1', username: 'GamerPro123', time: 'Hace 2 horas', content: '¿Alguien para ranked? Necesitamos 2 más para el equipo. Nivel Platino o superior.', likes: 24, comments: 8, shares: 2, userAvatarUri: 'https://picsum.photos/50/50?random=p1' },
    { id: 'p2', username: 'ProPlayer99', time: 'Ayer', content: 'Gran torneo el fin de semana. ¡Felicidades a los ganadores!', likes: 105, comments: 3, shares: 1, userAvatarUri: 'https://picsum.photos/50/50?random=p2' },
];

const AvisarDirectoModal = ({ isVisible, onClose }) => {
    return (
        <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={[styles.centeredView, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Avisar Directo</Text>
                    <Text style={{color: COLORS.white}}>Contenido del Modal de Aviso de Directo...</Text>
                    <TouchableOpacity onPress={onClose} style={[styles.modalButton, { backgroundColor: COLORS.purple, marginTop: 20 }]}>
                         <Text style={styles.modalButtonText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
};

const AdminActionModal = ({ 
    isVisible, 
    onClose, 
    targetMember, 
    onRemove, 
    onRoleChange 
}) => {
    const [isRoleModalVisible, setIsRoleModalVisible] = useState(false);
    
    if (!targetMember) return null;

    const handleRoleSelect = (newRole) => {
        setIsRoleModalVisible(false);
        onRoleChange(newRole); 
    };

    const rolesMenu = VALID_ROLES.filter(role => role !== targetMember.role);
    
    return (
        <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Text style={styles.modalTitle}>Acciones para **{targetMember.username}**</Text>

                    <TouchableOpacity 
                        style={[styles.modalButton, { backgroundColor: COLORS.red }]} 
                        onPress={() => { onClose(); onRemove(); }}
                    >
                        <Text style={styles.modalButtonText}>Eliminar Miembro</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.modalButton, { backgroundColor: COLORS.purple }]} 
                        onPress={() => setIsRoleModalVisible(true)}
                    >
                        <Text style={styles.modalButtonText}>Cambiar Rol (Actual: {targetMember.role})</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.modalButton, { backgroundColor: COLORS.inputBackground, marginTop: 15 }]} 
                        onPress={onClose}
                    >
                        <Text style={[styles.modalButtonText, { color: COLORS.white }]}>Cerrar</Text>
                    </TouchableOpacity>

                </View>
                
                <Modal animationType="slide" transparent={true} visible={isRoleModalVisible} onRequestClose={() => setIsRoleModalVisible(false)}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <Text style={styles.modalTitle}>Seleccionar Nuevo Rol</Text>
                            {rolesMenu.map(role => (
                                <TouchableOpacity 
                                    key={role}
                                    style={[styles.modalButton, { backgroundColor: COLORS.purple, marginVertical: 5 }]}
                                    onPress={() => handleRoleSelect(role)}
                                >
                                    <Text style={styles.modalButtonText}>{role}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity 
                                style={[styles.modalButton, { backgroundColor: COLORS.inputBackground, marginTop: 15 }]} 
                                onPress={() => setIsRoleModalVisible(false)}
                            >
                                <Text style={[styles.modalButtonText, { color: COLORS.white }]}>Cancelar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
};

const showAlert = (title, message, buttons = []) => {
  if (Platform.OS === 'web') {
    if (buttons.length === 2) {
      const confirm = window.confirm(`${title}\n\n${message}`);
      if (confirm && buttons[1]?.onPress) buttons[1].onPress();
    } else {
      window.alert(`${title}\n\n${message}`);
      if (buttons[0]?.onPress) buttons[0].onPress();
    }
  } else {
    showAlert(title, message, buttons);
  }
};

const GroupDetailView = ({ navigation, route }) => {
    const [activeTab, setActiveTab] = useState('Publicaciones');
    const [isAvisarModalVisible, setIsAvisarModalVisible] = useState(false);
    const [groupData, setGroupData] = useState(null); 
    const [loading, setLoading] = useState(true); 
    
    const [userRole, setUserRole] = useState(null); 
    const [membersList, setMembersList] = useState([]); 
    
    const [isActionModalVisible, setIsActionModalVisible] = useState(false);
    const [targetMember, setTargetMember] = useState(null); 

    const groupId = route.params?.groupData?.id; 
    const firebaseUid = getAuth().currentUser?.uid; 


    const handleStreamPress = () => {
        if (groupData?.streamLink) {
            Linking.openURL(groupData.streamLink).catch(err => 
                showAlert("Error", "No se pudo abrir el enlace: " + groupData.streamLink)
            );
        }
    };

    const handleSettingsPress = () => {
        navigation.navigate('EditGroupScreen', { groupId: groupData.id, initialData: groupData });
    };
    
    const handleLeaveGroup = async () => {
        showAlert(
            "Confirmar Abandono",
            "¿Estás seguro de que quieres abandonar este grupo? Si eres el creador o el último ADMIN, esto podría no ser posible.",
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Abandonar", 
                    style: "destructive", 
                    onPress: async () => {
                        console.log("--> Intento de abandonar grupo iniciado."); 
                        const token = await getFirebaseToken();
                        if (!token) {
                            showAlert("Error de Autenticación", "No se pudo obtener el token de autenticación. Inténtalo de nuevo.");
                            return;
                        }
                        
                        try {
                            setLoading(true);
                            
                            const response = await axios.post(`${MEMBER_API_URL}/${groupId}/leave`, {}, {
                                headers: { 
                                    'Authorization': `Bearer ${token}` 
                                }
                            });
                            
                            showAlert("Abandono Exitoso", response.data.message || "Has abandonado el grupo correctamente.");
                            
                            setTimeout(() => {
                                navigation.goBack(); 
                            }, 500); 
                            
                        } catch (error) {
                            console.error('Error al abandonar el grupo (Cliente):', error.response?.data || error.message);
                            
                            let errorMessage = "Error desconocido al procesar la solicitud.";
                            if (error.response) {
                                errorMessage = error.response.data?.error || error.response.data?.message || `Error del servidor: ${error.response.status}`;
                            } else if (error.request) {
                                errorMessage = "Error de conexión. Asegúrate que la URL del servidor es accesible.";
                            } else {
                                errorMessage = error.message;
                            }
                                
                            showAlert("Error al Salir", errorMessage);
                            
                        } finally {
                            setLoading(false);
                            console.log("--> Intento de abandonar grupo finalizado.");
                        }
                    }
                }
            ]
        );
    };

    const handleMemberAction = (member) => {
        if (member.id === groupData.creatorUserId) {
            showAlert("Permiso Denegado", "No puedes modificar al creador del grupo.");
            return;
        }
        if (member.isCurrentUser) { 
             showAlert("Permiso Denegado", "No puedes modificar tu propia membresía/rol.");
            return;
        }

        if (userRole === 'MODERATOR' && (member.role === 'ADMIN' || member.role === 'MODERATOR')) {
             showAlert("Jerarquía", "Como Moderador, solo puedes modificar miembros con rol 'MEMBER'.");
             return;
        }

        setTargetMember(member);
        setIsActionModalVisible(true);
    };
    
    const handleRemoveMember = async () => {
        if (!targetMember) return;
        
        showAlert(
            "Confirmar Eliminación",
            `¿Estás seguro de que quieres eliminar a ${targetMember.username} del grupo?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Eliminar", 
                    style: "destructive", 
                    onPress: async () => {
                        const token = await getFirebaseToken();
                        try {
                            setLoading(true);
                            const response = await axios.delete(`${MEMBER_API_URL}/${groupId}/members/${targetMember.id}`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                            });
                            
                            showAlert("Miembro Eliminado", response.data.message || `${targetMember.username} ha sido eliminado del grupo.`);
                            fetchMembersList(); 
                        } catch (error) {
                            let errorMessage = "Error desconocido al procesar la solicitud.";
                            if (error.response) {
                                errorMessage = error.response.data?.error || error.response.data?.message || `Error del servidor: ${error.response.status}`;
                            } else if (error.request) {
                                errorMessage = "Error de conexión. Asegúrate que la URL del servidor es accesible.";
                            } else {
                                errorMessage = error.message;
                            }
                            
                            showAlert("Error de Eliminación", errorMessage);
                            console.error('Error al eliminar miembro:', error.response?.data || error.message);
                        } finally {
                            setTargetMember(null);
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };
    
    const handleUpdateRole = async (newRole) => {
        if (!targetMember || !newRole) return;
        
        const token = await getFirebaseToken();
        try {
            setLoading(true);
            const response = await axios.put(`${MEMBER_API_URL}/${groupId}/members/${targetMember.id}/role`, { newRole }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            showAlert("Rol Actualizado", response.data.message || `El rol de ${targetMember.username} se ha actualizado a **${newRole}**.`);
            fetchMembersList(); 
        } catch (error) {
            const errorMessage = error.response?.data?.error || error.response?.data?.message || "Hubo un error al cambiar el rol.";
            showAlert("Error al Actualizar Rol", errorMessage);
            console.error('Error al cambiar rol:', error.response?.data || error.message);
        } finally {
            setIsActionModalVisible(false);
            setTargetMember(null);
            setLoading(false);
        }
    };

    const fetchGroupDetailAndRole = useCallback(async () => {
        if (!groupId || !firebaseUid) {
            setLoading(false);
            if (!groupId) showAlert("Error", "ID del grupo no proporcionado.");
            return;
        }

        setLoading(true);
        const token = await getFirebaseToken(); 

        try {
            const groupResponse = await fetch(`${API_URL}/${groupId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!groupResponse.ok) {
                const errorData = await groupResponse.json();
                throw new Error(errorData.message || 'Error al cargar el detalle del grupo');
            }

            const data = await groupResponse.json();
            const mappedDetail = mapApiToGroupDetail(data.group); 
            setGroupData(mappedDetail);
            
            const roleResponse = await fetch(`${MEMBER_API_URL}/${groupId}/role`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, 
                },
            });
            
            if (roleResponse.ok) {
                const roleData = await roleResponse.json();
                setUserRole(roleData.role); 
            } else {
                 console.warn("No se pudo obtener el rol del usuario. Asumiendo no-miembro o error.");
                 setUserRole(null);
            }

        } catch (error) {
            console.error('Error fetching group detail or role:', error);
            showAlert('Error de API', error.message || 'Hubo un error al cargar el detalle de la comunidad.');
            setGroupData(null);
            setUserRole(null);
        } finally {
            setLoading(false);
        }
    }, [groupId, firebaseUid]);

    const fetchMembersList = useCallback(async () => {
        if (!groupId || !firebaseUid) return;
        
        const token = await getFirebaseToken();
        if (!token) {
             console.warn("Token no disponible, no se puede cargar la lista de miembros.");
             setMembersList([]); 
             return;
        }
        
        try {
            const response = await fetch(`${MEMBER_API_URL}/${groupId}/members`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar la lista de miembros');
            }
            
            const data = await response.json();
            
            const mappedMembers = data.map(m => ({
                id: m.user.ID_USER, 
                username: m.user.USERNAME_DSC,
                role: m.MEMBER_ROLE_DSC,
                avatarUri: m.user.PROFILE_PIC 
                    ? m.user.PROFILE_PIC.startsWith(BASE_URL) 
                        ? m.user.PROFILE_PIC 
                        : `${BASE_URL}${m.user.PROFILE_PIC.replace('src/public', '')}` 
                    : `https://picsum.photos/40/40?random=${m.user.ID_USER}`, 
                isOnline: false, 
                isCurrentUser: m.user.FIREBASE_UID === firebaseUid, 
            }));
            
            setMembersList(mappedMembers);

        } catch (error) {
             console.error('Error fetching members list:', error);
             setMembersList([]); 
        }
    }, [groupId, firebaseUid]);

    useFocusEffect(
        useCallback(() => {
            fetchGroupDetailAndRole();
            return () => {}; 
        }, [fetchGroupDetailAndRole])
    );
    
    useEffect(() => {
        if (activeTab === 'Miembros') {
            fetchMembersList();
        }
    }, [activeTab, fetchMembersList]);


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
                        <GroupPostItem key={post.id} post={post} onPress={() => {}} />
                    ))}
                </View>
            );
        }

        if (activeTab === 'Miembros') {
            return (
                <View style={styles.membersListContainer}>
                    <Text style={styles.membersCountText}>Miembros del grupo</Text>
                    <Text style={styles.membersCountSubText}>{groupData.membersTotal} miembros • {groupData.membersOnline} en línea</Text>
                    
                    {membersList.length > 0 ? (
                        membersList.map(member => (
                            <MemberListingRow 
                                key={member.id} 
                                member={member} 
                                onPressProfile={() => showAlert("Ver Perfil", `Navegando al perfil de ${member.username}`)} 
                                userRole={userRole} 
                                onAdminAction={handleMemberAction} 
                                isCurrentUser={member.isCurrentUser} 
                            />
                        ))
                    ) : (
                        <Text style={styles.placeholderText}>
                            {loading ? "Cargando lista de miembros..." : "No se pudo cargar la lista de miembros o no eres miembro."}
                        </Text>
                    )}
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
                    Verifica tu conexión.
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
            
            <AdminActionModal 
                isVisible={isActionModalVisible}
                onClose={() => setIsActionModalVisible(false)}
                targetMember={targetMember}
                onRemove={handleRemoveMember}
                onRoleChange={handleUpdateRole}
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
                                    
                                    {userRole && (
                                        <TouchableOpacity 
                                            style={[styles.actionIcon, { backgroundColor: COLORS.red }]}
                                            onPress={handleLeaveGroup} 
                                        >
                                            <Ionicons name="exit-outline" size={20} color={COLORS.white} />
                                            <Text style={styles.actionText}>Abandonar</Text>
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
                                    
                                    {userRole === 'ADMIN' && (
                                        <TouchableOpacity 
                                            style={styles.actionIcon}
                                            onPress={handleSettingsPress} 
                                        >
                                            <Ionicons name="settings-outline" size={20} color={COLORS.white} />
                                            <Text style={styles.actionText}>Configuración</Text>
                                        </TouchableOpacity>
                                    )}
                                    
                                    {userRole === 'ADMIN' && groupData.isStreamer && (
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
    headerContainer: { backgroundColor: COLORS.darkBackground },
    bannerImage: { width: '100%', height: 180, backgroundColor: COLORS.inputBackground, },
    backButton: { position: 'absolute', top: 40, left: 15, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 5, },
    groupInfoBox: { paddingHorizontal: 15, paddingTop: 10, },
    groupHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, marginTop: -50, },
    titleContainer: { flex: 1, marginLeft: 10, },
    groupTitleText: { color: COLORS.white, fontSize: 22, fontWeight: '900', marginBottom: 2, },
    groupSubtitleText: { color: COLORS.grayText, fontSize: 14, fontWeight: '500', },
    groupDescriptionText: { color: COLORS.white, fontSize: 14, fontWeight: '400', marginBottom: 15, marginTop: 5, lineHeight: 20, },
    groupContentRow: { flexDirection: 'row', alignItems: 'flex-start', },
    profileImage: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: COLORS.darkerBackground, backgroundColor: COLORS.inputBackground, marginRight: 10, },
    statsAndActions: { flex: 1, },
    statsRow: { marginBottom: 8, },
    statText: { color: COLORS.grayText, fontSize: 13, fontWeight: '600', },
    actionButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap', 
        gap: 8, 
        marginBottom: 10,
    },
    liveBadge: { backgroundColor: COLORS.red, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 5, },
    liveBadgeText: { color: COLORS.white, fontWeight: '700', fontSize: 12, },
    streamActionButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.purple, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, },
    actionIcon: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBackground, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, },
    actionText: { color: COLORS.white, fontSize: 12, fontWeight: '600', marginLeft: 5, },
    tabContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.darkerBackground, borderBottomWidth: 1, borderBottomColor: COLORS.inputBackground, paddingVertical: 5, },
    tabButton: { paddingVertical: 10, paddingHorizontal: 15, marginHorizontal: 5, },
    activeTabButton: { borderBottomWidth: 3, borderBottomColor: COLORS.purple, },
    tabText: { color: COLORS.grayText, fontWeight: '600', },
    activeTabText: { color: COLORS.white, fontWeight: '700', },
    contentArea: { paddingHorizontal: 15, paddingTop: 10, },
    createPostContainer: { backgroundColor: COLORS.darkerBackground, borderRadius: 10, padding: 10, marginBottom: 15, },
    userAvatarInitial: { position: 'absolute', top: 15, left: 15, width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.purple, textAlign: 'center', lineHeight: 30, color: COLORS.white, fontWeight: '700', fontSize: 14, },
    postInput: { minHeight: 60, paddingLeft: 50, color: COLORS.white, fontSize: 15, paddingTop: 5, paddingBottom: 5, },
    postActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.inputBackground, marginTop: 5, },
    imageButton: { flexDirection: 'row', alignItems: 'center', padding: 5, },
    imageButtonText: { color: COLORS.grayText, marginLeft: 5, fontSize: 13, },
    postButton: { backgroundColor: COLORS.purple, paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8, },
    postButtonText: { color: COLORS.white, fontWeight: '700', },
    membersListContainer: {},
    membersCountText: { color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 2, },
    membersCountSubText: { color: COLORS.grayText, fontSize: 13, fontWeight: '500', marginBottom: 15, },
    placeholderContainer: { padding: 40, alignItems: 'center', backgroundColor: COLORS.darkerBackground, borderRadius: 10, marginTop: 20, },
    placeholderText: { color: COLORS.grayText, textAlign: 'center', fontSize: 15, marginBottom: 20, },
    eventActionButton: { backgroundColor: COLORS.purple, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, },
    eventActionButtonText: { color: COLORS.white, fontWeight: '700', },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
    },
    modalView: {
        margin: 20,
        backgroundColor: COLORS.darkerBackground,
        borderRadius: 10,
        padding: 25,
        alignItems: 'center',
        width: '80%',
        maxWidth: 350,
    },
    modalTitle: {
        marginBottom: 20,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    modalButton: {
        width: '100%',
        borderRadius: 8,
        padding: 12,
        marginVertical: 8,
        alignItems: 'center',
    },
    modalButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 14,
    },
});


export default GroupDetailView;