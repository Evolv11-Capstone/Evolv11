import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Text,
  Alert,
  Dimensions,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../types/navigationTypes';
import { TeamPlayer, ModerateStats } from '../../../types/playerTypes';
import {
  fetchPlayerById,
  getPlayerModerateSummary,
  updatePlayerPosition,
} from '../../../adapters/playerAdapters';
import PlayerCard from '../../../components/PlayerCard';
import PlayerStatsSummary from '../../../components/PlayerStatsSummary';

type PlayerDetailRouteProp = RouteProp<RootStackParamList, 'PlayerDetail'>;

const { width } = Dimensions.get('window');

export default function PlayerDetailScreen() {
  const { playerId } = useRoute<PlayerDetailRouteProp>().params;

  const [player, setPlayer] = useState<TeamPlayer | null>(null);
  const [moderateStats, setModerateStats] = useState<ModerateStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedPlayer = await fetchPlayerById(playerId);
        setPlayer(fetchedPlayer);

        const [stats, statsError] = await getPlayerModerateSummary(playerId);
        if (!statsError && stats) {
          setModerateStats({
            goals: Number(stats.goals),
            assists: Number(stats.assists),
            saves: Number(stats.saves),
            tackles: Number(stats.tackles),
            interceptions: Number(stats.interceptions),
            chances_created: Number(stats.chances_created),
            minutes_played: Number(stats.minutes_played),
            coach_rating: Number(stats.coach_rating),
          });
        }
      } catch (err) {
        console.error('Failed to fetch player details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [playerId]);

  const handlePositionChange = async (newPosition: string) => {
  if (!player) return;

  try {
    await updatePlayerPosition(player.id, newPosition);

    // ✅ Re-fetch full player after update to ensure consistency
    const refreshed = await fetchPlayerById(player.id);
    setPlayer(refreshed);
  } catch (err) {
    console.error('Position update error:', err);
    Alert.alert('Error', 'Failed to update player position.');
  }
};

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#f8c300" />
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: '#333' }}>Player not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.cardWrapper}>
        <PlayerCard
          imageUrl={player.image_url ?? ''}
          name={player.name}
          nationality={player.nationality ?? 'Unknown'}
          position={player.position ?? 'N/A'}
          overallRating={player.overall_rating ?? 50}
          stats={{
            shooting: player.shooting ?? 0,
            passing: player.passing ?? 0,
            dribbling: player.dribbling ?? 0,
            defense: player.defense ?? 0,
            physical: player.physical ?? 0,
            coachGrade: player.coach_grade,
          }}
          onPositionChange={handlePositionChange}
        />
      </View>

      {moderateStats && (
        <View style={styles.statsWrapper}>
          <Text style={styles.sectionTitle}>All-Time Match Stats</Text>
          <PlayerStatsSummary
            stats={{
              goals: moderateStats.goals,
              assists: moderateStats.assists,
              saves: moderateStats.saves,
              tackles: moderateStats.tackles,
              interceptions: moderateStats.interceptions,
              chancesCreated: moderateStats.chances_created,
              minutesPlayed: moderateStats.minutes_played,
              coachRating: moderateStats.coach_rating,
            }}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingBottom: 40,
    alignItems: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  cardWrapper: {
    marginTop: 24,
    width: width * 0.9,
    borderRadius: 20,
    backgroundColor: '#fdfdfd',
    paddingVertical: 20,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  statsWrapper: {
    marginTop: 30,
    width: width * 0.92,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dedede',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#000',
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});
