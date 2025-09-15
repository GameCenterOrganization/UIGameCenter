// LoginScreen.js
import React, { useState } from "react";
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

/**
 * LoginScreen
 * - Componente autocontenido
 * - Usa react-hook-form para validación
 */

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

  const onSubmit = (data) => {
    setLoading(true);
   
    setTimeout(() => {
      setLoading(false);
      // Aqui ingresar la logica con firbase (navigation, API call, etc.)
      navigation.navigate("Home");

      console.log("Login enviado", data);
      alert("Login enviado (simulado): " + JSON.stringify(data));
    }, 1400);
  };

  const onGoogle = () => {
    alert("Iniciar con Google (simulado)");
  };

  const onGithub = () => {
    alert("Iniciar con GitHub (simulado)");
  };

  const onRegister = () => {
    alert("Ir a registro (simulado)");
  };

  const onGuest = () => {
    alert("Continuar como invitado (simulado)");
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
                <Text style={{ color: "#f46ff0" }}>Game</Text>
                <Text style={{ color: "#9b7aff" }}>Center</Text>
              </Text>
            </View>

            <Text style={LoginStyles.headline}>Únete a la comunidad gamer más grande</Text>
            <Text style={LoginStyles.subText}>
              Descubre juegos, compara precios, conecta con otros gamers y encuentra las mejores ofertas en un solo lugar.
            </Text>

            <View style={LoginStyles.previewImageContainer}>
              {/* Imagen decorativa: puedes reemplazar por Image si tienes archivo */}
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60",
                }}
                style={LoginStyles.previewImage}
                resizeMode="cover"
              />
            </View>

            <View style={LoginStyles.statsRow}>
              <View style={LoginStyles.stat}>
                <Text style={LoginStyles.statNumber}>50K+</Text>
                <Text style={LoginStyles.statLabel}>Juegos</Text>
              </View>
              <View style={LoginStyles.stat}>
                <Text style={LoginStyles.statNumber}>1.2M+</Text>
                <Text style={LoginStyles.statLabel}>Usuarios</Text>
              </View>
              <View style={LoginStyles.stat}>
                <Text style={LoginStyles.statNumber}>890K</Text>
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
                        placeholder="tu@email.com"
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
                  minLength: { value: 6, message: "Mínimo 6 caracteres" },
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
                  colors={["#d153ff", "#ff599f"]}
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

              {/* Divider with text */}
              <View style={LoginStyles.dividerRow}>
                <View style={LoginStyles.dividerLine} />
                <Text style={LoginStyles.dividerText}>O CONTINÚA CON</Text>
                <View style={LoginStyles.dividerLine} />
              </View>

              {/* Social buttons */}
              <View style={LoginStyles.socialRow}>
                <TouchableOpacity style={LoginStyles.socialBtn} onPress={onGoogle}>
                  <FontAwesome name="google" size={18} color="#7a7a7a" />
                  <Text style={LoginStyles.socialText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity style={LoginStyles.socialBtn} onPress={onGithub}>
                  <FontAwesome name="github" size={18} color="#7a7a7a" />
                  <Text style={LoginStyles.socialText}>GitHub</Text>
                </TouchableOpacity>
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

