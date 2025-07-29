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
      <View style={styles.header}>
        <Text style={styles.title}>Team Setup</Text>
        <Text style={styles.subtitle}>Create or join a football club</Text>
      </View>

      {user?.role === 'coach' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Create New Club</Text>
          <Text style={styles.label}>Club Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter club name"
            value={teamName}
            onChangeText={setTeamName}
            placeholderTextColor="#9ca3af"
          />
          <TouchableOpacity 
            style={styles.button} 
            onPress={handleCreateTeam}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Create Club</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Join Existing Club</Text>
        <Text style={styles.label}>Available Clubs</Text>

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
              activeOpacity={0.8}
            >
              <Text style={[
                styles.teamName,
                selectedTeamId === item.id && styles.selectedTeamName,
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={handleJoinTeam}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Request to Join</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// Styles - Evolv11 Brand Colors & Nike-inspired Design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0', // Warm beige background matching logo
    paddingHorizontal: 20,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a4d3a', // Dark green matching logo
    marginBottom: 8,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
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
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#374151',
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 16,
    color: '#111827',
    fontWeight: '400',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#1a4d3a', // Dark green from logo
    borderRadius: 0,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#1a4d3a',
    borderRadius: 0,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  secondaryButtonText: {
    color: '#1a4d3a',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  teamCard: {
    padding: 20,
    borderRadius: 0,
    backgroundColor: '#ffffff',
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  selectedCard: {
    backgroundColor: '#f8f9fa',
    borderColor: '#1a4d3a',
    borderWidth: 2,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    letterSpacing: 0.1,
  },
  selectedTeamName: {
    color: '#1a4d3a',
    fontWeight: '600',
  },
});
