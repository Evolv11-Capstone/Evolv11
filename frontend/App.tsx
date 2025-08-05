// App.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ArrowLeft } from 'lucide-react-native';

// Contexts
import { UserProvider, useUser } from './app/contexts/UserContext';
import { ActiveTeamProvider, useActiveTeam } from './app/contexts/ActiveTeamContext';
import { DataRefreshProvider } from './app/contexts/DataRefreshContext';

// Navigators
import AuthNavigator from './app/navigation/AuthNavigator';
import PostAuthTabsNavigator from './app/navigation/PostAuthTabsNavigator';
import TeamTabsNavigator from './app/navigation/TeamTabsNavigator';

// Extra screens outside of tabs
import PlayerDetailScreen from './app/screens/TeamTabs/PlayerDetailScreen'; 
import MatchDetailScreen from './app/screens/TeamTabs/MatchDetailScreen'; 
import NotificationsScreen from './app/screens/TeamTabs/NotificationsScreen'; 

// Navigation types
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types/navigationTypes';

// Create Root Stack
const RootStack = createNativeStackNavigator<RootStackParamList>();

// Wrap app in global context providers
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserProvider>
        <ActiveTeamProvider>
          <DataRefreshProvider>
            <Navigation />
          </DataRefreshProvider>
        </ActiveTeamProvider>
      </UserProvider>
    </GestureHandlerRootView>
  );
}

// Main logic to determine which navigator or screen to show
function Navigation() {
  const { user, loading } = useUser(); // Global user session
  const { activeTeamId } = useActiveTeam(); // Global active team ID

  // While the app checks for session persistence
  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#f5f3f0'
      }}>
        <ActivityIndicator size="large" color="#1a4d3a" />
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
              options={({ navigation }) => ({ 
                headerShown: true, 
                title: 'PLAYER PROFILE',
                headerStyle: {
    
                  backgroundColor: '#f5f3f0',
                  borderBottomWidth: 1,
                  borderBottomColor: '#d4b896',
                  height: 100,
                },
                headerTitleStyle: {
                  fontSize: 24,
                  fontWeight: '900',
                  color: '#1a4d3a',
                },
                headerTitleAlign: 'left',
                headerLeft: () => (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginLeft: 17,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: '#ffffff',
                      borderWidth: 1,
                      borderColor: '#d4b896',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                  >
                    <ArrowLeft size={18} color="#1a4d3a" strokeWidth={2} />
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '900',
                      letterSpacing: 0.5,
                      color: '#1a4d3a',
                      marginLeft: 8,
                      textTransform: 'uppercase',
                    }}>
                      TEAM TABS
                    </Text>
                  </TouchableOpacity>
                ),
                headerTintColor: '#1a4d3a',
                headerBackTitle: '',
                headerShadowVisible: false,
              })}
            />
            <RootStack.Screen
              name="MatchDetailScreen"
              component={MatchDetailScreen}
              options={({ navigation }) => ({ 
                headerShown: true,
                title: 'MATCH DETAIL',
                headerStyle: {
                  backgroundColor: '#f5f3f0',
                  borderBottomWidth: 1,
                  borderBottomColor: '#d4b896',
                  height: 100,
                },
                headerTitleStyle: {
                  fontSize: 24,
                  fontWeight: '900',
                  color: '#1a4d3a',
                },
                headerTitleAlign: 'left',
                headerLeft: () => (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginLeft: 16,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: '#ffffff',
                      borderWidth: 1,
                      borderColor: '#d4b896',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                  >
                    <ArrowLeft size={18} color="#1a4d3a" strokeWidth={2} />
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '900',
                      letterSpacing: 0.5,
                      color: '#1a4d3a',
                      marginLeft: 8,
                      textTransform: 'uppercase',
                    }}>
                      TEAM TABS
                    </Text>
                  </TouchableOpacity>
                ),
                headerTintColor: '#1a4d3a',
                headerBackTitle: '',
                headerShadowVisible: false,
              })}
            />
            <RootStack.Screen
              name="NotificationsScreen"
              component={NotificationsScreen}
              options={({ navigation }) => ({ 
                headerShown: true,
                title: 'NOTIFICATIONS',
                headerStyle: {
                  backgroundColor: '#f5f3f0',
                  borderBottomWidth: 1,
                  borderBottomColor: '#d4b896',
                  height: 100,
                },
                headerTitleStyle: {
                  fontSize: 24,
                  fontWeight: '900',
                  color: '#1a4d3a',
                },
                headerTitleAlign: 'left',
                headerLeft: () => (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginLeft: 16,
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      backgroundColor: '#ffffff',
                      borderWidth: 1,
                      borderColor: '#d4b896',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 3,
                      elevation: 2,
                    }}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.7}
                  >
                    <ArrowLeft size={18} color="#1a4d3a" strokeWidth={2} />
                    <Text style={{
                      fontSize: 12,
                      fontWeight: '900',
                      letterSpacing: 0.5,
                      color: '#1a4d3a',
                      marginLeft: 8,
                      textTransform: 'uppercase',
                    }}>
                      DASHBOARD
                    </Text>
                  </TouchableOpacity>
                ),
                headerTintColor: '#1a4d3a',
                headerBackTitle: '',
                headerShadowVisible: false,
              })}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
