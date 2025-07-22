import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { getMatchById } from '../../../adapters/matchAdapters';
import type { RouteProp } from '@react-navigation/native';

// Define route params type
type MatchDetailRouteParams = {
  matchId: number;
};

// Define Match type
type Match = {
  id: number;
  opponent: string;
  match_date: string;
  team_score: number | null;
  opponent_score: number | null;
};

// Placeholder Player type
type Player = {
  id: number;
  name: string;
};

// Dummy example players
const samplePlayers: Player[] = [
  { id: 1, name: 'A. Smith' },
  { id: 2, name: 'B. Jones' },
  { id: 3, name: 'C. Reyes' },
  { id: 4, name: 'D. Silva' },
  { id: 5, name: 'E. Lee' },
  { id: 6, name: 'F. Kim' },
  { id: 7, name: 'G. Costa' },
  { id: 8, name: 'H. Nunez' },
  { id: 9, name: 'I. Mendy' },
  { id: 10, name: 'J. Torres' },
  { id: 11, name: 'K. Bruno' },
  { id: 12, name: 'L. Walker' }, // bench
  { id: 13, name: 'M. March' },
];

// Formation template: 11 empty slots
const formationSlots = [
  'GK', 'LB', 'CB1', 'CB2', 'RB', 'CM1', 'CM2', 'CM3', 'LW', 'ST', 'RW',
];

const MatchDetailScreen = () => {
  const { user } = useUser();
  const { activeTeamId } = useActiveTeam();
  const route = useRoute<RouteProp<{ params: MatchDetailRouteParams }, 'params'>>();
  const { matchId } = route.params;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  // Formation selection state
  const [formation, setFormation] = useState<string | null>(null);

  // Assigned player IDs to positions (key = position, value = player ID)
  const [startingLineup, setStartingLineup] = useState<{ [position: string]: number | null }>({});
  const [bench, setBench] = useState<number[]>([]); // player IDs

  const formationOptions = ['4-3-3', '4-4-2', '3-5-2', '3-4-3'];

  // Initialize empty formation positions
  useEffect(() => {
    if (formation) {
      const emptyLineup: { [pos: string]: number | null } = {};
      formationSlots.forEach((pos) => (emptyLineup[pos] = null));
      setStartingLineup(emptyLineup);
    }
  }, [formation]);

  // Fetch match info
  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      try {
        const [data, error] = await getMatchById(matchId);
        if (error) {
          console.error('Error loading match:', error);
          Alert.alert('Error', 'Could not load match.');
          return;
        }
        setMatch(data);
      } catch (err) {
        console.error('Unexpected error:', err);
        Alert.alert('Error', 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  // Loading spinner
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading match...</Text>
      </View>
    );
  }

  if (!match) {
    return (
      <View style={styles.center}>
        <Text>Match not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Match summary */}
      <Text style={styles.title}>Match vs {match.opponent}</Text>
      <Text style={styles.subtitle}>
        {new Date(match.match_date).toLocaleDateString()}
      </Text>
      <Text style={styles.score}>
        {match.team_score ?? '-'} - {match.opponent_score ?? '-'}
      </Text>

      {/* Formation Picker */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Select Formation</Text>
        <View style={styles.formationContainer}>
          {formationOptions.map((f) => (
            <TouchableOpacity
              key={f}
              style={[
                styles.formationButton,
                formation === f && styles.formationSelected,
              ]}
              onPress={() => setFormation(f)}
            >
              <Text style={styles.formationText}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {formation && (
          <Text style={styles.confirmedText}>Selected: {formation}</Text>
        )}
      </View>

      {/* Tactics Board */}
      {formation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Assign Players to Formation</Text>
          {formationSlots.map((position) => (
            <View key={position} style={styles.slotRow}>
              <Text style={styles.slotLabel}>{position}:</Text>
              <Text style={styles.slotValue}>
                {startingLineup[position]
                  ? samplePlayers.find((p) => p.id === startingLineup[position])?.name
                  : 'Unassigned'}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Bench Section */}
      {formation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Bench</Text>
          {bench.length === 0 ? (
            <Text style={styles.placeholder}>No players assigned to bench.</Text>
          ) : (
            bench.map((id) => {
              const player = samplePlayers.find((p) => p.id === id);
              return (
                <Text key={id} style={styles.slotValue}>
                  {player?.name}
                </Text>
              );
            })
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default MatchDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  score: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  formationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  formationButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  formationSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  formationText: {
    color: '#000',
  },
  confirmedText: {
    marginTop: 8,
    color: '#007bff',
    fontWeight: '600',
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotLabel: {
    width: 60,
    fontWeight: '500',
  },
  slotValue: {
    fontStyle: 'italic',
    color: '#444',
  },
  placeholder: {
    fontStyle: 'italic',
    color: '#888',
  },
});
