import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';

import RequestCard from '../../../components/RequestCard'; // Component for join requests
import TopPerformerCard from '../../../components/TopPerformerCard'; // Component for top performers
import { useUser } from '../../contexts/UserContext'; // Get current user info
import { useActiveTeam } from '../../contexts/ActiveTeamContext'; // Get active team

// Adapters to fetch and approve/reject requests
import {
  listPlayerTeamRequests,
  listCoachTeamRequests,
  approvePlayerTeamRequest,
  approveCoachTeamRequest,
  rejectPlayerTeamRequest,
  rejectCoachTeamRequest,
} from '../../../adapters/teamRequestAdapters';

// Import match adapters for upcoming matches
import { getMatchesForTeam } from '../../../adapters/matchAdapters';
import { getMatchReviews, MatchReview } from '../../../adapters/moderateReviewsAdapter';
import { Match } from '../../../types/matchTypes';

export default function DashboardScreen() {
  const { user } = useUser(); // Get user from global context
  const { activeTeamId } = useActiveTeam(); // Get selected team ID

  const [requests, setRequests] = useState<any[]>([]); // Local state for requests
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null); // State for upcoming match
  const [previousMatch, setPreviousMatch] = useState<Match | null>(null); // State for previous match
  const [previousMatchReviews, setPreviousMatchReviews] = useState<MatchReview[]>([]); // State for previous match reviews

  // Fetch requests and upcoming match on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !activeTeamId) return;

      // Fetch team requests (coach only)
      let fetched: any[] = [];
      if (user.role === 'coach') {
        const players = await listPlayerTeamRequests();
        const coaches = await listCoachTeamRequests();

        // Combine and filter only relevant requests for this team
        fetched = [...players, ...coaches].filter((req) => req.team_id === activeTeamId);
      }
      setRequests(fetched);

      // Fetch upcoming match for all users
      try {
        const [response, error] = await getMatchesForTeam(activeTeamId);
        
        if (response && !error && response.success) {
          const matches = response.data;
          const currentDate = new Date();
          
          // Get future matches (upcoming)
          const futureMatches = matches
            .filter((match: Match) => new Date(match.match_date) > currentDate)
            .sort((a: Match, b: Match) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
          
          setUpcomingMatch(futureMatches.length > 0 ? futureMatches[0] : null);

          // Get past matches (previous)
          const pastMatches = matches
            .filter((match: Match) => new Date(match.match_date) <= currentDate)
            .sort((a: Match, b: Match) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
          
          const mostRecentMatch = pastMatches.length > 0 ? pastMatches[0] : null;
          console.log('🏆 Previous Match Debug:', {
            totalMatches: matches.length,
            pastMatchesCount: pastMatches.length,
            mostRecentMatch: mostRecentMatch,
            currentDate: currentDate.toISOString()
          });
          setPreviousMatch(mostRecentMatch);

          // If we have a previous match, fetch its reviews
          if (mostRecentMatch) {
            console.log('🎯 Fetching reviews for match ID:', mostRecentMatch.id);
            try {
              const [reviews, reviewsError] = await getMatchReviews(mostRecentMatch.id);
              console.log('📊 Match Reviews Debug:', {
                matchId: mostRecentMatch.id,
                reviewsCount: reviews?.length,
                reviews: reviews,
                error: reviewsError
              });
              
              if (reviews && !reviewsError) {
                // Log each review to see the data structure
                reviews.forEach((review, index) => {
                  console.log(`📋 Review ${index + 1}:`, {
                    player_name: review.player_name,
                    goals: review.goals,
                    assists: review.assists,
                    coach_rating: review.coach_rating,
                    tackles: review.tackles,
                    interceptions: review.interceptions,
                    chances_created: review.chances_created
                  });
                });
                
                setPreviousMatchReviews(reviews);
              } else {
                setPreviousMatchReviews([]);
              }
            } catch (reviewsError) {
              console.error('Error fetching previous match reviews:', reviewsError);
              setPreviousMatchReviews([]);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
    };

    fetchDashboardData();
  }, [user, activeTeamId]);

  // Helper functions to find top performers
  const getTopPerformer = (stat: keyof MatchReview, reviews: MatchReview[]) => {
    console.log(`🔍 Getting top performer for ${stat}:`, {
      reviewsCount: reviews.length,
      stat
    });
    
    if (reviews.length === 0) {
      console.log(`❌ No reviews available for ${stat}`);
      return null;
    }
    
    const validReviews = reviews.filter(review => {
      const value = review[stat];
      const isValid = value !== null && value !== undefined && typeof value === 'number' && value > 0;
      console.log(`🏃 Player ${review.player_name} - ${stat}: ${value} (valid: ${isValid})`);
      return isValid;
    });
    
    console.log(`✅ Valid reviews for ${stat}:`, validReviews.length);
    
    if (validReviews.length === 0) {
      console.log(`❌ No valid reviews for ${stat}`);
      return null;
    }
    
    const topPerformer = validReviews.reduce((top, current) => 
      (current[stat] as number) > (top[stat] as number) ? current : top
    );
    
    console.log(`🏆 Top performer for ${stat}:`, {
      player: topPerformer.player_name,
      value: topPerformer[stat]
    });
    
    return topPerformer;
  };

  const getTopRated = (reviews: MatchReview[]) => {
    console.log('🔍 Getting top rated player:', {
      reviewsCount: reviews.length
    });
    
    if (reviews.length === 0) {
      console.log('❌ No reviews available for rating');
      return null;
    }
    
    const validReviews = reviews.filter(review => {
      const isValid = review.coach_rating !== null && review.coach_rating !== undefined && review.coach_rating > 0;
      console.log(`🏃 Player ${review.player_name} - rating: ${review.coach_rating} (valid: ${isValid})`);
      return isValid;
    });
    
    console.log('✅ Valid reviews for rating:', validReviews.length);
    
    if (validReviews.length === 0) {
      console.log('❌ No valid reviews for rating');
      return null;
    }
    
    const topRated = validReviews.reduce((top, current) => 
      current.coach_rating > top.coach_rating ? current : top
    );
    
    console.log('🏆 Top rated player:', {
      player: topRated.player_name,
      rating: topRated.coach_rating
    });
    
    return topRated;
  };

  // Handle approve logic
  const handleApprove = async (id: number, role: string) => {
    const action = role === 'player' ? approvePlayerTeamRequest : approveCoachTeamRequest;
    const { success, message } = await action(id);
    if (!success) Alert.alert('Error', message || 'Failed to approve request');
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'approved' } : req))
    );
  };

  // Handle reject logic
  const handleReject = async (id: number, role: string) => {
    const action = role === 'player' ? rejectPlayerTeamRequest : rejectCoachTeamRequest;
    const { success, message } = await action(id);
    if (!success) Alert.alert('Error', message || 'Failed to reject request');
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'rejected' } : req))
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Team Dashboard</Text>
        <Text style={styles.subtitle}>Manage your team operations</Text>
      </View>

      {/* Section: Upcoming Match */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Match</Text>
        {upcomingMatch ? (
          <View style={styles.matchCard}>
            <Text style={styles.matchOpponent}>vs {upcomingMatch.opponent}</Text>
            <Text style={styles.matchDate}>
              {new Date(upcomingMatch.match_date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No upcoming matches</Text>
            <Text style={styles.emptySubtext}>Schedule matches to see them here</Text>
          </View>
        )}
      </View>

      {/* Section: Previous Match */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Previous Match</Text>
        {previousMatch ? (
          <View>
            {/* Match Overview */}
            <View style={styles.matchCard}>
              <Text style={styles.matchOpponent}>
                vs {previousMatch.opponent}
              </Text>
              <Text style={styles.matchScore}>
                {previousMatch.team_score ?? 0} - {previousMatch.opponent_score ?? 0}
              </Text>
              <Text style={styles.matchDate}>
                {new Date(previousMatch.match_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>

            {/* Top Performers */}
            <View style={styles.topPerformersContainer}>
              <Text style={styles.subSectionTitle}>Top Performers</Text>
              
              <View style={styles.performersGrid}>
                <TopPerformerCard
                  title="Top Rated"
                  playerName={getTopRated(previousMatchReviews)?.player_name}
                  imageUrl={getTopRated(previousMatchReviews)?.player_image}
                  statLabel="Rating"
                  statValue={getTopRated(previousMatchReviews)?.coach_rating}
                />

                <TopPerformerCard
                  title="Top Scorer"
                  playerName={getTopPerformer('goals', previousMatchReviews)?.player_name}
                  imageUrl={getTopPerformer('goals', previousMatchReviews)?.player_image}
                  statLabel="Goals"
                  statValue={getTopPerformer('goals', previousMatchReviews)?.goals}
                />

                <TopPerformerCard
                  title="Top Assister"
                  playerName={getTopPerformer('assists', previousMatchReviews)?.player_name}
                  imageUrl={getTopPerformer('assists', previousMatchReviews)?.player_image}
                  statLabel="Assists"
                  statValue={getTopPerformer('assists', previousMatchReviews)?.assists}
                />

                <TopPerformerCard
                  title="Most Chances"
                  playerName={getTopPerformer('chances_created', previousMatchReviews)?.player_name}
                  imageUrl={getTopPerformer('chances_created', previousMatchReviews)?.player_image}
                  statLabel="Chances"
                  statValue={getTopPerformer('chances_created', previousMatchReviews)?.chances_created}
                />

                <TopPerformerCard
                  title="Most Tackles"
                  playerName={getTopPerformer('tackles', previousMatchReviews)?.player_name}
                  imageUrl={getTopPerformer('tackles', previousMatchReviews)?.player_image}
                  statLabel="Tackles"
                  statValue={getTopPerformer('tackles', previousMatchReviews)?.tackles}
                />

                <TopPerformerCard
                  title="Most Interceptions"
                  playerName={getTopPerformer('interceptions', previousMatchReviews)?.player_name}
                  imageUrl={getTopPerformer('interceptions', previousMatchReviews)?.player_image}
                  statLabel="Interceptions"
                  statValue={getTopPerformer('interceptions', previousMatchReviews)?.interceptions}
                />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No previous matches</Text>
            <Text style={styles.emptySubtext}>Play matches to see performance data here</Text>
          </View>
        )}
      </View>

      {/* Section: Pending Requests (Coach only) */}
      {user?.role === 'coach' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          {requests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending requests</Text>
              <Text style={styles.emptySubtext}>New join requests will appear here</Text>
            </View>
          ) : (
            <View style={styles.requestsList}>
              {requests.map((req) => (
                <View key={req.id} style={styles.requestWrapper}>
                  <RequestCard
                    id={req.id}
                    userName={req.user_name || 'Unknown'}
                    role={req.role || ''}
                    status={req.status}
                    onApprove={() => handleApprove(req.id, req.role)}
                    onReject={() => handleReject(req.id, req.role)}
                  />
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Future sections here: Tactical Ratings, Top Performers, etc. */}
    </ScrollView>
  );
}

// Styles - Evolv11 Brand Colors & Nike-inspired Design
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f3f0', // Warm beige background matching logo
    paddingHorizontal: 20,
    paddingBottom: 100, // Extra padding to avoid tab bar
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a4d3a', // Dark green matching logo
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderTopWidth: 3,
    borderTopColor: '#1a4d3a',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1a4d3a',
    marginBottom: 20,
    letterSpacing: -0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  requestsList: {
    gap: 16,
  },
  requestWrapper: {
    borderRadius: 0,
    overflow: 'hidden',
  },
  noData: {
    fontStyle: 'italic',
    color: '#6b7280',
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 18,
  },
  requestCardWrapper: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 0,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  matchCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 0,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a',
  },
  matchOpponent: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  matchDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    lineHeight: 22,
  },
  matchScore: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a4d3a',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  topPerformersContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  subSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a4d3a',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  performersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
});
