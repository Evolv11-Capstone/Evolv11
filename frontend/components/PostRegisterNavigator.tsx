// navigation/PostRegisterNavigator.tsx

import React from 'react'; // Import React
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Stack navigator
import TeamSetupScreen from './TeamSetupScreen'; // Team setup screen
import { useUser } from '../app/contexts/UserContext'; // Access user context

// Create a stack navigator instance
const Stack = createNativeStackNavigator();

// This navigator shows post-registration flow depending on user role
export default function PostRegisterNavigator() {
  const { user } = useUser(); // Get current user from context

  return (
    <Stack.Navigator>
      {/* Conditionally show team setup screen once user exists */}
      {user && (
        <Stack.Screen
          name="TeamSetup"
          component={TeamSetupScreen} // Route to team setup
          options={{ title: 'Set Up Your Team' }} // Header config
        />
      )}
    </Stack.Navigator>
  );
}
