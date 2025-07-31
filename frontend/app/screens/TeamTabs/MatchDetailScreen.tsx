// screens/TeamTabs/MatchDetailScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  Alert,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { getMatchById } from '../../../adapters/matchAdapters';
import {
  createLineup,
  addPlayerToLineup,
  unassignPlayerFromLineup,
  getFullLineupByMatch,
} from '../../../adapters/lineupAdapters';
import { getPlayersByTeam, getTeamById } from '../../../adapters/teamAdapters';
import { getPlayerMatchStats } from '../../../adapters/moderateReviewsAdapter';
import FormationSelector from '../../../components/FormationSelector';
import TacticalBoard from '../../../components/TacticalBoard';
import PlayerAssignmentBoard from '../../../components/PlayerAssignmentBoard';
import PlayerStatsModal from '../../../components/PlayerStatsModal';
import UpdateStatsInputModal from '../../../components/UpdateStatsInputModal';
import type { TeamPlayer } from '../../../types/playerTypes';

type Match = {
  id: number;
  opponent: string;
  match_date: string;
};

const MatchDetailScreen = () => {
  const { user } = useUser();
  const { activeTeamId, activeTeamName, setActiveTeamName } = useActiveTeam();
  const route = useRoute<RouteProp<{ params: { matchId: number } }, 'params'>>();
  const navigation = useNavigation();
  const { matchId } = route.params;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formation, setFormation] = useState<string | null>(null);
  const [lineup, setLineup] = useState<{ [pos: string]: number | null }>({});
  const [bench, setBench] = useState<number[]>([]);
  const [lineupId, setLineupId] = useState<number | null>(null);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<TeamPlayer | null>(null);
  const [playersWithStats, setPlayersWithStats] = useState<Set<number>>(new Set());
  const [showUpdateStatsModal, setShowUpdateStatsModal] = useState(false);
  const [showPlayerStatsModal, setShowPlayerStatsModal] = useState(false);

  // Function to load which players have submitted stats for this match
  const loadPlayersWithStats = async (playersList: TeamPlayer[]) => {
    const playersWithStatsSet = new Set<number>();
    
    // Check each player to see if they have stats for this match
    await Promise.all(
      playersList.map(async (player) => {
        try {
          const [stats, error] = await getPlayerMatchStats(player.id, matchId);
          if (stats && !error) {
            playersWithStatsSet.add(player.id);
          }
        } catch (error) {
          console.log(`No stats found for player ${player.id}:`, error);
        }
      })
    );
    
    setPlayersWithStats(playersWithStatsSet);
  };

  useEffect(() => {
    const initializeScreen = async () => {
      try {
        const [matchData] = await getMatchById(matchId);
        setMatch(matchData);

        // Fetch team name if not available in context
        if (activeTeamId && !activeTeamName) {
          const [teamData] = await getTeamById(activeTeamId);
          if (teamData?.name) {
            setActiveTeamName(teamData.name);
          }
        }

        const [teamPlayers] = await getPlayersByTeam(activeTeamId!);
        setPlayers(teamPlayers || []);

        // Load which players have submitted stats for this match
        if (teamPlayers && teamPlayers.length > 0) {
          await loadPlayersWithStats(teamPlayers);
        }

        const [lineupData] = await getFullLineupByMatch(matchId);
        if (lineupData) {
          setFormation(lineupData.formation);
          setLineupId(lineupData.lineup_id);

          const mappedLineup: { [pos: string]: number | null } = {};
          lineupData.players.forEach((p: any) => {
            if (!p.position.startsWith('B')) {
              mappedLineup[p.position] = p.player_id;
            }
          });
          setLineup(mappedLineup);

          const benchList = lineupData.players
            .filter((p: any) => p.position.startsWith('B'))
            .map((p: any) => p.player_id);
          setBench(benchList);
        }
      } catch (err) {
        console.error('❌ Error loading match or lineup:', err);
        Alert.alert('Failed to load match data');
      } finally {
        setLoading(false);
        // Add a small delay to ensure smooth rendering
        setTimeout(() => {
          setInitialLoading(false);
        }, 800); // 800ms delay for smooth loading experience
      }
    };

    initializeScreen();
  }, [matchId, activeTeamId, activeTeamName]);

  const handleFormationSelect = async (formationChoice: string) => {
    try {
      const [newLineup] = await createLineup({
        team_id: activeTeamId!,
        match_id: matchId,
        formation: formationChoice,
      });

      if (newLineup?.id) {
        setFormation(formationChoice);
        setLineupId(newLineup.id);
        const parts = formationChoice.split('-');
        const newLineupMap: { [pos: string]: number | null } = { GK: null };
        parts.forEach((count, rowIdx) => {
          const num = parseInt(count);
          for (let i = 1; i <= num; i++) {
            const pos = rowIdx === 0 ? `D${i}` : rowIdx === 1 ? `M${i}` : `A${i}`;
            newLineupMap[pos] = null;
          }
        });
        setLineup(newLineupMap);
        setBench([]);
      }
    } catch (err) {
      console.error('❌ Could not create lineup:', err);
      Alert.alert('Error creating lineup');
    }
  };

  const handleAssign = async (position: string, playerId: number) => {
    if (!lineupId) return;
    try {
      await addPlayerToLineup({ lineup_id: lineupId, player_id: playerId, position });
      if (position.startsWith('B')) {
        setBench((prev) => [...prev, playerId]);
      } else {
        setLineup((prev) => ({ ...prev, [position]: playerId }));
      }
    } catch (err) {
      console.error('❌ Failed to assign player:', err);
    }
  };

  const handleUnassign = async (position: string, playerId: number) => {
    if (!lineupId) return;
    try {
      await unassignPlayerFromLineup({ lineup_id: lineupId, player_id: playerId, position });
      if (position.startsWith('B')) {
        setBench((prev) => prev.filter((id) => id !== playerId));
      } else {
        setLineup((prev) => ({ ...prev, [position]: null }));
      }
    } catch (err) {
      console.error('❌ Failed to unassign player:', err);
    }
  };

  const handlePlayerTap = (player: TeamPlayer) => {
    setSelectedPlayer(player);
    
    // Check if stats have already been submitted for this player
    if (playersWithStats.has(player.id)) {
      // Stats exist - show update confirmation modal
      setShowUpdateStatsModal(true);
    } else {
      // No stats exist - show stats input modal directly
      setShowPlayerStatsModal(true);
    }
  };

  const handleCloseModals = () => {
    setSelectedPlayer(null);
    setShowUpdateStatsModal(false);
    setShowPlayerStatsModal(false);
  };

  const handleUpdateInput = () => {
    // Close the update confirmation modal and open the stats input modal
    setShowUpdateStatsModal(false);
    setShowPlayerStatsModal(true);
  };

  const assignedPlayerIds = [
    ...Object.values(lineup).filter(Boolean),
    ...bench,
  ] as number[];
  const availablePlayers = players.filter((p) => !assignedPlayerIds.includes(p.id));

  // Show initial loading animation
  if (initialLoading) {
    return (
      <View style={styles.initialLoader}>
        <View style={styles.loaderContent}>
          <ActivityIndicator size="large" color="#1a4d3a" />
          <Text style={styles.loadingTitle}>Loading Match Details</Text>
          <Text style={styles.loadingSubtitle}>Preparing tactical board...</Text>
        </View>
      </View>
    );
  }

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a4d3a" />
        <Text style={styles.loadingText}>Updating lineup...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {match && (
          <View style={styles.headerSection}>
            <View style={styles.matchHeaderContainer}>
              <Text 
                style={styles.matchTitle}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
                ellipsizeMode="tail"
              >
                {activeTeamName || 'YOUR TEAM'}
              </Text>
              <Text style={styles.versusText}>VS</Text>
              <Text 
                style={styles.opponentTitle}
                numberOfLines={2}
                adjustsFontSizeToFit={true}
                minimumFontScale={0.7}
                ellipsizeMode="tail"
              >
                {match.opponent.toUpperCase()}
              </Text>
            </View>
            <View style={styles.matchInfoContainer}>
              <Text style={styles.matchDate}>
                {new Date(match.match_date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }).toUpperCase()}
              </Text>
              <View style={styles.matchTypeIndicator}>
                <Text style={styles.matchTypeText}>TACTICAL SETUP</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Formation</Text>
          <FormationSelector selected={formation} onSelect={handleFormationSelect} />
        </View>

        {formation && (
          <>
            <View style={styles.card}>
              
              <TacticalBoard
                formation={formation}
                lineup={lineup}
                bench={bench}
                players={players}
                onTapPosition={(pos) => setSelectedPosition(pos)}
                onUnassign={handleUnassign}
                onBenchSlotTap={(slot) => setSelectedPosition(slot)}
                onPlayerTap={handlePlayerTap}
                playersWithStats={playersWithStats}
              />
            </View>

            <PlayerAssignmentBoard
              position={selectedPosition}
              players={availablePlayers}
              onAssign={handleAssign}
              onClose={() => setSelectedPosition(null)}
            />

            {selectedPlayer && (
              <>
                <UpdateStatsInputModal
                  visible={showUpdateStatsModal}
                  onClose={handleCloseModals}
                  onUpdateInput={handleUpdateInput}
                  playerName={selectedPlayer.name}
                />

                <PlayerStatsModal
                  visible={showPlayerStatsModal}
                  player={selectedPlayer}
                  matchId={matchId}
                  onClose={handleCloseModals}
                  onSave={async (stats) => {
                    console.log('Player stats saved:', stats);
                    // Update the players with stats set to show the checkmark
                    if (selectedPlayer) {
                      setPlayersWithStats(prev => new Set(prev).add(selectedPlayer.id));
                    }
                    // Optionally refresh all player stats to ensure consistency
                    await loadPlayersWithStats(players);
                    // Close all modals
                    handleCloseModals();
                  }}
                  playerName={selectedPlayer.name}
                  position={selectedPlayer.position || 'Unknown'}
                  matchDuration={90} // Replace with actual match duration if available
                />
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default MatchDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0',
    paddingTop: 0, // Remove top padding since we have navigation header
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3f0',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 120, // Add extra padding for navigation header and tab bar
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 20,
    marginBottom: 10,
    backgroundColor: '#f5f3f0',
  },
  matchHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 8,
    minHeight: 60,
  },
  matchTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a4d3a',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    marginRight: 8,
    flex: 1,
    textAlign: 'right',
    flexShrink: 1,
    minWidth: 0,
  },
  versusText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#d4b896',
    letterSpacing: 1,
    marginHorizontal: 8,
    opacity: 0.8,
    flexShrink: 0,
  },
  opponentTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1a4d3a',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    marginLeft: 8,
    flex: 1,
    textAlign: 'left',
    flexShrink: 1,
    minWidth: 0,
  },
  matchInfoContainer: {
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: '#d4b896',
    paddingTop: 16,
  },
  matchDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  matchTypeIndicator: {
    backgroundColor: '#1a4d3a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 0,
  },
  matchTypeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 4,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges for Nike-inspired design
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  errorText: {
    color: '#b00020',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 20,
  },
});
