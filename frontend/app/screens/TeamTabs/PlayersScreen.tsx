import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  Dimensions,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigationTypes';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { getPlayersByTeam } from '../../../adapters/teamAdapters';
import { TeamPlayer } from '../../../types/playerTypes';

const { width } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerDetail'>;

export default function PlayersScreen() {
  const { activeTeamId } = useActiveTeam();
  const navigation = useNavigation<NavigationProp>();
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      if (!activeTeamId) return;
      const [data, error] = await getPlayersByTeam(activeTeamId);

      if (error) {
        Alert.alert('Error', 'Failed to load players');
      } else {
        setPlayers(data ?? []);
      }

      setLoading(false);
    };

    fetchPlayers();
  }, [activeTeamId]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f8c300" />
        <Text style={styles.loadingText}>Loading players...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Team Roster</Text>
      <FlatList
        data={players}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PlayerDetail', { playerId: item.id })}
          >
            <Image
              source={{
                uri: item.image_url
                  ? item.image_url
                  : 'https://www.pngkit.com/png/detail/799-7998601_profile-placeholder-person-icon.png',
              }}
              style={styles.avatar}
            />
            <View style={styles.cardText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>Position: {item.position ?? 'N/A'}</Text>
              {item.nationality && (
                <Text style={styles.meta}>Nationality: {item.nationality}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingTop: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 16,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fdfdfd',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderColor: '#eee',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f8c300',
  },
  cardText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  meta: {
    fontSize: 14,
    color: '#666',
  },
});
