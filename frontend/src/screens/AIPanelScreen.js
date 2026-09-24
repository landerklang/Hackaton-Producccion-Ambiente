import React, { useState } from 'react';
import axios from 'axios';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const API_URL = 'http://10.0.2.2:3000/api/products/ai-generate';

export default function AIPanelScreen() {
  const [description, setDescription] = useState('');
  const [generatedProduct, setGeneratedProduct] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      setErrorMessage('Escribí una descripción para generar el catálogo.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setGeneratedProduct(null);

    try {
      const response = await axios.post(API_URL, { text: description.trim() });
      setGeneratedProduct(response.data);
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || 'No pudimos generar el catálogo. Revisá la conexión e intentá nuevamente.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>Asistente de catálogo</Text>
      <Text style={styles.title}>Contale a la IA qué producís</Text>
      <Text style={styles.description}>
        La IA va a ordenar la información para publicarla en el mercado local.
      </Text>

      <TextInput
        accessibilityLabel="Descripción del producto"
        multiline
        numberOfLines={6}
        onChangeText={setDescription}
        placeholder="Describe lo que vendes (ej: 20 cajones de tomates a 15000 pesos)"
        placeholderTextColor="#718096"
        style={styles.input}
        textAlignVertical="top"
        value={description}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: isLoading }}
        disabled={isLoading}
        onPress={handleGenerate}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isLoading && styles.buttonDisabled]}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Generar Catálogo con IA</Text>
        )}
      </Pressable>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {generatedProduct ? (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Datos extraídos</Text>
          <Text selectable style={styles.jsonText}>
            {JSON.stringify(generatedProduct, null, 2)}
          </Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F5F7F6',
  },
  eyebrow: {
    color: '#18864B',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 7,
    color: '#172033',
    fontSize: 26,
    fontWeight: '800',
  },
  description: {
    marginTop: 9,
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
  },
  input: {
    minHeight: 150,
    marginTop: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D9E1DC',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    color: '#172033',
    fontSize: 16,
    lineHeight: 23,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#18864B',
  },
  buttonPressed: {
    backgroundColor: '#12683A',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  error: {
    marginTop: 14,
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
  },
  result: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#CBE7D6',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  resultTitle: {
    color: '#17633F',
    fontSize: 17,
    fontWeight: '800',
  },
  jsonText: {
    marginTop: 12,
    color: '#344054',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 19,
  },
});
