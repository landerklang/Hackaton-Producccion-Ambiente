import React, { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = `http://${API_HOST}:3000/api/auth/register`;

export default function RegisterScreen({ navigation, setIsAuthenticated, setCurrentUser }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Completá todos los campos.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(API_URL, { name, email, password, role });
      const normalizedRole = response.data.user?.role === 'producer' || role === 'producer'
        ? 'productor'
        : 'comprador';
      await AsyncStorage.setItem('userToken', response.data.token || 'dummy-token');
      await AsyncStorage.setItem('userRole', normalizedRole);
      await AsyncStorage.setItem('userHasBusiness', 'false');
      setCurrentUser({ role: normalizedRole, hasBusiness: false });
      setIsAuthenticated(true);

      navigation.getRoot()?.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

      console.log('Register success:', response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formWrapper}>
          <Pressable
            accessibilityLabel="Volver a la portada"
            accessibilityRole="button"
            onPress={() => navigation.navigate('AuthEntry')}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <Text style={styles.backButtonText}>← Volver a la portada</Text>
          </Pressable>
          <Text style={styles.eyebrow}>Crear cuenta</Text>
          <Text style={styles.title}>Armemos tu perfil</Text>
          <Text style={styles.subtitle}>Sumate a la comunidad de Tierra y Artesanía.</Text>

          <TextInput
            onChangeText={setName}
            placeholder="Nombre completo"
            placeholderTextColor="#D0D0D0"
            style={styles.input}
            value={name}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor="#D0D0D0"
            style={styles.input}
            value={email}
          />

          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor="#D0D0D0"
            secureTextEntry
            style={styles.input}
            value={password}
          />

          <Text style={styles.sectionTitle}>Tipo de usuario</Text>
          <View style={styles.roleRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setRole('buyer')}
              style={({ pressed }) => [styles.roleButton, role === 'buyer' && styles.roleButtonActive, pressed && styles.rolePressed]}
            >
              <Text style={[styles.roleText, role === 'buyer' && styles.roleTextActive]}>Comprador</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setRole('producer')}
              style={({ pressed }) => [styles.roleButton, role === 'producer' && styles.roleButtonActive, pressed && styles.rolePressed]}
            >
              <Text style={[styles.roleText, role === 'producer' && styles.roleTextActive]}>Productor</Text>
            </Pressable>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={handleRegister}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Registrarse</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#242424',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  formWrapper: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    backgroundColor: '#2E2E2E',
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 20,
    padding: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 8,
    marginBottom: 18,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButtonText: {
    color: '#C89F7A',
    fontSize: 14,
    fontWeight: '800',
  },
  eyebrow: {
    color: '#C89F7A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    color: '#C89F7A',
    fontSize: 14,
    marginBottom: 18,
  },
  input: {
    height: 52,
    marginTop: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#555555',
    borderRadius: 8,
    backgroundColor: '#3A3A3A',
    fontSize: 15,
    color: '#FFFFFF',
  },
  sectionTitle: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555555',
    backgroundColor: '#3A3A3A',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#C89F7A',
    borderColor: '#C89F7A',
  },
  rolePressed: {
    opacity: 0.9,
  },
  roleText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  button: {
    marginTop: 22,
    backgroundColor: '#C89F7A',
    borderRadius: 8,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#B8885C',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  error: {
    marginTop: 14,
    color: '#F4B4B4',
    fontSize: 14,
    lineHeight: 20,
  },
});
