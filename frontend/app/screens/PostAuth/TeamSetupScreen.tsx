import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';

import { createTeam, getAllTeams } from '../../../adapters/teamAdapters';
import {
  createPlayerTeamRequest,
  createCoachTeamRequest,
} from '../../../adapters/teamRequestAdapters';

interface Team {
  id: number;
  name: string;
}

export default function TeamSetupScreen() {
  const { user } = useUser();
  const navigation = useNavigation();

  const [teamName, setTeamName] = useState('');
  const [existingTeams, setExistingTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchTeams = async () => {
        const [data, error] = await getAllTeams();
        if (error) Alert.alert('Failed to load teams');
        else setExistingTeams(data ?? []);
      };
      fetchTeams();
    }, [])
  );

  const handleCreateTeam = async () => {
    if (!teamName) return Alert.alert('Team name is required');
    if (!user) return Alert.alert('User not found');

    const [data, error] = await createTeam({ name: teamName, coach_id: user.id });
    if (error) return Alert.alert('Failed to create team');

    Alert.alert('Team created!');
    setTeamName('');
  };

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>Team Setup</Text>

      {user?.role === 'coach' && (
        <View style={styles.section}>
          <Text style={styles.label}>Create a new club</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter club name"
            value={teamName}
            onChangeText={setTeamName}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.button} onPress={handleCreateTeam}>
            <Text style={styles.buttonText}>Create Club</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.label}>Or join an existing club</Text>

      <FlatList
        data={existingTeams}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.teamCard,
              selectedTeamId === item.id && styles.selectedCard,
            ]}
            onPress={() => setSelectedTeamId(item.id)}
          >
            <Text style={styles.teamName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />

      <TouchableOpacity style={styles.secondaryButton} onPress={handleJoinTeam}>
        <Text style={styles.secondaryButtonText}>Request to Join Team</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#111',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#f4f4f4',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#222',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#4b7bec',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#ff9f1c',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  teamCard: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginVertical: 6,
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#d6f0ff',
    borderColor: '#4b7bec',
    borderWidth: 1.5,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#222',
  },
});
