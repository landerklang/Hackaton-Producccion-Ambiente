import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Pressable,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ProfileScreen({ navigation, setIsAuthenticated, currentUser, setCurrentUser }) {
  const [user, setUser] = useState({
    name: 'María López',
    email: 'maria@ejemplo.com',
    phone: '+54 9 3704 123456',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ ...user });

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
                  <Text style={styles.value}>{user.name}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Email</Text>
                  <Text style={styles.value}>{user.email}</Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.label}>Teléfono</Text>
                  <Text style={styles.value}>{user.phone}</Text>
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

              {!currentUser.hasBusiness ? (
                <>
                  <Text style={styles.emptyText}>Aún no tienes un negocio registrado.</Text>

                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {}}
                    style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
                  >
                    <Text style={styles.primaryButtonText}>Crear Negocio con IA</Text>
                  </Pressable>
                </>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => navigation.navigate('AddProduct')}
                  style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
                >
                  <Text style={styles.secondaryButtonText}>Subir nuevo artículo</Text>
                </Pressable>
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
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#74ACDF',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: '#E3F2FD',
  },
  secondaryButtonText: {
    color: '#74ACDF',
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
    borderColor: '#74ACDF',
    backgroundColor: 'transparent',
  },
  logoutButtonPressed: {
    backgroundColor: '#E3F2FD',
  },
  logoutText: {
    color: '#74ACDF',
    fontSize: 15,
    fontWeight: '700',
  },
});
