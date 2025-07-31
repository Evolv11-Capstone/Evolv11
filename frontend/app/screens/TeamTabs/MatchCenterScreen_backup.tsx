import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useUser } from '../../contexts/UserContext';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { getMatchesForTeam, updateMatch } from '../../../adapters/matchAdapters';
import { getTeamSeasons, Season } from '../../../adapters/seasonAdapters';
import type { StackNavigationProp } from '@react-navigation/stack';

// Import the new components
import SeasonForm from '../../../components/SeasonForm';
import MatchForm from '../../../components/MatchForm';
import SeasonCard from '../../../components/SeasonCard';

// Import the edit modal components
import DateTimePicker from '@react-native-community/datetimepicker';
import { TextInput } from 'react-native';

type MatchCenterScreenProps = {
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

const MatchCenterScreen = ({ navigation }: MatchCenterScreenProps) => {
  const { user } = useUser();
  const { activeTeamId } = useActiveTeam();

  // Season management state
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [expandedSeasonId, setExpandedSeasonId] = useState<number | null>(null);
  const [seasonName, setSeasonName] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() + 3)));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loadingSeasons, setLoadingSeasons] = useState(false);
  const [showCreateMatchModal, setShowCreateMatchModal] = useState(false);

  // Match creation state
  // Match creation state  
  const [opponentTeam, setOpponentTeam] = useState('');
  const [goalsFor, setGoalsFor] = useState('');
  const [goalsAgainst, setGoalsAgainst] = useState('');
  const [matchDate, setMatchDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit functionality state
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editOpponent, setEditOpponent] = useState('');
  const [editGoalsFor, setEditGoalsFor] = useState('');
  const [editGoalsAgainst, setEditGoalsAgainst] = useState('');
  const [editMatchDate, setEditMatchDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const initializeScreen = async () => {
      if (activeTeamId) {
        await fetchSeasons();
        await fetchMatches();
      }
      // Add a small delay to ensure smooth rendering
      setTimeout(() => {
        setInitialLoading(false);
      }, 800); // 800ms delay for smooth loading experience
    };

    // Reset modal states when activeTeamId changes
    setExpandedSeasonId(null);
    setShowCreateMatchModal(false);
    setSelectedSeason(null);

    initializeScreen();
  }, [activeTeamId]);

  const fetchSeasons = async () => {
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
    }
  };

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

  const handleCreateSeason = async () => {
    if (!seasonName.trim() || !startDate || !endDate) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Invalid Dates', 'Start date must be before end date.');
      return;
    }

    setLoading(true); // Set loading state for the form

    try {
      if (activeTeamId === null) {
        Alert.alert('Error', 'No active team selected.');
        setLoading(false);
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
        setLoading(false);
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
    } finally {
      setLoading(false); // Always reset loading state
    }
  };

  const handleSeasonTap = (season: Season) => {
    console.log('Season tapped:', season.name);
    
    // If this season is already expanded, collapse it
    if (expandedSeasonId === season.id) {
      setExpandedSeasonId(null);
      setSelectedSeason(null);
    } else {
      // Expand this season and collapse any others
      setExpandedSeasonId(season.id);
      setSelectedSeason(season);
    }
  };

  const closeSeasonDetailModal = () => {
    console.log('Closing season detail modal');
    setExpandedSeasonId(null);
    setSelectedSeason(null);
    // Reset any form state that might be stuck
    setShowCreateMatchModal(false);
    setOpponentTeam('');
    setGoalsFor('');
    setGoalsAgainst('');
    setMatchDate(new Date());
  };

  const handleCreateMatch = async () => {
    if (!opponentTeam || !matchDate) {
      Alert.alert('Missing Fields', 'Please fill in opponent team and match date.');
      return;
    }

    if (!selectedSeason) {
      Alert.alert('Error', 'No season selected.');
      return;
    }

    setLoading(true); // Set loading state

    try {
      if (activeTeamId === null) {
        Alert.alert('Error', 'No active team selected.');
        return;
      }
      
      // Format date to YYYY-MM-DD for backend
      const formattedDate = matchDate.toISOString().split('T')[0];
      
      // Use the new createMatch with season validation
      const [data, error] = await createMatch({
        team_id: activeTeamId,
        season_id: selectedSeason.id,
        opponent: opponentTeam,
        team_score: Number(goalsFor) || 0,
        opponent_score: Number(goalsAgainst) || 0,
        match_date: formattedDate,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Could not create match.');
        return;
      }

      // Clear form and close modals
      closeCreateMatchModal();
      
      await fetchMatches();
      Alert.alert('Success', 'Match created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not create match.');
      // Keep the season expanded if there's an error
    } finally {
      setLoading(false);
    }
  };

  const closeCreateMatchModal = () => {
    console.log('Closing create match modal');
    setShowCreateMatchModal(false);
    setOpponentTeam('');
    setGoalsFor('');
    setGoalsAgainst('');
    setMatchDate(new Date());
    setShowDatePicker(false);
    // Keep the season expanded when match creation is closed
  };

  // Debug modal states
  console.log('Modal States:', {
    expandedSeasonId,
    showCreateMatchModal,
    selectedSeason: selectedSeason?.name
  });

  // Additional debug - track when match modal should be visible
  if (showCreateMatchModal) {
    console.log('Match creation modal should be visible now');
  }

  const handleEditMatch = (match: Match) => {
    setEditingMatch(match);
    setEditOpponent(match.opponent);
    setEditGoalsFor(match.team_score?.toString() || '');
    setEditGoalsAgainst(match.opponent_score?.toString() || '');
    setEditMatchDate(new Date(match.match_date));
    setShowEditModal(true);
  };

  const handleUpdateMatch = async () => {
    if (!editingMatch || !editOpponent) {
      Alert.alert('Missing Fields', 'Please fill in opponent name.');
      return;
    }

    try {
      const formattedDate = editMatchDate.toISOString().split('T')[0];
      
      await updateMatch(Number(editingMatch.id), {
        opponent: editOpponent,
        team_score: Number(editGoalsFor) || 0,
        opponent_score: Number(editGoalsAgainst) || 0,
        match_date: formattedDate,
      });

      setShowEditModal(false);
      setEditingMatch(null);
      fetchMatches();
      Alert.alert('Success', 'Match updated successfully.');
    } catch (error) {
      Alert.alert('Error', 'Could not update match.');
    }
  };

  const handleDeleteMatch = (match: Match) => {
    Alert.alert(
      'Delete Match',
      `Are you sure you want to delete the match against ${match.opponent}? This will also delete all related data including lineups, player stats, and reviews.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMatch(Number(match.id));
              fetchMatches();
              Alert.alert('Success', 'Match deleted successfully.');
            } catch (error) {
              Alert.alert('Error', 'Could not delete match.');
            }
          }
        }
      ]
    );
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingMatch(null);
    setEditOpponent('');
    setEditGoalsFor('');
    setEditGoalsAgainst('');
    setEditMatchDate(new Date());
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    console.log('Start date changed:', selectedDate);
    setShowStartDatePicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    console.log('End date changed:', selectedDate);
    setShowEndDatePicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    console.log('Match date changed:', selectedDate);
    setShowDatePicker(false);
    if (selectedDate) {
      setMatchDate(selectedDate);
      console.log('New match date set:', selectedDate);
    }
  };

  const handleEditDateChange = (event: any, selectedDate?: Date) => {
    console.log('Edit date changed:', selectedDate);
    setShowEditDatePicker(false);
    if (selectedDate) {
      setEditMatchDate(selectedDate);
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

  const renderSeasonItem = ({ item }: { item: Season }) => {
    const seasonMatches = matches.filter(match => match.season_id === item.id);
    const isExpanded = expandedSeasonId === item.id;
    
    return (
      <View style={styles.seasonContainer}>
        <TouchableOpacity
          style={[styles.seasonCard, isExpanded && styles.seasonCardExpanded]}
          onPress={() => {
            console.log('Season card pressed:', item.name, 'ID:', item.id);
            handleSeasonTap(item);
          }}
          activeOpacity={0.85}
        >
          <View style={styles.seasonHeader}>
            <Text style={styles.seasonName}>{item.name}</Text>
            <View style={styles.seasonHeaderRight}>
              {item.is_active && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              )}
              <Text style={styles.dropdownArrow}>{isExpanded ? '▼' : '▶'}</Text>
            </View>
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

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.seasonExpandedContent}>
            <TouchableOpacity
              style={styles.createMatchButton}
              onPress={() => {
                console.log('Create New Match button pressed for season:', item.name);
                setShowCreateMatchModal(true);
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.createMatchButtonText}>Create New Match</Text>
            </TouchableOpacity>

            <View style={styles.matchesSection}>
              <Text style={styles.matchesSectionTitle}>Season Matches</Text>
              {seasonMatches.length === 0 ? (
                <Text style={styles.noMatchesText}>
                  No matches yet for this season
                </Text>
              ) : (
                <FlatList
                  data={seasonMatches}
                  renderItem={renderMatchItem}
                  keyExtractor={(item) => item.id?.toString() || ''}
                  showsVerticalScrollIndicator={false}
                  scrollEnabled={false}
                  contentContainerStyle={{ paddingBottom: 20 }}
                />
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderMatchItem = ({ item }: { item: Match }) => {
    if (!item || typeof item !== 'object' || !item.opponent) return null;

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
        // Only allow left swipe (negative dx)
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
          // Show delete button when swiping left
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
          // Trigger delete if swiped far enough
          handleDeleteMatch(item);
        }
        // Reset position
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
      <View style={styles.matchCard}>
        <Animated.View
          style={[
            styles.deleteButtonContainer,
            {
              opacity: deleteButtonOpacity,
            }
          ]}
        >
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteMatch(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>DELETE</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.matchCardAnimated,
            {
              transform: [{ translateX }],
            }
          ]}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.matchCardMain}
            onPress={() => {
              // Safely navigate with error handling
              try {
                const parentNavigator = navigation.getParent();
                if (parentNavigator) {
                  parentNavigator.navigate('MatchDetailScreen', { matchId: item.id });
                } else {
                  // Fallback: use current navigation if parent not available
                  navigation.navigate('MatchDetailScreen', { matchId: item.id });
                }
              } catch (error) {
                console.log('Navigation error:', error);
                // Show alert if navigation fails
                Alert.alert('Error', 'Could not open match details');
              }
            }}
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
          
          {/* Edit pencil icon in bottom-right */}
          <TouchableOpacity
            style={styles.editIconButton}
            onPress={() => handleEditMatch(item)}
            activeOpacity={0.7}
          >
            <View style={styles.editIconContainer}>
              <Text style={styles.editIcon}>✎</Text>
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
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
      {/* Season Creation Form */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>Create New Season</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Season Name</Text>
          <TextInput
            style={styles.input}
            value={seasonName}
            onChangeText={setSeasonName}
            placeholder="e.g., Spring 2025"
            placeholderTextColor="#666"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={[styles.dateText, { color: startDate ? '#1a4d3a' : '#666' }]}>
              {startDate ? formatDateDisplay(startDate) : 'Select start date'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Date</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={[styles.dateText, { color: endDate ? '#1a4d3a' : '#666' }]}>
              {endDate ? formatDateDisplay(endDate) : 'Select end date'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.seasonCreateButton}
          onPress={handleCreateSeason}
          disabled={loading}
        >
          <Text style={styles.seasonCreateButtonText}>
            {loading ? 'Creating...' : 'Create Season'}
          </Text>
        </TouchableOpacity>

        {/* Date Pickers for Season Form */}
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}

        {showEndDatePicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
      </View>

      {/* Season Cards List */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Your Seasons</Text>
        {loadingSeasons ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#32C759" />
            <Text style={styles.loadingText}>Loading seasons...</Text>
          </View>
        ) : seasons.length === 0 ? (
          <Text style={styles.emptyText}>
            Create your first season to start tracking matches
          </Text>
        ) : (
          <FlatList
            data={seasons}
            renderItem={renderSeasonItem}
            keyExtractor={(item) => item.id?.toString() || ''}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>



      {/* Match Creation Modal */}
      <Modal
        visible={showCreateMatchModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeCreateMatchModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                console.log('Closing match creation modal via X button');
                closeCreateMatchModal();
              }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Match for {selectedSeason?.name}</Text>
            <View style={styles.modalSpacer} />
          </View>

          <ScrollView style={styles.modalContent}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Opponent Team</Text>
                <TextInput
                  style={styles.input}
                  value={opponentTeam}
                  onChangeText={setOpponentTeam}
                  placeholder="Enter opponent team name"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Match Date</Text>
                <TouchableOpacity
                  style={styles.dateInput}
                  onPress={() => {
                    console.log('Date picker button pressed');
                    setShowDatePicker(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateText, { color: matchDate ? '#1a4d3a' : '#666' }]}>
                    {matchDate ? formatDateDisplay(matchDate) : 'Select match date'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.inputHalf]}>
                  <Text style={styles.label}>Goals For</Text>
                  <TextInput
                    style={styles.input}
                    value={goalsFor}
                    onChangeText={setGoalsFor}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                  />
                </View>
                <View style={[styles.inputGroup, styles.inputHalf]}>
                  <Text style={styles.label}>Goals Against</Text>
                  <TextInput
                    style={styles.input}
                    value={goalsAgainst}
                    onChangeText={setGoalsAgainst}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateMatch}
                disabled={loading}
              >
                <Text style={styles.createButtonText}>
                  {loading ? 'Creating...' : 'Create Match'}
                </Text>
              </TouchableOpacity>

              {/* Date Picker for Match Creation - Inside Modal */}
              {showDatePicker && (
                <View style={styles.datePickerContainer}>
                  <DateTimePicker
                    value={matchDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={handleDateChange}
                    minimumDate={new Date(2020, 0, 1)}
                    maximumDate={new Date(2030, 11, 31)}
                  />
                  {Platform.OS === 'android' && (
                    <TouchableOpacity
                      style={styles.datePickerCloseButton}
                      onPress={() => {
                        console.log('Closing date picker manually');
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.datePickerCloseText}>Cancel</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </View>
      </Modal>

      {/* Edit Match Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Match</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Opponent Team"
              value={editOpponent}
              onChangeText={setEditOpponent}
              placeholderTextColor="#666"
            />
            
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Goals For"
                value={editGoalsFor}
                onChangeText={setEditGoalsFor}
                keyboardType="numeric"
                placeholderTextColor="#666"
              />
              <TextInput
                style={[styles.input, styles.inputHalf]}
                placeholder="Goals Against"
                value={editGoalsAgainst}
                onChangeText={setEditGoalsAgainst}
                keyboardType="numeric"
                placeholderTextColor="#666"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowEditDatePicker(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.datePickerText}>
                {formatDateDisplay(editMatchDate)}
              </Text>
              <Text style={styles.datePickerLabel}>Match Date</Text>
            </TouchableOpacity>
            
            {showEditDatePicker && (
              <DateTimePicker
                value={editMatchDate}
                mode="date"
                display="default"
                onChange={handleEditDateChange}
                minimumDate={new Date(2020, 0, 1)}
                maximumDate={new Date(2030, 11, 31)}
              />
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={closeEditModal}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleUpdateMatch}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      </View>
    </TouchableWithoutFeedback>
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
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges for Nike-inspired design
    padding: 16, // Reduced padding to make it more compact
    marginHorizontal: 20,
    marginBottom: 12, // Reduced margin
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
    fontSize: 24, // Match the matches section title size
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 8,
    letterSpacing: -0.3,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  // New section container for matches
  matchesSectionContainer: {
    flex: 1, // Takes up remaining space
    marginTop: 8,
  },
  matchesSectionTitle: {
    fontSize: 24, // Bigger title for matches section
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
  input: {
    borderWidth: 1,
    borderColor: '#d4b896',
    backgroundColor: '#ffffff',
    padding: 12, // Reduced padding
    marginVertical: 6, // Reduced margin
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
    padding: 12, // Reduced padding
    marginVertical: 6, // Reduced margin
    borderRadius: 0,
    minHeight: 48, // Reduced height
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
    paddingVertical: 14, // Reduced padding
    marginTop: 12, // Reduced margin
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
    flex: 1, // Takes up all available space
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
    minHeight: 400, // Ensure minimum height for better visibility
  },
  matchCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 0,
    marginHorizontal: 20,
    marginBottom: 16, // Increased spacing between cards
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
    overflow: 'visible', // Allow icons to extend outside card bounds
    position: 'relative', // Enable absolute positioning for icons
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
  matchCardAnimated: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    position: 'relative',
  },
  matchCardMain: {
    padding: 20, // Increased padding for better visibility
    paddingBottom: 24, // Extra bottom padding to avoid edit icon overlap
  },
  // Edit pencil icon in bottom-right - Nike inspired design
  editIconButton: {
    position: 'absolute',
    bottom: 30, // Positioned below the card
    right: 260, // Positioned to the right of the card
    zIndex: 10,
  },
  editIconContainer: {
    width: 30,
    height: 30,
    backgroundColor: '#1a4d3a',
    borderWidth: 2,
    borderColor: '#d4b896',
    borderRadius: 0, // Sharp edges for Nike aesthetic
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  editIcon: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '900', // Bold for Nike aesthetic
    lineHeight: 12,
  },
  matchCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12, // Increased spacing
  },
  matchOpponent: {
    fontSize: 20, // Bigger font for better visibility
    fontWeight: '700',
    color: '#1a4d3a',
    flex: 1,
    letterSpacing: -0.3,
  },
  matchDate: {
    fontSize: 16, // Bigger font for better visibility
    color: '#666',
    fontWeight: '500',
    marginLeft: 8,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8, // Increased spacing
  },
  scoreBadge: {
    backgroundColor: '#1a4d3a',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 20, // Bigger scores for better visibility
    borderRadius: 0, // Sharp edges
    paddingHorizontal: 16, // Increased padding
    paddingVertical: 8, // Increased padding  
    marginHorizontal: 6, // Increased spacing
    minWidth: 44, // Bigger minimum width
    textAlign: 'center',
    overflow: 'hidden',
  },
  scoreDash: {
    fontSize: 22, // Bigger dash
    color: '#666',
    fontWeight: '700',
    marginHorizontal: 12, // Increased spacing
  },
  emptyText: {
    color: '#1a4d3a', // Match primary color
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: -0.3,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
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
    borderLeftColor: '#1a4d3a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  seasonCreateButton: {
    backgroundColor: '#1a4d3a', // Match primary color
    borderRadius: 0, // Sharp edges
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
  
  seasonCreateButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Season dropdown styles
  seasonContainer: {
    marginBottom: 8,
  },

  seasonCardExpanded: {
    borderLeftColor: '#1a4d3a', // Change accent when expanded
    shadowOpacity: 0.15,
    elevation: 4,
  },

  seasonHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  dropdownArrow: {
    fontSize: 12,
    color: '#1a4d3a',
    fontWeight: '700',
    marginLeft: 8,
  },

  seasonExpandedContent: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -8, // Slight overlap with season card
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a',
    borderTopWidth: 0,
    padding: 16,
    paddingTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  seasonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges like match cards
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#d4b896', // Same accent color as match cards
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  seasonName: {
    color: '#1a4d3a', // Match the primary color from match cards
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.3,
  },

  activeBadge: {
    backgroundColor: '#32C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0, // Sharp edges
  },

  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  seasonDates: {
    marginBottom: 8,
  },

  dateRange: {
    color: '#666', // Match the secondary text color
    fontSize: 16,
    fontWeight: '500',
  },

  seasonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  matchCount: {
    color: '#1a4d3a', // Match the primary color
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  // Form styles
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges like other cards
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a', // Primary color accent
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  formTitle: {
    color: '#1a4d3a', // Match primary color
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
  },

  inputGroup: {
    marginBottom: 12,
  },

  label: {
    color: '#1a4d3a', // Match primary color
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  dateInput: {
    borderWidth: 1,
    borderColor: '#d4b896',
    backgroundColor: '#ffffff',
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 0, // Sharp edges
  },

  dateText: {
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: '500',
  },

  sectionContainer: {
    flex: 1,
    marginTop: 8,
  },

  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f3f0', // Match main background
    zIndex: 1000, // Ensure proper layering
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d4b896',
    backgroundColor: '#ffffff',
  },

  modalCloseButton: {
    padding: 8,
  },

  modalCloseText: {
    color: '#1a4d3a',
    fontSize: 18,
    fontWeight: '600',
  },

  modalSpacer: {
    width: 34,
  },

  seasonDetailsContainer: {
    flex: 1,
  },

  seasonDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  seasonDetailName: {
    color: '#1a4d3a', // Match primary color
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.3,
  },

  seasonDetailDates: {
    color: '#666', // Match secondary text color
    fontSize: 16,
    marginBottom: 24,
    fontWeight: '500',
  },

  createMatchButton: {
    backgroundColor: '#1a4d3a', // Match primary color
    borderRadius: 0, // Sharp edges
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10, // Ensure touchability
  },

  createMatchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  matchesSection: {
    flex: 1,
  },

  noMatchesText: {
    color: '#666', // Match secondary text color
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
    paddingHorizontal: 20,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 0,
  },
  modalButtonPrimary: {
    backgroundColor: '#1a4d3a',
  },
  modalButtonSecondary: {
    backgroundColor: '#666',
  },
  modalButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // Date picker specific styles
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#d4b896',
    marginTop: 16,
    padding: 16,
    alignItems: 'center',
  },
  
  datePickerCloseButton: {
    backgroundColor: '#666',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 0,
    marginTop: 12,
  },
  
  datePickerCloseText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    textTransform: 'uppercase',
  },
});
