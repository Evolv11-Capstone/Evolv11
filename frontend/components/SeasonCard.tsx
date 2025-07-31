import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Animated,
  PanResponder,
  Modal,
  TextInput,
} from 'react-native';
import { Season, deleteSeason } from '../adapters/seasonAdapters';
import MatchCard from './MatchCard';

interface Match {
  id: number | string;
  opponent: string;
  team_score: number | null;
  opponent_score: number | null;
  match_date: string;
  season_id?: number;
}

interface SeasonCardProps {
  season: Season;
  matches: Match[];
  isExpanded: boolean;
  onToggleExpand: (season: Season) => void;
  onCreateMatch: (season: Season) => void;
  onNavigateToMatch: (matchId: number | string) => void;
  onEditMatch: (match: Match) => void;
  onEditSeason: (season: Season) => void;
  onMatchUpdated: () => void;
  onSeasonUpdated: () => void;
}

const SeasonCard = ({
  season,
  matches,
  isExpanded,
  onToggleExpand,
  onCreateMatch,
  onNavigateToMatch,
  onEditMatch,
  onEditSeason,
  onMatchUpdated,
  onSeasonUpdated
}: SeasonCardProps) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const seasonMatches = matches.filter(match => match.season_id === season.id);

  // Animation states for swipe gesture
  const translateX = new Animated.Value(0);
  const deleteButtonOpacity = new Animated.Value(0);

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleDeleteSeason = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteSeason = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      Alert.alert('Invalid Input', 'Please type "DELETE" exactly to confirm.');
      return;
    }

    setIsDeleting(true);

    try {
      await deleteSeason(season.id);
      setShowDeleteModal(false);
      setDeleteConfirmationText('');
      onSeasonUpdated();
      Alert.alert('Success', 'Season and all associated data deleted successfully.');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not delete season.');
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteConfirmationText('');
  };

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
        handleDeleteSeason();
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

  const renderMatchItem = ({ item }: { item: Match }) => (
    <MatchCard
      match={item}
      onNavigateToDetail={onNavigateToMatch}
      onEdit={onEditMatch}
      onMatchUpdated={onMatchUpdated}
    />
  );

  return (
    <View style={styles.seasonContainer}>
      {/* Delete button (hidden behind season card) */}
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
          onPress={handleDeleteSeason}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>DELETE</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        style={[
          styles.seasonCardAnimated,
          {
            transform: [{ translateX }],
          }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={[styles.seasonCard, isExpanded && styles.seasonCardExpanded]}
          onPress={() => {
            console.log('Season card pressed:', season.name, 'ID:', season.id);
            onToggleExpand(season);
          }}
          activeOpacity={0.85}
        >
          <View style={styles.seasonHeader}>
            <Text style={styles.seasonName}>{season.name}</Text>
            <View style={styles.seasonHeaderRight}>
              {season.is_active && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              )}
              <Text style={styles.dropdownArrow}>{isExpanded ? '▼' : '▶'}</Text>
            </View>
          </View>
          
          <View style={styles.seasonDates}>
            <Text style={styles.dateRange}>
              {formatDateShort(season.start_date)} - {formatDateShort(season.end_date)}
            </Text>
          </View>
          
          <View style={styles.seasonStats}>
            <Text style={styles.matchCount}>
              {seasonMatches.length} match{seasonMatches.length !== 1 ? 'es' : ''}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Edit button in bottom-right */}
        <TouchableOpacity
          style={styles.editIconButton}
          onPress={() => onEditSeason(season)}
          activeOpacity={0.7}
        >
          <View style={styles.editIconContainer}>
            <Text style={styles.editIcon}>✎</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>

      {/* Expanded Content */}
      {isExpanded && (
        <View style={styles.seasonExpandedContent}>
          <TouchableOpacity
            style={styles.createMatchButton}
            onPress={() => {
              console.log('Create New Match button pressed for season:', season.name);
              onCreateMatch(season);
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

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.deleteModalContainer}>
            <Text style={styles.deleteModalTitle}>Delete Season</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete "{season.name}"? This will permanently delete:
            </Text>
            <View style={styles.deleteModalList}>
              <Text style={styles.deleteModalListItem}>• The season</Text>
              <Text style={styles.deleteModalListItem}>• All {seasonMatches.length} match{seasonMatches.length !== 1 ? 'es' : ''} in this season</Text>
              <Text style={styles.deleteModalListItem}>• All lineups and player assignments</Text>
              <Text style={styles.deleteModalListItem}>• All player statistics and reviews</Text>
            </View>
            <Text style={styles.deleteModalWarning}>
              This action cannot be undone. Type "DELETE" to confirm:
            </Text>
            <TextInput
              style={styles.deleteModalInput}
              value={deleteConfirmationText}
              onChangeText={setDeleteConfirmationText}
              placeholder="Type DELETE here"
              placeholderTextColor="#999"
              autoCapitalize="characters"
            />
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.deleteModalCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deleteModalConfirmButton,
                  deleteConfirmationText !== 'DELETE' && styles.deleteModalConfirmButtonDisabled
                ]}
                onPress={confirmDeleteSeason}
                disabled={deleteConfirmationText !== 'DELETE' || isDeleting}
              >
                <Text style={[
                  styles.deleteModalConfirmText,
                  deleteConfirmationText !== 'DELETE' && styles.deleteModalConfirmTextDisabled
                ]}>
                  {isDeleting ? 'Deleting...' : 'Delete Season'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  seasonContainer: {
    marginBottom: 8,
  },

  seasonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
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
  },

  seasonCardExpanded: {
    borderLeftColor: '#1a4d3a',
    shadowOpacity: 0.15,
    elevation: 4,
  },

  seasonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  seasonHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  seasonName: {
    color: '#1a4d3a',
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.3,
  },

  activeBadge: {
    backgroundColor: '#32C759',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 0,
  },

  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  dropdownArrow: {
    fontSize: 12,
    color: '#1a4d3a',
    fontWeight: '700',
    marginLeft: 8,
  },

  seasonDates: {
    marginBottom: 8,
  },

  dateRange: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },

  seasonStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  matchCount: {
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
  },

  seasonExpandedContent: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -8,
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

  createMatchButton: {
    backgroundColor: '#1a4d3a',
    borderRadius: 0,
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
    zIndex: 10,
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

  matchesSectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 8,
    letterSpacing: -0.3,
    paddingHorizontal: 20,
    textAlign: 'center',
  },

  noMatchesText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
    paddingHorizontal: 20,
  },

  // Delete button and animation styles
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

  editIconButton: {
    position: 'absolute',
    bottom: 30,
    right: 260,
    zIndex: 10,
  },

  editIconContainer: {
    width: 30,
    height: 30,
    backgroundColor: '#d4b896',
    borderWidth: 2,
    borderColor: '#d4b896',
    borderRadius: 0,
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
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '900',
    lineHeight: 25,
  },

  // Delete confirmation modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  deleteModalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  deleteModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#dc3545',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },

  deleteModalMessage: {
    fontSize: 16,
    color: '#1a4d3a',
    marginBottom: 16,
    lineHeight: 22,
    fontWeight: '500',
  },

  deleteModalList: {
    marginBottom: 20,
    paddingLeft: 8,
  },

  deleteModalListItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },

  deleteModalWarning: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },

  deleteModalInput: {
    borderWidth: 2,
    borderColor: '#dc3545',
    backgroundColor: '#ffffff',
    padding: 12,
    fontSize: 16,
    color: '#1a4d3a',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    borderRadius: 0,
  },

  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },

  deleteModalCancelButton: {
    flex: 1,
    backgroundColor: '#666',
    paddingVertical: 14,
    borderRadius: 0,
    alignItems: 'center',
  },

  deleteModalCancelText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  deleteModalConfirmButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    borderRadius: 0,
    alignItems: 'center',
  },

  deleteModalConfirmButtonDisabled: {
    backgroundColor: '#ccc',
  },

  deleteModalConfirmText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  deleteModalConfirmTextDisabled: {
    color: '#999',
  },
});

export default SeasonCard;
