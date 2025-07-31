import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '../../contexts/UserContext';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { 
  getTeamSeasons, 
  createSeason, 
  updateSeasonStatus,
  deleteSeason,
  Season 
} from '../../../adapters/seasonAdapters';
import { getMatchesForTeam } from '../../../adapters/matchAdapters';
import type { StackNavigationProp } from '@react-navigation/stack';

type SeasonManagementScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

type Match = {
  id: number | string;
  opponent: string;
  team_score: number | null;
  opponent_score: number | null;
  match_date: string;
  season_id?: number;
};

const SeasonManagementScreen = ({ navigation }: SeasonManagementScreenProps) => {
  const { user } = useUser();
  const { activeTeamId } = useActiveTeam();

  // Create season form state
  const [seasonName, setSeasonName] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().setMonth(new Date().getMonth() + 3)));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Data state
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteSeasonCandidate, setDeleteSeasonCandidate] = useState<Season | null>(null);
  const [deleteConfirmationName, setDeleteConfirmationName] = useState('');

  // Season matches modal state
  const [showSeasonMatchesModal, setShowSeasonMatchesModal] = useState(false);
  const [seasonMatches, setSeasonMatches] = useState<Match[]>([]);

  useEffect(() => {
    const initializeScreen = async () => {
      if (activeTeamId) {
        await fetchSeasons();
        await fetchMatches();
      }
      setTimeout(() => {
        setInitialLoading(false);
      }, 800);
    };

    initializeScreen();
  }, [activeTeamId]);

  const fetchSeasons = async () => {
    setLoading(true);
    try {
      if (activeTeamId === null) {
        setSeasons([]);
        return;
      }
      const [data, error] = await getTeamSeasons(activeTeamId);
      if (error) {
        console.error('Error fetching seasons:', error);
        setSeasons([]);
      } else if (data && data.data && Array.isArray(data.data)) {
        setSeasons(data.data);
      } else {
        setSeasons([]);
      }
    } catch (err) {
      console.error('Error in fetchSeasons:', err);
      setSeasons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
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
    }
  };

  const handleCreateSeason = async () => {
    if (!seasonName.trim() || !startDate || !endDate) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Invalid Dates', 'Start date must be before end date.');
      return;
    }

    try {
      if (activeTeamId === null) {
        Alert.alert('Error', 'No active team selected.');
        return;
      }

      const seasonData = {
        team_id: activeTeamId,
        name: seasonName.trim(),
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      };

      const [data, error] = await createSeason(seasonData);
      
      if (error) {
        Alert.alert('Error', error.message || 'Could not create season.');
        return;
      }

      // Clear form
      setSeasonName('');
      setStartDate(new Date());
      setEndDate(new Date(new Date().setMonth(new Date().getMonth() + 3)));
      
      await fetchSeasons();
      Alert.alert('Success', 'Season created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not create season.');
    }
  };

  const handleSeasonTap = (season: Season) => {
    // Filter matches that belong to this season
    const filteredMatches = matches.filter(match => match.season_id === season.id);
    setSeasonMatches(filteredMatches);
    setSelectedSeason(season);
    setShowSeasonMatchesModal(true);
  };

  const handleDeleteSeason = (season: Season) => {
    setDeleteSeasonCandidate(season);
    setDeleteConfirmationName('');
    setShowDeleteModal(true);
  };

  const confirmDeleteSeason = async () => {
    if (!deleteSeasonCandidate) return;

    if (deleteConfirmationName.trim() !== deleteSeasonCandidate.name) {
      Alert.alert(
        'Name Mismatch', 
        'The season name you entered does not match. Please enter the exact season name to confirm deletion.'
      );
      return;
    }

    try {
      // Check if season has matches
      const seasonMatches = matches.filter(match => match.season_id === deleteSeasonCandidate.id);
      
      if (seasonMatches.length > 0) {
        Alert.alert(
          'Cannot Delete Season',
          `This season has ${seasonMatches.length} match(es) associated with it. Please delete all matches in this season first.`
        );
        return;
      }

      // Call delete API
      const [data, error] = await deleteSeason(deleteSeasonCandidate.id);
      
      if (error) {
        Alert.alert('Error', error.message || 'Could not delete season.');
        return;
      }

      Alert.alert('Success', 'Season deleted successfully!');
      
      setShowDeleteModal(false);
      setDeleteSeasonCandidate(null);
      setDeleteConfirmationName('');
      await fetchSeasons();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not delete season.');
    }
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const onStartDateChange = (event: any, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const onEndDateChange = (event: any, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const renderSeasonItem = ({ item }: { item: Season }) => {
    const seasonMatches = matches.filter(match => match.season_id === item.id);
    const translateX = new Animated.Value(0);
    const deleteButtonOpacity = new Animated.Value(0);

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderGrant: () => {
        translateX.setOffset(0);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
          if (gestureState.dx < -20) {
            Animated.timing(deleteButtonOpacity, {
              toValue: 1,
              duration: 150,
              useNativeDriver: false,
            }).start();
          } else {
            Animated.timing(deleteButtonOpacity, {
              toValue: 0,
              duration: 150,
              useNativeDriver: false,
            }).start();
          }
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dx < -80) {
          handleDeleteSeason(item);
        }
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
        Animated.timing(deleteButtonOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }).start();
      },
    });

    return (
      <View style={styles.seasonCard}>
        <Animated.View
          style={[
            styles.deleteButtonContainer,
            { opacity: deleteButtonOpacity }
          ]}
        >
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteSeason(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>DELETE</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.seasonCardAnimated,
            { transform: [{ translateX }] }
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.seasonCardMain}
            onPress={() => handleSeasonTap(item)}
            activeOpacity={0.85}
          >
            <View style={styles.seasonHeader}>
              <Text style={styles.seasonName}>{item.name}</Text>
              {item.is_active && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              )}
            </View>
            
            <View style={styles.seasonDates}>
              <Text style={styles.dateRange}>
                {formatDateShort(item.start_date)} - {formatDateShort(item.end_date)}
              </Text>
            </View>
            
            <View style={styles.seasonStats}>
              <Text style={styles.matchCount}>
                {seasonMatches.length} match{seasonMatches.length !== 1 ? 'es' : ''}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  };

  if (!user || !activeTeamId) {
    return (
      <View style={styles.initialLoader}>
        <View style={styles.loaderContent}>
          <ActivityIndicator size="large" color="#1a4d3a" />
          <Text style={styles.loadingTitle}>Loading Season Management</Text>
          <Text style={styles.loadingSubtitle}>Preparing your seasons...</Text>
        </View>
      </View>
    );
  }

  if (initialLoading) {
    return (
      <View style={styles.initialLoader}>
        <View style={styles.loaderContent}>
          <ActivityIndicator size="large" color="#1a4d3a" />
          <Text style={styles.loadingTitle}>Loading Season Management</Text>
          <Text style={styles.loadingSubtitle}>Preparing your seasons...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Season Management</Text>
        <Text style={styles.subtitle}>Create and manage team seasons</Text>
      </View>

      {/* Create Season Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Create New Season</Text>
        <TextInput
          style={styles.input}
          placeholder="Season Name (e.g., Spring 2025)"
          value={seasonName}
          onChangeText={setSeasonName}
          placeholderTextColor="#666"
        />
        
        <View style={styles.row}>
          <TouchableOpacity 
            style={[styles.datePickerButton, styles.inputHalf]}
            onPress={() => setShowStartDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.datePickerText}>
              {formatDateDisplay(startDate)}
            </Text>
            <Text style={styles.datePickerLabel}>Start Date</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.datePickerButton, styles.inputHalf]}
            onPress={() => setShowEndDatePicker(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.datePickerText}>
              {formatDateDisplay(endDate)}
            </Text>
            <Text style={styles.datePickerLabel}>End Date</Text>
          </TouchableOpacity>
        </View>
        
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={onStartDateChange}
            minimumDate={new Date(2020, 0, 1)}
            maximumDate={new Date(2030, 11, 31)}
          />
        )}
        
        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={onEndDateChange}
            minimumDate={startDate}
            maximumDate={new Date(2030, 11, 31)}
          />
        )}
        
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={handleCreateSeason} 
          activeOpacity={0.8}
        >
          <Text style={styles.createButtonText}>Create Season</Text>
        </TouchableOpacity>
      </View>

      {/* Seasons Section */}
      <View style={styles.seasonsSectionContainer}>
        <Text style={styles.seasonsSectionTitle}>Team Seasons</Text>
        <Text style={styles.instructionText}>
          Tap to view matches • Swipe left to delete
        </Text>
        <View style={styles.seasonsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1a4d3a" />
              <Text style={styles.loadingText}>Loading seasons...</Text>
            </View>
          ) : (
            <FlatList
              data={seasons}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderSeasonItem}
              ListEmptyComponent={
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyText}>No seasons yet</Text>
                  <Text style={styles.emptySubtext}>Create your first season above to get started!</Text>
                </View>
              }
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Season</Text>
            <Text style={styles.warningText}>
              This action cannot be undone. To confirm deletion, please type the season name exactly:
            </Text>
            <Text style={styles.seasonNameHighlight}>
              {deleteSeasonCandidate?.name}
            </Text>
            
            <TextInput
              style={styles.confirmationInput}
              placeholder="Type season name here"
              value={deleteConfirmationName}
              onChangeText={setDeleteConfirmationName}
              placeholderTextColor="#666"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => {
                  setShowDeleteModal(false);
                  setDeleteSeasonCandidate(null);
                  setDeleteConfirmationName('');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.modalButtonDanger,
                  deleteConfirmationName.trim() !== deleteSeasonCandidate?.name && styles.modalButtonDisabled
                ]}
                onPress={confirmDeleteSeason}
                activeOpacity={0.8}
                disabled={deleteConfirmationName.trim() !== deleteSeasonCandidate?.name}
              >
                <Text style={styles.modalButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Season Matches Modal */}
      <Modal
        visible={showSeasonMatchesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSeasonMatchesModal(false)}
      >
        <View style={styles.matchesModalOverlay}>
          <View style={styles.matchesModalContent}>
            <View style={styles.matchesModalHeader}>
              <Text style={styles.matchesModalTitle}>
                {selectedSeason?.name} Matches
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowSeasonMatchesModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={seasonMatches}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <View style={styles.matchItem}>
                  <View style={styles.matchItemRow}>
                    <Text style={styles.matchOpponent}>{item.opponent}</Text>
                    <Text style={styles.matchDate}>
                      {new Date(item.match_date).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.matchScoreRow}>
                    <Text style={styles.matchScore}>
                      {item.team_score ?? '-'} - {item.opponent_score ?? '-'}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.emptyMatchesContainer}>
                  <Text style={styles.emptyMatchesText}>No matches in this season yet</Text>
                </View>
              }
              contentContainerStyle={styles.matchesList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SeasonManagementScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0',
    paddingTop: 20,
    paddingBottom: 100,
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
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    color: '#1a4d3a',
    fontSize: 18,
    fontWeight: '600',
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 8,
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
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
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
    fontSize: 18,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d4b896',
    backgroundColor: '#ffffff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 0,
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
    padding: 12,
    marginVertical: 6,
    borderRadius: 0,
    minHeight: 48,
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
    borderRadius: 0,
    paddingVertical: 14,
    marginTop: 12,
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
  seasonsSectionContainer: {
    flex: 1,
    marginTop: 8,
  },
  seasonsSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 8,
    letterSpacing: -0.3,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    marginBottom: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  seasonsContainer: {
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
    minHeight: 400,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  seasonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 0,
    marginHorizontal: 20,
    marginBottom: 16,
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
    overflow: 'visible',
    position: 'relative',
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#dc3545',
    zIndex: 1,
  },
  deleteButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  seasonCardAnimated: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    position: 'relative',
  },
  seasonCardMain: {
    padding: 20,
  },
  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seasonName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a4d3a',
    flex: 1,
    letterSpacing: -0.3,
  },
  activeBadge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
    marginLeft: 8,
  },
  activeBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  seasonDates: {
    marginBottom: 8,
  },
  dateRange: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  seasonStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchCount: {
    fontSize: 14,
    color: '#1a4d3a',
    fontWeight: '600',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#1a4d3a',
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '400',
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    marginHorizontal: 20,
    maxWidth: 400,
    width: '90%',
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc3545',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  warningText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    lineHeight: 22,
  },
  seasonNameHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a4d3a',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 0,
    marginBottom: 16,
    textAlign: 'center',
    borderLeftWidth: 3,
    borderLeftColor: '#d4b896',
  },
  confirmationInput: {
    borderWidth: 2,
    borderColor: '#dc3545',
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 20,
    borderRadius: 0,
    fontSize: 16,
    color: '#1a4d3a',
    fontWeight: '500',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 0,
  },
  modalButtonSecondary: {
    backgroundColor: '#666',
  },
  modalButtonDanger: {
    backgroundColor: '#dc3545',
  },
  modalButtonDisabled: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  matchesModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  matchesModalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  matchesModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  matchesModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a4d3a',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  matchesList: {
    padding: 20,
  },
  matchItem: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginBottom: 12,
    borderRadius: 0,
    borderLeftWidth: 3,
    borderLeftColor: '#1a4d3a',
  },
  matchItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  matchOpponent: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a4d3a',
    flex: 1,
  },
  matchDate: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  matchScoreRow: {
    alignItems: 'center',
  },
  matchScore: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a4d3a',
  },
  emptyMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyMatchesText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
});
