import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  Alert,
  StyleSheet,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { getMatchById } from '../../../adapters/matchAdapters';
import {
  createLineup,
  addPlayerToLineup,
  unassignPlayerFromLineup,
  getFullLineupByMatch,
} from '../../../adapters/lineupAdapters';
import { getPlayersByTeam } from '../../../adapters/teamAdapters';
import FormationSelector from '../../../components/FormationSelector';
import TacticalBoard from '../../../components/TacticalBoard';
import PlayerAssignmentBoard from '../../../components/PlayerAssignmentBoard';
import type { TeamPlayer } from '../../../types/playerTypes';

type Match = {
  id: number;
  opponent: string;
  match_date: string;
};

const MatchDetailScreen = () => {
  const { user } = useUser();
  const { activeTeamId, activeTeamName } = useActiveTeam();
  const route = useRoute<RouteProp<{ params: { matchId: number } }, 'params'>>();
  const { matchId } = route.params;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [formation, setFormation] = useState<string | null>(null);
  const [lineup, setLineup] = useState<{ [pos: string]: number | null }>({});
  const [bench, setBench] = useState<number[]>([]);
  const [lineupId, setLineupId] = useState<number | null>(null);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  // ✅ Load all match, player, and lineup data on screen load
  useEffect(() => {
    const load = async () => {
      try {
        const [matchData] = await getMatchById(matchId);
        setMatch(matchData);

        const [teamPlayers] = await getPlayersByTeam(activeTeamId!);
        setPlayers(teamPlayers || []);

        const [lineupData] = await getFullLineupByMatch(matchId);

        if (lineupData) {
          setFormation(lineupData.formation);
          setLineupId(lineupData.lineup_id);

          // ✅ Build starting lineup object: { position: playerId }
          const mappedLineup: { [pos: string]: number | null } = {};
          lineupData.players.forEach((p: any) => {
            if (!p.position.startsWith('B')) {
              mappedLineup[p.position] = p.player_id;
            }
          });
          setLineup(mappedLineup);

          // ✅ Build bench list
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
      }
    };

    load();
  }, [matchId, activeTeamId]);

  // ✅ Handle new lineup creation (formation selection)
  const handleFormationSelect = async (formationChoice: string) => {
    try {
      const [newLineup, error] = await createLineup({
        team_id: activeTeamId!,
        match_id: matchId,
        formation: formationChoice,
      });

      if (newLineup?.id) {
        setFormation(formationChoice);
        setLineupId(newLineup.id);

        const newLineupMap: { [pos: string]: number | null } = {};

        // Generate empty position map based on known formation positions
        const parts = formationChoice.split('-'); // e.g. 4-4-2
        let posCount = 1;

        // Assume basic roles
        newLineupMap['GK'] = null;
        parts.forEach((count, rowIdx) => {
          const num = parseInt(count);
          for (let i = 1; i <= num; i++) {
            const pos = rowIdx === 0 ? `D${i}` : rowIdx === 1 ? `M${i}` : `A${i}`;
            newLineupMap[pos] = null;
            posCount++;
          }
        });

        setLineup(newLineupMap);
        setBench([]); // reset bench as well
      }
    } catch (err) {
      console.error('❌ Could not create lineup:', err);
      Alert.alert('Error creating lineup');
    }
  };

  // ✅ Assign player to a position
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

  // ✅ Remove player from a position
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

  // ✅ Get players who are not already assigned
  const assignedPlayerIds = [
    ...Object.values(lineup).filter(Boolean),
    ...bench,
  ] as number[];
  const availablePlayers = players.filter((p) => !assignedPlayerIds.includes(p.id));

  if (loading) return <ActivityIndicator size="large" />;
  if (!match) return <Text>Match not found</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {activeTeamName} vs {match.opponent}
      </Text>
      <Text style={styles.date}>{new Date(match.match_date).toLocaleDateString()}</Text>

      <FormationSelector selected={formation} onSelect={handleFormationSelect} />

      {formation && (
        <>
          <TacticalBoard
            formation={formation}
            lineup={lineup}
            bench={bench}
            players={players}
            onTapPosition={(pos) => setSelectedPosition(pos)}
            onUnassign={handleUnassign}
          />

          <PlayerAssignmentBoard
            position={selectedPosition}
            players={availablePlayers}
            onAssign={handleAssign}
            onClose={() => setSelectedPosition(null)}
          />
        </>
      )}
    </ScrollView>
  );
};

export default MatchDetailScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    paddingBottom: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  date: {
    fontSize: 16,
    marginBottom: 16,
    color: '#555',
  },
});
