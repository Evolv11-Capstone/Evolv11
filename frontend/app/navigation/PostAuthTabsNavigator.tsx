// navigation/PostAuthTabsNavigator.tsx

import React from 'react'; 
// React core needed to use JSX and build functional components

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
// React Navigation's bottom tab navigator for organizing post-auth screens

import { Ionicons } from '@expo/vector-icons';

import TeamSetupScreen from '../screens/PostAuth/TeamSetupScreen'; 
// Screen where users create or request to join teams

import ActiveClubsScreen from '../screens/PostAuth/ActiveClubsScreen'; 
// Screen showing list of teams the user belongs to

import AccountSettingsScreen from '../screens/PostAuth/AccountSettingsScreen'; 
// NEW: screen that displays logout option and future settings

import type { PostAuthTabsParamList } from '../../types/navigationTypes'; 
// Type definition for tab names and parameters

// Create a typed bottom tab navigator based on your screen map
const Tab = createBottomTabNavigator<PostAuthTabsParamList>();

// Export the main post-auth navigation tabs
export default function PostAuthTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#111',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          height: 64,
          borderTopWidth: 0.5,
          borderColor: '#e0e0e0',
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: -2 },
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 14,
          letterSpacing: 0.2,
          marginBottom: 6,
        },
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: string = '';
          if (route.name === 'TeamSetup') iconName = focused ? 'add-circle' : 'add-circle-outline';
          if (route.name === 'ActiveClubs') iconName = focused ? 'people' : 'people-outline';
          if (route.name === 'AccountSettings') iconName = focused ? 'settings' : 'settings-outline';
          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="TeamSetup"
        component={TeamSetupScreen}
        options={{ title: 'Team Setup' }}
      />
      <Tab.Screen
        name="ActiveClubs"
        component={ActiveClubsScreen}
        options={{ title: 'Clubs' }}
      />
      <Tab.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  );
}
