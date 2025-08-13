import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../constants/Colors';
import { useUser } from '../contexts/UserContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

interface Team {
  id: number;
  name: string;
  invite_code: string;
}

const TeamJoinScreen = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewTeam, setPreviewTeam] = useState<Team | null>(null);

  // Look up team by invite code for preview
  const lookupTeam = async (code: string) => {
    if (code.length !== 8) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/teams/by-code/${code.toUpperCase()}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const team = await response.json();
        setPreviewTeam(team);
      } else {
        setPreviewTeam(null);
        if (response.status === 404) {
          Alert.alert('Team Not Found', 'No team found with this invite code.');
        }
      }
    } catch (error) {
      console.error('Error looking up team:', error);
      Alert.alert('Error', 'Failed to look up team. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual code entry
  const handleCodeChange = (text: string) => {
    const upperText = text.toUpperCase().slice(0, 8);
    setInviteCode(upperText);
    
    // Clear preview when code is changed
    if (upperText.length !== 8) {
      setPreviewTeam(null);
    }
  };

  // Search for team with current invite code
  const searchTeam = () => {
    if (inviteCode.length === 8) {
      lookupTeam(inviteCode);
    } else {
      Alert.alert('Invalid Code', 'Please enter a valid 8-character invite code.');
    }
  };

  // Submit join request
  const submitJoinRequest = async () => {
    if (!previewTeam) {
      Alert.alert('Error', 'Please enter a valid invite code first.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/player_team_requests/by-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          user_id: user.id,
          invite_code: inviteCode,
        }),
      });

      if (response.ok) {
        const request = await response.json();
        Alert.alert(
          'Request Submitted!',
          `Your request to join "${previewTeam.name}" has been submitted and is pending approval.`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to submit join request.');
      }
    } catch (error) {
      console.error('Error submitting join request:', error);
      Alert.alert('Error', 'Failed to submit join request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>Join a Team</Text>
      <Text style={styles.subtitle}>
        Enter your team's 8-character invite code
      </Text>

      {/* Manual Code Entry */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>Team Invite Code</Text>
        <TextInput
          style={styles.codeInput}
          value={inviteCode}
          onChangeText={handleCodeChange}
          placeholder="Enter 8-character code"
          placeholderTextColor="#666"
          maxLength={8}
          autoCapitalize="characters"
          autoCorrect={false}
        />
      </View>

      {/* Search Button */}
      <TouchableOpacity
        style={[styles.searchButton, inviteCode.length !== 8 && styles.searchButtonDisabled]}
        onPress={searchTeam}
        disabled={loading || inviteCode.length !== 8}
      >
        {loading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text style={styles.searchButtonText}>Search Team</Text>
        )}
      </TouchableOpacity>

      {/* Team Preview */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.light.tint} />
          <Text style={styles.loadingText}>Looking up team...</Text>
        </View>
      )}

      {previewTeam && (
        <View style={styles.previewContainer}>
          <Text style={styles.previewTitle}>Team Found!</Text>
          <Text style={styles.teamName}>{previewTeam.name}</Text>
          <Text style={styles.teamCode}>Code: {previewTeam.invite_code}</Text>
          
          <TouchableOpacity
            style={styles.joinButton}
            onPress={submitJoinRequest}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.joinButtonText}>Request to Join This Team</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1a1a2e', // Dark sporty theme
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#b0b0b0',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#ffffff',
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    fontFamily: 'monospace',
    textAlign: 'center',
    backgroundColor: '#16213e',
    color: '#ffffff',
    letterSpacing: 2,
  },
  searchButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  searchButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#b0b0b0',
  },
  previewContainer: {
    backgroundColor: '#16213e',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    marginBottom: 20,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.tint,
    textAlign: 'center',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: '#ffffff',
  },
  teamCode: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#b0b0b0',
    fontFamily: 'monospace',
  },
  joinButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TeamJoinScreen;
