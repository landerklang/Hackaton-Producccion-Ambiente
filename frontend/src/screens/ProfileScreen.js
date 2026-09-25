import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function ProfileScreen({ navigation, setIsAuthenticated }) {
  const [user, setUser] = useState({
    name: 'María López',
    email: 'maria@ejemplo.com',
    phone: '+54 9 3704 123456',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [form, setForm] = useState({ ...user });

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    setUser(form);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
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
                  placeholderTextColor="#B7B7B7"
                  style={styles.input}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={form.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholder="Email"
                  placeholderTextColor="#B7B7B7"
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
                  placeholderTextColor="#B7B7B7"
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

          <View style={styles.card}>
            <Text style={[styles.sectionTitle, styles.businessSectionTitle]}>Mi Negocio</Text>

            {!hasBusiness ? (
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
                onPress={() => {}}
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryButtonPressed]}
              >
                <Text style={styles.secondaryButtonText}>Subir nuevo artículo</Text>
              </Pressable>
            )}
          </View>

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
    backgroundColor: '#242424',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  profileHeader: {
    width: '100%',
    backgroundColor: '#C89F7A',
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
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 24,
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#FFFFFF',
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
    color: '#D0D0D0',
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '600',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineButton: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#C89F7A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  outlineButtonPressed: {
    backgroundColor: 'rgba(200, 159, 122, 0.1)',
  },
  outlineButtonText: {
    color: '#C89F7A',
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#3A3A3A',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#555555',
  },
  primaryButton: {
    backgroundColor: '#C89F7A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  primaryButtonPressed: {
    backgroundColor: '#B8885C',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyText: {
    color: '#D0D0D0',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: '#3A3A3A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonPressed: {
    backgroundColor: '#4A4A4A',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
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
