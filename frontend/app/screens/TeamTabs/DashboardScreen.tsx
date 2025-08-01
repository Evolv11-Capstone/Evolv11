import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';

import RequestCard from '../../../components/RequestCard'; // Component for join requests
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
import { Match } from '../../../types/matchTypes';

export default function DashboardScreen() {
  const { user } = useUser(); // Get user from global context
  const { activeTeamId } = useActiveTeam(); // Get selected team ID

  const [requests, setRequests] = useState<any[]>([]); // Local state for requests
  const [upcomingMatch, setUpcomingMatch] = useState<Match | null>(null); // State for upcoming match

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
        console.log('Matches API response:', { response, error, activeTeamId });
        
        if (response && !error && response.success) {
          const matches = response.data;
          const currentDate = new Date();
          console.log('Current date:', currentDate);
          console.log('All matches:', matches);
          
          const futureMatches = matches
            .filter((match: Match) => {
              const matchDate = new Date(match.match_date);
              console.log(`Match vs ${match.opponent}: ${match.match_date} -> ${matchDate} > ${currentDate}?`, matchDate > currentDate);
              return matchDate > currentDate;
            })
            .sort((a: Match, b: Match) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime());
          
          console.log('Future matches:', futureMatches);
          setUpcomingMatch(futureMatches.length > 0 ? futureMatches[0] : null);
        } else {
          console.log('No matches or error occurred:', { response, error });
        }
      } catch (error) {
        console.error('Error fetching upcoming match:', error);
      }
    };

    fetchDashboardData();
  }, [user, activeTeamId]);

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
            <Text style={styles.matchOpponent}>{upcomingMatch.opponent}</Text>
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
});
