// LoginScreen.js
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
import { LoginStyles } from "./LoginStyles.js";

import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { makeRedirectUri } from "expo-auth-session";
import { BASE_URL } from '@env';

export default function LoginScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 480;

  // Form / UI states
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { email: "", password: "" },
  });

const onSubmit = async (data) => {
  setLoading(true);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    const idToken = await user.getIdToken();

    console.log("ID Token:", idToken);
    console.log("Usuario Firebase:", user.email);

    
    fetch(`${BASE_URL}/api/users/profile`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${idToken}`,
        "Content-Type": "application/json"
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log("Respuesta del backend:", data);
    })
    .catch(err => {
      console.error("Error conectando al backend:", err);
    });

    navigation.navigate("Home");
  } catch (error) {
    console.error("Error al iniciar sesión:", error.message);
    alert(error.message);
  } finally {
    setLoading(false);
  }
};
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: "1079695687490-5kno78vsammc54ib8ovn9v0fek9e3njq.apps.googleusercontent.com",
    redirectUri: makeRedirectUri({ useProxy: true }),
  });

  useEffect(() => {
    const loginWithGoogle = async () => {
      if (response?.type === "success") {
        const { id_token } = response.params;
        const credential = GoogleAuthProvider.credential(id_token);
        try {
          const userCredential = await signInWithCredential(auth, credential);
          console.log("Usuario Google:", userCredential.user);
          navigation.navigate("Home");
        } catch (err) {
          console.error("Error Google Sign-In:", err);
          alert(err.message);
        }
      }
    };
    loginWithGoogle();
  }, [response]);

  const onGoogle = () => {
    promptAsync();
  };
  const onGithub = () => {
    alert("Iniciar con GitHub ");
  };

  const onRegister = () => {
    alert("Ir a registro ");
    navigation.navigate("Register");
  };

  const onGuest = () => {
    alert("Continuar como invitado ");
    navigation.navigate("Home");
  };

  return (
    <LinearGradient
      colors={["#0f1220", "#12131e"]}
      style={LoginStyles.container}
    >

      <ScrollView
        contentContainerStyle={[
          LoginStyles.scrollContainer,
          isNarrow ? LoginStyles.scrollNarrow : LoginStyles.scrollWide,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/*promotional banner - hidden on mobile screens */}
        {!isNarrow && (
          <View style={LoginStyles.leftPane}>
            <View style={LoginStyles.logoRow}>
              <View style={LoginStyles.logoBadge}>
                <MaterialCommunityIcons name="gamepad-variant-outline" size={28} color="#fff" />
              </View>
              <Text style={LoginStyles.brandText}>
                <Text style={{ color: "#a85dfdff" }}>Game</Text>
                <Text style={{ color: "#9b7aff" }}>Center</Text>
              </Text>
            </View>

            <Text style={LoginStyles.headline}>Únete a nuestra comunidad gamer</Text>
            <Text style={LoginStyles.subText}>
              Descubre juegos, compara precios, conecta con otros gamers y encuentra las mejores ofertas en un solo lugar.
            </Text>

            <View style={LoginStyles.previewImageContainer}>
              {/**/}
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
                }}
                style={LoginStyles.previewImage}
                resizeMode="cover"
              />
            </View>

            <View style={LoginStyles.statsRow}>
              <View style={LoginStyles.stat}>
                <Text style={LoginStyles.statNumber}>COMPARA</Text>
                <Text style={LoginStyles.statLabel}>Juegos</Text>
              </View>
              <View style={LoginStyles.stat}>
                <Text style={LoginStyles.statNumber}>COMUNIDAD</Text>
                <Text style={LoginStyles.statLabel}>Usuarios</Text>
              </View>
              <View style={LoginStyles.stat}>
                <Text style={LoginStyles.statNumber}>INFORMATE</Text>
                <Text style={LoginStyles.statLabel}>Reviews</Text>
              </View>
            </View>
          </View>
        )}

        {/* Card (login) */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={[LoginStyles.cardWrapper, isNarrow && { width: "92%" }]}
        >
          <LinearGradient
            colors={["rgba(255,255,255,0.02)", "rgba(255,255,255,0.01)"]}
            style={LoginStyles.card}
          >
            <View style={LoginStyles.cardHeader}>
              <View style={LoginStyles.brandSmall}>
                <MaterialCommunityIcons name="gamepad-variant-outline" size={20} color="#fff" />
              </View>
              <Text style={LoginStyles.cardTitle}>Iniciar Sesión</Text>
              <Text style={LoginStyles.cardSubtitle}>Bienvenido de vuelta, gamer</Text>
            </View>

            {/* Form */}
            <View style={LoginStyles.form}>
              {/* Email */}
              <Text style={LoginStyles.inputLabel}>Email</Text>
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
                    <View style={LoginStyles.inputRow}>
                      <Feather name="mail" size={16} color="#9aa0a6" style={{ marginRight: 10 }} />
                      <TextInput
                        placeholder="ejemplo123@email.com"
                        placeholderTextColor="#6b7a84"
                        style={[LoginStyles.input, errors.email && LoginStyles.inputError]}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={value}
                      />
                    </View>
                    {errors.email && <Text style={LoginStyles.errorText}>{errors.email.message}</Text>}
                  </View>
                )}
              />

              {/* Password */}
              <Text style={[LoginStyles.inputLabel, { marginTop: 12 }]}>Contraseña</Text>
              <Controller
                control={control}
                rules={{
                  required: "La contraseña es requerida",
                  minLength: { value: 8, message: "Mínimo 8 caracteres" },
                }}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <View>
                    <View style={LoginStyles.inputRow}>
                      <Feather name="lock" size={16} color="#9aa0a6" style={{ marginRight: 10 }} />
                      <TextInput
                        placeholder="••••••••"
                        placeholderTextColor="#6b7a84"
                        style={[LoginStyles.input, errors.password && LoginStyles.inputError]}
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
                    {errors.password && <Text style={LoginStyles.errorText}>{errors.password.message}</Text>}
                  </View>
                )}
              />

              {/* Login button */}
              <TouchableOpacity
                style={LoginStyles.loginButton}
                onPress={handleSubmit(onSubmit)}
                activeOpacity={0.85}
                disabled={loading}
              >
                <LinearGradient
                  colors={["#875ff5", "#9b7aff"]}
                  start={[0, 0]}
                  end={[1, 0]}
                  style={LoginStyles.loginGradient}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <View style={LoginStyles.loginContent}>
                      <Text style={LoginStyles.loginText}>Iniciar Sesión</Text>
                      <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* */}
              <View style={LoginStyles.dividerRow}>
                <View style={LoginStyles.dividerLine} />
                <Text style={LoginStyles.dividerText}>O CONTINÚA CON</Text>
                <View style={LoginStyles.dividerLine} />
              </View>

              {/*  */}
              <View style={LoginStyles.socialRow}>
                <TouchableOpacity style={LoginStyles.socialBtn} onPress={onGoogle}>
                  <FontAwesome name="google" size={18} color="#7a7a7a" />
                  <Text style={LoginStyles.socialText}>Google</Text>
                </TouchableOpacity>

                {/*<TouchableOpacity style={LoginStyles.socialBtn} onPress={onGithub}>
                  <FontAwesome name="github" size={18} color="#7a7a7a" />
                  <Text style={LoginStyles.socialText}>GitHub</Text>
                </TouchableOpacity>*/}
              </View>

              {/* Links */}
              <View style={LoginStyles.linksRow}>
                <TouchableOpacity onPress={onRegister}>
                  <Text style={LoginStyles.linkPrimary}>¿No tienes cuenta? Regístrate aquí</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={onGuest}>
                  <Text style={LoginStyles.linkSecondary}>Continuar como invitado</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </KeyboardAvoidingView>
      </ScrollView>
    </LinearGradient>
  );
}

