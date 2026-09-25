import React, { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function BuyerFormScreen({ navigation }) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('Formosa');
  const [interests, setInterests] = useState('');
  const [favoriteCategories, setFavoriteCategories] = useState('');

  const handleSubmit = () => {
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>Perfil de comprador</Text>
        <Text style={styles.title}>Qué te interesa comprar</Text>

        <TextInput
          onChangeText={setName}
          placeholder="Nombre completo"
          placeholderTextColor="#718096"
          style={styles.input}
          value={name}
        />

        <TextInput
          onChangeText={setCity}
          placeholder="Ciudad o barrio"
          placeholderTextColor="#718096"
          style={styles.input}
          value={city}
        />

        <TextInput
          multiline
          onChangeText={setInterests}
          placeholder="Intereses de compra (ej: alimentos, cerámica, diseño, textiles)"
          placeholderTextColor="#718096"
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
          value={interests}
        />

        <TextInput
          onChangeText={setFavoriteCategories}
          placeholder="Categorías favoritas"
          placeholderTextColor="#718096"
          style={styles.input}
          value={favoriteCategories}
        />

        <Pressable
          accessibilityRole="button"
          onPress={handleSubmit}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonText}>Guardar perfil</Text>
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
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  button: {
    marginTop: 22,
    backgroundColor: '#18864B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#12683A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
