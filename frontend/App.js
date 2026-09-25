import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';

const normalizeRole = (role) => (role === 'producer' ? 'productor' : 'comprador');

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
        setIsAuthenticated(Boolean(token));
        setCurrentUser({
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
