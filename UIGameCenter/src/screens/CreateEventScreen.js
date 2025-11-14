import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, SafeAreaView, Alert, Platform, Image, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import COLORS from '../constants/Colors';
import { getAuth } from 'firebase/auth';

let Calendar = null;
if (Platform.OS === 'web') {
  Calendar = require('react-calendar').default;
}

const getBaseUrl = () => {
    if (Platform.OS === 'web') {
        return 'http://localhost:8080';
    } else {
        return 'http://192.168.1.100:8080';
    }
};

const BASE_URL = getBaseUrl();
const API_URL = `${BASE_URL}/api/events`;

const CreateEventScreen = ({ navigation, route }) => {
    const { eventToEdit, groupId } = route.params || {};
    const isEdit = !!eventToEdit;

    const [eventName, setEventName] = useState(eventToEdit?.TITLE || '');
    const [eventDate, setEventDate] = useState(eventToEdit?.DATE || '');
    const [eventTime, setEventTime] = useState(eventToEdit?.HOUR || '');
    const [eventDescription, setEventDescription] = useState(eventToEdit?.DESCRIPTION || '');
    const [location, setLocation] = useState(eventToEdit?.LOCATION || '');
    const [participantsLimit, setParticipantsLimit] = useState(eventToEdit?.PARTICIPANTS_LIMIT?.toString() || '');
    const [selectedImage, setSelectedImage] = useState(null);
    const [loading, setLoading] = useState(false);

    const [showWebCalendar, setShowWebCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);

    const auth = getAuth();
    const user = auth.currentUser;

    // === ACTUALIZAR ESTADO ===
    useEffect(() => {
        if (eventToEdit?.IMG_URL) {
            setSelectedImage({ uri: `${BASE_URL}${eventToEdit.IMG_URL}` });
        }

        if (eventToEdit?.DATE && eventToEdit.DATE !== '0000-00-00') {
            const mysqlDate = eventToEdit.DATE;
            if (mysqlDate.includes('-')) {
                const [year, month, day] = mysqlDate.split('-');
                if (year !== '0000') {
                    setEventDate(`${day}/${month}/${year}`);
                }
            } else {
                setEventDate(mysqlDate);
            }
        }

        if (eventToEdit?.HOUR) {
            setEventTime(eventToEdit.HOUR.replace(/:00$/, ''));
        }
    }, [eventToEdit]);

    // === LOGS DE DEPURACIÓN ===
    useEffect(() => {
        console.log("=== CreateEventScreen CARGADO ===");
        console.log("route.params:", route.params);
        console.log("eventToEdit:", eventToEdit);
        console.log("isEdit:", isEdit);
        console.log("ID_EVENT:", eventToEdit?.ID_EVENT);
        console.log("=====================================");
    }, []);

    const getToken = async () => {
        if (!user) return null;
        return await user.getIdToken();
    };

    const handleWebDateChange = (date) => {
        setSelectedDate(date);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        setEventDate(`${day}/${month}/${year}`);
        setShowWebCalendar(false);
    };

    const formatTimeInput = (text) => {
        let cleaned = text.replace(/[^0-9]/g, '').slice(0, 4);
        if (cleaned.length > 2) {
            cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2);
        }
        setEventTime(cleaned);
    };

    const formatDateForDB = (dateStr) => {
        if (!dateStr) return null;
        let day, month, year;
        if (dateStr.includes('/')) {
            [day, month, year] = dateStr.split('/');
        } else if (dateStr.includes('-')) {
            [year, month, day] = dateStr.split('-');
        } else {
            return null;
        }
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const handleImageUpload = async () => {
        if (Platform.OS === 'web') {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    const uri = URL.createObjectURL(file);
                    setSelectedImage({ uri, name: file.name, file });
                }
            };
            input.click();
        } else {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería.');
                return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });
            if (!result.canceled) {
                setSelectedImage({
                    uri: result.assets[0].uri,
                    name: result.assets[0].fileName || 'event.jpg'
                });
            }
        }
    };

    const removeImage = () => setSelectedImage(null);

    const validateForm = () => {
        if (!eventName.trim()) return "El nombre es obligatorio";
        if (!eventDate) return "Selecciona una fecha";
        const formatted = formatDateForDB(eventDate);
        if (!formatted) return "Fecha inválida";
        if (!eventTime || !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(eventTime)) return "Hora inválida (HH:MM)";
        if (!participantsLimit || isNaN(participantsLimit) || participantsLimit < 1) return "Límite inválido";
        const eventDateObj = new Date(formatted);
        if (eventDateObj < new Date().setHours(0, 0, 0, 0)) return "La fecha debe ser futura";
        return null;
    };

    const handleSubmit = async () => {
        const error = validateForm();
        if (error) {
            Alert.alert("Error", error);
            return;
        }

        setLoading(true);
        const token = await getToken();
        if (!token) {
            Alert.alert("Error", "Debes estar autenticado.");
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('TITLE', eventName);
            formData.append('DESCRIPTION', eventDescription || '');
            formData.append('DATE', formatDateForDB(eventDate));
            formData.append('HOUR', eventTime + ':00');
            formData.append('LOCATION', location || '');
            formData.append('PARTICIPANTS_LIMIT', participantsLimit);
            if (groupId) formData.append('ID_GROUP', groupId);
            if (isEdit) formData.append('PARTICIPANTS', eventToEdit.PARTICIPANTS?.toString() || '0');

            if (selectedImage?.file) {
                formData.append('image', selectedImage.file);
            } else if (selectedImage?.uri && Platform.OS !== 'web') {
                formData.append('image', {
                    uri: selectedImage.uri,
                    name: selectedImage.name || 'event.jpg',
                    type: 'image/jpeg',
                });
            } else if (!selectedImage && isEdit) {
                formData.append('IMG_URL', 'null');
            }

            const url = isEdit ? `${API_URL}/update/${eventToEdit.ID_EVENT}` : `${API_URL}/register`;
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.message || "Error del servidor");

            navigation.goBack();
            setTimeout(() => {
                Alert.alert("ÉXITO", isEdit ? "Evento actualizado" : "Evento creado");
            }, 300);

        } catch (error) {
            console.error("Error al enviar evento:", error);
            Alert.alert("Error", error.message || "No se pudo guardar el evento");
        } finally {
            setLoading(false);
        }
    };

    // === ELIMINAR EVENTO ===
    const confirmDelete = async () => {
        if (!eventToEdit?.ID_EVENT) {
            Alert.alert("Error", "ID del evento no encontrado");
            return;
        }

        setLoading(true);
        const token = await getToken();
        if (!token) {
            Alert.alert("Error", "No autenticado");
            setLoading(false);
            return;
        }

        try {
            console.log("Eliminando evento ID:", eventToEdit.ID_EVENT);

            const response = await fetch(`${API_URL}/${eventToEdit.ID_EVENT}`, {
                method: 'DELETE',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });

            const data = await response.json();
            console.log("Respuesta DELETE:", data);

            if (!response.ok) throw new Error(data.message || "Error al eliminar");

            navigation.goBack();
            setTimeout(() => {
                Alert.alert("Eliminado", "El evento ha sido eliminado");
            }, 300);

        } catch (error) {
            console.error("Error en DELETE:", error);
            Alert.alert("Error", error.message || "No se pudo eliminar");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
    console.log("BOTÓN ELIMINAR TOCADO");

    if (Platform.OS === 'web') {
        const confirmed = window.confirm(
            "¿Estás seguro de que quieres eliminar este evento?\n\nEsta acción no se puede deshacer."
        );
        if (confirmed) {
            confirmDelete();
        }
    } else {
        Alert.alert(
            "Eliminar Evento",
            "¿Estás seguro de que quieres eliminar este evento?\n\nEsta acción no se puede deshacer.",
            [
                { text: "Cancelar", style: "cancel" },
                { text: "Eliminar", style: "destructive", onPress: confirmDelete }
            ]
        );
    }
};

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close-outline" size={30} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{isEdit ? 'Editar Evento' : 'Programar Evento'}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>Detalles del Evento</Text>

                <Text style={styles.inputLabel}>Nombre del Evento *</Text>
                <TextInput style={styles.input} placeholder="Torneo CS2 - Copa GameCenter" placeholderTextColor={COLORS.grayText} value={eventName} onChangeText={setEventName} />

                <Text style={styles.inputLabel}>Ubicación</Text>
                <TextInput style={styles.input} placeholder="Online - Discord" placeholderTextColor={COLORS.grayText} value={location} onChangeText={setLocation} />

                <Text style={styles.inputLabel}>Participantes Máximos *</Text>
                <TextInput style={styles.input} placeholder="128" placeholderTextColor={COLORS.grayText} value={participantsLimit} onChangeText={setParticipantsLimit} keyboardType="numeric" />

                <Text style={styles.sectionTitle}>Fecha y Hora *</Text>

                <Text style={styles.inputLabel}>Fecha</Text>
                {Platform.OS === 'web' ? (
                    <TouchableOpacity style={styles.datePickerButton} onPress={() => setShowWebCalendar(!showWebCalendar)}>
                        <Ionicons name="calendar-outline" size={20} color={COLORS.purple} />
                        <Text style={styles.dateText}>{eventDate || 'Selecciona una fecha'}</Text>
                        <Ionicons name="chevron-down" size={18} color={COLORS.grayText} />
                    </TouchableOpacity>
                ) : (
                    <TextInput
                        style={styles.input}
                        placeholder="14/11/2025"
                        placeholderTextColor={COLORS.grayText}
                        value={eventDate}
                        onChangeText={setEventDate}
                        keyboardType="numbers-and-punctuation"
                    />
                )}

                {Platform.OS === 'web' && showWebCalendar && (
                    <View style={styles.calendarContainer}>
                        {Calendar && (
                            <Calendar
                                onChange={handleWebDateChange}
                                value={selectedDate || new Date()}
                                minDate={new Date()}
                                className="custom-react-calendar"
                            />
                        )}
                    </View>
                )}

                <Text style={styles.inputLabel}>Hora (HH:MM)</Text>
                {Platform.OS === 'web' ? (
                    <input
                        type="time"
                        value={eventTime}
                        onChange={(e) => setEventTime(e.target.value)}
                        style={{
                            backgroundColor: COLORS.inputBackground,
                            color: COLORS.white,
                            borderRadius: 8,
                            padding: 14,
                            fontSize: 15,
                            width: '100%',
                            border: 'none',
                            outline: 'none'
                        }}
                    />
                ) : (
                    <View style={styles.timeInputContainer}>
                        <Ionicons name="time-outline" size={20} color={COLORS.purple} style={{ marginRight: 10 }} />
                        <TextInput
                            style={styles.timeInput}
                            placeholder="18:00"
                            placeholderTextColor={COLORS.grayText}
                            value={eventTime}
                            onChangeText={formatTimeInput}
                            keyboardType="numeric"
                            maxLength={5}
                        />
                    </View>
                )}

                <Text style={styles.sectionTitle}>Descripción</Text>
                <TextInput style={styles.textArea} placeholder="Premios, reglas, cómo unirse..." placeholderTextColor={COLORS.grayText} value={eventDescription} onChangeText={setEventDescription} multiline />

                <Text style={styles.sectionTitle}>Foto del Evento</Text>
                <TouchableOpacity style={styles.imageUploadArea} onPress={handleImageUpload}>
                    <Ionicons name="image-outline" size={30} color={COLORS.grayText} />
                    <Text style={styles.uploadText}>Subir imagen</Text>
                    <Text style={styles.uploadSubText}>Máx 1 archivo, 5MB</Text>
                </TouchableOpacity>

                {selectedImage && (
                    <View style={styles.imagePreviewWrapper}>
                        <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
                        <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                            <Ionicons name="close-circle" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            <View style={styles.footer}>
                {isEdit && eventToEdit?.ID_EVENT && (
                    <TouchableOpacity 
                        style={styles.deleteButton} 
                        onPress={handleDelete}
                        disabled={loading}
                    >
                        <Ionicons name="trash-outline" size={18} color={COLORS.white} />
                        <Text style={styles.deleteButtonText}>Eliminar Evento</Text>
                    </TouchableOpacity>
                )}

                <View style={{ flex: 1 }} />

                <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={() => navigation.goBack()}
                    disabled={loading}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.scheduleButton} 
                    onPress={handleSubmit} 
                    disabled={loading}
                >
                    {loading ? <ActivityIndicator color={COLORS.white} /> : 
                     <Text style={styles.scheduleButtonText}>Guardar</Text>
                    }
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.darkBackground },
    header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, backgroundColor: COLORS.darkerBackground, borderBottomWidth: 1, borderBottomColor: COLORS.inputBackground },
    backButton: { marginRight: 10 },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    scrollContent: { padding: 15, paddingBottom: 100 },
    sectionTitle: { color: COLORS.purple, fontSize: 14, fontWeight: '900', marginTop: 20, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: COLORS.inputBackground, paddingBottom: 5 },
    inputLabel: { color: COLORS.grayText, fontSize: 13, fontWeight: '600', marginTop: 10, marginBottom: 5 },
    input: { backgroundColor: COLORS.inputBackground, color: COLORS.white, padding: 12, borderRadius: 8, fontSize: 15 },
    textArea: { backgroundColor: COLORS.inputBackground, color: COLORS.white, padding: 12, borderRadius: 8, fontSize: 15, minHeight: 120, textAlignVertical: 'top' },
    datePickerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBackground, padding: 14, borderRadius: 8, justifyContent: 'space-between' },
    dateText: { color: COLORS.white, fontSize: 15, flex: 1, marginLeft: 10 },
    calendarContainer: { marginTop: 10, backgroundColor: '#1a1a1a', borderRadius: 12, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#333', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 25, elevation: 10 },
    timeInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.inputBackground, paddingHorizontal: 12, paddingVertical: 14, borderRadius: 8 },
    timeInput: { flex: 1, color: COLORS.white, fontSize: 15, fontWeight: '600' },
    imageUploadArea: { borderWidth: 2, borderColor: COLORS.grayText, borderStyle: 'dashed', borderRadius: 8, padding: 20, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    uploadText: { color: COLORS.grayText, marginTop: 5, fontSize: 14 },
    uploadSubText: { color: COLORS.grayText, fontSize: 12 },
    imagePreviewWrapper: { position: 'relative', marginTop: 10 },
    previewImage: { width: '100%', height: 200, borderRadius: 8 },
    removeImageButton: { position: 'absolute', top: 10, right: 10 },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'flex-end', padding: 15, backgroundColor: COLORS.darkerBackground, borderTopWidth: 1, borderTopColor: COLORS.inputBackground },
    cancelButton: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8, marginRight: 10 },
    cancelButtonText: { color: COLORS.grayText, fontWeight: '700' },
    scheduleButton: { backgroundColor: COLORS.purple, paddingVertical: 12, paddingHorizontal: 20, borderRadius: 8 },
    scheduleButtonText: { color: COLORS.white, fontWeight: '700' },
    deleteButton: { backgroundColor: '#e74c3c', flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 8, marginRight: 10 },
    deleteButtonText: { color: COLORS.white, fontWeight: '700', marginLeft: 6 },
});

