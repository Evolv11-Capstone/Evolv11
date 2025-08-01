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

export default function NotificationsScreen() {
  const { user } = useUser(); // Get user from global context
  const { activeTeamId } = useActiveTeam(); // Get selected team ID

  const [requests, setRequests] = useState<any[]>([]); // Local state for requests

  // Fetch requests on mount
  useEffect(() => {
    const fetchRequests = async () => {
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
    };

    fetchRequests();
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
        <Text style={styles.title}>Team Requests</Text>
        <Text style={styles.subtitle}>Manage pending join requests for your team</Text>
      </View>

      {/* Section: Pending Requests (Coach only) */}
      {user?.role === 'coach' ? (
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
      ) : (
        <View style={styles.section}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Access Restricted</Text>
            <Text style={styles.emptySubtext}>Only coaches can view and manage team requests</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

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
});
