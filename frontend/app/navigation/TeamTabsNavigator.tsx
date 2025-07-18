// navigation/TeamTabsNavigator.tsx

import React from 'react'; // Core React import for JSX
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Tab navigator for bottom navigation
import { Text, View } from 'react-native'; // Native components (used for fallback UI)

// Screens shown inside this team-specific navigation
import DashboardScreen from '../screens/TeamTabs/DashboardScreen';
import PlayersScreen from '../screens/TeamTabs/PlayersScreen';
import MatchCenterScreen from '../screens/TeamTabs/MatchCenterScreen';
import GrowthInsightsScreen from '../screens/TeamTabs/GrowthInsightsScreen';
import TeamAnalysisScreen from '../screens/TeamTabs/TeamAnalysisScreen';
import AccountSettingsScreen from '../screens/PostAuth/AccountSettingsScreen'; 

// Import our ActiveTeamContext to get the selected team
import { useActiveTeam } from '../contexts/ActiveTeamContext';

// Define the tab navigator with default (no explicit typing here)
const Tab = createBottomTabNavigator();

export default function TeamTabsNavigator() {
  const { activeTeamId } = useActiveTeam(); // Get current selected team from context

  // Fallback UI if somehow this navigator is rendered without a selected team
  if (!activeTeamId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No team selected.</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true, // Show a header on each screen
        tabBarLabelStyle: { fontSize: 12 },
        tabBarStyle: { paddingBottom: 5, height: 60 },
      }}
    >
      {/* Dashboard: Displays stats/overview for selected team */}
      <Tab.Screen name="Dashboard" component={DashboardScreen} />

      {/* Players: Roster view for selected team */}
      <Tab.Screen name="Players" component={PlayersScreen} />

      {/* Match Center: Match schedule + results */}
      <Tab.Screen name="MatchCenter" component={MatchCenterScreen} />

      {/* Growth Insights: Player development tracking */}
      <Tab.Screen name="GrowthInsights" component={GrowthInsightsScreen} />

      {/* Team Analysis: Analytics and performance metrics */}
      <Tab.Screen name="TeamAnalysis" component={TeamAnalysisScreen} />

      {/* Tab for account actions — includes logout logic */}
            <Tab.Screen name="AccountSettings" component={AccountSettingsScreen} />
    </Tab.Navigator>
  );
}
