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
import ProfileScreen from '../screens/ProfileScreen';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function AuthNavigator({ setIsAuthenticated }) {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="AuthEntry" component={AuthEntryScreen} />
      <AuthStack.Screen name="Login">
        {(props) => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {(props) => <RegisterScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

function MainNavigator({ setIsAuthenticated }) {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Hub Productivo',
          headerRight: () => (
            <View style={styles.headerActions}>
              <Button title="IA" onPress={() => navigation.navigate('AIPanel')} />
              <Button title="Entrar" onPress={() => navigation.navigate('AuthEntry')} />
            </View>
          ),
        })}
      />
      <MainStack.Screen name="BuyerForm" component={BuyerFormScreen} options={{ title: 'Perfil del comprador' }} />
      <MainStack.Screen name="ProducerForm" component={ProducerFormScreen} options={{ title: 'Perfil del productor' }} />
      <MainStack.Screen name="Profile">
        {(props) => <ProfileScreen {...props} setIsAuthenticated={setIsAuthenticated} />}
      </MainStack.Screen>
      <MainStack.Screen name="AIPanel" component={AIPanelScreen} options={{ title: 'Catálogo con IA' }} />
    </MainStack.Navigator>
  );
}

function Navigator({ isAuthenticated, setIsAuthenticated }) {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main">
          {(props) => <MainNavigator {...props} setIsAuthenticated={setIsAuthenticated} />}
        </RootStack.Screen>
      ) : (
        <RootStack.Screen name="Auth">
          {(props) => <AuthNavigator {...props} setIsAuthenticated={setIsAuthenticated} />}
        </RootStack.Screen>
      )}
    </RootStack.Navigator>
  );
}

function Button({ title, onPress }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.headerButton}>
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
    color: '#18864B',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default Navigator;
