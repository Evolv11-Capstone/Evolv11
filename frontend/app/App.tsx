// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Required for navigation
import { useUser } from './contexts/UserContext'; // Custom context hook to get the current user
import TabNavigator from './navigation/TabNavigator'; // Default tab navigator (for registration etc.)
import PostRegisterNavigator from '../components/PostRegisterNavigator'; // Post-registration flow

export default function App() {
  // Get the user from context
  const { user } = useUser();

  return (
    // NavigationContainer must wrap the entire navigator stack
    <NavigationContainer>
      {/* If a user exists, show the post-register flow. Otherwise show initial tabs */}
      {user ? <PostRegisterNavigator /> : <TabNavigator />}
    </NavigationContainer>
  );
}
