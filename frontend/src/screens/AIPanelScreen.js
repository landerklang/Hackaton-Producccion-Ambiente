import React, { useState } from 'react';
import axios from 'axios';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = `http://${API_HOST}:3000/api/producers/ai-profile`;

const QUESTIONS = [
  '¿Cómo se llama tu emprendimiento o cómo querés que aparezca tu nombre?',
  '¿Qué producís o qué servicio ofrecés?',
  '¿En qué localidad trabajás?',
  '¿Cómo pueden contactarte? Podés pasar WhatsApp e Instagram.',
  '¿Qué te gustaría destacar de tu propuesta?',
];

export default function AIPanelScreen() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: '¡Hola! Te voy a ayudar a crear tu perfil productivo. Empecemos: ' + QUESTIONS[0] },
  ]);
  const [answer, setAnswer] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [profile, setProfile] = useState(null);
  const [editRequest, setEditRequest] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAnswer = async () => {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer) {
      setErrorMessage('Escribí una respuesta para continuar.');
      return;
    }

    setErrorMessage('');
    const nextMessages = [...messages, { role: 'user', content: trimmedAnswer }];
    setMessages(nextMessages);
    setAnswer('');

    if (questionIndex < QUESTIONS.length - 1) {
      const nextQuestionIndex = questionIndex + 1;
      setQuestionIndex(nextQuestionIndex);
      setMessages([...nextMessages, { role: 'assistant', content: QUESTIONS[nextQuestionIndex] }]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(API_URL, { messages: nextMessages });
      setProfile(response.data);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'No pudimos crear tu perfil. Revisá la conexión e intentá nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    const trimmedRequest = editRequest.trim();

    if (!trimmedRequest) {
      setErrorMessage('Escribí qué querés cambiar en tu perfil.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    const editMessages = [...messages, { role: 'user', content: trimmedRequest }];
    setMessages(editMessages);
    setEditRequest('');

    try {
      const response = await axios.post(API_URL, { messages: editMessages, profile });
      setProfile(response.data);
      setMessages([...editMessages, { role: 'assistant', content: 'Listo, actualicé tu perfil.' }]);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'No pudimos actualizar el perfil. Intentá nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>Asistente de perfil</Text>
      <Text style={styles.title}>Hacé visible tu producción</Text>
      <Text style={styles.description}>
        Respondé unas preguntas y te ayudamos a preparar una presentación para el mercado local.
      </Text>

      <View style={styles.chat}>
        {messages.map((message, index) => (
          <View key={`${message.role}-${index}`} style={[styles.message, message.role === 'user' && styles.userMessage]}>
            <Text style={styles.messageLabel}>{message.role === 'user' ? 'Vos' : 'Asistente'}</Text>
            <Text style={styles.messageText}>{message.content}</Text>
          </View>
        ))}
      </View>

      {!profile ? (
        <TextInput
          accessibilityLabel="Respuesta del productor"
          multiline
          onChangeText={setAnswer}
          placeholder="Escribí tu respuesta..."
          placeholderTextColor="#718096"
          style={styles.input}
          textAlignVertical="top"
          value={answer}
        />
      ) : null}

      {profile ? (
        <>
          <TextInput
            accessibilityLabel="Edición del perfil"
            multiline
            onChangeText={setEditRequest}
            placeholder="Ej: Cambiá la descripción y agregá souvenirs personalizados"
            placeholderTextColor="#718096"
            style={styles.input}
            textAlignVertical="top"
            value={editRequest}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: isLoading }}
            disabled={isLoading}
            onPress={handleEdit}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isLoading && styles.buttonDisabled]}
          >
            {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Actualizar perfil</Text>}
          </Pressable>
        </>
      ) : (
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: isLoading }}
          disabled={isLoading}
          onPress={handleAnswer}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, isLoading && styles.buttonDisabled]}
        >
          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.buttonText}>Continuar</Text>}
        </Pressable>
      )}

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {profile ? (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Borrador de tu perfil</Text>
          <Text style={styles.profileTitle}>{profile.name || 'Tu emprendimiento'}</Text>
          {profile.category ? <Text style={styles.profileMeta}>{profile.category}</Text> : null}
          <Text style={styles.profileText}>{profile.profileText}</Text>
          {profile.products?.length ? (
            <Text style={styles.profileMeta}>Productos: {profile.products.join(', ')}</Text>
          ) : null}
          {profile.locationText ? <Text style={styles.profileMeta}>Ubicación: {profile.locationText}</Text> : null}
          {profile.instagram || profile.whatsappNumber ? (
            <Text style={styles.profileMeta}>
              Contacto: {[profile.whatsappNumber, profile.instagram].filter(Boolean).join(' · ')}
            </Text>
          ) : null}
          {profile.missingFields?.length ? (
            <Text style={styles.missing}>Para completar: {profile.missingFields.join(', ')}</Text>
          ) : null}
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
    minHeight: 82,
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
  chat: {
    marginTop: 22,
    gap: 10,
  },
  message: {
    alignSelf: 'flex-start',
    maxWidth: '90%',
    padding: 13,
    borderRadius: 12,
    backgroundColor: '#E7F3EB',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCE8F7',
  },
  messageLabel: {
    marginBottom: 4,
    color: '#17633F',
    fontSize: 12,
    fontWeight: '800',
  },
  messageText: {
    color: '#344054',
    fontSize: 15,
    lineHeight: 21,
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
  profileTitle: {
    marginTop: 12,
    color: '#172033',
    fontSize: 18,
    fontWeight: '800',
  },
  profileText: {
    marginTop: 12,
    color: '#344054',
    fontSize: 15,
    lineHeight: 22,
  },
  profileMeta: {
    marginTop: 10,
    color: '#667085',
    fontSize: 13,
    lineHeight: 19,
  },
  missing: {
    marginTop: 14,
    color: '#8A5A00',
    fontSize: 13,
    lineHeight: 19,
  },
});
