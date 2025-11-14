// src/components/EventCard.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

const EventCard = ({ 
    event, 
    onPress, 
    onJoin, 
    onEdit, 
    isOwner, 
    isJoined // NUEVO: saber si ya está inscrito
}) => {
    const progress = event.PARTICIPANTS_LIMIT > 0 
        ? (event.PARTICIPANTS / event.PARTICIPANTS_LIMIT) * 100 
        : 0;
    const isFull = event.PARTICIPANTS >= event.PARTICIPANTS_LIMIT;

    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            {/* IMAGEN */}
            <Image 
                source={{ 
                    uri: event.IMG_URL 
                        ? `http://localhost:8080${event.IMG_URL}` 
                        : 'https://via.placeholder.com/300' 
                }} 
                style={styles.image} 
            />

            {/* TAG */}
            <View style={styles.overlay}>
                <View style={styles.tag}>
                    <Text style={styles.tagText}>Evento</Text>
                </View>
            </View>

            {/* CONTENIDO */}
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{event.TITLE}</Text>
                <Text style={styles.description} numberOfLines={2}>{event.DESCRIPTION}</Text>

                {/* FECHA Y HORA */}
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="calendar-outline" size={14} color={COLORS.grayText} />
                        <Text style={styles.infoText}>{event.DATE}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="time-outline" size={14} color={COLORS.grayText} />
                        <Text style={styles.infoText}>{event.HOUR}</Text>
                    </View>
                </View>

                {/* UBICACIÓN Y PARTICIPANTES */}
                <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                        <Ionicons name="location-outline" size={14} color={COLORS.grayText} />
                        <Text style={styles.infoText}>{event.LOCATION || 'Online'}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Ionicons name="people-outline" size={14} color={COLORS.grayText} />
                        <Text style={styles.infoText}>
                            {event.PARTICIPANTS}/{event.PARTICIPANTS_LIMIT} participantes
                        </Text>
                    </View>
                </View>

                {/* ORGANIZADOR */}
                <View style={styles.creatorRow}>
                    <Image 
                        source={{ 
                            uri: event.creator?.PROFILE_PIC 
                                ? `http://localhost:8080${event.creator.PROFILE_PIC}` 
                                : `http://localhost:8080/images/event/default_avatar.jpg` 
                        }} 
                        style={styles.creatorImg} 
                    />
                    <Text style={styles.creatorText}>
                        Organizado por {event.creator?.USERNAME_DSC}
                    </Text>
                </View>

                {/* BARRA DE PROGRESO */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>Plazas disponibles</Text>
                </View>

                {/* ACCIONES */}
                <View style={styles.actions}>
                    {isOwner ? (
                        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                            <Text style={styles.editButtonText}>Editar</Text>
                        </TouchableOpacity>
                    ) : isJoined ? (
                        // YA INSCRITO → BOTÓN VERDE CON CHECK
                        <TouchableOpacity style={styles.joinedButton} disabled>
                            <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
                            <Text style={styles.joinedText}>Ya inscrito</Text>
                        </TouchableOpacity>
                    ) : (
                        // INSCRIBIRSE
                        <TouchableOpacity 
                            style={[
                                styles.joinButton, 
                                isFull && styles.joinButtonDisabled
                            ]} 
                            onPress={onJoin} 
                            disabled={isFull}
                        >
                            <Text style={styles.joinButtonText}>
                                {isFull ? 'Lleno' : 'Inscribirse'}
                            </Text>
                        </TouchableOpacity>
                    )}

                    {/* VER DETALLES */}
                    <TouchableOpacity style={styles.detailsButton}>
                        <Ionicons name="heart-outline" size={18} color={COLORS.white} style={{ marginLeft: 5 }} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
};

// ESTILOS COMPLETOS
const styles = StyleSheet.create({
    card: { 
        backgroundColor: COLORS.darkerBackground, 
        borderRadius: 16, 
        overflow: 'hidden', 
        marginBottom: 16, 
        elevation: 4 
    },
    image: { 
        width: '100%', 
        height: 180 
    },
    overlay: { 
        position: 'absolute', 
        top: 10, 
        left: 10 
    },
    tag: { 
        backgroundColor: COLORS.purple, 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 20 
    },
    tagText: { 
        color: COLORS.white, 
        fontSize: 11, 
        fontWeight: 'bold' 
    },
    content: { 
        padding: 14 
    },
    title: { 
        color: COLORS.white, 
        fontSize: 17, 
        fontWeight: 'bold', 
        marginBottom: 6 
    },
    description: { 
        color: COLORS.grayText, 
        fontSize: 13, 
        marginBottom: 10 
    },
    infoRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 8 
    },
    infoItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        flex: 1 
    },
    infoText: { 
        color: COLORS.grayText, 
        fontSize: 12, 
        marginLeft: 4 
    },
    creatorRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginVertical: 10 
    },
    creatorImg: { 
        width: 28, 
        height: 28, 
        borderRadius: 14, 
        marginRight: 8 
    },
    creatorText: { 
        color: COLORS.grayText, 
        fontSize: 12 
    },
    progressContainer: { 
        marginVertical: 10 
    },
    progressBar: { 
        height: 6, 
        backgroundColor: COLORS.inputBackground, 
        borderRadius: 3, 
        overflow: 'hidden' 
    },
    progressFill: { 
        height: '100%', 
        backgroundColor: COLORS.purple 
    },
    progressText: { 
        color: COLORS.grayText, 
        fontSize: 11, 
        textAlign: 'right', 
        marginTop: 4 
    },
    actions: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginTop: 10 
    },

    // BOTONES
    joinButton: { 
        backgroundColor: COLORS.purple, 
        paddingHorizontal: 24, 
        paddingVertical: 10, 
        borderRadius: 8 
    },
    joinButtonDisabled: { 
        backgroundColor: COLORS.purple 
    },
    joinButtonText: { 
        color: COLORS.white, 
        fontWeight: 'bold' 
    },

    editButton: { 
        backgroundColor: COLORS.purple, 
        paddingHorizontal: 24, 
        paddingVertical: 10, 
        borderRadius: 8 
    },
    editButtonText: { 
        color: COLORS.white, 
        fontWeight: 'bold' 
    },

    // NUEVO: YA INSCRITO
    joinedButton: {
        backgroundColor: COLORS.purple,
        borderColor: COLORS.green,
        borderWidth: 1,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    joinedText: {
        color: COLORS.green,
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 14
    },

    detailsButton: { 
        flexDirection: 'row', 
        alignItems: 'center' 
    },
    detailsButtonText: { 
        color: COLORS.grayText, 
        fontSize: 13 
    },
});

export default EventCard;