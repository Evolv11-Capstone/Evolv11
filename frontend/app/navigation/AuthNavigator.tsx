// navigation/AuthNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, Platform } from 'react-native';

// Import the screens for pre-auth flow
import LandingScreen from '../screens/Auth/LandingScreen';
import AboutScreen from '../screens/Auth/AboutScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import CreateNewUser from '../screens/Auth/CreateNewUser';

// Define navigator type
const Tab = createBottomTabNavigator();

export default function AuthNavigator() {
  return (
    <View style={styles.background}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: '#1a4d3a', // Dark green from logo
          tabBarInactiveTintColor: '#6b7280', // Neutral gray
          tabBarStyle: {
            backgroundColor: '#ffffff',
            borderTopWidth: 1,
            borderTopColor: '#e5e7eb',
            height: route.name === 'Landing' ? 0 : 110, // Hide tab bar only on Landing screen
            paddingTop: 8,
            paddingBottom: 8,
            shadowColor: '#1a4d3a',
            shadowOpacity: 0.1,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: -4 },
            elevation: 10,
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
          
            display: route.name === 'Landing' ? 'none' : 'flex', // Completely hide on Landing
          },
          tabBarLabelStyle: {
            fontWeight: '600',
            fontSize: 12,
            letterSpacing: 0.5,
            marginTop: 4,
            textTransform: 'uppercase',
            fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
          },
          tabBarIcon: ({ color, size, focused }) => {
            let iconName: string = '';
            if (route.name === 'Landing') iconName = focused ? 'home' : 'home-outline';
            if (route.name === 'About') iconName = focused ? 'information-circle' : 'information-circle-outline';
            if (route.name === 'Login') iconName = focused ? 'log-in' : 'log-in-outline';
            if (route.name === 'Register') iconName = focused ? 'person-add' : 'person-add-outline';
            return <Ionicons name={iconName as any} size={30} color={color} />;
          },
          tabBarIconStyle: {
            marginTop: 2,
          },
        })}
      >
        <Tab.Screen name="Landing" component={LandingScreen} options={{ title: 'Home' }} />
        <Tab.Screen name="About" component={AboutScreen} options={{ title: 'About' }} />
        <Tab.Screen name="Login" component={LoginScreen} options={{ title: 'Sign In' }} />
        <Tab.Screen name="Register" component={CreateNewUser} options={{ title: 'Join' }} />
      </Tab.Navigator>
    </View>
  );
}

// Styles - Evolv11 Brand Colors & Nike-inspired Design
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f5f3f0', // Warm beige background matching logo
  },
});
