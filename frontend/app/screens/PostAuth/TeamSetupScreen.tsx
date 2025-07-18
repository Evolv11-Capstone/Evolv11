// screens/TeamSetupScreen.tsx

import React, { useEffect, useState, useCallback } from 'react';

import { useFocusEffect } from '@react-navigation/native';

import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext'; // Global user context

// Import correct adapters
import { createTeam, getAllTeams } from '../../../adapters/teamAdapters';
import {
  createPlayerTeamRequest,
  createCoachTeamRequest,
} from '../../../adapters/teamRequestAdapters';

// Define the shape of a team object
interface Team {
  id: number;
  name: string;
}

// Component for team creation and join requests
export default function TeamSetupScreen() {
  const { user } = useUser(); // Get the current logged-in user
  const navigation = useNavigation(); // Navigation for future redirects

  // State to manage new team name input (for coaches)
  const [teamName, setTeamName] = useState('');

  // State to store teams fetched from the server
  const [existingTeams, setExistingTeams] = useState<Team[]>([]);

  // Track selected team (to join)
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Fetch all teams from the backend when screen loads
  useFocusEffect(
    useCallback(() => {
      const fetchTeams = async () => {
        const [data, error] = await getAllTeams();
        if (error) Alert.alert('Failed to load teams');
        else setExistingTeams(data);
      };

      fetchTeams();
    }, [])
  );

  // Coach-only: create a new team
  const handleCreateTeam = async () => {
    if (!teamName) return Alert.alert('Team name is required');
    if (!user) return Alert.alert('User not found');

    const [data, error] = await createTeam({
      name: teamName,
      coach_id: user.id,
    });

    if (error) return Alert.alert('Failed to create team');

    Alert.alert('Team created!');
    // You could refresh teams here or navigate to a dashboard
  };

  // Player or Coach: request to join an existing team
  const handleJoinTeam = async () => {
    if (!selectedTeamId) return Alert.alert('Select a team first');
    if (!user) return Alert.alert('User not found');

    let result;
    if (user.role === 'player') {
      result = await createPlayerTeamRequest(user.id, selectedTeamId);
    } else if (user.role === 'coach') {
      result = await createCoachTeamRequest(user.id, selectedTeamId);
    } else {
      return Alert.alert('Only coaches or players can join a team.');
    }

    if (!result.success) {
      return Alert.alert('Request failed', result.message || 'Unknown error');
    }

    Alert.alert('Join request sent!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Setup</Text>

      {/* Coach-only section: Create a new team */}
      {user && user.role === 'coach' && (
        <>
          <Text style={styles.label}>Create a new club:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter club name"
            value={teamName}
            onChangeText={setTeamName}
          />
          <Button title="Create Club" onPress={handleCreateTeam} />
        </>
      )}

      <Text style={styles.label}>Or join an existing club:</Text>

      {/* List of teams to request to join */}
      <FlatList
        data={existingTeams}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.teamItem,
              selectedTeamId === item.id && styles.selectedTeam,
            ]}
            onPress={() => setSelectedTeamId(item.id)}
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Submit join request */}
      <Button title="Request to Join Team" onPress={handleJoinTeam} />
    </View>
  );
}

// Styling
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  label: { fontWeight: '600', marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  teamItem: {
    padding: 12,
    backgroundColor: '#eee',
    borderRadius: 6,
    marginVertical: 4,
  },
  selectedTeam: {
    backgroundColor: '#cde1ff',
  },
});
