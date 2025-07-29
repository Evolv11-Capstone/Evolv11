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
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '../../contexts/UserContext';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { createMatch, getMatchesForTeam } from '../../../adapters/matchAdapters';
import type { StackNavigationProp } from '@react-navigation/stack';

type MatchCenterScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

type Match = {
  id: number | string;
  opponent: string;
  team_score: number | null;
  opponent_score: number | null;
  match_date: string;
};

const MatchCenterScreen = ({ navigation }: MatchCenterScreenProps) => {
  const { user } = useUser();
  const { activeTeamId } = useActiveTeam();

  const [opponent, setOpponent] = useState('');
  const [goalsFor, setGoalsFor] = useState('');
  const [goalsAgainst, setGoalsAgainst] = useState('');
  const [matchDate, setMatchDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initializeScreen = async () => {
      if (activeTeamId) {
        await fetchMatches();
      }
      // Add a small delay to ensure smooth rendering
      setTimeout(() => {
        setInitialLoading(false);
      }, 800); // 800ms delay for smooth loading experience
    };

    initializeScreen();
  }, [activeTeamId]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      if (activeTeamId === null) {
        setMatches([]);
        return;
      }
      const [data, error] = await getMatchesForTeam(activeTeamId);
      if (error) {
        setMatches([]);
      } else if (Array.isArray(data)) {
        setMatches(data);
      } else {
        setMatches([]);
      }
    } catch (err) {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

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
      
      // Format date to YYYY-MM-DD for backend
      const formattedDate = matchDate.toISOString().split('T')[0];
      
      await createMatch({
        team_id: activeTeamId,
        opponent,
        team_score: Number(goalsFor) || 0,
        opponent_score: Number(goalsAgainst) || 0,
        match_date: formattedDate,
      });
      setOpponent('');
      setGoalsFor('');
      setGoalsAgainst('');
      setMatchDate(new Date());
      fetchMatches();
    } catch (error) {
      Alert.alert('Error', 'Could not create match.');
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setMatchDate(selectedDate);
    }
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderMatchItem = ({ item }: { item: Match }) => {
    if (!item || typeof item !== 'object' || !item.opponent) return null;
    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => navigation.getParent()?.navigate('MatchDetailScreen', { matchId: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.matchCardRow}>
          <Text style={styles.matchOpponent}>{item.opponent}</Text>
          <Text style={styles.matchDate}>
            {new Date(item.match_date).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreBadge}>{item.team_score ?? '-'}</Text>
          <Text style={styles.scoreDash}>-</Text>
          <Text style={styles.scoreBadge}>{item.opponent_score ?? '-'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (!user || !activeTeamId) {
    return (
      <View style={styles.initialLoader}>
        <View style={styles.loaderContent}>
          <ActivityIndicator size="large" color="#1a4d3a" />
          <Text style={styles.loadingTitle}>Loading Match Center</Text>
          <Text style={styles.loadingSubtitle}>Preparing your matches...</Text>
        </View>
      </View>
    );
  }

  // Show initial loading animation
  if (initialLoading) {
    return (
      <View style={styles.initialLoader}>
        <View style={styles.loaderContent}>
          <ActivityIndicator size="large" color="#1a4d3a" />
          <Text style={styles.loadingTitle}>Loading Match Center</Text>
          <Text style={styles.loadingSubtitle}>Preparing your matches...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Match Center</Text>
        <Text style={styles.subtitle}>Create and manage team matches</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create New Match</Text>
        <TextInput
          style={styles.input}
          placeholder="Opponent Team"
          value={opponent}
          onChangeText={setOpponent}
          placeholderTextColor="#666"
        />
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="Goals For"
            value={goalsFor}
            onChangeText={setGoalsFor}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
          <TextInput
            style={[styles.input, styles.inputHalf]}
            placeholder="Goals Against"
            value={goalsAgainst}
            onChangeText={setGoalsAgainst}
            keyboardType="numeric"
            placeholderTextColor="#666"
          />
        </View>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.datePickerText}>
            {formatDateDisplay(matchDate)}
          </Text>
          <Text style={styles.datePickerLabel}>Match Date</Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={matchDate}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date(2020, 0, 1)}
            maximumDate={new Date(2030, 11, 31)}
          />
        )}
        
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={handleCreateMatch} 
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>Create Match</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Recent Matches</Text>
      <View style={styles.matchesContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#1a4d3a" />
            <Text style={styles.loadingText}>Loading matches...</Text>
          </View>
        ) : (
          <FlatList
            data={Array.isArray(matches) ? matches : []}
            keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
            renderItem={renderMatchItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No matches yet. Create your first match above!</Text>
            }
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

export default MatchCenterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0',
    paddingTop: 20,
    paddingBottom: 100, // Add padding for tab bar
  },
  initialLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3f0',
  },
  loaderContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingTitle: {
    marginTop: 20,
    color: '#1a4d3a',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  loadingSubtitle: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges for Nike-inspired design
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 16,
    letterSpacing: -0.3,
    paddingHorizontal: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d4b896',
    backgroundColor: '#ffffff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 0, // Sharp edges
    fontSize: 16,
    color: '#1a4d3a',
    fontWeight: '500',
  },
  inputHalf: {
    flex: 1,
    marginHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#d4b896',
    backgroundColor: '#ffffff',
    padding: 16,
    marginVertical: 8,
    borderRadius: 0,
    minHeight: 52,
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#1a4d3a',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  datePickerLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '400',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  createButton: {
    backgroundColor: '#1a4d3a',
    borderRadius: 0, // Sharp edges
    paddingVertical: 16,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  matchesContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 0,
    marginHorizontal: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  matchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#d4b896',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  matchCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchOpponent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a4d3a',
    flex: 1,
    letterSpacing: -0.3,
  },
  matchDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    marginLeft: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  scoreBadge: {
    backgroundColor: '#1a4d3a',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    borderRadius: 0, // Sharp edges
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    minWidth: 36,
    textAlign: 'center',
    overflow: 'hidden',
  },
  scoreDash: {
    fontSize: 18,
    color: '#666',
    fontWeight: '700',
    marginHorizontal: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    fontWeight: '400',
  },
});
