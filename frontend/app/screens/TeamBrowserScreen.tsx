import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/Colors';
import { useUser } from '../contexts/UserContext';
import { createPlayerTeamRequest } from '../../adapters/teamRequestAdapters';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface Team {
  id: number;
  name: string;
}

const TeamBrowserScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingTeam, setRequestingTeam] = useState<number | null>(null);

  // Fetch all teams
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      } else {
        Alert.alert('Error', 'Failed to load teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      Alert.alert('Error', 'Failed to load teams. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (teamId: number) => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    setRequestingTeam(teamId);
    try {
      const { success, message } = await createPlayerTeamRequest(user.id, teamId);
      
      if (success) {
        Alert.alert(
          'Request Sent',
          'Your join request has been sent to the team coach.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        Alert.alert('Error', message || 'Failed to send join request');
      }
    } catch (error) {
      console.error('Error sending join request:', error);
      Alert.alert('Error', 'Failed to send join request. Please try again.');
    } finally {
      setRequestingTeam(null);
    }
  };

  const renderTeam = ({ item }: { item: Team }) => (
    <View style={styles.teamCard}>
      <Text style={styles.teamName}>{item.name}</Text>
      <TouchableOpacity
        style={[
          styles.joinButton,
          requestingTeam === item.id && styles.joinButtonDisabled
        ]}
        onPress={() => handleJoinRequest(item.id)}
        disabled={requestingTeam === item.id}
      >
        {requestingTeam === item.id ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.joinButtonText}>Request to Join</Text>
        )}
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.tint} />
        <Text style={styles.loadingText}>Loading teams...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Browse Teams</Text>
        <Text style={styles.subtitle}>Find and request to join a team</Text>
      </View>

      <FlatList
        data={teams}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTeam}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0',
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    lineHeight: 22,
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
    color: '#6b7280',
  },
  listContainer: {
    paddingBottom: 100,
  },
  teamCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a',
  },
  teamName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a4d3a',
    marginBottom: 12,
  },
  joinButton: {
    backgroundColor: '#1a4d3a',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonDisabled: {
    opacity: 0.6,
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TeamBrowserScreen;
