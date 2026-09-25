import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { API_BASE_URL } from '../config/api';

const PRODUCERS_API_URL = `${API_BASE_URL}/api/producers`;
const USER_API_URL = `${API_BASE_URL}/api/auth/me`;

export default function ProfileScreen({ navigation, setIsAuthenticated, currentUser, setCurrentUser }) {
  const [user, setUser] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [business, setBusiness] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [isBusinessModalVisible, setBusinessModalVisible] = useState(false);
  const [businessModalSection, setBusinessModalSection] = useState('details');
  const [form, setForm] = useState({ ...user });

  useEffect(() => {
    setUser({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
    });
    setForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
    });
  }, [currentUser]);

  useEffect(() => {
    const loadBusiness = async () => {
      let ownerUserId = currentUser?.id;

      if (!ownerUserId) {
        const storedUserData = await AsyncStorage.getItem('userData');
        const storedUser = storedUserData ? JSON.parse(storedUserData) : null;
        ownerUserId = storedUser?.id;
      }

      if (!ownerUserId) {
        setBusiness(null);
        setHasBusiness(false);
        setLoadingBusiness(false);
        return;
      }

      try {
        const query = new URLSearchParams({
          status: 'published',
          ownerUserId,
        }).toString();
        const response = await axios.get(`${PRODUCERS_API_URL}?${query}`);
        const published = Array.isArray(response.data) ? response.data : [];
        const firstPublished = published[0] || null;
        setBusiness(firstPublished);
        setHasBusiness(Boolean(firstPublished));
      } catch (error) {
        console.error('Error loading published business:', error);
        setBusiness(null);
        setHasBusiness(false);
      } finally {
        setLoadingBusiness(false);
      }
    };

    loadBusiness();

    const unsubscribe = navigation.addListener('focus', loadBusiness);
    return unsubscribe;
  }, [currentUser?.id, navigation]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(USER_API_URL, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
        }),
      });

      if (!response.ok) {
        throw new Error('User update failed.');
      }

      const data = await response.json();
      const updatedUser = {
        ...currentUser,
        ...data.user,
        role: data.user?.role === 'producer' ? 'productor' : data.user?.role || currentUser?.role,
      };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      setUser({ name: updatedUser.name || '', email: updatedUser.email || '' });
      setIsEditing(false);
      Alert.alert('Éxito', 'Tus datos han sido actualizados.');
    } catch (error) {
      console.error('Error updating user data:', error);
      Alert.alert('Error', 'Hubo un problema al actualizar la base de datos.');
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userRole');
      await AsyncStorage.removeItem('userHasBusiness');
      await AsyncStorage.removeItem('userData');
      setCurrentUser({ role: 'comprador', hasBusiness: false });
      setIsAuthenticated(false);
      navigation.getRoot()?.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profileHeaderContent}>
          <Pressable
            accessibilityLabel="Volver al inicio"
            accessibilityRole="button"
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </Pressable>
          <Text numberOfLines={1} style={styles.headerTitle}>Mi Perfil</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.innerContainer}>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Datos Personales</Text>

            {!isEditing ? (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>Nombre</Text>
                  <Text style={styles.value}>{user.name || 'Sin nombre disponible'}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{user.email || 'Sin email disponible'}</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    setForm({ ...user });
                    setIsEditing(true);
                  }}
                  style={({ pressed }) => [styles.outlineButton, pressed && styles.outlineButtonPressed]}
                >
                  <Text style={styles.outlineButtonText}>Editar Datos</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={styles.label}>Nombre</Text>
                <TextInput
                  value={form.name}
                  onChangeText={(value) => handleChange('name', value)}
                  placeholder="Nombre"
                  placeholderTextColor="#6C757D"
                  style={styles.input}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={form.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholder="Email"
                  placeholderTextColor="#6C757D"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />

                <Pressable
                  accessibilityRole="button"
                  onPress={handleSave}
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
                >
                  <Text style={styles.primaryButtonText}>Guardar</Text>
                </Pressable>
              </>
            )}
          </View>

          {currentUser?.role === 'productor' ? (
            <View style={styles.card}>
              <Text style={[styles.sectionTitle, styles.businessSectionTitle]}>Mi Negocio</Text>

              {loadingBusiness ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator color="#C89F7A" size="small" />
                  <Text style={styles.loadingText}>Cargando negocio...</Text>
                </View>
              ) : !hasBusiness ? (
                <>
                  <Text style={styles.emptyText}>Aún no tienes un negocio registrado.</Text>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => navigation.navigate('AIPanel')}
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
                  >
                    <Text style={styles.primaryButtonText}>Crear Negocio con IA</Text>
                  </Pressable>
                </>
              ) : (
                <View style={styles.businessInfo}>
                  <Pressable
                    accessibilityLabel={`Ver descripción completa de ${business?.name || 'tu negocio'}`}
                    accessibilityRole="button"
                    onPress={() => {
                      setBusinessModalSection('details');
                      setBusinessModalVisible(true);
                    }}
                    style={({ pressed }) => [styles.businessSummary, pressed && styles.businessSummaryPressed]}
                  >
                    <Text style={styles.businessName}>{business?.name || 'Negocio registrado'}</Text>
                    <Text style={styles.businessMeta}>{business?.category || 'Sin categoría'}</Text>
                    <Text numberOfLines={3} style={styles.businessDescription}>{business?.description || business?.profileText || 'Sin descripción disponible.'}</Text>
                    <Text style={styles.detailHint}>Ver descripción completa</Text>
                  </Pressable>

                  <View style={styles.modalActionRow}>
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setBusinessModalSection('plan');
                        setBusinessModalVisible(true);
                      }}
                      style={({ pressed }) => [styles.modalActionButton, pressed && styles.modalActionButtonPressed]}
                    >
                      <Text style={styles.modalActionText}>Plan de negocio</Text>
                    </Pressable>

                    <Pressable
                      accessibilityRole="button"
                      onPress={() => {
                        setBusinessModalSection('legal');
                        setBusinessModalVisible(true);
                      }}
                      style={({ pressed }) => [styles.modalActionButton, pressed && styles.modalActionButtonPressed]}
                    >
                      <Text style={styles.modalActionText}>Checklist legal</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => navigation.navigate('AIPanel', { existingBusiness: business })}
                    style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
                  >
                    <Text style={styles.secondaryButtonText}>Actualizar con IA</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : null}

          <View style={styles.logoutWrapper}>
            <Pressable
              accessibilityRole="button"
              onPress={handleLogout}
              style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutButtonPressed]}
            >
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setBusinessModalVisible(false)}
        transparent
        visible={isBusinessModalVisible}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.businessModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {businessModalSection === 'plan'
                  ? 'Plan de negocio'
                  : businessModalSection === 'legal'
                    ? 'Checklist legal orientativo'
                    : 'Descripción del emprendimiento'}
              </Text>
              <Pressable
                accessibilityLabel="Cerrar descripción"
                accessibilityRole="button"
                onPress={() => setBusinessModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>Cerrar</Text>
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {businessModalSection === 'details' ? (
                <>
                  <Text style={styles.modalBusinessName}>{business?.name || 'Negocio registrado'}</Text>
                  <Text style={styles.modalMeta}>{business?.category || 'Sin categoría'}</Text>

                  <Text style={styles.modalLabel}>Descripción</Text>
                  <Text style={styles.modalBody}>{business?.description || business?.profileText || 'Sin descripción disponible.'}</Text>

                  {business?.addressText ? (
                    <>
                      <Text style={styles.modalLabel}>Ubicación</Text>
                      <Text style={styles.modalBody}>{business.addressText}</Text>
                    </>
                  ) : null}

                  {business?.whatsappNumber || business?.instagram ? (
                    <>
                      <Text style={styles.modalLabel}>Canales de contacto</Text>
                      {business?.whatsappNumber ? <Text style={styles.modalBody}>WhatsApp: {business.whatsappNumber}</Text> : null}
                      {business?.instagram ? <Text style={styles.modalBody}>Instagram: {business.instagram}</Text> : null}
                    </>
                  ) : null}

                  {business?.aiGuide?.businessProfile ? (
                    <>
                      <Text style={styles.modalLabel}>Cliente objetivo</Text>
                      <Text style={styles.modalBody}>{business.aiGuide.businessProfile.customer || 'Sin información disponible.'}</Text>
                      <Text style={styles.modalLabel}>Oferta</Text>
                      <Text style={styles.modalBody}>{business.aiGuide.businessProfile.offer || 'Sin información disponible.'}</Text>
                    </>
                  ) : null}
                </>
              ) : businessModalSection === 'plan' ? (
                <>
                  {business?.aiGuide?.plan ? (
                    <>
                      <Text style={styles.modalLabel}>Propuesta de valor</Text>
                      <Text style={styles.modalBody}>{business.aiGuide.plan.valueProposition || 'Sin información disponible.'}</Text>
                      <Text style={styles.modalLabel}>Primera oferta</Text>
                      <Text style={styles.modalBody}>{business.aiGuide.plan.firstOffer || 'Sin información disponible.'}</Text>
                      <Text style={styles.modalLabel}>Estrategia de precio</Text>
                      <Text style={styles.modalBody}>{business.aiGuide.plan.pricingStrategy || 'Sin información disponible.'}</Text>
                      <Text style={styles.modalLabel}>Primeros 30 días</Text>
                      {business.aiGuide.plan.first30DaysPlan?.length ? business.aiGuide.plan.first30DaysPlan.map((item, index) => (
                        <Text key={`plan-item-${index}`} style={styles.modalListItem}>{`• ${item}`}</Text>
                      )) : <Text style={styles.modalBody}>Sin información disponible.</Text>}
                    </>
                  ) : <Text style={styles.modalBody}>Todavía no hay un plan de negocio generado.</Text>}
                </>
              ) : (
                <>
                  <Text style={styles.modalNotice}>Esta información es orientativa y no reemplaza asesoría profesional.</Text>
                  {business?.aiGuide?.legalChecklist?.length ? business.aiGuide.legalChecklist.map((item, index) => (
                    <Text key={`legal-item-${index}`} style={styles.modalListItem}>{`• ${item}`}</Text>
                  )) : <Text style={styles.modalBody}>Todavía no hay un checklist legal generado.</Text>}
                  {business?.aiGuide?.officialSources?.length ? (
                    <>
                      <Text style={styles.modalLabel}>Fuentes oficiales</Text>
                      {business.aiGuide.officialSources.map((item, index) => (
                        <Text key={`source-item-${index}`} style={styles.modalListItem}>{`• ${item}`}</Text>
                      ))}
                    </>
                  ) : null}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  profileHeader: {
    width: '100%',
    backgroundColor: '#74ACDF',
  },
  profileHeaderContent: {
    width: '100%',
    maxWidth: 1000,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
  },
  backButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  headerTitle: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  innerContainer: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 24,
    marginBottom: 18,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    color: '#2D2D2D',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  businessSectionTitle: {
    marginTop: 10,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    color: '#6C757D',
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
  },
  value: {
    color: '#2D2D2D',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#74ACDF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  outlineButtonPressed: {
    backgroundColor: '#E3F2FD',
  },
  outlineButtonText: {
    color: '#74ACDF',
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#2D2D2D',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#CED4DA',
  },
  primaryButton: {
    backgroundColor: '#74ACDF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonPressed: {
    backgroundColor: '#5E9DCE',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyText: {
    color: '#6C757D',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#6C757D',
    fontSize: 14,
  },
  businessInfo: {
    gap: 8,
  },
  businessSummary: {
    borderRadius: 8,
    padding: 10,
    margin: -10,
    marginBottom: 2,
  },
  businessSummaryPressed: {
    backgroundColor: '#F1F7FC',
  },
  businessName: {
    color: '#2D2D2D',
    fontSize: 20,
    fontWeight: '800',
  },
  businessMeta: {
    color: '#6C757D',
    fontSize: 14,
    lineHeight: 20,
  },
  businessDescription: {
    color: '#2D2D2D',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
  detailHint: {
    color: '#285C8D',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  modalActionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: '#EAF3FB',
  },
  modalActionButtonPressed: {
    backgroundColor: '#DCEAF9',
  },
  modalActionText: {
    color: '#285C8D',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  secondaryButton: {
    backgroundColor: '#EAF3FB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonPressed: {
    backgroundColor: '#DCEAF9',
  },
  secondaryButtonText: {
    color: '#285C8D',
    fontSize: 15,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(20, 35, 50, 0.45)',
  },
  businessModal: {
    width: '100%',
    maxHeight: '85%',
    padding: 24,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  modalTitle: {
    flex: 1,
    color: '#2D2D2D',
    fontSize: 20,
    fontWeight: '800',
  },
  modalCloseButton: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: '#EAF3FB',
  },
  modalCloseText: {
    color: '#285C8D',
    fontSize: 14,
    fontWeight: '700',
  },
  modalBusinessName: {
    color: '#2D2D2D',
    fontSize: 24,
    fontWeight: '900',
  },
  modalMeta: {
    color: '#6C757D',
    fontSize: 15,
    marginTop: 4,
    marginBottom: 18,
  },
  modalLabel: {
    color: '#285C8D',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  modalBody: {
    color: '#2D2D2D',
    fontSize: 15,
    lineHeight: 23,
  },
  modalListItem: {
    color: '#2D2D2D',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 7,
  },
  modalNotice: {
    color: '#6C757D',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
  },
  logoutWrapper: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    alignItems: 'center',
  },
  logoutButton: {
    width: '100%',
    maxWidth: 600,
    marginTop: 40,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    backgroundColor: 'transparent',
  },
  logoutButtonPressed: {
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
  },
  logoutText: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: '700',
  },
});
