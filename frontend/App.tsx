// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';

// Contexts
import { UserProvider, useUser } from './app/contexts/UserContext';
import { ActiveTeamProvider, useActiveTeam } from './app/contexts/ActiveTeamContext';

// Navigators
import AuthNavigator from './app/navigation/AuthNavigator';
import PostAuthTabsNavigator from './app/navigation/PostAuthTabsNavigator';
import TeamTabsNavigator from './app/navigation/TeamTabsNavigator';

// Extra screens outside of tabs
import PlayerDetailScreen from './app/screens/TeamTabs/PlayerDetailScreen'; 

// Navigation types
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types/navigationTypes';

// Create Root Stack
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Wrap app in global context providers
export default function App() {
  return (
    <UserProvider>
      <ActiveTeamProvider>
        <Navigation />
      </ActiveTeamProvider>
    </UserProvider>
  );
}

// Main logic to determine which navigator or screen to show
function Navigation() {
  const { user, loading } = useUser(); // Global user session
  const { activeTeamId } = useActiveTeam(); // Global active team ID

  // While the app checks for session persistence
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {/* Show auth flow if no user */}
        {!user && <RootStack.Screen name="AuthNavigator" component={AuthNavigator} />}

        {/* Show team setup flow if logged in but not part of a team */}
        {user && !activeTeamId && (
          <RootStack.Screen name="PostAuthTabs" component={PostAuthTabsNavigator} />
        )}

        {/* Show team features if user and team are both present */}
        {user && activeTeamId && (
          <>
            <RootStack.Screen name="TeamTabs" component={TeamTabsNavigator} />
            <RootStack.Screen
              name="PlayerDetail"
              component={PlayerDetailScreen}
              options={{ headerShown: true, title: 'Player Profile' }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
