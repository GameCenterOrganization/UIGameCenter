import React, { useState, useEffect, useCallback } from 'react';
import { 
    View, Text, StyleSheet, ScrollView, 
    TouchableOpacity, SafeAreaView, ActivityIndicator, 
    Platform, TextInput
} from 'react-native';
import COLORS from '../constants/Colors';
import GroupCardComponent from '../components/GroupCardComponent';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth'; 
import { BASE_URL } from '@env';

import { showMessage } from "react-native-flash-message"; 

const API_URL = `${BASE_URL}/api/group`;

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

const mapApiToGroupCard = (group) => {
    const isStreamer = group.COMMUNITY_TYPE_DSC === 'STREAMER'; 
    const hasStreamerInfo = !!group.streamerInfo; 
    const isLive = isStreamer && group.streamerInfo?.IS_LIVE_BOOL; 
    const membersTotal = group.MEMBER_COUNT ? group.MEMBER_COUNT.toLocaleString('es-ES') : '0';
    const imagePath = group.PROFILE_IMG_URL || group.BANNER_IMG_URL;
    const imageUri = imagePath ? `${BASE_URL}${imagePath}` : null;
    
    const cardSubtitle = group.COMMUNITY_TYPE_DSC === 'GAME' ? 'Comunidad de Juego' : 'Comunidad de Streamer';
    const isMember = group.IS_MEMBER_BOOL || false;

    return {
        id: group.ID_GROUP, 
        title: group.GROUP_NAME_DSC,
        subtitle: cardSubtitle, 
        members: membersTotal,
        imageUri: imageUri, 
        isTrending: membersTotal > 10000,
        isStreamer: isStreamer, 
        isLive: isLive,
        liveSpectators: isLive 
            ? (hasStreamerInfo && group.streamerInfo.LIVE_SPECTATORS_INT ? group.streamerInfo.LIVE_SPECTATORS_INT.toLocaleString('es-ES') : 'N/A') 
            : undefined,
        streamLink: isStreamer ? group.streamerInfo?.STREAMER_LINK_DSC : undefined, 
        isMember: isMember, 
    };
};

