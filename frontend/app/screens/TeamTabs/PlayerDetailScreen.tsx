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
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../../types/navigationTypes';
import { TeamPlayer, ModerateStats } from '../../../types/playerTypes';
import {
  fetchPlayerById,
  getPlayerModerateSummary,
  updatePlayerPosition,
} from '../../../adapters/playerAdapters';
import { getUserById } from '../../../adapters/userAdapters';
import PlayerCard from '../../../components/PlayerCard';
import GoalieCard from '../../../components/GoalieCard';
import PlayerStatsSummary from '../../../components/PlayerStatsSummary';
import PerNinetyMinutesExpectations from '../../../components/PerNinetyMinutesExpectations';
import GrowthChart from '../../../components/GrowthChart';
import SpiderGraph from '../../../components/SpiderGraph';
import { calculateAge } from '../../../utils/dateUtils';

type PlayerDetailRouteProp = RouteProp<RootStackParamList, 'PlayerDetail'>;

const { width } = Dimensions.get('window');

export default function PlayerDetailScreen() {
  const { playerId } = useRoute<PlayerDetailRouteProp>().params;
  const navigation = useNavigation();

  const [player, setPlayer] = useState<TeamPlayer | null>(null);
  const [moderateStats, setModerateStats] = useState<ModerateStats | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  // Note: User birthday is stored as a string in the database, not age

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedPlayer = await fetchPlayerById(playerId);
        setPlayer(fetchedPlayer);

        // Fetch user data if user_id exists
        if (fetchedPlayer.user_id) {
          console.log('Fetching user data for user_id:', fetchedPlayer.user_id);
          const [user, userError] = await getUserById(fetchedPlayer.user_id);
          if (!userError && user) {
            console.log('User data fetched:', user);
            setUserData(user);
          } else {
            console.log('Error fetching user data:', userError);
          }
        } else {
          console.log('No user_id found for player:', fetchedPlayer);
        }

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
            // Goalkeeper-specific stats
            successful_goalie_kicks: Number(stats.successful_goalie_kicks || 0),
            failed_goalie_kicks: Number(stats.failed_goalie_kicks || 0),
            successful_goalie_throws: Number(stats.successful_goalie_throws || 0),
            failed_goalie_throws: Number(stats.failed_goalie_throws || 0),
          });
        }
      } catch (err) {
        console.error('Failed to fetch player details:', err);
      } finally {
        setLoading(false);
        // Add a delay to ensure smooth rendering of images and styling
        setTimeout(() => {
          setInitialLoading(false);
        }, 800); // 800ms delay for smooth loading experience
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

      // ✅ PlayersScreen will automatically refresh when we navigate back due to useFocusEffect
    } catch (err) {
      console.error('Position update error:', err);
      Alert.alert('Error', 'Failed to update player position.');
    }
  };

  if (loading || initialLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#1a4d3a" />
        <Text style={styles.loadingText}>Loading player details...</Text>
        <Text style={styles.loadingSubtitle}>Preparing profile and statistics...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorText}>Player not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Player Details</Text>
        <Text style={styles.subtitle}>View player profile and statistics</Text>
      </View>

      {/* Player Info Section */}
      <View style={styles.playerInfoSection}>
        <Text style={styles.playerName}>{player.name}</Text>
        <View style={styles.playerMetadata}>
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Age</Text>
              <Text style={styles.metadataValue}>
                {userData && userData.birthday
                  ? `${calculateAge(userData.birthday)} years`
                  : 'Unknown'
                }
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Height</Text>
              <Text style={styles.metadataValue}>
                {userData && userData.height
                  ? userData.height
                  : 'Not specified'
                }
              </Text>
            </View>
          </View>
          <View style={styles.metadataRow}>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Preferred Position</Text>
              <Text style={styles.metadataValue}>
                {userData && userData.preferred_position
                  ? userData.preferred_position
                  : 'Not specified'
                }
              </Text>
            </View>
            <View style={styles.metadataItem}>
              <Text style={styles.metadataLabel}>Joined Club</Text>
              <Text style={styles.metadataValue}>
                {player.created_at 
                  ? new Date(player.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })
                  : 'Unknown'
                }
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.cardWrapper}>
        {player.position === 'GK' ? (
          <GoalieCard
            imageUrl={player.image_url ?? ''}
            name={player.name}
            nationality={player.nationality ?? 'Unknown'}
            position={player.position ?? 'N/A'}
            overallRating={player.overall_rating ?? 50}
            stats={{
              // Goalkeeper-specific stats
              diving: player.defense ?? 50,      // DIV - use defense as placeholder
              handling: player.physical ?? 50,   // HAN - use physical as placeholder  
              kicking: player.shooting ?? 50,    // KIC - use shooting as placeholder
              passing: player.passing ?? 50,     // PAS - use existing passing stat
              coachGrade: player.coach_grade,
            }}
            onPositionChange={handlePositionChange}
          />
        ) : (
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
        )}
      </View>



      {moderateStats && (
        <>
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

          <View style={styles.expectationsWrapper}>
            <Text style={styles.sectionTitle}>Performance Expectations</Text>
            <Text style={styles.sectionSubtitle}>Per 90 minutes based on historical data</Text>
            <PerNinetyMinutesExpectations
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

          <View style={styles.growthWrapper}>
            <Text style={styles.sectionTitle}>Player Development</Text>
            <Text style={styles.sectionSubtitle}>Attribute progression throughout the season</Text>
            <GrowthChart playerId={playerId} />
          </View>

          <View style={styles.spiderWrapper}>
        <Text style={styles.sectionTitle}>Player Attributes</Text>
        <Text style={styles.sectionSubtitle}>Core strengths visualization</Text>
        <SpiderGraph
          stats={{
            shooting: player.shooting ?? 0,
            passing: player.passing ?? 0,
            dribbling: player.dribbling ?? 0,
            defense: player.defense ?? 0,
            physical: player.physical ?? 0,
          }}
        />
      </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f3f0',
    paddingBottom: 100, // Add padding for tab bar
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3f0',
  },
  loadingText: {
    marginTop: 10,
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingSubtitle: {
    marginTop: 8,
    color: '#666',
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  errorText: {
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
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
  playerInfoSection: {
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#d4b896',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  playerName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a4d3a',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  playerMetadata: {
    marginTop: 8,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metadataItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  metadataLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metadataValue: {
    fontSize: 16,
    color: '#1a4d3a',
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,
  },
  cardWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 0, // Sharp edges for Nike-inspired design
    backgroundColor: '#ffffff',
    padding: 20,
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
  spiderWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: '#d4b896', // Gold accent for spider graph
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: '#1a4d3a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#1a4d3a',
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  expectationsWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: '#2c5530', // Slightly different green for distinction
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  growthWrapper: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    padding: 20,
    borderTopWidth: 3,
    borderTopColor: '#d4b896', // Different color for growth chart section
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});
