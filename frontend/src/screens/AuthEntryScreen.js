import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

export default function AuthEntryScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.eyebrow}>Hub Productivo</Text>
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
    justifyContent: 'center',
    backgroundColor: '#F5F7F6',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  eyebrow: {
    color: '#18864B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 12,
    color: '#172033',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 12,
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
  },
  primaryButton: {
    marginTop: 22,
    backgroundColor: '#18864B',
    borderRadius: 12,
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
    backgroundColor: '#E7F3EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: '#D7EEDD',
  },
  secondaryButtonText: {
    color: '#0F5F38',
    fontSize: 16,
    fontWeight: '800',
  },
  buttonPressed: {
    backgroundColor: '#12683A',
  },
});
