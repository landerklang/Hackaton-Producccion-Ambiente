<<<<<<< HEAD
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LandingScreen from "../screens/LandingScreen";
import AuthScreen from "../screens/AuthScreen";
import HomeScreen from "../screens/HomeScreen";
import AIPanelScreen from "../screens/AIPanelScreen";
=======
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AIPanelScreen from '../screens/AIPanelScreen';
import AuthEntryScreen from '../screens/AuthEntryScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BuyerFormScreen from '../screens/BuyerFormScreen';
import ProducerFormScreen from '../screens/ProducerFormScreen';
>>>>>>> 34173459a97936f879a1eee1186e18f6e68f14c6

const Stack = createNativeStackNavigator();

function Navigator() {
  return (
    <Stack.Navigator
      initialRouteName="Landing"
      screenOptions={{
        headerStyle: { backgroundColor: "#F5F7F6" },
        headerTintColor: "#172033",
        headerTitleStyle: { fontWeight: "800" },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: "#F5F7F6" },
      }}
    >
      <Stack.Screen name="Landing" options={{ headerShown: false }}>
        {({ navigation }) => (
          <LandingScreen
            onBuyPress={() =>
              navigation.navigate("Auth", { mode: "register", role: "client" })
            }
            onSellPress={() =>
              navigation.navigate("Auth", {
                mode: "register",
                role: "producer",
              })
            }
            onLoginPress={() => navigation.navigate("Auth", { mode: "login" })}
          />
        )}
      </Stack.Screen>

      <Stack.Screen
        name="Auth"
        component={AuthScreen}
        options={{ title: "Autenticación" }}
      />

      <Stack.Screen
        name="AuthEntry"
        component={AuthEntryScreen}
        options={{ title: 'Hub Productivo' }}
      />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: "Hub Productivo",
          headerRight: () => (
<<<<<<< HEAD
            <Button title="IA" onPress={() => navigation.navigate("AIPanel")} />
          ),
        })}
      />
      <Stack.Screen
        name="AIPanel"
        component={AIPanelScreen}
        options={{ title: "Catálogo con IA" }}
      />
=======
            <View style={styles.headerActions}>
              <Button title="IA" onPress={() => navigation.navigate('AIPanel')} />
              <Button title="Entrar" onPress={() => navigation.navigate('AuthEntry')} />
            </View>
          ),
        })}
      />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Ingresar' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Crear cuenta' }} />
      <Stack.Screen name="BuyerForm" component={BuyerFormScreen} options={{ title: 'Perfil del comprador' }} />
      <Stack.Screen name="ProducerForm" component={ProducerFormScreen} options={{ title: 'Perfil del productor' }} />
      <Stack.Screen name="AIPanel" component={AIPanelScreen} options={{ title: 'Catálogo con IA' }} />
>>>>>>> 34173459a97936f879a1eee1186e18f6e68f14c6
    </Stack.Navigator>
  );
}

function Button({ title, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.headerButton}
    >
      <Text style={styles.headerButtonText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerButtonText: {
    color: "#18864B",
    fontSize: 14,
    fontWeight: "800",
  },
});

export default Navigator;
