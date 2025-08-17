// components/LogoutButton.tsx

import React from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../adapters/authAdapters';
import { useUser } from '../app/contexts/UserContext';
import { useActiveTeam } from '../app/contexts/ActiveTeamContext'; // Import context
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigationTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LogoutButton() {
  const { setUser } = useUser(); // Clear user session
  const { setActiveTeamId, setActiveTeamName } = useActiveTeam(); // Clear selected team and name
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              const [data, error] = await logoutUser();

              if (error) {
                Alert.alert('Logout Failed', error.message);
                return;
              }

              // Clear both user and active team from global state
              setUser(null);
              setActiveTeamId(null);
              setActiveTeamName(undefined);

              // Reset navigation to unauthenticated state
              navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

// AccountSettings-inspired logout button styles
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#dc2626',
    marginTop: 8,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
