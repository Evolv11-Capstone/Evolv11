import React, { useState, useEffect, useContext } from 'react';
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

// Import context and adapters
import { useUser } from '../app/contexts/UserContext';
import { createTeam, requestTeamJoin, getAllTeams } from '../adapters/teamAdapters';

// Define the structure of a team
interface Team {
  id: number;
  name: string;
}

export default function TeamSetupScreen() {
  // Access user data from context
  const { user } = useUser();
  const navigation = useNavigation();

  // Local state for creating and selecting teams
  const [teamName, setTeamName] = useState('');
  const [existingTeams, setExistingTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Fetch all teams on component mount
  useEffect(() => {
    const fetchTeams = async () => {
      const [data, error] = await getAllTeams();
      if (error) Alert.alert('Failed to load teams');
      else setExistingTeams(data);
    };

    fetchTeams();
  }, []);

  // Handle creating a new team (only for coaches)
  const handleCreateTeam = async () => {
    if (!teamName) return Alert.alert('Team name is required');
    const [data, error] = await createTeam({ name: teamName, coach_id: user.id });

    if (error) return Alert.alert('Failed to create team');

    Alert.alert('Team created!');
    // Optionally: you can navigate or reset state here
  };

  // Handle requesting to join a team (players or coaches)
  const handleJoinTeam = async () => {
    if (!selectedTeamId) return Alert.alert('Select a team first');

    const [data, error] = await requestTeamJoin({
      user_id: user.id,
      team_id: selectedTeamId,
      role: user.role,
    });

    if (error) return Alert.alert('Request failed');

    Alert.alert('Join request sent!');
    // Optionally: navigate or update state
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Setup</Text>

      {/* Show create team field only for coaches */}
      {user.role === 'coach' && (
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

      {/* List existing teams to join */}
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

      <Button title="Request to Join Team" onPress={handleJoinTeam} />
    </View>
  );
}

// Styles for the screen
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
