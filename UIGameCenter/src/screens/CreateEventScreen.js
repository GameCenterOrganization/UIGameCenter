// src/screens/CreateEventScreen.js (Renombrado para consistencia)
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors'; 

const EventTypeOptions = ['Tournament', 'Casual Meetup', 'Group Stream', 'Class/Workshop'];
const VisibilityOptions = ['Public (Visible to everyone)', 'Group Members Only'];

const CreateEventScreen = ({ navigation, route }) => {
    // const { groupId } = route.params; // If receiving group ID

    const [eventName, setEventName] = useState('');
    const [eventDate, setEventDate] = useState(''); 
    const [eventTime, setEventTime] = useState(''); 
    const [eventType, setEventType] = useState(EventTypeOptions[0]);
    const [eventDescription, setEventDescription] = useState('');
    const [eventVisibility, setEventVisibility] = useState(VisibilityOptions[0]);

    const handleSubmit = () => {
        if (!eventName || !eventDate || !eventTime) {
            Alert.alert("Error", "Please complete the event name, date, and time.");
            return;
        }

        const eventData = {
            name: eventName,
            date: eventDate,
            time: eventTime,
            type: eventType,
            description: eventDescription,
            visibility: eventVisibility,
        };
        console.log("Scheduling Event:", eventData);
        Alert.alert("Success", `Event "${eventName}" scheduled successfully.`, [
            { text: "OK", onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close-outline" size={30} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Schedule New Event</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                
                {/* -------------------- Name and Type -------------------- */}
                <Text style={styles.sectionTitle}>Basic Details</Text>
                
                <Text style={styles.inputLabel}>Event Name</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g. Fortnite 1v1 Tournament"
                    placeholderTextColor={COLORS.grayText}
                    value={eventName}
                    onChangeText={setEventName}
                    maxLength={100}
                />

                <Text style={styles.inputLabel}>Event Type</Text>
                <View style={styles.typeSelectorContainer}>
                    {EventTypeOptions.map(option => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.typeButton,
                                eventType === option && styles.typeButtonActive,
                            ]}
                            onPress={() => setEventType(option)}
                        >
                            <Text style={[
                                styles.typeButtonText,
                                eventType === option && styles.typeButtonTextActive,
                            ]}>
                                {option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* -------------------- Date and Time -------------------- */}
                <Text style={styles.sectionTitle}>Date and Time</Text>
                
                <View style={styles.dateTimeRow}>
                    <View style={styles.dateTimeInputContainer}>
                        <Text style={styles.inputLabel}>Date</Text>
                        <View style={styles.datePickerSim}>
                            <Ionicons name="calendar-outline" size={20} color={COLORS.grayText} />
                            <TextInput
                                style={styles.dateTimeInput}
                                placeholder="MM/DD/YYYY"
                                placeholderTextColor={COLORS.grayText}
                                value={eventDate}
                                onChangeText={setEventDate}
                            />
                        </View>
                    </View>
                    <View style={styles.dateTimeInputContainer}>
                        <Text style={styles.inputLabel}>Time</Text>
                        <View style={styles.datePickerSim}>
                            <Ionicons name="time-outline" size={20} color={COLORS.grayText} />
                            <TextInput
                                style={styles.dateTimeInput}
                                placeholder="HH:MM (GMT-5)"
                                placeholderTextColor={COLORS.grayText}
                                value={eventTime}
                                onChangeText={setEventTime}
                            />
                        </View>
                    </View>
                </View>

                {/* -------------------- Description -------------------- */}
                <Text style={styles.sectionTitle}>Event Description</Text>
                
                <Text style={styles.inputLabel}>Details</Text>
                <TextInput
                    style={styles.textArea}
                    placeholder="Describe requirements, prizes, and how to join the event."
                    placeholderTextColor={COLORS.grayText}
                    value={eventDescription}
                    onChangeText={setEventDescription}
                    multiline
                    maxLength={1000}
                />
                <Text style={styles.charLimit}>0/1000 characters</Text>

                {/* -------------------- Visibility -------------------- */}
                <Text style={styles.sectionTitle}>Visibility</Text>
                
                <View style={styles.typeSelector}>
                    {VisibilityOptions.map(option => (
                        <TouchableOpacity 
                            key={option} 
                            onPress={() => setEventVisibility(option)} 
                            style={styles.radioContainer}
                        >
                            <View style={[styles.radio, eventVisibility === option && styles.radioActive]}>
                                {eventVisibility === option && <View style={styles.radioDot} />}
                            </View>
                            <Text style={styles.radioText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>

            {/* -------------------- Footer Action -------------------- */}
            <View style={styles.footer}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.scheduleButton} onPress={handleSubmit}>
                    <Text style={styles.scheduleButtonText}>Schedule Event</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// --- Styles (Styles are language-agnostic, keeping them the same) ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.darkBackground },
    
    // --- Header ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        backgroundColor: COLORS.darkerBackground,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBackground,
    },
    backButton: { marginRight: 10 },
    headerTitle: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: '700',
    },

    // --- Main Content ---
    scrollContent: {
        padding: 15,
        paddingBottom: 100,
    },
    sectionTitle: {
        color: COLORS.purple,
        fontSize: 14,
        fontWeight: '900',
        marginTop: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBackground,
        paddingBottom: 5,
    },
    inputLabel: {
        color: COLORS.grayText,
        fontSize: 13,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 5,
    },
    input: {
        backgroundColor: COLORS.inputBackground,
        color: COLORS.white,
        padding: 12,
        borderRadius: 8,
        fontSize: 15,
    },
    textArea: {
        backgroundColor: COLORS.inputBackground,
        color: COLORS.white,
        padding: 12,
        borderRadius: 8,
        fontSize: 15,
        minHeight: 120,
        textAlignVertical: 'top',
    },
    charLimit: {
        color: COLORS.grayText,
        fontSize: 12,
        textAlign: 'right',
        marginTop: 4,
    },

    // --- Event Type (Tag Selector) ---
    typeSelectorContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    typeButton: {
        backgroundColor: COLORS.inputBackground,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    typeButtonActive: {
        backgroundColor: COLORS.purple,
    },
    typeButtonText: {
        color: COLORS.white,
        fontWeight: '600',
        fontSize: 13,
    },
    typeButtonTextActive: {
        color: COLORS.white,
    },

    // --- Date and Time ---
    dateTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 15,
    },
    dateTimeInputContainer: {
        flex: 1,
    },
    datePickerSim: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBackground,
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    },
    dateTimeInput: {
        flex: 1,
        color: COLORS.white,
        fontSize: 15,
        marginLeft: 10,
    },

    // --- Visibility (Radio Buttons) ---
    typeSelector: {
        marginBottom: 15,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingVertical: 5,
    },
    radio: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: COLORS.grayText,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioActive: {
        borderColor: COLORS.purple,
    },
    radioDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.purple,
    },
    radioText: {
        color: COLORS.white,
        fontSize: 14,
    },

    // --- Footer ---
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: 15,
        backgroundColor: COLORS.darkerBackground,
        borderTopWidth: 1,
        borderTopColor: COLORS.inputBackground,
    },
    cancelButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        marginRight: 10,
    },
    cancelButtonText: {
        color: COLORS.grayText,
        fontWeight: '700',
    },
    scheduleButton: {
        backgroundColor: COLORS.purple,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    scheduleButtonText: {
        color: COLORS.white,
        fontWeight: '700',
    },
});

export default CreateEventScreen;