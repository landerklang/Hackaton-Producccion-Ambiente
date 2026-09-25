import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';

const normalizeRole = (role) => (role === 'producer' ? 'productor' : 'comprador');
const API_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const ME_API_URL = `http://${API_HOST}:3000/api/auth/me`;

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState({ role: 'comprador', hasBusiness: false });

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const role = await AsyncStorage.getItem('userRole');
        const hasBusiness = await AsyncStorage.getItem('userHasBusiness');
        const storedUserData = await AsyncStorage.getItem('userData');
        const storedUser = storedUserData ? JSON.parse(storedUserData) : {};
        let authenticatedUser = storedUser;

        if (token && token !== 'dummy-token') {
          try {
            const response = await fetch(ME_API_URL, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
              const data = await response.json();
              authenticatedUser = data.user || storedUser;
              await AsyncStorage.setItem('userData', JSON.stringify(authenticatedUser));
            }
          } catch (error) {
            console.error('Error loading authenticated user:', error);
          }
        }

        setIsAuthenticated(Boolean(token));
        setCurrentUser({
          id: authenticatedUser.id,
          name: authenticatedUser.name,
          email: authenticatedUser.email,
          role: normalizeRole(role),
          hasBusiness: hasBusiness === 'true',
        });
      } catch (error) {
        console.error('Error reading auth state:', error);
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C89F7A" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator
        isAuthenticated={isAuthenticated}
        setIsAuthenticated={setIsAuthenticated}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#242424',
  },
});
