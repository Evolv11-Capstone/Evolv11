// navigation/PostAuthTabsNavigator.tsx

import React from 'react'; 
// React core needed to use JSX and build functional components

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; 
// React Navigation's bottom tab navigator for organizing post-auth screens

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
    <Tab.Navigator>
      {/* Tab for coaches to create or request to join teams */}
      <Tab.Screen name="TeamSetup" component={TeamSetupScreen} />

      {/* Tab listing user's currently joined teams */}
      <Tab.Screen name="ActiveClubs" component={ActiveClubsScreen} />

      {/* Tab for account actions — includes logout logic */}
      <Tab.Screen name="AccountSettings" component={AccountSettingsScreen} />
    </Tab.Navigator>
  );
}
