import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AppNavigator from "./src/navigation/AppNavigator";

const API_URL = "http://tu-api.com"; // desde .env

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        if (token) {
          const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const { user } = await res.json();
            setUser(user);
          } else {
            await AsyncStorage.removeItem("userToken");
          }
        }
      } catch (error) {
        console.warn("No se pudo validar la sesión:", error.message);
      } finally {
        setIsReady(true);
      }
    };

    bootstrap();
  }, []);

  const login = async (token, userData) => {
    await AsyncStorage.setItem("userToken", token);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    setUser(null);
  };

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2d7a4f" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <AppNavigator
        user={user}
        isAuthenticated={Boolean(user)}
        onLogin={login}
        onLogout={logout}
      />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f8f5",
  },
});
