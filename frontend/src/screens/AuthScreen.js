import React, { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const API_HOST = Platform.OS === "android" ? "10.0.2.2" : "localhost";
const API_URL = `http://${API_HOST}:3000/api/auth`;
const GREEN = "#2D7A4F";
const DARK_GREEN = "#17633F";
const BACKGROUND = "#F5F7F6";
const TEXT = "#172033";
const MUTED = "#667085";
const BORDER = "#D9E1DC";

export default function AuthScreen({ navigation, route }) {
  const initialMode = route.params?.mode || "login";
  const initialRole = route.params?.role || "client";
  const [mode, setMode] = useState(initialMode);
  const [role, setRole] = useState(initialRole);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isRegistering = mode === "register";

  const handleSubmit = async () => {
    setErrorMessage("");

    if (!email.trim() && isRegistering) {
      setErrorMessage("Ingresá un email.");
      return;
    }

    if (!username.trim() && isRegistering) {
      setErrorMessage("Ingresá un nombre de usuario.");
      return;
    }

    if (!email.trim() && !isRegistering) {
      setErrorMessage("Ingresá tu usuario o email.");
      return;
    }

    if (!password) {
      setErrorMessage("Ingresá tu contraseña.");
      return;
    }

    setIsLoading(true);

    try {
      const response = isRegistering
        ? await axios.post(`${API_URL}/register`, {
            username: username.trim(),
            email: email.trim(),
            password,
            role,
          })
        : await axios.post(`${API_URL}/login`, {
            identifier: email.trim(),
            password,
          });

      await AsyncStorage.setItem("authToken", response.data.token);
      await AsyncStorage.setItem(
        "authUser",
        JSON.stringify(response.data.user),
      );
      navigation.replace(
        response.data.user.role === "producer" ? "AIPanel" : "Home",
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error ||
          "No pudimos completar la operación. Revisá la conexión e intentá nuevamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectMode = (nextMode) => {
    setMode(nextMode);
    setErrorMessage("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.eyebrow}>Tachyon Dream Formosa</Text>
        <Text style={styles.title}>
          {isRegistering ? "Creá tu cuenta" : "Volvé a tu cuenta"}
        </Text>
        <Text style={styles.subtitle}>
          {isRegistering
            ? "Sumate al mercado local de Formosa."
            : "Iniciá sesión para continuar."}
        </Text>

        <View style={styles.modeSwitch}>
          <Pressable
            onPress={() => selectMode("login")}
            style={[
              styles.modeButton,
              !isRegistering && styles.modeButtonActive,
            ]}
          >
            <Text
              style={[styles.modeText, !isRegistering && styles.modeTextActive]}
            >
              Ingresar
            </Text>
          </Pressable>
          <Pressable
            onPress={() => selectMode("register")}
            style={[
              styles.modeButton,
              isRegistering && styles.modeButtonActive,
            ]}
          >
            <Text
              style={[styles.modeText, isRegistering && styles.modeTextActive]}
            >
              Registrarme
            </Text>
          </Pressable>
        </View>

        {isRegistering ? (
          <>
            <Text style={styles.label}>Nombre de usuario</Text>
            <TextInput
              autoCapitalize="none"
              onChangeText={setUsername}
              placeholder="ej: productor_formosa"
              placeholderTextColor="#8A9B91"
              style={styles.input}
              value={username}
            />
          </>
        ) : null}

        <Text style={styles.label}>
          {isRegistering ? "Gmail" : "Usuario o email"}
        </Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={isRegistering ? "email-address" : "default"}
          onChangeText={setEmail}
          placeholder={isRegistering ? "tu@gmail.com" : "tu usuario o email"}
          placeholderTextColor="#8A9B91"
          style={styles.input}
          value={email}
        />

        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          autoCapitalize="none"
          onChangeText={setPassword}
          placeholder="Tu contraseña"
          placeholderTextColor="#8A9B91"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: isLoading }}
          disabled={isLoading}
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitButton,
            pressed && styles.pressed,
            isLoading && styles.disabled,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>
              {isRegistering ? "Crear cuenta" : "Iniciar sesión"}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BACKGROUND },
  container: { flexGrow: 1, padding: 20, paddingTop: 16, paddingBottom: 28 },
  eyebrow: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 10,
    color: TEXT,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  subtitle: { marginTop: 8, color: MUTED, fontSize: 15, lineHeight: 22 },
  modeSwitch: {
    flexDirection: "row",
    marginTop: 20,
    padding: 4,
    borderRadius: 14,
    backgroundColor: "#E8F1EB",
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 11,
    borderRadius: 10,
  },
  modeButtonActive: { backgroundColor: "#FFFFFF", elevation: 2 },
  modeText: { color: MUTED, fontSize: 14, fontWeight: "700" },
  modeTextActive: { color: DARK_GREEN },
  label: {
    marginTop: 18,
    marginBottom: 7,
    color: TEXT,
    fontSize: 14,
    fontWeight: "800",
  },
  input: {
    minHeight: 50,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    color: TEXT,
    fontSize: 16,
  },
  error: { marginTop: 16, color: "#B42318", fontSize: 14, lineHeight: 20 },
  submitButton: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    marginTop: 22,
    borderRadius: 13,
    backgroundColor: GREEN,
  },
  submitText: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  pressed: { opacity: 0.9 },
  disabled: { opacity: 0.65 },
});
