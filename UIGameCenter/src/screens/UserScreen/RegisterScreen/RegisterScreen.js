import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Pressable,
    ActivityIndicator,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, FontAwesome, Feather } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import { RegisterStyle } from "./RegisterStyle.js";
import { auth } from "../firebaseConfig.js";
import { createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import * as Google from "expo-auth-session/providers/google";
import { makeRedirectUri } from "expo-auth-session";
import { BASE_URL } from '@env';

import { showMessage } from "react-native-flash-message";
import COLORS from "../../../constants/Colors";

const showAlert = (title, message) => {
    showMessage({
        message: title,
        description: message,
        type: "default",
        backgroundColor: COLORS.darkerBackground,
        color: COLORS.white,
        textStyle: { fontWeight: "bold" },
        titleStyle: { fontSize: 16, fontWeight: "800" },
        duration: 3500,
        icon: "danger",
        style: { paddingTop: 40 },
    });
};

export default function RegisterScreen({ navigation }) {

    const { width } = useWindowDimensions();
    const isNarrow = width < 480;

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { control, handleSubmit, watch, formState: { errors } } = useForm({
        mode: "onChange",
        defaultValues: { email: "", password: "", confirmPassword: "" },
    });

    const passwordValue = watch("password");

    const getPasswordStrength = (password) => {
        let score = 0;
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        if (score <= 1) return { label: "Débil", color: "red" };
        if (score === 2) return { label: "Media", color: "orange" };
        return { label: "Fuerte", color: "green" };
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
            const user = userCredential.user;
            const idToken = await user.getIdToken();

            fetch(`${BASE_URL}/api/users/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    firebaseUid: user.uid,
                    email: user.email,
                    username: data.username,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    birthDate: data.birthDate,
                    bio: data.bio,
                    profilePic: data.profilePic
                })
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Respuesta del backend:", data);
                    showAlert("Registro exitoso", "Tu cuenta ha sido creada correctamente.");
                })
                .catch(err => {
                    console.error("Error enviando datos al backend:", err);
                    showAlert("Error de servidor", "Hubo un problema guardando tus datos.");
                });

            navigation.navigate("Home");

        } catch (error) {
            console.error("Error al registrar usuario:", error.message);

            let msg = "No se pudo crear tu cuenta.";
            if (error.code === "auth/email-already-in-use") msg = "Este correo ya está en uso.";
            if (error.code === "auth/invalid-email") msg = "El formato de email es incorrecto.";
            if (error.code === "auth/weak-password") msg = "La contraseña es demasiado débil.";

            showAlert("Error de registro", msg);

        } finally {
            setLoading(false);
        }
    };

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        webClientId: "1079695687490-5kno78vsammc54ib8ovn9v0fek9e3njq.apps.googleusercontent.com",
        androidClientId: "1079695687490-l09vcqsqj4dq6i7tkvgagp5drpiui889.apps.googleusercontent.com",
        iosClientId: "1079695687490-pmmbcr6ck5va5854c1vi0aus3pocrm95.apps.googleusercontent.com",
        redirectUri: makeRedirectUri({ useProxy: true }),
    });

    useEffect(() => {
        if (response?.type === "success") {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);

            signInWithCredential(auth, credential)
                .then((userCredential) => {
                    console.log("Usuario Google registrado:", userCredential.user);
                    showAlert("Bienvenido", "Registro exitoso con Google");
                    navigation.navigate("Home");
                })
                .catch((err) => {
                    console.error("Error autenticando con Firebase:", err);
                    showAlert("Error Google", err.message);
                });
        }
    }, [response]);

    const onGoogle = async () => {
        await promptAsync();
    };

    const onGithub = async () => {
        try {
            const provider = new OAuthProvider("github.com");
            provider.addScope("user:email");

            const result = await signInWithCredential(auth, provider);
            console.log("Usuario GitHub:", result.user);

            showAlert("GitHub", "Inicio con GitHub pendiente de ajuste");
            navigation.navigate("Home");

        } catch (err) {
            console.error(err);
            showAlert("Error GitHub", err.message);
        }
    };

    const onLogin = () => {
        showAlert("Ir a iniciar sesión", "Redirigiendo a Login...");
        navigation.navigate("Login");
    };

    const onGuest = () => {
        showAlert("Modo Invitado", "Entrando sin cuenta...");
        navigation.navigate("Home");
    };

    return (
        <LinearGradient
            colors={["#0f1220", "#12131e"]}
            style={RegisterStyle.container}
        >
            <ScrollView
                contentContainerStyle={[
                    RegisterStyle.scrollContainer,
                    isNarrow ? RegisterStyle.scrollNarrow : RegisterStyle.scrollWide,
                ]}
                keyboardShouldPersistTaps="handled"
            >
                {!isNarrow && (
                    <View style={RegisterStyle.leftPane}>
                        <View style={RegisterStyle.logoRow}>
                            <View style={RegisterStyle.logoBadge}>
                                <MaterialCommunityIcons name="gamepad-variant-outline" size={28} color="#fff" />
                            </View>
                            <Text style={RegisterStyle.brandText}>
                                <Text style={{ color: "#a85dfdff" }}>Game</Text>
                                <Text style={{ color: "#9b7aff" }}>Center</Text>
                            </Text>
                        </View>

                        <Text style={RegisterStyle.headline}>Únete a nuestra comunidad gamer</Text>
                        <Text style={RegisterStyle.subText}>
                            Descubre juegos, compara precios, conecta con otros gamers y encuentra las mejores ofertas en un solo lugar.
                        </Text>

                        <View style={RegisterStyle.previewImageContainer}>
                            <Image
                                source={{
                                    uri: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0"
                                }}
                                style={RegisterStyle.previewImage}
                                resizeMode="cover"
                            />
                        </View>

                        <View style={RegisterStyle.statsRow}>
                            <View style={RegisterStyle.stat}>
                                <Text style={RegisterStyle.statNumber}>COMPARA</Text>
                                <Text style={RegisterStyle.statLabel}>Juegos</Text>
                            </View>
                            <View style={RegisterStyle.stat}>
                                <Text style={RegisterStyle.statNumber}>COMUNIDAD</Text>
                                <Text style={RegisterStyle.statLabel}>Usuarios</Text>
                            </View>
                            <View style={RegisterStyle.stat}>
                                <Text style={RegisterStyle.statNumber}>INFORMATE</Text>
                                <Text style={RegisterStyle.statLabel}>Reviews</Text>
                            </View>
                        </View>
                    </View>
                )}

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={[RegisterStyle.cardWrapper, isNarrow && { width: "92%" }]}
                >
                    <LinearGradient
                        colors={["rgba(255,255,255,0.02)", "rgba(255,255,255,0.01)"]}
                        style={RegisterStyle.card}
                    >
                        <View style={RegisterStyle.cardHeader}>
                            <View style={RegisterStyle.brandSmall}>
                                <MaterialCommunityIcons name="gamepad-variant-outline" size={20} color="#fff" />
                            </View>
                            <Text style={RegisterStyle.cardTitle}>Registrar Cuenta</Text>
                            <Text style={RegisterStyle.cardSubtitle}>Bienvenido a nuestra plataforma, gamer</Text>
                        </View>


                        <View style={RegisterStyle.form}>

                            <Text style={RegisterStyle.inputLabel}>Email</Text>
                            <Controller
                                control={control}
                                rules={{
                                    required: "El email es requerido",
                                    pattern: {
                                        value:
                                            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()[\]\\.,;:\s@"]+\.)+[^<>()[\]\\.,;:\s@"]{2,})$/i,
                                        message: "Formato de email inválido",
                                    },
                                }}
                                name="email"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View>
                                        <View style={RegisterStyle.inputRow}>
                                            <Feather name="mail" size={16} color="#9aa0a6" style={{ marginRight: 10 }} />
                                            <TextInput
                                                placeholder="ejemplo123@email.com"
                                                placeholderTextColor="#6b7a84"
                                                style={[RegisterStyle.input, errors.email && RegisterStyle.inputError]}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                autoCapitalize="none"
                                                keyboardType="email-address"
                                                value={value}
                                            />
                                        </View>
                                        {errors.email && <Text style={RegisterStyle.errorText}>{errors.email.message}</Text>}
                                    </View>
                                )}
                            />

                            <Text style={[RegisterStyle.inputLabel, { marginTop: 12 }]}>Contraseña</Text>
                            <Controller
                                control={control}
                                rules={{
                                    required: "La contraseña es requerida",
                                    minLength: { value: 8, message: "Mínimo 8 caracteres" },
                                }}
                                name="password"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View>
                                        <View style={RegisterStyle.inputRow}>
                                            <Feather name="lock" size={16} color="#9aa0a6" style={{ marginRight: 10 }} />
                                            <TextInput
                                                placeholder="••••••••"
                                                placeholderTextColor="#6b7a84"
                                                style={[RegisterStyle.input, errors.password && RegisterStyle.inputError]}
                                                secureTextEntry={!showPassword}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                autoCapitalize="none"
                                            />
                                            <Pressable onPress={() => setShowPassword((s) => !s)} style={{ padding: 6 }}>
                                                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color="#9aa0a6" />
                                            </Pressable>
                                        </View>

                                        {errors.password && <Text style={RegisterStyle.errorText}>{errors.password.message}</Text>}

                                        {value.length > 0 && (
                                            <Text style={{ color: getPasswordStrength(value).color }}>
                                                Seguridad: {getPasswordStrength(value).label}
                                            </Text>
                                        )}
                                    </View>
                                )}
                            />

                            <Text style={[RegisterStyle.inputLabel, { marginTop: 12 }]}>Confirmar Contraseña</Text>
                            <Controller
                                control={control}
                                name="confirmPassword"
                                rules={{
                                    required: "Confirmar la contraseña es requerido",
                                    validate: (value) => value === passwordValue || "Las contraseñas no coinciden",
                                }}
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <View>
                                        <View style={RegisterStyle.inputRow}>
                                            <Feather name="lock" size={16} color="#9aa0a6" style={{ marginRight: 10 }} />
                                            <TextInput
                                                placeholder="••••••••"
                                                placeholderTextColor="#6b7a84"
                                                style={[RegisterStyle.input, errors.confirmPassword && RegisterStyle.inputError]}
                                                secureTextEntry={!showPassword}
                                                onBlur={onBlur}
                                                onChangeText={onChange}
                                                value={value}
                                                autoCapitalize="none"
                                            />
                                        </View>
                                        {errors.confirmPassword && <Text style={RegisterStyle.errorText}>{errors.confirmPassword.message}</Text>}
                                    </View>
                                )}
                            />

                            <TouchableOpacity
                                style={RegisterStyle.loginButton}
                                onPress={handleSubmit(onSubmit)}
                                activeOpacity={0.85}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={["#875ff5", "#9b7aff"]}
                                    start={[0, 0]}
                                    end={[1, 0]}
                                    style={RegisterStyle.loginGradient}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <View style={RegisterStyle.loginContent}>
                                            <Pressable onPress={handleSubmit(onSubmit)}>
                                                <Text style={RegisterStyle.loginText}>Registrar</Text>
                                            </Pressable>
                                        </View>
                                    )}
                                </LinearGradient>
                            </TouchableOpacity>

                            <View style={RegisterStyle.dividerRow}>
                                <View style={RegisterStyle.dividerLine} />
                                <Text style={RegisterStyle.dividerText}>O CONTINÚA CON</Text>
                                <View style={RegisterStyle.dividerLine} />
                            </View>

                            <View style={RegisterStyle.socialRow}>
                                <TouchableOpacity style={RegisterStyle.socialBtn} onPress={onGoogle}>
                                    <FontAwesome name="google" size={18} color="#7a7a7a" />
                                    <Text style={RegisterStyle.socialText}>Google</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={RegisterStyle.linksRow}>
                                <TouchableOpacity onPress={onLogin}>
                                    <Text style={RegisterStyle.linkPrimary}>Ya tienes cuenta? Inicia sesión aquí</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={onGuest}>
                                    <Text style={RegisterStyle.linkSecondary}>Continuar como invitado</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </LinearGradient>
                </KeyboardAvoidingView>
            </ScrollView>
        </LinearGradient>
    );
}
