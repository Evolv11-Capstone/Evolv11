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

export default function DashboardScreen() {
  const { user } = useUser(); // Get user from global context
  const { activeTeamId } = useActiveTeam(); // Get selected team ID

  const [requests, setRequests] = useState<any[]>([]); // Local state for requests

  // Fetch requests on mount if user is a coach
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user || !activeTeamId) return;

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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Team Dashboard</Text>

      {/* Section: Pending Requests (Coach only) */}
      {user?.role === 'coach' && (
        <>
          <Text style={styles.sectionTitle}>Pending Requests</Text>
          {requests.length === 0 ? (
            <Text style={styles.noData}>No pending requests.</Text>
          ) : (
            requests.map((req) => (
              <RequestCard
                key={req.id}
                id={req.id}
                userName={req.user_name || 'Unknown'}
                role={req.role || ''}
                status={req.status}
                onApprove={() => handleApprove(req.id, req.role)}
                onReject={() => handleReject(req.id, req.role)}
              />
            ))
          )}
        </>
      )}

      {/* Future sections here: Tactical Ratings, Top Performers, etc. */}
    </ScrollView>
  );
}

// Styling
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 12,
  },
  noData: {
    fontStyle: 'italic',
    color: '#666',
  },
});
