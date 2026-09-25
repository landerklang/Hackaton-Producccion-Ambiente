import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function AuthEntryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>HUB PRODUCTIVO</Text>
        <Text style={styles.title}>Conectá producción local con clientes cerca tuyo</Text>
        <Text style={styles.subtitle}>
          Viví la experiencia de vender, descubrir y empezar con ayuda de IA.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Login')}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.primaryButtonText}>Entrar</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Register')}
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
        >
          <Text style={styles.secondaryButtonText}>Crear cuenta</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#2E2E2E',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#555555',
  },
  eyebrow: {
    color: '#C89F7A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 12,
    color: '#D0D0D0',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 22,
    backgroundColor: '#C89F7A',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    marginTop: 12,
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: '#4B4B4B',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonPressed: {
    backgroundColor: '#B8885C',
  },
});
