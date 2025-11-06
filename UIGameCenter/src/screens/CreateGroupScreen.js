import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView, Alert, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/Colors';

const CATEGORIES = ['FPS', 'RPG', 'MOBA', 'Battle Royale', 'Estrategia', 'Casual'];

const CreateGroupScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const isWide = width > 800; 

    const [groupType, setGroupType] = useState('Juego');
    const [groupName, setGroupName] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [description, setDescription] = useState('');
    const [rules, setRules] = useState('');

    const handleSubmit = () => {
        if (!groupName || !selectedCategory || !description || !rules) {
            Alert.alert("Error", "Por favor, completa todos los campos obligatorios.");
            return;
        }
        const groupData = { type: groupType, name: groupName, category: selectedCategory, description, rules };
        console.log("Datos de Grupo a Crear:", groupData);
        Alert.alert("Éxito", `Grupo "${groupName}" creado con éxito.`, [
            { text: "OK", onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Crear Grupo de Juego</Text>
            </View>

            <ScrollView contentContainerStyle={[styles.scrollContent, !isWide && { paddingBottom: 80 }]}>
                <View style={[styles.contentWrapper, !isWide && { flexDirection: 'column' }]}>
               
                    <View style={[styles.formContainer, !isWide && { marginRight: 0 }]}>
                        <Text style={styles.sectionTitle}>Información del Grupo</Text>

                   
                        <View style={styles.typeSelector}>
                            <TouchableOpacity onPress={() => setGroupType('Juego')} style={styles.radioContainer}>
                                <View style={[styles.radio, groupType === 'Juego' && styles.radioActive]}>
                                    {groupType === 'Juego' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={styles.radioText}>Grupo de Juego - Para comunidades de juegos específicos</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setGroupType('Streamer')} style={styles.radioContainer}>
                                <View style={[styles.radio, groupType === 'Streamer' && styles.radioActive]}>
                                    {groupType === 'Streamer' && <View style={styles.radioDot} />}
                                </View>
                                <Text style={styles.radioText}>Comunidad de Streamer - Para streamers crear su comunidad</Text>
                            </TouchableOpacity>
                        </View>

                     
                        <Text style={styles.inputLabel}>Nombre del Grupo</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ej: Fortnite Latinos"
                            placeholderTextColor={COLORS.grayText}
                            value={groupName}
                            onChangeText={setGroupName}
                            maxLength={50}
                        />
                        <Text style={styles.charLimit}>{groupName.length}/50 caracteres</Text>

                    
                        <Text style={styles.inputLabel}>Categoría</Text>
                        <View style={styles.categoryContainer}>
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <Text style={[styles.categoryButtonText, selectedCategory === cat && styles.categoryButtonTextActive]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                    
                        <Text style={styles.inputLabel}>Descripción</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Describe el propósito y objetivo del grupo..."
                            placeholderTextColor={COLORS.grayText}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            maxLength={500}
                        />
                        <Text style={styles.charLimit}>{description.length}/500 caracteres</Text>

                  
                        <Text style={styles.inputLabel}>Reglas del Grupo</Text>
                        <TextInput
                            style={styles.textArea}
                            placeholder="Establece reglas de convivencia para los miembros..."
                            placeholderTextColor={COLORS.grayText}
                            value={rules}
                            onChangeText={setRules}
                            multiline
                        />

                   
                        <Text style={styles.inputLabel}>Icono del Grupo</Text>
                        <TouchableOpacity style={styles.uploadBox}>
                            <Ionicons name="cloud-upload-outline" size={30} color={COLORS.grayText} />
                            <Text style={styles.uploadText}>Haz clic para subir</Text>
                            <Text style={styles.uploadSubText}>PNG, JPG hasta 5MB</Text>
                        </TouchableOpacity>

          
                        <View style={styles.buttonRow}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                                <Text style={styles.cancelButtonText}>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.createButton} onPress={handleSubmit}>
                                <Text style={styles.createButtonText}>Crear Grupo</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

             
                    <View style={[styles.sidebarContainer, !isWide && { borderLeftWidth: 0, paddingLeft: 0, marginTop: 30 }]}>
                        <Text style={styles.sectionTitle}>Consejos</Text>
                        <View style={styles.tipBox}>
                            <Ionicons name="information-circle-outline" size={20} color={COLORS.purple} />
                            <Text style={styles.tipText}>Usa un nombre descriptivo y atractivo para tu grupo.</Text>
                        </View>

                        <Text style={styles.tipTitle}>Buenas Prácticas:</Text>
                        <View style={styles.bulletList}>
                            <Text style={styles.bulletText}>• Establece reglas claras desde el inicio</Text>
                            <Text style={styles.bulletText}>• Sé específico sobre el tema del grupo</Text>
                            <Text style={styles.bulletText}>• Usa una descripción llamativa</Text>
                            <Text style={styles.bulletText}>• Considera roles de moderadores</Text>
                        </View>
                        <Text style={styles.monetizationText}>Los grupos creados pueden monetizar con GameCenter Plus</Text>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.darkBackground },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        backgroundColor: COLORS.darkerBackground,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBackground,
    },
    backButton: { marginRight: 15 },
    headerTitle: { color: COLORS.white, fontSize: 18, fontWeight: '700' },
    scrollContent: { padding: 20 },
    contentWrapper: { flexDirection: 'row', justifyContent: 'space-between' },
    formContainer: { flex: 2, marginRight: 20 },
    sidebarContainer: { flex: 1, paddingLeft: 20, borderLeftWidth: 1, borderLeftColor: COLORS.inputBackground },

    sectionTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 15 },
    inputLabel: { color: COLORS.grayText, fontSize: 14, fontWeight: '600', marginTop: 15, marginBottom: 5 },
    input: {
        backgroundColor: COLORS.inputBackground,
        color: COLORS.white,
        padding: 10,
        borderRadius: 8,
        fontSize: 15,
    },
    textArea: {
        backgroundColor: COLORS.inputBackground,
        color: COLORS.white,
        padding: 10,
        borderRadius: 8,
        fontSize: 15,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    charLimit: { color: COLORS.grayText, fontSize: 12, textAlign: 'right', marginTop: 4 },
    typeSelector: { marginBottom: 15 },
    radioContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    radio: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: COLORS.grayText, marginRight: 10, justifyContent: 'center', alignItems: 'center' },
    radioActive: { borderColor: COLORS.purple },
    radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.purple },
    radioText: { color: COLORS.white, fontSize: 14 },
    categoryContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
    categoryButton: { backgroundColor: COLORS.inputBackground, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    categoryButtonActive: { backgroundColor: COLORS.purple },
    categoryButtonText: { color: COLORS.white, fontWeight: '600', fontSize: 13 },
    uploadBox: {
        backgroundColor: COLORS.inputBackground,
        height: 120,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: COLORS.grayText,
    },
    uploadText: { color: COLORS.white, fontWeight: '600', fontSize: 14, marginTop: 5 },
    uploadSubText: { color: COLORS.grayText, fontSize: 12 },
    buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 30, gap: 10, paddingTop: 20 },
    cancelButtonText: { color: COLORS.grayText, fontWeight: '700' },
    createButton: { backgroundColor: COLORS.purple, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
    createButtonText: { color: COLORS.white, fontWeight: '700' },
    tipBox: { flexDirection: 'row', backgroundColor: COLORS.purple + '20', padding: 15, borderRadius: 8, marginBottom: 20 },
    tipText: { color: COLORS.white, fontSize: 14, marginLeft: 10, flexShrink: 1 },
    tipTitle: { color: COLORS.white, fontWeight: '700', marginBottom: 10 },
    bulletText: { color: COLORS.white, fontSize: 13, marginBottom: 5 },
    monetizationText: { color: COLORS.grayText, fontSize: 11, marginTop: 20, borderTopWidth: 1, borderTopColor: COLORS.inputBackground, paddingTop: 10 },
});

export default CreateGroupScreen;
