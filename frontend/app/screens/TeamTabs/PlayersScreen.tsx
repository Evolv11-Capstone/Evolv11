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

import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchPlayers = async () => {
    if (!activeTeamId) return;
    setLoading(true);
    const [data, error] = await getPlayersByTeam(activeTeamId);

    if (error) {
      Alert.alert('Error', 'Failed to load players');
    } else {
      setPlayers(data ?? []);
    }

    setLoading(false);
  };

  useEffect(() => {
    const initializeScreen = async () => {
      await fetchPlayers();
      // Add a small delay to ensure smooth rendering
      setTimeout(() => {
        setInitialLoading(false);
      }, 800); // 800ms delay for smooth loading experience
    };

    initializeScreen();
  }, [activeTeamId]);

  // ✅ Refresh players when screen comes into focus (e.g., returning from PlayerDetail)
  useFocusEffect(
    React.useCallback(() => {
      if (activeTeamId) {
        fetchPlayers();
      }
    }, [activeTeamId])
  );

  // Show initial loading animation
  if (initialLoading) {
    return (
      <View style={styles.initialLoader}>
        <View style={styles.loaderContent}>
          <ActivityIndicator size="large" color="#1a4d3a" />
          <Text style={styles.loadingTitle}>Loading Team Roster</Text>
          <Text style={styles.loadingSubtitle}>Preparing your players...</Text>
        </View>
      </View>
    );
  }

  // Show regular loading for data refresh
  if (loading && !initialLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1a4d3a" />
        <Text style={styles.loadingText}>Updating players...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Team Roster</Text>
        <Text style={styles.subtitle}>View and manage your team players</Text>
      </View>

      <FlatList
        data={players}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('PlayerDetail', { playerId: item.id })}
            activeOpacity={0.8}
          >
            <Image
              source={{
                uri: item.image_url
                  ? item.image_url
                  : 'https://www.pngkit.com/png/detail/799-7998601_profile-placeholder-person-icon.png',
              }}
              style={styles.avatar}
            />
            <View style={styles.cardContent}>
              <Text style={styles.name}>{item.name}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>Position: {item.position ?? 'N/A'}</Text>
                {item.nationality && (
                  <Text style={styles.meta}>Nationality: {item.nationality}</Text>
                )}
              </View>
            </View>
            <View style={styles.arrow}>
              <Text style={styles.arrowText}>›</Text>
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
    backgroundColor: '#f5f3f0',
    paddingTop: 20,
    paddingBottom: 100, // Add padding for tab bar
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3f0',
  },
  initialLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3f0',
  },
  loaderContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingTitle: {
    marginTop: 20,
    color: '#1a4d3a',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  loadingSubtitle: {
    marginTop: 8,
    color: '#666',
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: '600',
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges for Nike-inspired design
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 0, // Sharp edges
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#d4b896',
  },
  cardContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'column',
    gap: 2,
  },
  meta: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
  },
  arrow: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a4d3a',
    borderRadius: 0,
  },
  arrowText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
