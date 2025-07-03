// screens/TeamSetupScreen.tsx

import React, { useEffect, useState } from 'react'; // Core React hooks
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
} from 'react-native'; // React Native UI components
import { useNavigation } from '@react-navigation/native'; // Navigation hook

// Importing custom context and server adapters
import { useUser } from '../app/contexts/UserContext'; // Provides current logged-in user
import { createTeam, requestTeamJoin, getAllTeams } from '../adapters/teamAdapters'; // API functions for team operations

// Define the shape of a team object
interface Team {
  id: number;
  name: string;
}

// Component for setting up a team after registration
export default function TeamSetupScreen() {
  const { user } = useUser(); // Access current user from context
  const navigation = useNavigation(); // Get navigation object to enable screen transitions

  // Local state to manage team name input
  const [teamName, setTeamName] = useState('');

  // Stores the list of teams fetched from the backend
  const [existingTeams, setExistingTeams] = useState<Team[]>([]);

  // Keeps track of which team was selected by the user
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // Fetch all teams once when component mounts
  useEffect(() => {
    const fetchTeams = async () => {
      const [data, error] = await getAllTeams(); // Use adapter to fetch teams
      if (error) Alert.alert('Failed to load teams'); // Show alert if fetch fails
      else setExistingTeams(data); // Store retrieved teams in local state
    };

    fetchTeams(); // Trigger fetch when component loads
  }, []);

  // Handle the team creation process (for coaches)
  const handleCreateTeam = async () => {
    if (!teamName) return Alert.alert('Team name is required'); // Validation check

    const [data, error] = await createTeam({
      name: teamName,
      coach_id: user.id, // Send current user ID as coach ID
    });

    if (error) return Alert.alert('Failed to create team'); // Handle server error

    Alert.alert('Team created!'); // Notify success
    // You can redirect to dashboard or reset form here
  };

  // Handle request to join a team (for players or coaches)
  const handleJoinTeam = async () => {
    if (!selectedTeamId) return Alert.alert('Select a team first'); // Validation

    const [data, error] = await requestTeamJoin({
      user_id: user.id,
      team_id: selectedTeamId,
      role: user.role, // Send user role in request
    });

    if (error) return Alert.alert('Request failed'); // Show error alert

    Alert.alert('Join request sent!'); // Notify success
    // You can redirect or confirm status here
  };

  // UI rendering
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Setup</Text>

      {/* Only coaches can create teams */}
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

      {/* List all teams that user can join */}
      <FlatList
        data={existingTeams}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.teamItem,
              selectedTeamId === item.id && styles.selectedTeam, // Highlight if selected
            ]}
            onPress={() => setSelectedTeamId(item.id)} // Select team on press
          >
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Button to request to join selected team */}
      <Button title="Request to Join Team" onPress={handleJoinTeam} />
    </View>
  );
}

// Styles for the screen
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 }, // Main container layout
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 }, // Heading text
  label: { fontWeight: '600', marginVertical: 8 }, // Form label styling
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
    backgroundColor: '#cde1ff', // Highlight selected team
  },
});
