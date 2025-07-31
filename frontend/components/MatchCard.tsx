import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  PanResponder,
} from 'react-native';
import { updateMatch, deleteMatch } from '../adapters/matchAdapters';

interface Match {
  id: number | string;
  opponent: string;
  team_score: number | null;
  opponent_score: number | null;
  match_date: string;
  season_id?: number;
}

interface MatchCardProps {
  match: Match;
  onNavigateToDetail: (matchId: number | string) => void;
  onEdit: (match: Match) => void;
  onMatchUpdated: () => void;
}

const MatchCard = ({ match, onNavigateToDetail, onEdit, onMatchUpdated }: MatchCardProps) => {
  if (!match || typeof match !== 'object' || !match.opponent) return null;

  const translateX = new Animated.Value(0);
  const deleteButtonOpacity = new Animated.Value(0);

  const handleDeleteMatch = (matchToDelete: Match) => {
    Alert.alert(
      'Delete Match',
      `Are you sure you want to delete the match against ${matchToDelete.opponent}? This will also delete all related data including lineups, player stats, and reviews.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMatch(Number(matchToDelete.id));
              onMatchUpdated();
              Alert.alert('Success', 'Match deleted successfully.');
            } catch (error) {
              Alert.alert('Error', 'Could not delete match.');
            }
          }
        }
      ]
    );
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
        handleDeleteMatch(match);
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
          onPress={() => handleDeleteMatch(match)}
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
          onPress={() => onNavigateToDetail(match.id)}
          activeOpacity={0.85}
        >
          <View style={styles.matchCardRow}>
            <Text style={styles.matchOpponent}>{match.opponent}</Text>
            <Text style={styles.matchDate}>
              {new Date(match.match_date).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.scoreRow}>
            <Text style={styles.scoreBadge}>{match.team_score ?? '-'}</Text>
            <Text style={styles.scoreDash}>-</Text>
            <Text style={styles.scoreBadge}>{match.opponent_score ?? '-'}</Text>
          </View>
        </TouchableOpacity>
        
        {/* Edit pencil icon in bottom-right */}
        <TouchableOpacity
          style={styles.editIconButton}
          onPress={() => onEdit(match)}
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

const styles = StyleSheet.create({
  matchCard: {
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

  matchCardAnimated: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    position: 'relative',
  },

  matchCardMain: {
    padding: 20,
    paddingBottom: 24,
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

  matchCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  matchOpponent: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a4d3a',
    flex: 1,
    letterSpacing: -0.3,
  },

  matchDate: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    marginLeft: 8,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  scoreBadge: {
    backgroundColor: '#1a4d3a',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 20,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 6,
    minWidth: 44,
    textAlign: 'center',
    overflow: 'hidden',
  },

  scoreDash: {
    fontSize: 22,
    color: '#666',
    fontWeight: '700',
    marginHorizontal: 12,
  },
});

export default MatchCard;
