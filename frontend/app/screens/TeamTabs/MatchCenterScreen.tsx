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
  Modal,
  Animated,
  PanResponder,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUser } from '../../contexts/UserContext';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { createMatch, getMatchesForTeam, updateMatch, deleteMatch } from '../../../adapters/matchAdapters';
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

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setMatchDate(selectedDate);
    }
  };

  const onEditDateChange = (event: any, selectedDate?: Date) => {
    setShowEditDatePicker(Platform.OS === 'ios');
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
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Match Center</Text>
        <Text style={styles.subtitle}>Create and manage team matches</Text>
      </View>

      {/* Create Match Section - Made more compact */}
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

      {/* Recent Matches Section - Made bigger and more prominent */}
      <View style={styles.matchesSectionContainer}>
        <Text style={styles.matchesSectionTitle}>Recent Matches</Text>
        <Text style={styles.instructionText}>
          Swipe left on any match to reveal delete option
        </Text>
        <View style={styles.matchesContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1a4d3a" />
              <Text style={styles.loadingText}>Loading matches...</Text>
            </View>
          ) : (
            <FlatList
              data={Array.isArray(matches) ? matches : []}
              keyExtractor={(item, index) => item?.id?.toString() ?? index.toString()}
              renderItem={renderMatchItem}
              ListEmptyComponent={
                <View style={styles.emptyStateContainer}>
                  <Text style={styles.emptyText}>No matches yet</Text>
                  <Text style={styles.emptySubtext}>Create your first match above to get started!</Text>
                </View>
              }
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

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
                onChange={onEditDateChange}
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
    fontSize: 18, // Slightly smaller
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 12, // Reduced margin
    letterSpacing: -0.3,
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
    color: '#1a4d3a',
    fontSize: 20, // Bigger text for better visibility
    textAlign: 'center',
    fontWeight: '600',
    letterSpacing: -0.3,
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
});
