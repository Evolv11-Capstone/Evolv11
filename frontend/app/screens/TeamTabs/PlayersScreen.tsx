import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useNavigation } from '@react-navigation/native'; // 👈 For navigating to PlayerDetail
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigationTypes'; // 👈 For type safety

import { useActiveTeam } from '../../contexts/ActiveTeamContext'; // Context for current team
import { getPlayersByTeam } from '../../../adapters/teamAdapters'; // Adapter for player fetch
import { TeamPlayer } from '../../../types/playerTypes'; // Type definition

// 👇 Set up navigation prop type
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerDetail'>;

export default function PlayersScreen() {
  const { activeTeamId } = useActiveTeam(); // Get team ID from context
  const navigation = useNavigation<NavigationProp>(); // 👈 Access navigation

  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch approved players on mount
  useEffect(() => {
    const fetchPlayers = async () => {
      if (!activeTeamId) return;

      const [data, error] = await getPlayersByTeam(activeTeamId);

      if (error) {
        Alert.alert('Error', 'Failed to load players');
      } else {
        setPlayers(data || []);
      }

      setLoading(false);
    };

    fetchPlayers();
  }, [activeTeamId]);

  // Show loading spinner
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text>Loading players...</Text>
      </View>
    );
  }

  // If no players found
  if (!players.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No players found for this team.</Text>
      </View>
    );
  }

  // Main view: list of players with navigation on tap
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Squad Members</Text>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PlayerDetail', { playerId: item.id })} // 👈 Navigate on tap
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>Role: {item.role}</Text>
            {item.nationality && <Text style={styles.meta}>Nationality: {item.nationality}</Text>}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  card: {
    padding: 12,
    backgroundColor: '#eef2f7',
    borderRadius: 10,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: '600' },
  meta: { fontSize: 14, color: '#333' },
});
