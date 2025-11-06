import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import COLORS from '../constants/Colors';
import GroupCardComponent from '../components/GroupCardComponent';
import { Ionicons } from '@expo/vector-icons';
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

const mapApiToGroupCard = (group) => {
    const isStreamer = !!group.streamerInfo; 
    const isLive = isStreamer && group.streamerInfo?.IS_LIVE_BOOL; 
    
     const membersTotal = group.GROUP_MEMBER_COUNT ? group.GROUP_MEMBER_COUNT.toLocaleString('es-ES') : '0';

    const imagePath = group.PROFILE_IMG_URL || group.BANNER_IMG_URL;

    return {
        id: group.ID_GROUP, 
        title: group.GROUP_NAME_DSC,
        subtitle: group.COMMUNITY_TYPE_DSC,
        members: membersTotal,
        imageUri: imagePath 
            ? `${BASE_URL}${imagePath}` 
            : 'https://picsum.photos/400/200?random=' + group.ID_GROUP,
        isTrending: membersTotal > 10000,
        isStreamer: isStreamer,
        isLive: isLive,
        liveSpectators: isLive ? (group.streamerInfo.LIVE_SPECTATORS_INT ? group.streamerInfo.LIVE_SPECTATORS_INT.toLocaleString('es-ES') : 'N/A') : undefined,
        streamLink: isStreamer ? group.streamerInfo.STREAM_LINK_DSC : undefined,
    };
};

const GroupDiscoveryScreen = ({ navigation }) => {
    const [activeType, setActiveType] = useState('Juegos');
    const [groupsData, setGroupsData] = useState({ Juegos: [], Streamers: [] }); // Reemplaza MOCK_DATA
    const [loading, setLoading] = useState(true);

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        try {

            const response = await fetch(API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al cargar grupos');
            }

            const data = await response.json();
            
           const mappedGroups = (data.groups || []).map(mapApiToGroupCard); 
            
            const classifiedGroups = {
               Juegos: mappedGroups.filter(g => !g.isStreamer),
                Streamers: mappedGroups.filter(g => g.isStreamer),
            };

            setGroupsData(classifiedGroups);
        } catch (error) {
            console.error('Error fetching groups:', error);
            Alert.alert('Error de API', error.message || 'Hubo un error al cargar las comunidades.');
            setGroupsData({ Juegos: [], Streamers: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const currentGroups = groupsData[activeType];

    const navigateToGroupDetail = (group) => {
        navigation.navigate('GroupDetail', { groupData: group });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
  
                <View style={styles.headerContainer}>
                    <Text style={styles.mainTitle}>Grupos y Comunidades</Text>
                    <Text style={styles.subtitle}>Únete a grupos de juegos y comunidades de streamers</Text>
                </View>

                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.createGroupButton]}
                        onPress={() => navigation.navigate('CreateGroup')} 
                    >
                        <Text style={styles.actionButtonText}>Crear Grupo</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.scheduleEventButton]}
                        onPress={() => navigation.navigate('CreateEvent')} 
                    >
                        <Text style={styles.actionButtonText}>Programar Evento</Text>
                    </TouchableOpacity>
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

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.purple} style={styles.loader} />
                ) : (
                    <View style={styles.gridContainer}>
                        {currentGroups.map(group => (
                            <GroupCardComponent key={group.id} group={group} onPress={() => navigateToGroupDetail(group)} />
                        ))}
                    </View>
                )}
                
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.darkBackground },
    scrollContent: { paddingHorizontal: 14, paddingBottom: 20 },

    // --- Header ---
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
        marginBottom: 15,
    },
    
     actionButtonsContainer: {
        position: 'absolute',
        top: 10,
        right: 14,
        flexDirection: 'row',
        zIndex: 1,
    },
    actionButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        marginLeft: 8,
        backgroundColor: COLORS.purple,
    },
    actionButtonText: {
        color: COLORS.white,
        fontWeight: '700',
        fontSize: 13,
    },
    createGroupButton: {},
    scheduleEventButton: {},

   toggleBarContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.inputBackground, 
        borderRadius: 10,
        padding: 4,
        marginBottom: 20,
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

    // --- Grid ---
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    loader: {
        marginTop: 50,
    }
});

export default GroupDiscoveryScreen;