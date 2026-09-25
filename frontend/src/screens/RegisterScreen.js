import React, { useState } from 'react';
import axios from 'axios';
import { ActivityIndicator, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = `http://${API_HOST}:3000/api/auth/register`;

export default function RegisterScreen({ navigation }) {
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
      console.log('Register success:', response.data);
      navigation.navigate(role === 'producer' ? 'ProducerForm' : 'BuyerForm');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>Crear cuenta</Text>
        <Text style={styles.title}>Armemos tu perfil</Text>

        <TextInput
          onChangeText={setName}
          placeholder="Nombre completo"
          placeholderTextColor="#718096"
          style={styles.input}
          value={name}
        />

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
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Crear cuenta</Text>}
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
  sectionTitle: {
    marginTop: 18,
    color: '#172033',
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9E1DC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  roleButtonActive: {
    backgroundColor: '#18864B',
    borderColor: '#18864B',
  },
  rolePressed: {
    opacity: 0.9,
  },
  roleText: {
    color: '#172033',
    fontWeight: '700',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },
  button: {
    marginTop: 22,
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
});
