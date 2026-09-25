import React, { useState } from 'react';
import axios from 'axios';
import { ActivityIndicator, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const PROFILE_API_URL = `http://${API_HOST}:3000/api/producers/ai-profile`;
const GUIDE_API_URL = `http://${API_HOST}:3000/api/ai/entrepreneur-guide`;
const PRODUCT_API_URL = `http://${API_HOST}:3000/api/products/ai-generate`;
const PUBLISH_API_URL = `http://${API_HOST}:3000/api/producers`;

export default function ProducerFormScreen({ navigation }) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('Formosa');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [instagram, setInstagram] = useState('');
  const [profileText, setProfileText] = useState('');
  const [guide, setGuide] = useState(null);
  const [result, setResult] = useState(null);
  const [mode, setMode] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const buildMessages = () => {
    return [
      { role: 'user', content: `Nombre: ${name || 'no indicado'}` },
      { role: 'user', content: `Categoría: ${category || 'no indicada'}` },
      { role: 'user', content: `Descripción: ${description || 'no indicada'}` },
      { role: 'user', content: `Localidad: ${locationText || 'Formosa'}` },
      { role: 'user', content: `WhatsApp: ${whatsappNumber || 'no indicado'}` },
      { role: 'user', content: `Instagram: ${instagram || 'no indicado'}` },
    ];
  };

  const handleGenerateProfile = async () => {
    if (!name.trim() && !category.trim() && !description.trim()) {
      setError('Completa al menos nombre, categoría o descripción para generar un perfil.');
      return;
    }

    setMode('profile');
    setLoading(true);
    setError('');
    setGuide(null);

    try {
      const profileResponse = await axios.post(PROFILE_API_URL, { messages: buildMessages() });
      setResult(profileResponse.data);
      setProfileText(profileResponse.data.profileText || '');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos generar el perfil con IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGuide = async () => {
    if (!description.trim() && !category.trim()) {
      setError('Escribí la idea o producción para pedir guía de emprendimiento.');
      return;
    }

    setMode('guide');
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(GUIDE_API_URL, {
        idea: description || category,
        category: category || 'General',
        location: locationText || 'Formosa',
      });

      setGuide(response.data);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos generar la guía de emprendimiento.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateProduct = async () => {
    if (!description.trim()) {
      setError('Escribí la idea del producto para generarlo con IA.');
      return;
    }

    setMode('product');
    setLoading(true);
    setError('');
    setGuide(null);

    try {
      const response = await axios.post(PRODUCT_API_URL, {
        text: description,
      });

      setResult({
        title: response.data.title || name || 'Producto',
        description: response.data.description || description,
        tags: response.data.tags || [],
        price: response.data.price || 'Consultar',
      });
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos generar el producto con IA.');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!name.trim() || !category.trim()) {
      setError('Nombre y categoría son obligatorios para publicar.');
      return;
    }

    const payload = {
      name,
      category,
      description,
      profileText,
      whatsappNumber,
      instagram,
      addressText: locationText,
      status: 'published',
    };

    setLoading(true);
    setError('');

    try {
      await axios.post(PUBLISH_API_URL, payload);
      navigation.navigate('Home');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No pudimos publicar tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>Perfil de productor</Text>
        <Text style={styles.title}>Prepará tu presencia local</Text>

        <View style={styles.modeRow}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMode('profile')}
            style={({ pressed }) => [styles.modeButton, mode === 'profile' && styles.modeButtonActive, pressed && styles.modePressed]}
          >
            <Text style={[styles.modeText, mode === 'profile' && styles.modeTextActive]}>Perfil</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMode('product')}
            style={({ pressed }) => [styles.modeButton, mode === 'product' && styles.modeButtonActive, pressed && styles.modePressed]}
          >
            <Text style={[styles.modeText, mode === 'product' && styles.modeTextActive]}>Producto</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setMode('guide')}
            style={({ pressed }) => [styles.modeButton, mode === 'guide' && styles.modeButtonActive, pressed && styles.modePressed]}
          >
            <Text style={[styles.modeText, mode === 'guide' && styles.modeTextActive]}>Guía</Text>
          </Pressable>
        </View>

        <TextInput
          onChangeText={setName}
          placeholder="Nombre del emprendimiento"
          placeholderTextColor="#718096"
          style={styles.input}
          value={name}
        />

        <TextInput
          onChangeText={setCategory}
          placeholder="Categoría"
          placeholderTextColor="#718096"
          style={styles.input}
          value={category}
        />

        <TextInput
          multiline
          onChangeText={setDescription}
          placeholder="¿Qué producis o qué servicio ofrecés?"
          placeholderTextColor="#718096"
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
          value={description}
        />

        <TextInput
          onChangeText={setLocationText}
          placeholder="Localidad o barrio"
          placeholderTextColor="#718096"
          style={styles.input}
          value={locationText}
        />

        <TextInput
          keyboardType="phone-pad"
          onChangeText={setWhatsappNumber}
          placeholder="WhatsApp"
          placeholderTextColor="#718096"
          style={styles.input}
          value={whatsappNumber}
        />

        <TextInput
          autoCapitalize="none"
          onChangeText={setInstagram}
          placeholder="Instagram"
          placeholderTextColor="#718096"
          style={styles.input}
          value={instagram}
        />

        <View style={styles.actionRow}>
          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={handleGenerateProfile}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed, loading && styles.buttonDisabled]}
          >
            <Text style={styles.secondaryButtonText}>Generar perfil</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={handleGenerateProduct}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed, loading && styles.buttonDisabled]}
          >
            <Text style={styles.secondaryButtonText}>Generar producto</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            disabled={loading}
            onPress={handleGenerateGuide}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed, loading && styles.buttonDisabled]}
          >
            <Text style={styles.secondaryButtonText}>Guía general</Text>
          </Pressable>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {result ? (
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>{mode === 'product' ? 'Producto sugerido' : mode === 'guide' ? 'Orientación' : 'Perfil sugerido'}</Text>
            {mode === 'product' ? (
              <>
                <Text style={styles.previewLabel}>Título</Text>
                <Text style={styles.previewText}>{result.title || 'Sin título'}</Text>
                <Text style={styles.previewLabel}>Descripción</Text>
                <Text style={styles.previewText}>{result.description || 'Sin descripción'}</Text>
                <Text style={styles.previewLabel}>Tags</Text>
                <Text style={styles.previewText}>{Array.isArray(result.tags) ? result.tags.join(', ') : 'Sin tags'}</Text>
                <Text style={styles.previewLabel}>Precio</Text>
                <Text style={styles.previewText}>{result.price || 'Consultar'}</Text>
              </>
            ) : (
              <>
                <Text style={styles.previewLabel}>Nombre</Text>
                <Text style={styles.previewText}>{result.name || name}</Text>
                <Text style={styles.previewLabel}>Categoría</Text>
                <Text style={styles.previewText}>{result.category || category}</Text>
                <Text style={styles.previewLabel}>Descripción</Text>
                <Text style={styles.previewText}>{result.profileText || result.description || description}</Text>
                <Text style={styles.previewLabel}>Contacto</Text>
                <Text style={styles.previewText}>{[whatsappNumber, instagram].filter(Boolean).join(' · ') || 'Sin contacto cargado'}</Text>
              </>
            )}
          </View>
        ) : null}

        {guide ? (
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>Guía de emprendimiento</Text>
            <Text style={styles.previewText}>{guide.positioning || 'Sin orientación disponible.'}</Text>
            <View style={{ marginTop: 10 }}>
              {guide.quickChecklist?.map((item, index) => (
                <Text key={`check-${index}`} style={styles.bullet}>{'• ' + item}</Text>
              ))}
            </View>
          </View>
        ) : null}

        <TextInput
          multiline
          onChangeText={setProfileText}
          placeholder="Revisá y editá el perfil final antes de publicar"
          placeholderTextColor="#718096"
          style={[styles.input, styles.textArea, styles.profileTextArea]}
          textAlignVertical="top"
          value={profileText}
        />

        <Pressable
          accessibilityRole="button"
          disabled={loading}
          onPress={handlePublish}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed, loading && styles.buttonDisabled]}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Publicar perfil</Text>}
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
    paddingTop: 24,
    paddingBottom: 40,
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
    marginBottom: 16,
  },
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    marginBottom: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#E7F3EB',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#18864B',
  },
  modeText: {
    color: '#0F5F38',
    fontWeight: '800',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  modePressed: {
    opacity: 0.9,
  },
  input: {
    minHeight: 52,
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
  profileTextArea: {
    marginTop: 18,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 18,
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: '#18864B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: '#12683A',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#E7F3EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    minWidth: 140,
  },
  secondaryButtonPressed: {
    backgroundColor: '#D7EEDD',
  },
  secondaryButtonText: {
    color: '#0F5F38',
    fontWeight: '800',
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  error: {
    marginTop: 14,
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
  },
  previewBox: {
    marginTop: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9E1DC',
    padding: 16,
  },
  previewTitle: {
    color: '#172033',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 10,
  },
  previewLabel: {
    marginTop: 8,
    color: '#18864B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  previewText: {
    marginTop: 4,
    color: '#344054',
    fontSize: 15,
    lineHeight: 22,
  },
  bullet: {
    color: '#344054',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
});
