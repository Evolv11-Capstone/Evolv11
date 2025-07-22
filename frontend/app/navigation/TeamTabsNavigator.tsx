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

import DashboardScreen from '../screens/TeamTabs/DashboardScreen';
import PlayersScreen from '../screens/TeamTabs/PlayersScreen';
import MatchCenterScreen from '../screens/TeamTabs/MatchCenterScreen';
import GrowthInsightsScreen from '../screens/TeamTabs/GrowthInsightsScreen';
import TeamAnalysisScreen from '../screens/TeamTabs/TeamAnalysisScreen';
import MatchDetailScreen from '../screens/TeamTabs/MatchDetailScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// 🧱 Reusable stack wrapper for each team tab
function TeamStack({ component, title }: { component: React.ComponentType<any>; title: string }) {
  return () => (
    <Stack.Navigator>
      <Stack.Screen name={title} component={component} options={{ headerShown: false }} />
      <Stack.Screen name="MatchDetailScreen" component={MatchDetailScreen} options={{ title: 'Match Detail' }} />
    </Stack.Navigator>
  );
}

export default function TeamTabsNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: 'slide',
        headerLeft: () => <HamburgerButton />,
        headerStyle: { backgroundColor: '#fff' },
        headerTintColor: '#000',
      }}
    >
      <Drawer.Screen name="Dashboard" component={TeamStack({ component: DashboardScreen, title: 'Dashboard' })} />
      <Drawer.Screen name="Players" component={TeamStack({ component: PlayersScreen, title: 'Players' })} />
      <Drawer.Screen name="Match Center" component={TeamStack({ component: MatchCenterScreen, title: 'Match Center' })} />
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
      style={{ marginLeft: 16 }}
      onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
    >
      <Menu size={24} color="#000" />
    </TouchableOpacity>
  );
}

// 📋 Custom drawer
function CustomDrawerContent({ state, navigation }: DrawerContentComponentProps) {
  const { setActiveTeamId } = useActiveTeam();

  const goToActiveTeams = () => {
    setActiveTeamId(null);
    navigation.reset({
      index: 0,
      routes: [{ name: 'PostAuthTabs' }],
    });
  };

  return (
    <DrawerContentScrollView>
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        return (
          <Pressable
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.drawerItem, isFocused && styles.drawerItemActive]}
          >
            <Text style={{ color: '#000', fontWeight: isFocused ? 'bold' : 'normal' }}>
              {route.name}
            </Text>
          </Pressable>
        );
      })}

      <Pressable style={styles.backRow} onPress={goToActiveTeams}>
        <ArrowLeft size={20} color="#000" />
        <Text style={styles.backText}>Active Teams</Text>
      </Pressable>
    </DrawerContentScrollView>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  drawerItem: {
    padding: 16,
    paddingHorizontal: 24,
  },
  drawerItemActive: {
    backgroundColor: '#f0f0f0',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
