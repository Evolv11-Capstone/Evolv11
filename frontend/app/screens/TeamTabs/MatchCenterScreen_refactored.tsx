import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { getTeamSeasons, Season } from '../../../adapters/seasonAdapters';
import { getMatchesForTeam } from '../../../adapters/matchAdapters';
import type { StackNavigationProp } from '@react-navigation/stack';

// Import the new modular components
import SeasonForm from '../../../components/SeasonForm';
import MatchForm from '../../../components/MatchForm';
import MatchCard from '../../../components/MatchCard';

type Match = {
  id: number | string;
  opponent: string;
  team_score: number | null;
  opponent_score: number | null;
  match_date: string;
  season_id?: number;
};

type SeasonWithMatches = Season & {
  matches: Match[];
};

type MatchCenterScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const MatchCenterScreen = ({ navigation }: MatchCenterScreenProps) => {
  const { user } = useUser();
  const { activeTeamId } = useActiveTeam();

  // Main state
  const [seasonsData, setSeasonsData] = useState<SeasonWithMatches[]>([]);
  const [expandedSeasonId, setExpandedSeasonId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isSeasonFormVisible, setIsSeasonFormVisible] = useState(false);
  const [isMatchFormVisible, setIsMatchFormVisible] = useState(false);
  const [selectedSeasonForMatch, setSelectedSeasonForMatch] = useState<Season | null>(null);

  // For managing matches and edits
  const [editingMatch, setEditingMatch] = useState<any>(null);

  useEffect(() => {
    const initializeScreen = async () => {
      if (activeTeamId) {
        await fetchSeasonsWithMatches();
      }
      setLoading(false);
    };

    // Reset expanded state when team changes
    setExpandedSeasonId(null);
    initializeScreen();
  }, [activeTeamId]);

  const fetchSeasonsWithMatches = async () => {
    try {
      if (activeTeamId === null) {
        setSeasonsData([]);
        return;
      }

      // Fetch seasons
      const [seasonsResult, seasonsError] = await getTeamSeasons(activeTeamId);
      if (seasonsError) {
        console.error('Error fetching seasons:', seasonsError);
        Alert.alert('Error', 'Failed to fetch seasons');
        setSeasonsData([]);
        return;
      }

      const seasons = seasonsResult?.data || [];

      // Fetch matches for each season
      const seasonsWithMatches = await Promise.all(
        seasons.map(async (season: Season) => {
          const [matchesResult, matchesError] = await getMatchesForTeam(activeTeamId);
          if (matchesError) {
            console.error('Error fetching matches for season:', season.id, matchesError);
            return { ...season, matches: [] };
          }
          
          const allMatches = matchesResult?.data || [];
          const seasonMatches = allMatches.filter((match: Match) => match.season_id === season.id);
          
          return { ...season, matches: seasonMatches };
        })
      );

      setSeasonsData(seasonsWithMatches);
    } catch (err) {
      console.error('Error in fetchSeasonsWithMatches:', err);
      Alert.alert('Error', 'Failed to fetch seasons and matches');
      setSeasonsData([]);
    }
  };

  const handleSeasonCreated = async () => {
    // Refresh seasons list after creating a new season
    await fetchSeasonsWithMatches();
    setIsSeasonFormVisible(false);
  };

  const handleMatchCreated = async () => {
    // Refresh seasons list to get updated matches
    await fetchSeasonsWithMatches();
    setIsMatchFormVisible(false);
    setSelectedSeasonForMatch(null);
  };

  const handleCreateMatchForSeason = (season: Season) => {
    setSelectedSeasonForMatch(season);
    setIsMatchFormVisible(true);
  };

  const handleSeasonUpdated = async () => {
    // Refresh seasons list after updates (like match deletion)
    await fetchSeasonsWithMatches();
  };

  const handleMatchEdit = (match: any) => {
    setEditingMatch(match);
    // Handle navigation or edit modal opening
  };

  const handleNavigateToMatch = (matchId: number | string) => {
    navigation.navigate('MatchDetails', { matchId });
  };

  const toggleSeasonExpansion = (season: Season) => {
    setExpandedSeasonId(expandedSeasonId === season.id ? null : season.id);
  };

  const renderSeasonCard = ({ item: season }: { item: SeasonWithMatches }) => (
    <View style={styles.seasonCard}>
      <TouchableOpacity
        style={styles.seasonHeader}
        onPress={() => toggleSeasonExpansion(season)}
      >
        <Text style={styles.seasonName}>{season.name}</Text>
        <Text style={styles.seasonDates}>
          {new Date(season.start_date).toLocaleDateString()} - {new Date(season.end_date).toLocaleDateString()}
        </Text>
        <Text style={styles.expandIcon}>
          {expandedSeasonId === season.id ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>

      {expandedSeasonId === season.id && (
        <View style={styles.seasonContent}>
          <TouchableOpacity
            style={styles.createMatchButton}
            onPress={() => handleCreateMatchForSeason(season)}
          >
            <Text style={styles.createMatchButtonText}>+ Create New Match</Text>
          </TouchableOpacity>

          <FlatList
            data={season.matches}
            renderItem={({ item: match }) => (
              <MatchCard
                match={match}
                onNavigateToDetail={handleNavigateToMatch}
                onEdit={handleMatchEdit}
                onMatchUpdated={handleSeasonUpdated}
              />
            )}
            keyExtractor={(match) => match.id.toString()}
            scrollEnabled={false}
            style={styles.matchesList}
            ListEmptyComponent={
              <Text style={styles.noMatchesText}>No matches yet</Text>
            }
          />
        </View>
      )}
    </View>
  );

  if (!user || !activeTeamId) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a4d3a" />
        <View style={styles.centerContainer}>
          <Text style={styles.noTeamText}>Please select a team to manage matches</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1a4d3a" />
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#d4b896" />
          <Text style={styles.loadingText}>Loading seasons...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a4d3a" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Match Center</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsSeasonFormVisible(true)}
        >
          <Text style={styles.createButtonText}>+ New Season</Text>
        </TouchableOpacity>
      </View>

      {/* Seasons List */}
      <FlatList
        data={seasonsData}
        renderItem={renderSeasonCard}
        keyExtractor={(item) => item.id.toString()}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        contentContainerStyle={seasonsData.length === 0 ? styles.emptyListContainer : undefined}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No seasons found</Text>
            <Text style={styles.emptySubtext}>Create your first season to start managing matches</Text>
          </View>
        }
      />

      {/* Season Form Component */}
      <Modal visible={isSeasonFormVisible} animationType="slide" presentationStyle="pageSheet">
        <SeasonForm
          activeTeamId={activeTeamId}
          onSeasonCreated={handleSeasonCreated}
        />
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => setIsSeasonFormVisible(false)}
        >
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </Modal>

      {/* Match Form Modal */}
      {selectedSeasonForMatch && (
        <MatchForm
          visible={isMatchFormVisible}
          onClose={() => {
            setIsMatchFormVisible(false);
            setSelectedSeasonForMatch(null);
          }}
          onMatchCreated={handleMatchCreated}
          selectedSeason={selectedSeasonForMatch}
          activeTeamId={activeTeamId}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a4d3a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a4d3a',
    borderBottomWidth: 1,
    borderBottomColor: '#2a5d4a',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d4b896',
  },
  createButton: {
    backgroundColor: '#d4b896',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 0,
  },
  createButtonText: {
    color: '#1a4d3a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: {
    flex: 1,
    padding: 16,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4b896',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#a0a0a0',
    textAlign: 'center',
    lineHeight: 20,
  },
  noTeamText: {
    fontSize: 18,
    color: '#d4b896',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#d4b896',
    marginTop: 16,
  },
  // Season card styles
  seasonCard: {
    backgroundColor: '#2a5d4a',
    marginBottom: 16,
    borderRadius: 0,
  },
  seasonHeader: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seasonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4b896',
    flex: 1,
  },
  seasonDates: {
    fontSize: 14,
    color: '#a0a0a0',
    marginHorizontal: 12,
  },
  expandIcon: {
    fontSize: 16,
    color: '#d4b896',
    fontWeight: 'bold',
  },
  seasonContent: {
    padding: 16,
    paddingTop: 0,
  },
  createMatchButton: {
    backgroundColor: '#d4b896',
    padding: 12,
    borderRadius: 0,
    marginBottom: 16,
    alignItems: 'center',
  },
  createMatchButtonText: {
    color: '#1a4d3a',
    fontWeight: 'bold',
    fontSize: 16,
  },
  matchesList: {
    maxHeight: 400,
  },
  noMatchesText: {
    color: '#a0a0a0',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  closeButton: {
    backgroundColor: '#d4b896',
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 0,
  },
  closeButtonText: {
    color: '#1a4d3a',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MatchCenterScreen;
