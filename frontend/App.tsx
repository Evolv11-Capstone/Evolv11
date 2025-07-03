import React from 'react';
import TabNavigator from './app/navigation/TabNavigator';
import { PlayerProvider } from './app/contexts/UserContext';

// Wrap the entire app in the PlayerProvider to share player data between screens
export default function App() {
  return (
    <PlayerProvider>
      <TabNavigator />
    </PlayerProvider>
  );
}
