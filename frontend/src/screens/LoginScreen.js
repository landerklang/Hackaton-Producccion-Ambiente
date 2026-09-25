import React, { useState } from 'react';
import axios from 'axios';
import { ActivityIndicator, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = `http://${API_HOST}:3000/api/auth/login`;

export default function LoginScreen({ navigation }) {
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
      navigation.navigate('Home');
      console.log('Login success:', response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>Ingresar</Text>
        <Text style={styles.title}>Accedé a tu cuenta</Text>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#718096"
          style={styles.input}
          value={email}
        />

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor="#718096"
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
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F6',
  },
  content: {
    padding: 20,
    paddingTop: 32,
  },
  eyebrow: {
    color: '#18864B',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: '#172033',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 18,
  },
  input: {
    height: 52,
    marginTop: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#D9E1DC',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    fontSize: 15,
    color: '#172033',
  },
  button: {
    marginTop: 18,
    backgroundColor: '#18864B',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: '#12683A',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  error: {
    marginTop: 14,
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
  },
  linkButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: '#18864B',
    fontSize: 14,
    fontWeight: '700',
  },
});
