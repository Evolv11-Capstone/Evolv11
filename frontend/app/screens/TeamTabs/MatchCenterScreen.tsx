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
  TextInput,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '../../contexts/UserContext';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { getTeamSeasons, Season } from '../../../adapters/seasonAdapters';
import { getMatchesForTeam, updateMatch } from '../../../adapters/matchAdapters';
import type { StackNavigationProp } from '@react-navigation/stack';

// Import the new modular components
import SeasonForm from '../../../components/SeasonForm';
import MatchForm from '../../../components/MatchForm';
import SeasonCard from '../../../components/SeasonCard';
import UpdateMatchForm from '../../../components/UpdateMatchForm';

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
  const [isUpdateFormVisible, setIsUpdateFormVisible] = useState(false);

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

      console.log('Fetching seasons for team:', activeTeamId);

      // Fetch seasons
      const [seasonsResult, seasonsError] = await getTeamSeasons(activeTeamId);
      if (seasonsError) {
        console.error('Error fetching seasons:', seasonsError);
        Alert.alert('Error', 'Failed to fetch seasons');
        setSeasonsData([]);
        return;
      }

      const seasons = seasonsResult?.data || [];
      console.log('Fetched seasons:', seasons.length, seasons.map((s: Season) => ({ id: s.id, name: s.name })));

      // Fetch ALL matches for the team once (more efficient than fetching for each season)
      const [allMatchesResult, matchesError] = await getMatchesForTeam(activeTeamId);
      if (matchesError) {
        console.error('Error fetching matches for team:', activeTeamId, matchesError);
        // Don't return early - continue with empty matches
      }
      
      const allMatches = allMatchesResult?.data || [];
      console.log('Fetched all matches:', allMatches.length);
      console.log('Sample match data:', allMatches[0]);
      
      // Group matches by season
      const seasonsWithMatches = seasons.map((season: Season) => {
        const seasonMatches = allMatches.filter((match: Match) => {
          console.log(`Checking match ${match.id}: season_id=${match.season_id} vs season=${season.id}`);
          return match.season_id === season.id;
        });
        
        console.log(`Season ${season.name} (${season.id}) has ${seasonMatches.length} matches`);
        
        return {
          ...season,
          matches: seasonMatches
        };
      });

      setSeasonsData(seasonsWithMatches);
      console.log('Final seasons data:', seasonsWithMatches.map((s: SeasonWithMatches) => ({ 
        name: s.name, 
        matchCount: s.matches.length 
      })));
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
    setIsUpdateFormVisible(true);
  };

  const handleSeasonEdit = (season: Season) => {
    // TODO: Implement season edit modal or navigation
    Alert.alert('Edit Season', `Edit functionality for "${season.name}" will be implemented soon.`);
  };

  const closeEditModal = () => {
    setIsUpdateFormVisible(false);
    setEditingMatch(null);
  };

  const handleNavigateToMatch = (matchId: number | string) => {
    // Navigate to the root stack's MatchDetailScreen
    navigation.getParent()?.navigate('MatchDetailScreen', { matchId });
  };

  const toggleSeasonExpansion = (season: Season) => {
    setExpandedSeasonId(expandedSeasonId === season.id ? null : season.id);
  };

  const renderSeasonCard = ({ item: season }: { item: SeasonWithMatches }) => {
    console.log('Rendering season:', season.name, 'with matches:', season.matches.length);
    return (
      <SeasonCard
        season={season}
        matches={season.matches}
        isExpanded={expandedSeasonId === season.id}
        onToggleExpand={toggleSeasonExpansion}
        onCreateMatch={handleCreateMatchForSeason}
        onNavigateToMatch={handleNavigateToMatch}
        onEditMatch={handleMatchEdit}
        onMatchUpdated={handleSeasonUpdated}
        onSeasonUpdated={handleSeasonUpdated}
      />
    );
  };

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
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.title}>Match Center</Text>
        <Text style={styles.subtitle}>Organize seasons, schedule matches, and track your team's progress</Text>
      </View>
      
      {/* Seasons List */}
      <View style={styles.listContainer}>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setIsSeasonFormVisible(true)}
          >
            <Text style={styles.createButtonText}>+ New Season</Text>
          </TouchableOpacity>
        </View>
        
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
      </View>

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

      {/* Update Match Form Component */}
      <UpdateMatchForm
        visible={isUpdateFormVisible}
        match={editingMatch}
        onClose={closeEditModal}
        onMatchUpdated={handleSeasonUpdated}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    lineHeight: 22,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  createButton: {
    backgroundColor: '#d4b896',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 0,
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
    color: '#1a4d3a',
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    flex: 1,
    backgroundColor: '#f5f3f0',
  },
  list: {
    flex: 1,
    paddingTop: 16,
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
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  noTeamText: {
    fontSize: 18,
    color: '#1a4d3a',
    textAlign: 'center',
    fontWeight: '600',
  },
  loadingText: {
    fontSize: 16,
    color: '#1a4d3a',
    marginTop: 16,
    fontWeight: '500',
  },
  
  // Modal styles
  closeButton: {
    backgroundColor: '#1a4d3a',
    padding: 16,
    alignItems: 'center',
    margin: 16,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  closeButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Edit modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editModalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d4b896',
    backgroundColor: '#f5f3f0',
  },
  editModalCloseText: {
    color: '#1a4d3a',
    fontSize: 18,
    fontWeight: '600',
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a4d3a',
    letterSpacing: -0.3,
  },
  editModalSpacer: {
    width: 20,
  },
  editModalBody: {
    flex: 1,
  },
  editFormContainer: {
    padding: 20,
  },
  editInputGroup: {
    marginBottom: 16,
  },
  editInputGroupHalf: {
    flex: 1,
    marginHorizontal: 6,
  },
  editRowContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    marginHorizontal: -6,
  },
  editLabel: {
    color: '#1a4d3a',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#d4b896',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 0,
    fontSize: 16,
    color: '#1a4d3a',
    fontWeight: '500',
  },
  editInputHalf: {
    flex: 1,
  },
  editDateInput: {
    borderWidth: 1,
    borderColor: '#d4b896',
    backgroundColor: '#ffffff',
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 0,
  },
  editDateText: {
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: '500',
  },
  editUpdateButton: {
    backgroundColor: '#1a4d3a',
    borderRadius: 0,
    paddingVertical: 14,
    marginTop: 20,
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
  editUpdateButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Date picker modal styles
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d4b896',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a4d3a',
    letterSpacing: -0.3,
  },
  datePickerButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a4d3a',
  },
  datePicker: {
    backgroundColor: '#ffffff',
  },
});

export default MatchCenterScreen;