if (Platform.OS === 'web') {
    const style = document.createElement('style');
    style.textContent = `
        .custom-react-calendar {
            width: 100%;
            max-width: 400px;
            background-color: #1a1a1a;
            border: 1px solid #333;
            border-radius: 12px;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.5;
            color: #e0e0e0;
            padding: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
        }
        .react-calendar__navigation { display: flex; justify-content: space-between; margin-bottom: 12px; height: 40px; }
        .react-calendar__navigation button { background: #2d1b69; color: #fff; border: none; border-radius: 8px; font-size: 14px; font-weight: 700; padding: 8px 12px; min-width: 44px; transition: all 0.2s ease; cursor: pointer; }
        .react-calendar__navigation button:hover { background: #4a2a9e; transform: translateY(-1px); }
        .react-calendar__navigation__label { font-weight: 800; font-size: 16px; color: #c084fc; text-transform: uppercase; letter-spacing: 0.5px; }
        .react-calendar__month-view__weekdays { text-align: center; font-weight: 700; font-size: 12px; text-transform: uppercase; color: #a78bfa; margin-bottom: 8px; }
        .react-calendar__month-view__weekdays__weekday { padding: 8px 0; }
        .react-calendar__month-view__days__day { color: #7c3aed; font-size: 14px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s ease; cursor: pointer; }
        .react-calendar__month-view__days__day--neighboringMonth { color: #555; }
        .react-calendar__tile--active, .react-calendar__tile--active:hover { background: #7c3aed !important; color: white !important; font-weight: 700; }
        .react-calendar__tile--now { background: #1a1a1a; border: 2px solid #7c3aed; color: #fff; }
        .react-calendar__tile--now:hover { background: #7c3aed; }
        .react-calendar__tile:hover { background: #2d1b69; color: white; transform: scale(1.05); }
        .react-calendar__tile:disabled { background-color: #2a2a2a; color: #666; cursor: not-allowed; }
    `;
    document.head.appendChild(style);
}

export default CreateEventScreen;