import React, { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = `http://${API_HOST}:3000/api/auth/login`;

export default function LoginScreen({ navigation, setIsAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Completá email y contraseña.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(API_URL, { email, password });
      await AsyncStorage.setItem('userToken', response.data.token || 'dummy-token');
      setIsAuthenticated(true);
      navigation.getRoot()?.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });

      console.log('Login success:', response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos iniciar sesión.');
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
          <Text style={styles.eyebrow}>Ingresar</Text>
          <Text style={styles.title}>Accedé a tu cuenta</Text>
          <Text style={styles.subtitle}>Descubrí productos locales y productores de Formosa.</Text>

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

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={handleLogin}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
          >
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Ingresar</Text>}
          </Pressable>

          <Pressable onPress={() => navigation.navigate('Register')} style={styles.linkButton}>
            <Text style={styles.linkText}>No tengo cuenta. Crear una.</Text>
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
  button: {
    marginTop: 18,
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
  linkButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: '#C89F7A',
    fontSize: 14,
    fontWeight: '700',
  },
});
