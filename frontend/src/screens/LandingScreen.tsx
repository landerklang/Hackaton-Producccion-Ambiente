import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type LandingScreenProps = {
  onBuyPress?: () => void;
  onSellPress?: () => void;
  onLoginPress?: () => void;
};

const BRAND_GREEN = "#1E7A4B";
const DEEP_GREEN = "#0F5E3A";
const SOFT_GREEN = "#EAF7F0";
const LIGHT_GREEN = "#F5FBF7";
const TEXT = "#153126";
const MUTED = "#5F7268";
const LINE = "#D9E9E0";
const WHITE = "#FFFFFF";

export default function LandingScreen({
  onBuyPress,
  onSellPress,
  onLoginPress,
}: LandingScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.eyebrow}>Bienvenidos</Text>
          <Text style={styles.title}>Tachyon Dream Formosa</Text>
          <Text style={styles.subtitle}>¿Qué querés hacer en la app hoy?</Text>
        </View>

        <View style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionIcon}>🛒</Text>
            <Text style={styles.optionTitle}>Quiero comprar</Text>
          </View>

          <Text style={styles.optionSubtext}>
            Registrate con email, nombre y contraseña para empezar a explorar.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={onBuyPress}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Siguiente</Text>
          </Pressable>
        </View>

        <View style={styles.optionCard}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionIcon}>🌱</Text>
            <Text style={styles.optionTitle}>Quiero vender</Text>
          </View>

          <Text style={styles.optionSubtext}>
            Registrate con email, nombre y contraseña para abrir tu perfil.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={onSellPress}
            style={({ pressed }) => [
              styles.secondaryButton,
              pressed && styles.secondaryButtonPressed,
            ]}
          >
            <Text style={styles.secondaryButtonText}>Siguiente</Text>
          </Pressable>
        </View>

        <View style={styles.loginCard}>
          <View style={styles.optionHeader}>
            <Text style={styles.optionIcon}>🔐</Text>
            <Text style={styles.optionTitle}>Ya tengo cuenta</Text>
          </View>

          <Text style={styles.optionSubtext}>
            Iniciá sesión con tu email y contraseña para continuar.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={onLoginPress}
            style={({ pressed }) => [
              styles.ghostButton,
              pressed && styles.ghostButtonPressed,
            ]}
          >
            <Text style={styles.ghostButtonText}>Iniciar sesión</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LIGHT_GREEN,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    backgroundColor: LIGHT_GREEN,
    alignItems: "center",
  },
  headerWrap: {
    marginBottom: 18,
    width: "100%",
    maxWidth: 640,
  },
  eyebrow: {
    color: BRAND_GREEN,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  title: {
    marginTop: 10,
    color: TEXT,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 10,
    color: MUTED,
    fontSize: 16,
    lineHeight: 23,
  },
  optionCard: {
    backgroundColor: WHITE,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: LINE,
    shadowColor: "#18372A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    width: "100%",
    maxWidth: 640,
  },
  loginCard: {
    backgroundColor: SOFT_GREEN,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: "#CFE7D8",
    width: "100%",
    maxWidth: 640,
  },
  optionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  optionIcon: {
    fontSize: 25,
    marginRight: 10,
  },
  optionTitle: {
    color: TEXT,
    fontSize: 22,
    fontWeight: "800",
  },
  optionSubtext: {
    color: MUTED,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 10,
  },
  roleText: {
    color: DEEP_GREEN,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: BRAND_GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: "100%",
    maxWidth: 260,
    alignSelf: "center",
  },
  primaryButtonPressed: {
    opacity: 0.93,
  },
  primaryButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    backgroundColor: DEEP_GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: "100%",
    maxWidth: 260,
    alignSelf: "center",
  },
  secondaryButtonPressed: {
    opacity: 0.94,
  },
  secondaryButtonText: {
    color: WHITE,
    fontSize: 15,
    fontWeight: "800",
  },
  ghostButton: {
    backgroundColor: WHITE,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LINE,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    width: "100%",
    maxWidth: 260,
    alignSelf: "center",
  },
  ghostButtonPressed: {
    opacity: 0.92,
  },
  ghostButtonText: {
    color: DEEP_GREEN,
    fontSize: 15,
    fontWeight: "800",
  },
});
