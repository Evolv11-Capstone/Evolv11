import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getPlayerMatchStats, updatePlayerReflection, type PlayerMatchStats } from '../../../adapters/moderateReviewsAdapter';
import { getPlayerByUserAndTeam } from '../../../adapters/playerAdapters';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { useUser } from '../../contexts/UserContext';

type FeedbackDetailRouteParams = {
  matchId: number;
  matchDate: string;
  opponent: string;
  playerId?: number;
};

type FeedbackDetailScreenRouteProp = RouteProp<
  { FeedbackDetail: FeedbackDetailRouteParams },
  'FeedbackDetail'
>;

const FeedbackDetailScreen = () => {
  const route = useRoute<FeedbackDetailScreenRouteProp>();
  const { matchId, matchDate, opponent, playerId } = route.params;
  const { user } = useUser();
  const { activeTeamId } = useActiveTeam();
  
  const [matchStats, setMatchStats] = useState<PlayerMatchStats | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedPlayerId, setResolvedPlayerId] = useState<number | null>(null);

  // Reflection states
  const [reflection, setReflection] = useState<string>('');
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  useEffect(() => {
    const resolvePlayerId = async () => {
      // If playerId is provided in params, use it directly
      if (playerId) {
        setResolvedPlayerId(playerId);
        return;
      }

      // Otherwise, resolve using user_id and team_id
      if (!user?.id || !activeTeamId) {
        setError('Missing user or team information');
        setLoading(false);
        return;
      }

      try {
        console.log('Resolving player ID for user:', user.id, 'team:', activeTeamId);
        const [playerResult, playerError] = await getPlayerByUserAndTeam(user.id, activeTeamId);
        
        if (playerError || !playerResult) {
          console.error('Failed to resolve player ID:', playerError?.message);
          throw new Error(playerError?.message || 'Could not find player information');
        }
        
        console.log('Successfully resolved player ID:', playerResult.id);
        setResolvedPlayerId(playerResult.id);
      } catch (err: any) {
        console.error('Error resolving player ID:', err);
        setError(err.message || 'Failed to resolve player information');
        setLoading(false);
      }
    };

    resolvePlayerId();
  }, [playerId, user?.id, activeTeamId]);

  useEffect(() => {
    const loadMatchFeedback = async () => {
      if (!resolvedPlayerId || !matchId) {
        if (resolvedPlayerId === null) {
          // Still resolving player ID, wait
          return;
        }
        setError('Missing player or match information');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [stats, statsError] = await getPlayerMatchStats(resolvedPlayerId, matchId);

        if (statsError) {
          throw new Error(statsError.message || 'Failed to load match stats');
        }

        if (!stats) {
          setError('No feedback available for this match yet.');
          setLoading(false);
          return;
        }

        setMatchStats(stats);
        
        // Use the real AI suggestions from the backend
        setAiSuggestions(stats.ai_suggestions || null);
        
        // Load existing reflection if available
        setReflection(stats.reflection || '');
        
      } catch (err: any) {
        console.error('Error loading match feedback:', err);
        setError(err.message || 'Failed to load match feedback');
      } finally {
        setLoading(false);
      }
    };

    loadMatchFeedback();
  }, [resolvedPlayerId, matchId]);

  const saveReflection = async () => {
    if (!resolvedPlayerId || !matchId) {
      Alert.alert('Error', 'Unable to save reflection at this time');
      return;
    }

    try {
      setReflectionSaving(true);
      const [success, error] = await updatePlayerReflection(resolvedPlayerId, matchId, reflection);
      
      if (error || !success) {
        throw new Error(error?.message || 'Failed to save reflection');
      }
      
      setReflectionSaved(true);
      
      // Reset saved state after 3 seconds
      setTimeout(() => {
        setReflectionSaved(false);
      }, 3000);
      
    } catch (err: any) {
      console.error('Error saving reflection:', err);
      Alert.alert('Error', err.message || 'Failed to save reflection');
    } finally {
      setReflectionSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const parseAISuggestions = (suggestionsText: string) => {
    if (!suggestionsText) return [];
    
    const lines = suggestionsText.split('\n');
    const bulletPoints = lines
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().substring(1).trim())
      .slice(0, 3); // Limit to 3 suggestions
    
    return bulletPoints;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a4d3a" />
        <Text style={styles.loadingText}>Loading your feedback...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No Feedback Available</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorHint}>
          Match stats need to be submitted by your coach before feedback becomes available.
        </Text>
      </View>
    );
  }

  const suggestions = parseAISuggestions(aiSuggestions || '');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Match Feedback</Text>
        <Text style={styles.subtitle}>
          Against {opponent}
        </Text>
        <Text style={styles.dateText}>
          {formatDate(matchDate)}
        </Text>
      </View>

      {/* Performance Summary */}
      {matchStats && (
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{matchStats.goals}</Text>
              <Text style={styles.statLabel}>Goals</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{matchStats.assists}</Text>
              <Text style={styles.statLabel}>Assists</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{matchStats.tackles}</Text>
              <Text style={styles.statLabel}>Tackles</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{matchStats.coach_rating}</Text>
              <Text style={styles.statLabel}>Coach Rating</Text>
            </View>
          </View>
        </View>
      )}
          {/* Coach Feedback */}
      {matchStats?.feedback && (
        <View style={styles.coachFeedbackCard}>
          <Text style={styles.sectionTitle}>Coach's Notes</Text>
          <Text style={styles.coachFeedbackText}>
            {matchStats.feedback}
          </Text>
        </View>
      )}


      {/* AI Suggestions */}
      {suggestions.length > 0 ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.sectionTitle}>Growth Insights</Text>
          <Text style={styles.feedbackIntro}>
            Based on your performance, here are personalized suggestions to help you improve:
          </Text>
          
          <View style={styles.suggestionsList}>
            {suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : aiSuggestions === null ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.sectionTitle}>Growth Insights</Text>
          <Text style={styles.feedbackIntro}>
            AI-powered insights are being generated for your performance. Check back soon for personalized suggestions!
          </Text>
        </View>
      ) : null}

  
      {/* Personal Reflection */}
      <View style={styles.reflectionCard}>
        <Text style={styles.sectionTitle}>Your Reflection</Text>
        <Text style={styles.reflectionSubtitle}>
          This is your personal space. No one else can see this reflection.
        </Text>
        
        <TextInput
          style={styles.reflectionInput}
          multiline
          numberOfLines={6}
          maxLength={500}
          placeholder="Write your thoughts about this match..."
          placeholderTextColor="#999"
          value={reflection}
          onChangeText={(text) => {
            setReflection(text);
            if (reflectionSaved) {
              setReflectionSaved(false);
            }
          }}
          textAlignVertical="top"
        />
        
        <View style={styles.reflectionFooter}>
          <Text style={styles.characterCount}>
            {reflection.length}/500 characters
          </Text>
          
          <TouchableOpacity
            style={[
              styles.saveButton,
              reflectionSaving && styles.saveButtonDisabled,
              reflectionSaved && styles.saveButtonSuccess
            ]}
            onPress={saveReflection}
            disabled={reflectionSaving || reflectionSaved}
          >
            <Text style={[
              styles.saveButtonText,
              reflectionSaved && styles.saveButtonTextSuccess
            ]}>
              {reflectionSaving 
                ? 'Saving...' 
                : reflectionSaved 
                  ? '✓ Saved' 
                  : 'Save Reflection'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3f0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3f0',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  errorHint: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a4d3a',
    marginBottom: 8,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d4b896',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  feedbackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  journalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d4b896',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coachFeedbackCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d4b896',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a4d3a',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feedbackIntro: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  suggestionsList: {
    marginTop: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletPoint: {
    width: 6,
    height: 6,
    borderRadius: 0,
    backgroundColor: '#1a4d3a',
    marginTop: 8,
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontWeight: '500',
  },
  journalText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  coachFeedbackText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
    fontWeight: '500',
  },
  reflectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d4b896',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reflectionSubtitle: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  reflectionInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
    color: '#333',
    minHeight: 120,
    marginBottom: 12,
    fontFamily: 'System',
  },
  reflectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
  },
  saveButton: {
    backgroundColor: '#1a4d3a',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 0,
    minWidth: 120,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#999',
  },
  saveButtonSuccess: {
    backgroundColor: '#28a745',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  saveButtonTextSuccess: {
    color: '#ffffff',
  },
});

export default FeedbackDetailScreen;
