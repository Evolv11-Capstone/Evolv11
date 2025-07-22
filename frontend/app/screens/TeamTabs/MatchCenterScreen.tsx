import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useUser } from '../../contexts/UserContext'; // Access current user
import { useActiveTeam } from '../../contexts/ActiveTeamContext'; // Access selected team
import { createMatch, getMatchesForTeam } from '../../../adapters/matchAdapters'; // Adapter functions

import type { StackNavigationProp } from '@react-navigation/stack';

// Props type for navigation
type MatchCenterScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

// Match data structure
type Match = {
  id: number | string;
  opponent: string;
  team_score: number | null;
  opponent_score: number | null;
  match_date: string;
  // You can add more fields if needed (e.g. created_at, updated_at)
};

const MatchCenterScreen = ({ navigation }: MatchCenterScreenProps) => {
  const { user } = useUser(); // Get current user
  const { activeTeamId } = useActiveTeam(); // Get active team

  // Form state
  const [opponent, setOpponent] = useState('');
  const [goalsFor, setGoalsFor] = useState('');
  const [goalsAgainst, setGoalsAgainst] = useState('');
  const [matchDate, setMatchDate] = useState('');

  // Match list state
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch matches when activeTeamId changes
  useEffect(() => {
    if (activeTeamId) {
      fetchMatches();
    }
  }, [activeTeamId]);

  // Load matches from backend
  const fetchMatches = async () => {
    setLoading(true);
    try {
      if (activeTeamId === null) {
        setMatches([]);
        return;
      }

      // Use your fetchHandler format: [data, error]
      const [data, error] = await getMatchesForTeam(activeTeamId);

      if (error) {
        console.error('Match fetch error:', error);
        setMatches([]);
      } else if (Array.isArray(data)) {
        setMatches(data);
      } else {
        console.warn('Unexpected match data:', data);
        setMatches([]);
      }
    } catch (err) {
      console.error('Unexpected error fetching matches:', err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  // Create new match and refresh list
  const handleCreateMatch = async () => {
    if (!opponent || !matchDate) {
      Alert.alert('Missing Fields', 'Please fill in opponent and date.');
      return;
    }

    try {
      if (activeTeamId === null) {
        Alert.alert('Error', 'No active team selected.');
        return;
      }

      // Submit match using the field names you're using: team_score & opponent_score
      await createMatch({
        team_id: activeTeamId,
        opponent,
        team_score: Number(goalsFor) || 0,
        opponent_score: Number(goalsAgainst) || 0,
        match_date: matchDate,
      });

      // Reset form fields
      setOpponent('');
      setGoalsFor('');
      setGoalsAgainst('');
      setMatchDate('');

      // Refresh match list
      fetchMatches();
    } catch (error) {
      console.error('Failed to create match:', error);
      Alert.alert('Error', 'Could not create match.');
    }
  };

  // Render each match as a card
  const renderMatchItem = ({ item }: { item: Match }) => {
    if (!item || typeof item !== 'object' || !item.opponent) return null;

    return (
      <TouchableOpacity
        style={styles.matchCard}
        // Navigate to MatchDetailScreen with matchId
        onPress={() => navigation.navigate('MatchDetailScreen', { matchId: item.id })}
      >
        <Text style={styles.matchText}>{item.opponent}</Text>
        <Text style={styles.matchText}>
          {new Date(item.match_date).toLocaleDateString()}
        </Text>
        <Text style={styles.matchText}>
          {item.team_score ?? '-'} - {item.opponent_score ?? '-'}
        </Text>
      </TouchableOpacity>
    );
  };

  // If user or team isn’t loaded yet
  if (!user || !activeTeamId) {
    return (
      <View style={styles.container}>
        <Text>Loading user or team context...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Match</Text>

      {/* Form Inputs */}
      <TextInput
        style={styles.input}
        placeholder="Opponent"
        value={opponent}
        onChangeText={setOpponent}
      />
      <TextInput
        style={styles.input}
        placeholder="Goals For"
        value={goalsFor}
        onChangeText={setGoalsFor}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Goals Against"
        value={goalsAgainst}
        onChangeText={setGoalsAgainst}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Match Date (YYYY-MM-DD)"
        value={matchDate}
        onChangeText={setMatchDate}
      />
      <Button title="Create Match" onPress={handleCreateMatch} />

      {/* Match List */}
      <Text style={styles.title}>Recent Matches</Text>
      {loading ? (
        <Text>Loading matches...</Text>
      ) : (
        <FlatList
          data={Array.isArray(matches) ? matches : []}
          keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
          renderItem={renderMatchItem}
          ListEmptyComponent={<Text>No matches yet. Start by creating one above!</Text>}
        />
      )}
    </View>
  );
};

export default MatchCenterScreen;

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    marginVertical: 12,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
  },
  matchCard: {
    padding: 12,
    marginVertical: 6,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  matchText: {
    fontSize: 16,
  },
});
