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
  const { setActiveTeamId } = useActiveTeam(); // Function to update global active team ID
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
    navigation.navigate('TeamTabs', { teamId: team.id }); // Navigate to per-team navigator
  };

  // If loading, show spinner
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Loading your clubs...</Text>
      </View>
    );
  }

  // If user has no teams yet
  if (!teams.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Active Clubs</Text>
        <Text>You are not a member of any team yet.</Text>
      </View>
    );
  }

  // Main view with list of active clubs
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Active Clubs</Text>

      <FlatList
        data={teams} // Teams to render
        keyExtractor={(item) => item.id.toString()} // Key extractor for optimization
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.teamItem}
            onPress={() => handleTeamPress(item)} // Handle tap on team
          >
            <Text style={styles.teamName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// Local screen styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  loadingContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  teamItem: {
    backgroundColor: '#e6ecf3',
    padding: 14,
    borderRadius: 8,
    marginVertical: 6,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
  },
});
