import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';
import { getAuth } from 'firebase/auth';

const { width } = Dimensions.get('window');
const BASE_URL = "http://localhost:8080";
const EVENT_API = `${BASE_URL}/api/events`;

const EventDetailScreen = ({ route, navigation }) => {
  const { event } = route.params;
  const [loading, setLoading] = useState(false);
  const [currentParticipants, setCurrentParticipants] = useState(event.PARTICIPANTS);
  const [isFull, setIsFull] = useState(event.PARTICIPANTS >= event.PARTICIPANTS_LIMIT);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    fetchUserProfile();
    checkIfJoined();
    setIsOwner(event.creator?.FIREBASE_UID === user?.uid);
  }, [event, user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUserId(data.id); 
      }
    } catch (err) {
      console.log("Error cargando perfil");
    }
  };

  const checkIfJoined = () => {
    if (!currentUserId || !event.participants) return;
    const joined = event.participants.some(p => p.ID_USER === currentUserId);
    setIsJoined(joined);
  };

  useEffect(() => {
    checkIfJoined();
  }, [currentUserId, event.participants]);

  const handleJoin = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión");
      return;
    }

    if (isJoined) {
      Alert.alert("Información", `Ya te has inscrito a "${event.TITLE}"`);
      return;
    }

    if (isFull) {
      Alert.alert("Lleno", "No hay plazas disponibles");
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch(`${EVENT_API}/join/${event.ID_EVENT}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();

      if (res.ok) {
        Alert.alert("Éxito", data.message || "¡Inscrito!");
        setCurrentParticipants(prev => prev + 1);
        setIsFull(true);
        setIsJoined(true);
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (err) {
      Alert.alert("Error", "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const progress = event.PARTICIPANTS_LIMIT > 0
    ? (currentParticipants / event.PARTICIPANTS_LIMIT) * 100
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="close" size={28} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: event.IMG_URL ? `${BASE_URL}${event.IMG_URL}` : 'https://via.placeholder.com/600x300' }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          <View style={styles.tagOverlay}>
            <Text style={styles.tagText}>Evento</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{event.TITLE}</Text>
          <Text style={styles.description}>{event.DESCRIPTION}</Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.purple} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Fecha</Text>
                <Text style={styles.infoValue}>{event.DATE}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="time-outline" size={20} color={COLORS.purple} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Hora</Text>
                <Text style={styles.infoValue}>{event.HOUR} hrs</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={20} color={COLORS.purple} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Ubicación</Text>
                <Text style={styles.infoValue}>{event.LOCATION || 'Online'}</Text>
              </View>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={20} color={COLORS.purple} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Participantes</Text>
                <Text style={styles.infoValue}>{currentParticipants} / {event.PARTICIPANTS_LIMIT}</Text>
              </View>
            </View>
          </View>

          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>Plazas disponibles</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progress)}% lleno ({event.PARTICIPANTS_LIMIT - currentParticipants} libres)
            </Text>
          </View>

          <View style={styles.creatorSection}>
            <Image
              source={{ uri: event.creator?.PROFILE_PIC ? `${BASE_URL}${event.creator.PROFILE_PIC}` : 'http://localhost:8080/images/event/default_avatar.jpg' }}
              style={styles.creatorImage}
            />
            <View style={styles.creatorInfo}>
              <Text style={styles.creatorLabel}>Organizado por</Text>
              <Text style={styles.creatorName}>{event.creator?.USERNAME_DSC || 'GameCenter'}</Text>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {isOwner ? (
              <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('CreateEvent', { eventToEdit: event })}>
                <Ionicons name="create-outline" size={20} color={COLORS.white} />
                <Text style={styles.editButtonText}>Editar Evento</Text>
              </TouchableOpacity>
            ) : isJoined ? (
              <TouchableOpacity style={styles.joinedButton} disabled>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
                <Text style={styles.joinedText}>Ya inscrito</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.joinButton, (isFull || loading) && styles.joinButtonDisabled]}
                onPress={handleJoin}
                disabled={isFull || loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="person-add-outline" size={20} color={COLORS.white} />
                    <Text style={styles.joinButtonText}>
                      {isFull ? 'Lleno' : 'Inscribirse'}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-social-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBackground },
  scrollContent: { paddingBottom: 20 },
  header: { position: 'absolute', top: 10, left: 10, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 30, padding: 8 },
  backButton: {},
  imageContainer: { position: 'relative' },
  mainImage: { width: '100%', height: 280 },
  tagOverlay: { position: 'absolute', top: 16, left: 16, backgroundColor: COLORS.purple, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  tagText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },
  content: { padding: 20 },
  title: { color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 12 },
  description: { color: COLORS.grayText, fontSize: 15, lineHeight: 22, marginBottom: 24 },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 },
  infoItem: { flexDirection: 'row', alignItems: 'center', width: '50%', marginBottom: 16 },
  infoTextContainer: { marginLeft: 10 },
  infoLabel: { color: COLORS.grayText, fontSize: 12 },
  infoValue: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  progressSection: { marginBottom: 24 },
  progressLabel: { color: COLORS.white, fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  progressBar: { height: 10, backgroundColor: COLORS.inputBackground, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: COLORS.purple },
  progressText: { color: COLORS.grayText, fontSize: 12, textAlign: 'right', marginTop: 6 },
  creatorSection: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.darkerBackground, padding: 16, borderRadius: 16, marginBottom: 30 },
  creatorImage: { width: 56, height: 56, borderRadius: 28 },
  creatorInfo: { marginLeft: 14 },
  creatorLabel: { color: COLORS.grayText, fontSize: 12 },
  creatorName: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  joinButton: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.purple, paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  joinButtonDisabled: { backgroundColor: COLORS.purple, opacity: 0.7 },
  joinButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  editButton: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.purple, paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  editButtonText: { color: COLORS.white, fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  joinedButton: { flex: 1, flexDirection: 'row', backgroundColor: COLORS.purple, borderColor: COLORS.green, borderWidth: 1, paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  joinedText: { color: COLORS.green, fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
  shareButton: { backgroundColor: COLORS.inputBackground, padding: 16, borderRadius: 12 },
});

export default EventDetailScreen;