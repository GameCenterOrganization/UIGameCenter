
import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  KeyboardAvoidingView,
  Button,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { styles } from "./ProfileStyle";
import DateTimePicker from '@react-native-community/datetimepicker';

const BACKEND_BASE = "http://localhost:8080";
const PROFILE_GET = `${BACKEND_BASE}/api/users/profile`;
const PROFILE_UPDATE = `${BACKEND_BASE}/api/users/profile/update`;
const PROFILE_UPLOAD_PIC = `${BACKEND_BASE}/api/users/profile/upload-photo`;

export default function UserProfileScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 700;

  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    birthDate: null,
    bio: "",
    photoURL: null,
    tags: ["Pro Gamer", "Amigable", "Estratega"],
  });

  const [redirecting, setRedirecting] = useState(false);


  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {

        return;
      }

      setFirebaseUser(user);
      setLoading(true);
      try {
        const idToken = await user.getIdToken();
        const res = await fetch(PROFILE_GET, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${idToken}`,
            Accept: "application/json",
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();


        let birthDate = null;
        if (data.birthDate) {
          const [year, month, day] = data.birthDate.split('-').map(Number);
          if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
            birthDate = new Date(year, month - 1, day);
          }
        }

        setProfile((p) => ({
          ...p,
          firstName: data.firstName ?? p.firstName,
          lastName: data.lastName ?? p.lastName,
          username: data.username ?? p.username,
          email: data.email ?? p.email,
          birthDate: birthDate,
          bio: data.bio ?? p.bio,
          photoURL: data.photoURL ?? p.photoURL,
          tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : p.tags,
        }));
      } catch (err) {
        console.error("Error al obtener perfil:", err);
        Alert.alert("Error", "No se pudo cargar tu perfil.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigation]);

  const onChange = (field, value) => {
    setProfile((p) => ({ ...p, [field]: value }));
  };

  const addTag = (tag) => {
    if (!tag || tag.trim() === "") return;
    const normalized = tag.trim();
    if (profile.tags.includes(normalized)) return;
    setProfile((p) => ({ ...p, tags: [...p.tags, normalized] }));
  };

  const removeTag = (tag) => {
    setProfile((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }));
  };

  const formatDate = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setProfile(p => ({ ...p, birthDate: selectedDate }));
    }
  };

  const pickImageAndUpload = useCallback(async () => {

    if (!firebaseUser) {
      Alert.alert("Error", "Usuario no autenticado. Por favor, inicia sesión.");
      return;
    }

    if (Platform.OS !== "web") {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permisos requeridos", "Necesitamos acceso a tu galería.");
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (result.canceled) return;

      const localUri = result.assets[0].uri;
      const filename = localUri.split("/").pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = `image/${match ? match[1] : "jpeg"}`;

      const formData = new FormData();
      formData.append("photo", {
        uri: localUri,
        name: filename,
        type,
      });

      setSaving(true);
      const idToken = await firebaseUser.getIdToken();
      const res = await fetch(PROFILE_UPLOAD_PIC, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

      const data = await res.json();
      setProfile((p) => ({ ...p, photoURL: data.photoURL || localUri }));
    } catch (err) {
      console.error("Error al subir imagen:", err);
      Alert.alert("Error", "No se pudo subir la imagen.");
    } finally {
      setSaving(false);
    }
  }, [firebaseUser]);



  const saveProfile = async () => {
    if (!firebaseUser) {
      Alert.alert("Error", "Usuario no autenticado.");
      return;
    }

    setSaving(true);
    try {

      const formattedBirthDate = profile.birthDate
        ? profile.birthDate.toISOString().split('T')[0]
        : null;

      const idToken = await firebaseUser.getIdToken();
      const res = await fetch(PROFILE_UPDATE, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          FIRST_NAME_DSC: profile.firstName,
          LAST_NAME_DSC: profile.lastName,
          USERNAME_DSC: profile.username,
          BIRTH_DATE: formattedBirthDate,
          BIO_DSC: profile.bio,
          PROFILE_PIC: profile.photoURL,
        }),
      });

      if (!res.ok) throw new Error(`Save failed: ${res.status}`);
      Alert.alert("Éxito", "Perfil actualizado correctamente.");
    } catch (err) {
      console.error("Error al guardar:", err);
      Alert.alert("Error", "No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#9b7aff" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!firebaseUser) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="small" />
        <Text style={{ color: "#fff", marginTop: 10 }}>Redirigiendo...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={["#0b0d12", "#0f1116"]} style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.inner}>
          <Text style={styles.title}>Mi Cuenta</Text>
          <Text style={styles.subtitle}>Gestiona tu perfil y configuración</Text>

          <View style={[styles.card, isNarrow ? styles.cardNarrow : styles.cardWide]}>
            <Text style={styles.cardHeader}>Foto de Perfil</Text>
            <View style={styles.row}>
              <View style={styles.avatarColumn}>
                <View style={styles.avatarWrap}>
                  {profile.photoURL ? (
                    <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]}>
                      <MaterialCommunityIcons name="account" size={48} color="#8b8f96" />
                    </View>
                  )}
                  <TouchableOpacity style={styles.cameraBtn} onPress={pickImageAndUpload} activeOpacity={0.8}>
                    {saving ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Feather name="camera" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.infoColumn}>
                <Text style={styles.nameText}>
                  {profile.firstName || "Nombre"} {profile.lastName || ""}
                </Text>
                <Text style={styles.usernameText}>@{profile.username || "usuario"}</Text>
                <TouchableOpacity style={styles.changeBtn} onPress={pickImageAndUpload}>
                  <Text style={styles.changeBtnText}>Cambiar Foto</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>


          <View style={[styles.card, isNarrow ? styles.cardNarrow : styles.cardWide]}>
            <Text style={styles.cardHeader}>Información Personal</Text>

            <View style={styles.rowTwo}>
              <View style={styles.field}>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  value={profile.firstName}
                  onChangeText={(t) => onChange("firstName", t)}
                  style={styles.input}
                  placeholder=""
                  placeholderTextColor="#6b7a84"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Apellido</Text>
                <TextInput
                  value={profile.lastName}
                  onChangeText={(t) => onChange("lastName", t)}
                  style={styles.input}
                  placeholder=""
                  placeholderTextColor="#6b7a84"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nombre de Usuario</Text>
              <TextInput
                value={profile.username}
                onChangeText={(t) => onChange("username", t)}
                style={styles.input}
                placeholder=""
                placeholderTextColor="#6b7a84"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput value={profile.email} editable={false} style={[styles.input, styles.inputDisabled]} />
            </View>

           <View style={styles.field}>
  <Text style={styles.label}>Fecha de Nacimiento</Text>

  {Platform.OS === 'web' ? (
    <input
      type="date"
      value={profile.birthDate && profile.birthDate instanceof Date && !isNaN(profile.birthDate)
        ? profile.birthDate.toISOString().split('T')[0]
        : ''
      }
      onChange={(e) => {
        if (e.target.value) {
          const [year, month, day] = e.target.value.split('-').map(Number);
          const newDate = new Date(year, month - 1, day);
          onChange('birthDate', newDate);
        } else {
          onChange('birthDate', null);
        }
      }}
      style={{
        backgroundColor: '#1e2228',
        color: '#fff',
        padding: 12,
        borderRadius: 8,
        border: '1px solid #3a3f47',
        fontSize: 16,
        outline: 'none',
        width: '100%',
      }}
    />
  ) : (
    <>
      <TouchableOpacity
        style={[styles.input, { justifyContent: 'center' }]}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={{ color: profile.birthDate && profile.birthDate instanceof Date && !isNaN(profile.birthDate) ? '#fff' : '#6b7a84' }}>
          {profile.birthDate && profile.birthDate instanceof Date && !isNaN(profile.birthDate)
            ? formatDate(profile.birthDate)
            : "Selecciona tu fecha"}
        </Text>
      </TouchableOpacity>

      {showDatePicker && (
        <DateTimePicker
          value={profile.birthDate && profile.birthDate instanceof Date && !isNaN(profile.birthDate)
            ? profile.birthDate
            : new Date()
          }
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}
    </>
  )}
</View>
            <View style={styles.field}>
              <Text style={styles.label}>Biografía</Text>
              <TextInput
                value={profile.bio}
                onChangeText={(t) => onChange("bio", t)}
                style={[styles.input, styles.textarea]}
                multiline
                numberOfLines={4}
                placeholder="Cuenta algo sobre ti..."
              />
            </View>
          </View>


          <View style={[styles.card, isNarrow ? styles.cardNarrow : styles.cardWide]}>
            <Text style={styles.cardHeader}>Tags de Personalidad</Text>
            <View style={styles.tagsRow}>
              {profile.tags.map((t) => (
                <View style={styles.tag} key={t}>
                  <Text style={styles.tagText}>{t}</Text>
                  <TouchableOpacity onPress={() => removeTag(t)} style={styles.tagRemove}>
                    <Feather name="x" size={14} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.addTagRow}>
              <TextInput
                placeholder="Agregar nuevo tag..."
                placeholderTextColor="#6b7a84"
                style={[styles.input, { flex: 1 }]}
                onSubmitEditing={(e) => {
                  addTag(e.nativeEvent.text);
                  e.currentTarget.value = "";
                }}
              />
              <TouchableOpacity
                style={styles.addTagBtn}
                onPress={() => {
                  Alert.prompt?.("Nuevo Tag", "Escribe el nuevo tag", [
                    { text: "Cancelar", style: "cancel" },
                    { text: "Agregar", onPress: addTag },
                  ]) || addTag("Nuevo");
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.examples}>Ejemplos: Pro Gamer, Amigable, Solitario, Competitivo, Casual, Estratega</Text>
          </View>
          <View >
            <Text >Configuración</Text>
            <Text>Ajusta tus preferencias aquí</Text>
            <Button
              title="Volver al Inicio"
              onPress={() => navigation.goBack()}
            />
          </View>

          <View style={{ alignItems: "flex-end", width: "100%", paddingHorizontal: isNarrow ? 12 : 0 }}>
            <TouchableOpacity style={styles.saveButton} onPress={saveProfile} disabled={saving}>
              <LinearGradient colors={["#875ff5", "#9b7aff"]} start={[0, 0]} end={[1, 0]} style={styles.saveGradient}>
                {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveText}>Guardar Cambios</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>

    </LinearGradient>
  );
}