const GroupDiscoveryScreen = ({ navigation }) => {
    const [activeType, setActiveType] = useState('Juegos'); 
    const [groupsData, setGroupsData] = useState({ Juegos: [], Streamers: [] }); 
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(''); 

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        try {
            const token = await getFirebaseToken();
            
            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` }), 
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar grupos');
            }

            const data = await response.json();
            console.log('Grupos recibidos de la API:', data.groups);
            
            const mappedGroups = (data.groups || []).map(mapApiToGroupCard); 
            
            const classifiedGroups = {
                Juegos: mappedGroups.filter(g => g.isStreamer === false),
                Streamers: mappedGroups.filter(g => g.isStreamer === true),
            };

            console.log('Grupos clasificados:', classifiedGroups); 
            setGroupsData(classifiedGroups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            showAlert('Error de API', error.message || 'Hubo un error al cargar las comunidades.');
            setGroupsData({ Juegos: [], Streamers: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const handleGroupCreated = useCallback(() => {
        console.log('Recargando grupos después de crear uno nuevo...');
        fetchGroups();
    }, [fetchGroups]);

    const handleJoinSuccess = (group) => {
        const message = `¡Bienvenido! Te has unido a ${group.title} correctamente.`;

        showAlert('Éxito', message);
        
        navigateToGroupDetail(group);
        
        setTimeout(() => {
            fetchGroups();
        }, 500); 
    };

    const allGroupsForType = groupsData[activeType]; 
    const currentGroups = allGroupsForType.filter(group => 
        group.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const navigateToGroupDetail = (group) => {
        navigation.navigate('GroupDetail', { groupData: group });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                stickyHeaderIndices={[0]} 
            >
                
                <View style={styles.stickyHeaderWrapper}>
                    
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={COLORS.grayText} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Buscar grupos por nombre..."
                            placeholderTextColor={COLORS.grayText}
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        {searchTerm.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearButton}>
                                <Ionicons name="close-circle" size={20} color={COLORS.grayText} />
                            </TouchableOpacity>
                        )}
                    </View>
                    
                    <View style={styles.toggleBarContainer}>
                        <TouchableOpacity
                            style={[styles.toggleButton, activeType === 'Juegos' && styles.activeToggleButton]}
                            onPress={() => setActiveType('Juegos')}
                        >
                            <Text style={[styles.toggleText, activeType === 'Juegos' && styles.activeToggleText]}>Grupos de Juegos</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.toggleButton, activeType === 'Streamers' && styles.activeToggleButton]}
                            onPress={() => setActiveType('Streamers')}
                        >
                            <Text style={[styles.toggleText, activeType === 'Streamers' && styles.activeToggleText]}>Comunidades de Streamers</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                
                <View style={styles.headerContainer}>
                    <Text style={styles.mainTitle}>Grupos y Comunidades</Text>
                    <Text style={styles.subtitle}>Únete a grupos de juegos y comunidades de streamers</Text>
                    
                    <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                            style={[styles.actionButton, styles.createGroupButton]}
                            onPress={() => navigation.navigate('CreateGroup', {
                                onGroupCreated: handleGroupCreated 
                            })} 
                        >
                            <Ionicons name="people-circle-outline" size={20} color={COLORS.white} />
                            <Text style={styles.actionButtonText}>Crear Grupo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.actionButton, styles.scheduleEventButton, styles.secondaryActionButton]}
                            onPress={() => navigation.navigate('CreateEvent')} 
                        >
                            <Ionicons name="calendar-outline" size={20} color={COLORS.purple} />
                            <Text style={[styles.actionButtonText, styles.secondaryActionButtonText]}>Programar Evento</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View>
                    {loading ? (
                        <ActivityIndicator size="large" color={COLORS.purple} style={styles.loader} />
                    ) : (
                        <View style={styles.gridContainer}>
                            {currentGroups.map(group => (
                                <GroupCardComponent 
                                    key={group.id} 
                                    group={group} 
                                    onPress={() => navigateToGroupDetail(group)} 
                                    onJoinSuccess={handleJoinSuccess} 
                                    navigation={navigation} 
                                />
                            ))}
                            {currentGroups.length === 0 && (
                                <Text style={styles.noDataText}>
                                    {searchTerm ? `No se encontraron grupos llamados "${searchTerm}" en ${activeType}.` : `No hay grupos disponibles en esta categoría.`}
                                </Text>
                            )}
                        </View>
                    )}
                </View>
                
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.darkBackground },
    scrollContent: { paddingHorizontal: 14, paddingBottom: 20 },

    stickyHeaderWrapper: {
        backgroundColor: COLORS.darkBackground, 
        marginHorizontal: -14,
        paddingHorizontal: 14, 
        paddingTop: 10, 
        paddingBottom: 5, 
        zIndex: 10,
    },
    
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBackground,
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 8,
        marginBottom: 10, 
        borderWidth: 1,
        borderColor: 'transparent',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: COLORS.white,
        fontSize: 16,
        paddingVertical: 0, 
    },
    clearButton: {
        marginLeft: 10,
        padding: 5,
    },

    headerContainer: {
        paddingVertical: 10,
    },
    mainTitle: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: '800',
    },
    subtitle: {
        color: COLORS.grayText,
        fontSize: 14,
        marginTop: 4,
    },

    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15, 
        marginBottom: 10,
    },
    actionButton: {
        flex: 1, 
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 8, 
        paddingHorizontal: 10,
        borderRadius: 8,
        marginHorizontal: 4,
        backgroundColor: COLORS.purple, 
    },
    actionButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 5, 
        textAlign: 'center',
    },
    createGroupButton: { marginLeft: 0, marginRight: 4 },
    scheduleEventButton: { marginLeft: 4, marginRight: 0 },
    secondaryActionButton: {
        backgroundColor: COLORS.inputBackground, 
        borderWidth: 1,
        borderColor: COLORS.purple, 
    },
    secondaryActionButtonText: {
        color: COLORS.purple, 
    },

    toggleBarContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.inputBackground, 
        borderRadius: 10,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    activeToggleButton: {
        backgroundColor: COLORS.purple,
    },
    toggleText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 13,
    },
    activeToggleText: {
        fontWeight: '700',
    },

    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    loader: {
        marginTop: 50,
    },
    noDataText: {
        color: COLORS.grayText,
        textAlign: 'center',
        marginTop: 30,
        width: '100%',
        fontSize: 16,
    }
});

export default GroupDiscoveryScreen;