import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const PRODUCERS_API_URL = `http://${API_HOST}:3000/api/producers`;

export default function ProfileScreen({ navigation, setIsAuthenticated, currentUser, setCurrentUser }) {
  const [user, setUser] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [business, setBusiness] = useState(null);
  const [loadingBusiness, setLoadingBusiness] = useState(true);
  const [form, setForm] = useState({ ...user });

  useEffect(() => {
    setUser({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
    });
    setForm({
      name: currentUser?.name || '',
      email: currentUser?.email || '',
      phone: currentUser?.phone || '',
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
      const response = await fetch('http://localhost:5000/api/users/update', {
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

      await AsyncStorage.setItem('userData', JSON.stringify(form));
      setUser(form);
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

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Teléfono</Text>
                  <Text style={styles.value}>{user.phone || 'Sin teléfono disponible'}</Text>
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

                <Text style={styles.label}>Teléfono</Text>
                <TextInput
                  value={form.phone}
                  onChangeText={(value) => handleChange('phone', value)}
                  placeholder="Teléfono"
                  placeholderTextColor="#6C757D"
                  keyboardType="phone-pad"
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
                  <Text style={styles.businessName}>{business?.name || 'Negocio registrado'}</Text>
                  <Text style={styles.businessMeta}>{business?.category || 'Sin categoría'}</Text>
                  <Text style={styles.businessDescription}>{business?.description || business?.profileText || 'Sin descripción disponible.'}</Text>

                  {business?.whatsappNumber ? (
                    <Text style={styles.businessMeta}>WhatsApp: {business.whatsappNumber}</Text>
                  ) : null}

                  {business?.instagram ? (
                    <Text style={styles.businessMeta}>Instagram: {business.instagram}</Text>
                  ) : null}

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
