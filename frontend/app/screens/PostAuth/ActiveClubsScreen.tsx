// screens/PostAuth/ActiveClubsScreen.tsx

import React, { useEffect, useState } from 'react';
// Core React hooks for component state and lifecycle

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
// Native UI components from React Native

import { useNavigation } from '@react-navigation/native';
// Hook to allow screen navigation

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
// Type support for strongly-typed navigation

import { RootStackParamList } from '../../../types/navigationTypes';
// Your app's root-level navigation type

import { useUser } from '../../contexts/UserContext';
// Global context for the currently authenticated user

import { useActiveTeam } from '../../contexts/ActiveTeamContext';
// Global context for tracking which team is currently active

import { getMyTeams } from '../../../adapters/teamAdapters';
// Adapter that fetches all teams the user is part of

import { Team } from '../../../types/teamTypes';
// Type definition for a Team object

// Define navigation type for this screen
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PostAuthTabs'>;

export default function ActiveClubsScreen() {
  const { user } = useUser(); // Access authenticated user data
  const { setActiveTeamId, setActiveTeamName } = useActiveTeam(); // Function to update global active team ID and name
  const navigation = useNavigation<NavigationProp>(); // Navigation object for redirecting

  const [teams, setTeams] = useState<Team[]>([]); // Stores teams fetched from backend
  const [loading, setLoading] = useState(true); // Tracks whether data is still loading

  // Fetch the teams this user is a part of
  useEffect(() => {
  const fetchTeams = async () => {
    const [data, error] = await getMyTeams(); // Proper destructuring

    if (error || !data) {
      Alert.alert('Error', 'Failed to load your teams');
    } else {
      setTeams(data); // Only set if data is valid
    }

    setLoading(false); // End loading in all cases
  };

  fetchTeams();
}, []);


  // Handle tap on a team
  const handleTeamPress = (team: Team) => {
    setActiveTeamId(team.id); // Update active team globally
    setActiveTeamName(team.name); // Update active team name globally
    navigation.navigate('TeamTabs', { teamId: team.id }); // Navigate to per-team navigator
  };

  // If loading, show spinner
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a4d3a" />
        <Text style={styles.loadingText}>Loading your clubs...</Text>
      </View>
    );
  }

  // If user has no teams yet
  if (!teams.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Active Clubs</Text>
          <Text style={styles.subtitle}>Your football clubs</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You are not a member of any team yet.</Text>
          <Text style={styles.emptySubtext}>Join a club to start your football journey</Text>
        </View>
      </View>
    );
  }

  // Main view with list of active clubs
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Active Clubs</Text>
        <Text style={styles.subtitle}>Select a club to continue</Text>
      </View>

      <FlatList
        data={teams} // Teams to render
        keyExtractor={(item) => item.id.toString()} // Key extractor for optimization
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.teamItem}
            onPress={() => handleTeamPress(item)} // Handle tap on team
            activeOpacity={0.8}
          >
            <Text style={styles.teamName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

// Styles - Evolv11 Brand Colors & Nike-inspired Design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0', // Warm beige background matching logo
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a4d3a', // Dark green matching logo
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    lineHeight: 22,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3f0',
    paddingHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  listContainer: {
    paddingBottom: 100, // Extra padding to avoid tab bar
  },
  teamItem: {
    backgroundColor: '#ffffff',
    padding: 24,
    marginVertical: 8,
    borderRadius: 0,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    borderTopWidth: 3,
    borderTopColor: '#1a4d3a',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a4d3a',
    letterSpacing: -0.2,
  },
});
