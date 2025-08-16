import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, RouteProp } from '@react-navigation/native';
import { getPlayerMatchStats, updatePlayerReflection, type PlayerMatchStats } from '../../../adapters/moderateReviewsAdapter';
import { getPlayerByUserAndTeam } from '../../../adapters/playerAdapters';
import { getMatchById } from '../../../adapters/matchAdapters';
import { type Match } from '../../../types/matchTypes';
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
  const [playerPosition, setPlayerPosition] = useState<string | null>(null);
  const [matchData, setMatchData] = useState<Match | null>(null);

  // Reflection states
  const [reflection, setReflection] = useState<string>('');
  const [reflectionSaving, setReflectionSaving] = useState(false);
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Unlock animation states
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false);

  // Animation values
  const lockOpacity = useRef(new Animated.Value(1)).current;
  const unlockScale = useRef(new Animated.Value(0.8)).current;
  const unlockOpacity = useRef(new Animated.Value(0)).current;
  const shimmerAnimation = useRef(new Animated.Value(0)).current;

  // Reusable StatRow component
  const StatRow = ({ label, value, testID }: { label: string; value: string; testID?: string }) => (
    <View style={styles.statRow} testID={testID}>
      <Text style={styles.statRowLabel}>{label}</Text>
      <Text style={styles.statRowValue} accessibilityLabel={`${label}: ${value}`}>{value}</Text>
    </View>
  );

  // Function to render goalkeeper-specific stats
  const renderGoalkeeperStats = () => {
    if (!matchStats) return null;

    const minutesPlayed = matchStats.minutes_played || 0;

    // Save percentage: saves / (saves + goals_conceded) * 100
    const saves = matchStats.saves || 0;
    const goalsConceded = matchData?.opponent_score || 0;
    const savePercentage = (saves + goalsConceded) > 0 
      ? Math.round((saves / (saves + goalsConceded)) * 100) 
      : null;

    // Kicks accuracy
    const kicks_attempted = (matchStats.successful_goalie_kicks || 0) + (matchStats.failed_goalie_kicks || 0);
    const kicks_successful = matchStats.successful_goalie_kicks || 0;
    const kicksAccuracy = kicks_attempted > 0 
      ? Math.round((kicks_successful / kicks_attempted) * 100) 
      : null;
    
    // Throws accuracy
    const throws_attempted = (matchStats.successful_goalie_throws || 0) + (matchStats.failed_goalie_throws || 0);
    const throws_successful = matchStats.successful_goalie_throws || 0;
    const throwsAccuracy = throws_attempted > 0 
      ? Math.round((throws_successful / throws_attempted) * 100) 
      : null;

    return (
      <View style={styles.outfieldStatsContainer}>
        {/* Performance Section */}
        <View style={styles.performanceSection}>
          <Text style={styles.subsectionTitle}>Match Statistics</Text>
          <StatRow 
            label="Minutes Played" 
            value={`${minutesPlayed}'`} 
            testID="stat-minutes-played" 
          />
          <StatRow 
            label="Save %" 
            value={savePercentage !== null ? `${savePercentage}%` : 'N/A'} 
            testID="stat-save-pct" 
          />
          <StatRow 
            label="Kicks – Accuracy" 
            value={kicksAccuracy !== null ? `${kicksAccuracy}%` : 'N/A'} 
            testID="stat-kicks-accuracy" 
          />
          <StatRow 
            label="Throws – Accuracy" 
            value={throwsAccuracy !== null ? `${throwsAccuracy}%` : 'N/A'} 
            testID="stat-throws-accuracy" 
          />
        </View>
        
        {/* Divider */}
        <View style={styles.sectionDivider} />
      </View>
    );
  };

  // Function to render outfield player stats
  const renderOutfieldStats = () => {
    if (!matchStats) return null;

    const interceptions = matchStats.interceptions || 0;
    const chancesCreated = matchStats.chances_created || 0;
    const minutesPlayed = matchStats.minutes_played || 0;

    return (
      <View style={styles.outfieldStatsContainer}>
        {/* Performance Section */}
        <View style={styles.performanceSection}>
          <Text style={styles.subsectionTitle}>Match Statistics</Text>
          <StatRow 
            label="Minutes Played" 
            value={`${minutesPlayed}'`} 
            testID="stat-minutes-played" 
          />
          <StatRow 
            label="Goals" 
            value={`${matchStats.goals}`} 
            testID="stat-goals" 
          />
          <StatRow 
            label="Assists" 
            value={`${matchStats.assists}`} 
            testID="stat-assists" 
          />
          <StatRow 
            label="Tackles" 
            value={`${matchStats.tackles}`} 
            testID="stat-tackles" 
          />
          <StatRow 
            label="Interceptions" 
            value={`${interceptions}`} 
            testID="stat-interceptions" 
          />
          <StatRow 
            label="Chances Created" 
            value={`${chancesCreated}`} 
            testID="stat-chances-created" 
          />
        </View>
        
        {/* Divider */}
        <View style={styles.sectionDivider} />
      </View>
    );
  };

  // Function to render ratings section (Coach Grade)
  const renderRatingsSection = () => {
    if (!matchStats) return null;

    const coachGrade = matchStats.coach_rating || 0;

    return (
      <View style={styles.ratingsSection}>
        <Text style={styles.subsectionTitle}>Ratings</Text>
        <StatRow 
          label="Coach Grade" 
          value={`${coachGrade}`} 
          testID="stat-coach-grade" 
        />
      </View>
    );
  };

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
        setPlayerPosition(playerResult.position || null);
      } catch (err: any) {
        console.error('Error resolving player ID:', err);
        setError(err.message || 'Failed to resolve player information');
        setLoading(false);
      }
    };

    resolvePlayerId();
  }, [playerId, user?.id, activeTeamId]);

  // Fetch match data
  useEffect(() => {
    const loadMatchData = async () => {
      if (!matchId) return;

      try {
        const [match, matchError] = await getMatchById(matchId);
        
        if (matchError) {
          console.error('Failed to load match data:', matchError.message);
          return;
        }
        
        if (match) {
          setMatchData(match);
          console.log('Match data loaded:', match);
        }
      } catch (err: any) {
        console.error('Error loading match data:', err);
      }
    };

    loadMatchData();
  }, [matchId]);

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
          console.log('DEBUG: No stats found for player:', resolvedPlayerId, 'match:', matchId);
          return;
        }

        console.log('DEBUG: Match stats loaded:', stats);

        setMatchStats(stats);
        
        // Use the real AI suggestions from the backend
        setAiSuggestions(stats.ai_suggestions || null);
        console.log('DEBUG: AI suggestions:', stats.ai_suggestions);
        
        // Load existing reflection if available
        const existingReflection = stats.reflection || '';
        setReflection(existingReflection);
        console.log('DEBUG: Existing reflection:', existingReflection, 'Length:', existingReflection.length);
        
        // Check if reflection meets minimum requirement (50 characters)
        if (existingReflection.length >= 50) {
          setIsUnlocked(true);
          // Initialize animation values to unlocked state
          lockOpacity.setValue(1);
          unlockScale.setValue(1);
          console.log('DEBUG: Content unlocked - reflection meets minimum requirement');
        } else {
          // Initialize animation values to locked state
          lockOpacity.setValue(0.3);
          unlockScale.setValue(0.95);
          console.log('DEBUG: Content locked - reflection too short');
        }
        
      } catch (err: any) {
        console.error('Error loading match feedback:', err);
        setError(err.message || 'Failed to load match feedback');
      } finally {
        setLoading(false);
      }
    };

    loadMatchFeedback();
  }, [resolvedPlayerId, matchId]);

  // Start shimmer animation for anticipation
  const startShimmerAnimation = () => {
    shimmerAnimation.setValue(0);
    Animated.loop(
      Animated.timing(shimmerAnimation, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  };

  // Stop shimmer and trigger unlock animation
  const triggerUnlockAnimation = () => {
    // Haptic feedback for satisfaction
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Stop shimmer
    shimmerAnimation.stopAnimation();

    // Fade out lock overlay
    Animated.timing(lockOpacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Animate content reveal with staggered timing
    setTimeout(() => {
      setIsUnlocked(true);
      
      // Scale up and fade in animation
      Animated.parallel([
        Animated.timing(unlockScale, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.back(1.1)),
          useNativeDriver: false,
        }),
        Animated.timing(lockOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: false,
        }),
      ]).start(() => {
        setShowUnlockAnimation(false);
        setIsUnlocking(false);
      });
    }, 300);
  };

  const saveReflection = async () => {
    if (!resolvedPlayerId || !matchId) {
      Alert.alert('Error', 'Unable to save reflection at this time');
      return;
    }

    const willUnlock = !isUnlocked && reflection.length >= 50;

    try {
      setReflectionSaving(true);
      
      // If this will unlock insights, show anticipation animation
      if (willUnlock) {
        setIsUnlocking(true);
        setShowUnlockAnimation(true);
        startShimmerAnimation();
      }

      const [success, error] = await updatePlayerReflection(resolvedPlayerId, matchId, reflection);
      
      if (error || !success) {
        throw new Error(error?.message || 'Failed to save reflection');
      }
      
      setReflectionSaved(true);
      
      // If unlocking insights, trigger unlock animation after a delay
      if (willUnlock) {
        setTimeout(() => {
          triggerUnlockAnimation();
        }, 1500); // 1.5 second anticipation
      } else {
        // Regular save feedback
        setTimeout(() => {
          setReflectionSaved(false);
        }, 3000);
      }
      
    } catch (err: any) {
      console.error('Error saving reflection:', err);
      Alert.alert('Error', err.message || 'Failed to save reflection');
      setIsUnlocking(false);
      setShowUnlockAnimation(false);
    } finally {
      if (!willUnlock) {
        setReflectionSaving(false);
      }
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
    console.log('DEBUG: parseAISuggestions called with:', suggestionsText);
    if (!suggestionsText) return [];
    
    const lines = suggestionsText.split('\n');
    const bulletPoints = lines
      .filter(line => line.trim().startsWith('-'))
      .map(line => line.trim().substring(1).trim())
      .slice(0, 3); // Limit to 3 suggestions
    
    console.log('DEBUG: Parsed suggestions:', bulletPoints);
    return bulletPoints;
  };

  const renderLockedOverlay = (message: string) => (
    <View style={styles.lockedOverlay}>
      <View style={styles.lockedContent}>
        <Ionicons name="lock-closed" size={24} color="#999" />
        <Text style={styles.lockedText}>{message}</Text>
      </View>
    </View>
  );

  const renderShimmerOverlay = () => {
    if (!showUnlockAnimation) return null;
    
    const shimmerTranslateX = shimmerAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [-100, 100],
    });

    return (
      <View style={styles.unlockingOverlay}>
        <Animated.View 
          style={[
            styles.shimmerEffect,
            {
              transform: [{ translateX: shimmerTranslateX }],
            },
          ]}
        />
        <View style={styles.unlockingContent}>
          <ActivityIndicator size="large" color="#1a4d3a" />
          <Text style={styles.unlockingText}>Processing your reflection...</Text>
        </View>
      </View>
    );
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
  console.log('DEBUG: Final suggestions for rendering:', suggestions, 'Length:', suggestions.length);
  console.log('DEBUG: isUnlocked:', isUnlocked, 'aiSuggestions:', aiSuggestions);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
        <View style={styles.sectionContainer}>
          <Animated.View 
            style={[
              styles.summaryCard,
              {
                opacity: lockOpacity,
                transform: [{ scale: unlockScale }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Performance Summary</Text>
            {playerPosition === 'GK' ? renderGoalkeeperStats() : renderOutfieldStats()}
            {renderRatingsSection()}
          </Animated.View>
          
          {!isUnlocked && renderLockedOverlay("Unlock by writing your reflection")}
          {showUnlockAnimation && renderShimmerOverlay()}
        </View>
      )}
          {/* Coach Feedback */}
      {matchStats?.feedback && (
        <View style={styles.sectionContainer}>
          <Animated.View 
            style={[
              styles.coachFeedbackCard,
              {
                opacity: lockOpacity,
                transform: [{ scale: unlockScale }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Coach's Notes</Text>
            <Text style={styles.coachFeedbackText}>
              {matchStats.feedback}
            </Text>
          </Animated.View>
          
          {!isUnlocked && renderLockedOverlay("Unlock by writing your reflection")}
          {showUnlockAnimation && renderShimmerOverlay()}
        </View>
      )}


      {/* AI Suggestions */}
      {suggestions.length > 0 ? (
        <View style={styles.sectionContainer}>
          <Animated.View 
            style={[
              styles.feedbackCard,
              {
                opacity: lockOpacity,
                transform: [{ scale: unlockScale }],
              },
            ]}
          >
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
          </Animated.View>
          
          {!isUnlocked && renderLockedOverlay("Unlock by writing your reflection")}
          {showUnlockAnimation && renderShimmerOverlay()}
        </View>
      ) : aiSuggestions === null ? (
        <View style={styles.sectionContainer}>
          <Animated.View 
            style={[
              styles.feedbackCard,
              {
                opacity: lockOpacity,
                transform: [{ scale: unlockScale }],
              },
            ]}
          >
            <Text style={styles.sectionTitle}>Growth Insights</Text>
            <Text style={styles.feedbackIntro}>
              AI-powered insights are being generated for your performance. Check back soon for personalized suggestions!
            </Text>
          </Animated.View>
          
          {!isUnlocked && renderLockedOverlay("Unlock by writing your reflection")}
          {showUnlockAnimation && renderShimmerOverlay()}
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
          scrollEnabled={false}
          blurOnSubmit={false}
          returnKeyType="done"
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0',
  },
  scrollView: {
    flex: 1,
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
  outfieldStatsContainer: {
    gap: 16,
  },
  performanceSection: {
    marginBottom: 20,
  },
  ratingsSection: {
    marginTop: 8,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    marginVertical: 12,
    opacity: 0.12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.12)',
  },
  statRowLabel: {
    fontSize: 14,
    color: '#666',
    opacity: 0.9,
    flex: 1,
  },
  statRowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a4d3a',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a4d3a',
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
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
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#888',
    textAlign: 'center',
    marginTop: 2,
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
  sectionContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  lockedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    zIndex: 10,
  },
  lockedContent: {
    alignItems: 'center',
    padding: 20,
  },
  lockedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a4d3a',
    textAlign: 'center',
    marginTop: 12,
  },
  unlockingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 77, 58, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    zIndex: 20,
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(212, 184, 150, 0.3)',
  },
  unlockingContent: {
    alignItems: 'center',
    padding: 20,
  },
  unlockingText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default FeedbackDetailScreen;
