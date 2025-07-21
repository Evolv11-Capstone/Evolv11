// screens/TeamTabs/TeamHubScreen.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Pressable } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';

// Replace with your actual screens
import Dashboard from './DashboardScreen';
import Players from './PlayersScreen';
import MatchCenter from './MatchCenterScreen';
import GrowthInsights from './GrowthInsightsScreen';
import TeamAnalysis from './TeamAnalysisScreen';

const SCREENS = ['Dashboard', 'Players', 'Match Center', 'Growth Insights', 'Team Analysis'];

export default function TeamHubScreen() {
  const [selectedTab, setSelectedTab] = useState('Dashboard');
  const [menuVisible, setMenuVisible] = useState(false);

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Players':
        return <Players />;
      case 'Match Center':
        return <MatchCenter />;
      case 'Growth Insights':
        return <GrowthInsights />;
      case 'Team Analysis':
        return <TeamAnalysis />;
      case 'Dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Floating menu button */}
      <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      {/* Current tab content */}
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        {renderTabContent()}
      </ScrollView>

      {/* Sidebar Modal */}
      <Modal visible={menuVisible} transparent animationType="slide">
        <Pressable style={styles.backdrop} onPress={() => setMenuVisible(false)} />
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Team Sections</Text>
          {SCREENS.map(screen => (
            <TouchableOpacity
              key={screen}
              onPress={() => {
                setSelectedTab(screen);
                setMenuVisible(false);
              }}
              style={[
                styles.menuItem,
                selectedTab === screen && styles.menuItemActive,
              ]}
            >
              <Text
                style={[
                  styles.menuText,
                  selectedTab === screen && styles.menuTextActive,
                ]}
              >
                {screen}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: '#f8e71c',
    padding: 10,
    borderRadius: 20,
    elevation: 6,
  },
  menuIcon: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  backdrop: {
    flex: 1,
    backgroundColor: '#00000088',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 240,
    height: '100%',
    backgroundColor: '#fff',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: -3, height: 0 },
    shadowRadius: 6,
    elevation: 10,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuItemActive: {
    backgroundColor: '#f3f3f3',
    borderRadius: 6,
  },
  menuText: {
    fontSize: 16,
  },
  menuTextActive: {
    fontWeight: 'bold',
    color: '#007bff',
  },
});
