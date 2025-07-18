// navigation/AuthNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Import the screens for pre-auth flow
import LandingScreen from '../screens/Auth/LandingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import CreateNewUser from '../screens/Auth/CreateNewUser'; 

// Define navigator type
const Tab = createBottomTabNavigator();

export default function AuthNavigator() {
  return (
    <Tab.Navigator>
      {/* Landing screen describing value prop */}
      <Tab.Screen name="Landing" component={LandingScreen} />

      {/* Login screen */}
      <Tab.Screen name="Login" component={LoginScreen} />

      {/* Register (Create new user) screen */}
      <Tab.Screen name="Register" component={CreateNewUser} />
    </Tab.Navigator>
  );
}
