import React, { useState } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const API_URL = `http://${API_HOST}:3000/api/ai/entrepreneur-guide`;
const PRODUCER_API_URL = `http://${API_HOST}:3000/api/producers`;

const INITIAL_FORM = {
  idea: '',
  category: '',
  location: 'Formosa',
  experience: '',
  availability: '',
  budget: '',
};

export default function AIPanelScreen({ route, currentUser }) {
  const initialBusiness = route?.params?.existingBusiness || null;

  const [form, setForm] = useState(() => ({
    ...INITIAL_FORM,
    idea: initialBusiness?.description || initialBusiness?.profileText || '',
    category: initialBusiness?.category || '',
    location: initialBusiness?.addressText || initialBusiness?.location || 'Formosa',
  }));
  const [guide, setGuide] = useState(initialBusiness?.aiGuide || null);
  const [draftBusiness, setDraftBusiness] = useState(() => (
    initialBusiness
      ? {
          _id: initialBusiness._id || null,
          name: initialBusiness.name || 'Negocio nuevo',
          category: initialBusiness.category || 'General',
          location: initialBusiness.addressText || 'Formosa',
          description: initialBusiness.description || initialBusiness.profileText || '',
          customer: initialBusiness.aiGuide?.businessProfile?.customer || '',
          offer: initialBusiness.aiGuide?.businessProfile?.offer || '',
          whatsappNumber: initialBusiness.whatsappNumber || '',
          instagram: initialBusiness.instagram || '',
        }
      : null
  ));
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const buildDraftFromGuide = (responseData, previousDraft = null) => ({
    ...(previousDraft || {}),
    name: responseData?.businessProfile?.name || previousDraft?.name || 'Negocio nuevo',
    category: responseData?.businessProfile?.category || previousDraft?.category || form.category || 'General',
    location: responseData?.businessProfile?.location || previousDraft?.location || form.location || 'Formosa',
    description: responseData?.businessProfile?.description || previousDraft?.description || form.idea || '',
    customer: responseData?.businessProfile?.customer || previousDraft?.customer || '',
    offer: responseData?.businessProfile?.offer || previousDraft?.offer || '',
    whatsappNumber: previousDraft?.whatsappNumber || '',
    instagram: previousDraft?.instagram || '',
  });

  const updateDraftField = (field, value) => {
    setDraftBusiness((current) => ({ ...current, [field]: value }));
  };

  const handleGenerateGuide = async () => {
    if (!form.idea.trim()) {
      setErrorMessage('Contanos qué querés vender o producir para poder ayudarte.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(API_URL, {
        idea: form.idea,
        category: form.category || 'General',
        location: form.location || 'Formosa',
        experience: form.experience,
        availability: form.availability,
        budget: form.budget,
      });

      setGuide(response.data);
      setDraftBusiness((current) => buildDraftFromGuide(response.data, current));
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'No pudimos generar la guía. Revisá la conexión e intentá nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBusiness = async () => {
    if (!draftBusiness?.name?.trim()) {
      setErrorMessage('Poné un nombre para el negocio antes de guardarlo.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const storedUserData = await AsyncStorage.getItem('userData');
      const storedUser = storedUserData ? JSON.parse(storedUserData) : null;
      const ownerUserId = currentUser?.id || storedUser?.id;

      if (!ownerUserId) {
        setErrorMessage('No pudimos identificar tu usuario. Cerrá sesión e ingresá nuevamente.');
        return;
      }

      const payload = {
        name: draftBusiness.name.trim(),
        category: draftBusiness.category.trim() || 'General',
        description: draftBusiness.description.trim() || 'Negocio generado con IA.',
        profileText: [draftBusiness.description, draftBusiness.offer, draftBusiness.customer].filter(Boolean).join(' · '),
        whatsappNumber: draftBusiness.whatsappNumber?.trim() || undefined,
        instagram: draftBusiness.instagram?.trim() || undefined,
        addressText: draftBusiness.location?.trim() || 'Formosa',
        status: 'published',
        aiGuide: guide,
        ownerUserId,
      };

      if (draftBusiness._id) {
        await axios.put(`${PRODUCER_API_URL}/${draftBusiness._id}`, payload);
        setSuccessMessage('Negocio actualizado con éxito. Volviendo al inicio...');
      } else {
        await axios.post(PRODUCER_API_URL, payload);
        setSuccessMessage('Negocio creado con éxito. Volviendo al inicio...');
      }

      navigation.navigate('Home');
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'No pudimos crear el negocio.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>Fase 2 · IA para emprendimiento</Text>
      <Text style={styles.title}>Armemos tu plan de inicio</Text>
      <Text style={styles.description}>
        Respondé estas preguntas y te ayudamos a pensar cómo empezar a vender localmente con una idea clara y útil.
      </Text>

      <View style={styles.formBlock}>
        <Text style={styles.label}>¿Qué querés vender o producir?</Text>
        <TextInput
          multiline
          onChangeText={(value) => updateField('idea', value)}
          placeholder="Ej: empanadas regionales, artesanías, servicio de impresión 3D..."
          placeholderTextColor="#718096"
          style={[styles.input, styles.textArea]}
          textAlignVertical="top"
          value={form.idea}
        />

        <Text style={styles.label}>Categoría</Text>
        <TextInput
          onChangeText={(value) => updateField('category', value)}
          placeholder="Ej: alimentos, artesanías, textil, agro..."
          placeholderTextColor="#718096"
          style={styles.input}
          value={form.category}
        />

        <Text style={styles.label}>Localidad</Text>
        <TextInput
          onChangeText={(value) => updateField('location', value)}
          placeholder="Ej: Formosa, Laguna Blanca, El Colorado..."
          placeholderTextColor="#718096"
          style={styles.input}
          value={form.location}
        />

        <Text style={styles.label}>¿Qué experiencia o conocimientos tenés?</Text>
        <TextInput
          onChangeText={(value) => updateField('experience', value)}
          placeholder="Ej: soy cocinero, trabajo con madera, tengo experiencia con textiles..."
          placeholderTextColor="#718096"
          style={styles.input}
          value={form.experience}
        />

        <Text style={styles.label}>¿Cuánto tiempo podés dedicarle?</Text>
        <TextInput
          onChangeText={(value) => updateField('availability', value)}
          placeholder="Ej: 4 horas por semana, todos los días por la tarde..."
          placeholderTextColor="#718096"
          style={styles.input}
          value={form.availability}
        />

        <Text style={styles.label}>¿Tienes un presupuesto inicial?</Text>
        <TextInput
          onChangeText={(value) => updateField('budget', value)}
          placeholder="Ej: 15.000, no tengo presupuesto, quiero empezar con lo que ya tengo..."
          placeholderTextColor="#718096"
          style={styles.input}
          value={form.budget}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={isLoading}
        onPress={handleGenerateGuide}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed, isLoading && styles.buttonDisabled]}
      >
        {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryButtonText}>Generar guía</Text>}
      </Pressable>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      {successMessage ? <Text style={styles.success}>{successMessage}</Text> : null}

      {guide ? (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Perfil del emprendimiento</Text>

          <Text style={styles.sectionLabel}>Nombre</Text>
          <Text style={styles.resultText}>{guide.businessProfile?.name || 'Sin nombre disponible.'}</Text>

          <Text style={styles.sectionLabel}>Categoría</Text>
          <Text style={styles.resultText}>{guide.businessProfile?.category || 'General'}</Text>

          <Text style={styles.sectionLabel}>Localidad</Text>
          <Text style={styles.resultText}>{guide.businessProfile?.location || form.location || 'Formosa'}</Text>

          <Text style={styles.sectionLabel}>Descripción</Text>
          <Text style={styles.resultText}>{guide.businessProfile?.description || 'Sin descripción disponible.'}</Text>

          <Text style={styles.sectionLabel}>Cliente objetivo</Text>
          <Text style={styles.resultText}>{guide.businessProfile?.customer || 'Sin cliente objetivo disponible.'}</Text>

          <Text style={styles.sectionLabel}>Oferta</Text>
          <Text style={styles.resultText}>{guide.businessProfile?.offer || 'Sin oferta disponible.'}</Text>

          <Text style={styles.sectionLabel}>Canales</Text>
          <View style={styles.listBlock}>
            {guide.businessProfile?.channels?.map((item, index) => (
              <Text key={`channel-${index}`} style={styles.listItem}>{'• ' + item}</Text>
            ))}
          </View>

          <Text style={styles.resultTitle}>Plan de negocio</Text>

          <Text style={styles.sectionLabel}>Propuesta de valor</Text>
          <Text style={styles.resultText}>{guide.plan?.valueProposition || 'Sin propuesta disponible.'}</Text>

          <Text style={styles.sectionLabel}>Primera oferta</Text>
          <Text style={styles.resultText}>{guide.plan?.firstOffer || 'Sin oferta disponible.'}</Text>

          <Text style={styles.sectionLabel}>Estrategia de precio</Text>
          <Text style={styles.resultText}>{guide.plan?.pricingStrategy || 'Sin estrategia disponible.'}</Text>

          <Text style={styles.sectionLabel}>Primeros 30 días</Text>
          <View style={styles.listBlock}>
            {guide.plan?.first30DaysPlan?.map((item, index) => (
              <Text key={`plan-${index}`} style={styles.listItem}>{'• ' + item}</Text>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Riesgos</Text>
          <View style={styles.listBlock}>
            {guide.plan?.risks?.map((item, index) => (
              <Text key={`risk-${index}`} style={styles.listItem}>{'• ' + item}</Text>
            ))}
          </View>

          <Text style={styles.resultTitle}>Checklist legal orientativo</Text>
          <Text style={styles.noticeText}>Esto es una guía general para saber qué revisar antes de iniciar, no reemplaza asesoría profesional.</Text>
          <View style={styles.listBlock}>
            {guide.legalChecklist?.map((item, index) => (
              <Text key={`legal-${index}`} style={styles.listItem}>{'• ' + item}</Text>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Fuentes oficiales</Text>
          <View style={styles.listBlock}>
            {guide.officialSources?.map((item, index) => (
              <Text key={`source-${index}`} style={styles.listItem}>{'• ' + item}</Text>
            ))}
          </View>

          <Text style={styles.sectionLabel}>Advertencia</Text>
          <Text style={styles.resultText}>{guide.warning || 'Esto es orientación general.'}</Text>
        </View>
      ) : null}

      {draftBusiness ? (
        <View style={styles.editCard}>
          <Text style={styles.resultTitle}>Editar antes de crear</Text>

          <Text style={styles.label}>Nombre del negocio</Text>
          <TextInput
            onChangeText={(value) => updateDraftField('name', value)}
            style={styles.input}
            value={draftBusiness.name}
          />

          <Text style={styles.label}>Categoría</Text>
          <TextInput
            onChangeText={(value) => updateDraftField('category', value)}
            style={styles.input}
            value={draftBusiness.category}
          />

          <Text style={styles.label}>Localidad</Text>
          <TextInput
            onChangeText={(value) => updateDraftField('location', value)}
            style={styles.input}
            value={draftBusiness.location}
          />

          <Text style={styles.label}>Descripción</Text>
          <TextInput
            multiline
            onChangeText={(value) => updateDraftField('description', value)}
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
            value={draftBusiness.description}
          />

          <Text style={styles.label}>Cliente objetivo</Text>
          <TextInput
            onChangeText={(value) => updateDraftField('customer', value)}
            style={styles.input}
            value={draftBusiness.customer}
          />

          <Text style={styles.label}>Oferta principal</Text>
          <TextInput
            multiline
            onChangeText={(value) => updateDraftField('offer', value)}
            style={[styles.input, styles.textArea]}
            textAlignVertical="top"
            value={draftBusiness.offer}
          />

          <Text style={styles.label}>WhatsApp</Text>
          <TextInput
            keyboardType="phone-pad"
            onChangeText={(value) => updateDraftField('whatsappNumber', value)}
            placeholder="54937..."
            placeholderTextColor="#718096"
            style={styles.input}
            value={draftBusiness.whatsappNumber}
          />

          <Text style={styles.label}>Instagram</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={(value) => updateDraftField('instagram', value)}
            placeholder="@tu_negocio"
            placeholderTextColor="#718096"
            style={styles.input}
            value={draftBusiness.instagram}
          />

          <Pressable
            accessibilityRole="button"
            disabled={isLoading}
            onPress={handleCreateBusiness}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed, isLoading && styles.buttonDisabled]}
          >
            <Text style={styles.primaryButtonText}>Crear negocio</Text>
          </Pressable>
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
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: '#172033',
    fontSize: 28,
    fontWeight: '800',
  },
  description: {
    marginTop: 10,
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
  },
  formBlock: {
    marginTop: 22,
  },
  label: {
    marginTop: 16,
    color: '#172033',
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    minHeight: 52,
    marginTop: 8,
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
  primaryButton: {
    marginTop: 22,
    backgroundColor: '#18864B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    backgroundColor: '#12683A',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
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
  success: {
    marginTop: 14,
    color: '#18864B',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  resultCard: {
    marginTop: 24,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CDE8D9',
  },
  editCard: {
    marginTop: 24,
    padding: 18,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D9E1DC',
  },
  resultTitle: {
    color: '#17633F',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 12,
  },
  noticeText: {
    marginTop: 8,
    color: '#667085',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionLabel: {
    marginTop: 16,
    color: '#172033',
    fontSize: 13,
    fontWeight: '800',
  },
  resultText: {
    marginTop: 6,
    color: '#344054',
    fontSize: 15,
    lineHeight: 22,
  },
  listBlock: {
    marginTop: 6,
    gap: 6,
  },
  listItem: {
    color: '#344054',
    fontSize: 14,
    lineHeight: 20,
  },
});
