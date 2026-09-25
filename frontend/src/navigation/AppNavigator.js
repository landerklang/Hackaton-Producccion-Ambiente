import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import AIPanelScreen from '../screens/AIPanelScreen';
import AddProductScreen from '../screens/AddProductScreen';
import AuthEntryScreen from '../screens/AuthEntryScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import BuyerFormScreen from '../screens/BuyerFormScreen';
import ProducerFormScreen from '../screens/ProducerFormScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PublicStoreScreen from '../screens/PublicStoreScreen';

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();

function AuthNavigator({ setIsAuthenticated, setCurrentUser }) {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <AuthStack.Screen name="AuthEntry" component={AuthEntryScreen} />
      <AuthStack.Screen name="Login">
        {(props) => <LoginScreen {...props} setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {(props) => <RegisterScreen {...props} setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

function MainNavigator({ setIsAuthenticated, currentUser, setCurrentUser }) {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MainStack.Screen
        name="Home"
        children={(props) => <HomeScreen {...props} currentUser={currentUser} />}
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
      <MainStack.Screen name="AddProduct" component={AddProductScreen} />
      <MainStack.Screen name="PublicStore" component={PublicStoreScreen} />
      <MainStack.Screen name="Profile">
        {(props) => <ProfileScreen {...props} setIsAuthenticated={setIsAuthenticated} currentUser={currentUser} setCurrentUser={setCurrentUser} />}
      </MainStack.Screen>
      <MainStack.Screen name="AIPanel">
        {(props) => <AIPanelScreen {...props} currentUser={currentUser} />}
      </MainStack.Screen>
    </MainStack.Navigator>
  );
}

function Navigator({ isAuthenticated, setIsAuthenticated, currentUser, setCurrentUser }) {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <RootStack.Screen name="Main">
          {(props) => <MainNavigator {...props} setIsAuthenticated={setIsAuthenticated} currentUser={currentUser} setCurrentUser={setCurrentUser} />}
        </RootStack.Screen>
      ) : (
        <RootStack.Screen name="Auth">
          {(props) => <AuthNavigator {...props} setIsAuthenticated={setIsAuthenticated} setCurrentUser={setCurrentUser} />}
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
