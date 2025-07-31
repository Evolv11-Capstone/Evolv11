import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import {
  TouchableOpacity,
  Text,
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { Menu, ArrowLeft } from 'lucide-react-native';

import { useActiveTeam } from '../contexts/ActiveTeamContext';
import { useUser } from '../contexts/UserContext';

import DashboardScreen from '../screens/TeamTabs/DashboardScreen';
import PlayersScreen from '../screens/TeamTabs/PlayersScreen';
import MatchCenterScreen from '../screens/TeamTabs/MatchCenterScreen';
import GrowthInsightsScreen from '../screens/TeamTabs/GrowthInsightsScreen';
import TeamAnalysisScreen from '../screens/TeamTabs/TeamAnalysisScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// 🧱 Reusable stack wrapper for each team tab
function TeamStack({ component, title }: { component: React.ComponentType<any>; title: string }) {
  return () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name={title} component={component} options={{ headerShown: false }} />
      </Stack.Navigator>
    );
  };
}

export default function TeamTabsNavigator() {
  const { user } = useUser();

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'slide',
        headerLeft: () => <HamburgerButton />,
        headerStyle: { 
          backgroundColor: '#f5f3f0', 
          elevation: 0, 
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#d4b896',
        },
        headerTintColor: '#1a4d3a',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 20,
          letterSpacing: -0.3,
          color: '#1a4d3a',
        },
        drawerStyle: {
          backgroundColor: '#f5f3f0',
          borderTopRightRadius: 0, // Sharp edges for Nike-inspired design
          borderBottomRightRadius: 0,
          width: 280,
          borderRightWidth: 3,
          borderRightColor: '#1a4d3a',
        },
      }}
    >
      <Drawer.Screen name="Dashboard" component={TeamStack({ component: DashboardScreen, title: 'Dashboard' })} />
      <Drawer.Screen name="Players" component={TeamStack({ component: PlayersScreen, title: 'Players' })} />
      {user?.role === 'coach' && (
        <>
          <Drawer.Screen name="Match Center" component={TeamStack({ component: MatchCenterScreen, title: 'Match Center' })} />
        </>
      )}
      <Drawer.Screen name="Growth Insights" component={TeamStack({ component: GrowthInsightsScreen, title: 'Growth Insights' })} />
      <Drawer.Screen name="Team Analysis" component={TeamStack({ component: TeamAnalysisScreen, title: 'Team Analysis' })} />
    </Drawer.Navigator>
  );
}

// 🍔 Hamburger button
function HamburgerButton() {
  const navigation = useNavigation();
  return (
    <TouchableOpacity
      style={styles.hamburgerButton}
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <Menu size={24} color="#1a4d3a" />
    </TouchableOpacity>
  );
}

// 📋 Custom drawer
function CustomDrawerContent({ state, navigation }: DrawerContentComponentProps) {
  const { setActiveTeamId, setActiveTeamName } = useActiveTeam();
  const { user } = useUser();

  const goToActiveTeams = () => {
    setActiveTeamId(null);
    setActiveTeamName(undefined);
    navigation.getParent()?.navigate('PostAuthTabs', { screen: 'ActiveClubs' });
  };

  return (
    <DrawerContentScrollView style={styles.drawerContainer} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Team Menu</Text>
        <Text style={styles.drawerSubtitle}>Navigate your team</Text>
      </View>

      {/* Navigation Items */}
      <View style={styles.navigationSection}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={[styles.drawerItem, isFocused && styles.drawerItemActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.drawerItemText, isFocused && styles.drawerItemTextActive]}>
                {route.name}
              </Text>
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={goToActiveTeams} activeOpacity={0.8}>
        <ArrowLeft size={20} color="#1a4d3a" />
        <Text style={styles.backText}>Back to Teams</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

// 🎨 Styles - Evolv11 Brand Colors & Nike-inspired Design
const styles = StyleSheet.create({
  hamburgerButton: {
    marginLeft: 16,
    padding: 8,
    borderRadius: 0, // Sharp edges
    backgroundColor: 'transparent',
  },
  drawerContainer: {
    backgroundColor: '#f5f3f0',
    flex: 1,
  },
  drawerHeader: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#d4b896',
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  drawerSubtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  navigationSection: {
    paddingHorizontal: 16,
    flex: 1,
  },
  drawerItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 0, // Sharp edges for Nike-inspired design
    marginVertical: 4,
    backgroundColor: '#ffffff',
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  drawerItemActive: {
    backgroundColor: '#ffffff',
    borderLeftColor: '#1a4d3a',
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    letterSpacing: -0.2,
  },
  drawerItemTextActive: {
    fontWeight: '700',
    color: '#1a4d3a',
  },
  activeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 0, // Sharp square indicator
    backgroundColor: '#1a4d3a',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 30,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 0,
    borderTopWidth: 3,
    borderTopColor: '#1a4d3a',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
    color: '#1a4d3a',
    letterSpacing: -0.2,
  },
});
