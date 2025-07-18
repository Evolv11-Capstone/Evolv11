import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';

import { RouteProp, useRoute } from '@react-navigation/native'; // Access route params
import { RootStackParamList } from '../../../types/navigationTypes'; // Stack types
import { getPlayerById } from '../../../adapters/teamAdapters'; // Fetch player by ID
import { TeamPlayer } from '../../../types/playerTypes'; // Player data type
import PlayerCard from '../../../components/PlayerCard'; // Reusable card UI

// Set the route type for accessing the playerId parameter
type PlayerDetailRouteProp = RouteProp<RootStackParamList, 'PlayerDetail'>;

export default function PlayerDetailScreen() {
  const route = useRoute<PlayerDetailRouteProp>(); // Grab playerId from route
  const { playerId } = route.params; // Destructure playerId from params

  const [player, setPlayer] = useState<TeamPlayer | null>(null); // Local state for player
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch player on mount
  useEffect(() => {
    const fetchPlayer = async () => {
      const [data, error] = await getPlayerById(playerId); // Fetch player from backend

      if (error || !data) {
        Alert.alert('Error', 'Could not load player data');
      } else {
        setPlayer(data); // Store player data
      }

      setLoading(false); // Stop spinner
    };

    fetchPlayer();
  }, [playerId]);

  // Show loading spinner while fetching
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading player...</Text>
      </View>
    );
  }

  // If player not found, show fallback
  if (!player) {
    return (
      <View style={styles.centered}>
        <Text>Player not found.</Text>
      </View>
    );
  }

  // Main layout with PlayerCard
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PlayerCard player={player} /> {/* Reusable card to show full profile */}
    </ScrollView>
  );
}

// Basic styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
