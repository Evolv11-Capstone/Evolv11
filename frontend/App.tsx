import React, { ReactNode } from 'react';
import TabNavigator from './app/navigation/TabNavigator';
import { UserProvider } from './app/contexts/UserContext';

// Wrap the entire app in the UserProvider to share user data between screens
export default function App() {
  return (
    <UserProvider>
      <TabNavigator />
    </UserProvider>
  );
}
