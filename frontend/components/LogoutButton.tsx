// components/LogoutButton.tsx

import React from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
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
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <ArrowLeft size={20} color="#1a4d3a" strokeWidth={2} />
        <Text style={styles.logoutText}>LOG OUT</Text>
      </TouchableOpacity>
    </View>
  );
}

// Nike-inspired minimalist styles with app color palette
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f5f3f0',
    borderWidth: 1,
    borderColor: '#d4b896',
    borderRadius: 0, // Sharp edges for Nike aesthetic
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '900', // Ultra-bold Nike typography
    letterSpacing: 0.5,
    color: '#1a4d3a',
    marginLeft: 12,
    textTransform: 'uppercase',
  },
});
