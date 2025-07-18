// components/LogoutButton.tsx

import React from 'react';
import { Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../adapters/authAdapters';
import { useUser } from '../app/contexts/UserContext';
import { useActiveTeam } from '../app/contexts/ActiveTeamContext'; // Import context
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigationTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function LogoutButton() {
  const { setUser } = useUser(); // Clear user session
  const { setActiveTeamId } = useActiveTeam(); // Clear selected team
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

    // Reset navigation to unauthenticated state
    navigation.reset({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
  };

  return <Button title="Log Out" onPress={handleLogout} />;
}
