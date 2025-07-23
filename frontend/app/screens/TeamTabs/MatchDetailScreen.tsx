import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { getMatchById } from '../../../adapters/matchAdapters';
import {
  createLineup,
  addPlayerToLineup,
  getFullLineupByMatch,
} from '../../../adapters/lineupAdapters';
import { getPlayersByTeam } from '../../../adapters/teamAdapters';
import PlayersModal from '../../../components/PlayersModal';
import type { RouteProp } from '@react-navigation/native';
import type { TeamPlayer } from '../../../types/playerTypes';

type Match = {
  id: number;
  opponent: string;
  match_date: string;
};

const MatchDetailScreen = () => {
  const { user } = useUser(); // Current user context
  const { activeTeamId } = useActiveTeam(); // Active team ID context
  const route = useRoute<RouteProp<{ params: { matchId: number } }, 'params'>>();
  const { matchId } = route.params;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [formation, setFormation] = useState<string | null>(null);
  const [startingLineup, setStartingLineup] = useState<{ [position: string]: number | null }>({});
  const [bench, setBench] = useState<number[]>([]);
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [lineupId, setLineupId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const formationOptions = ['4-3-3', '4-4-2', '3-5-2', '3-4-3'];
  const formationSlots = ['GK', 'LB', 'CB1', 'CB2', 'RB', 'CM1', 'CM2', 'CM3', 'LW', 'ST', 'RW'];

  useEffect(() => {
    const load = async () => {
      try {
        // Load match details
        const [matchData] = await getMatchById(matchId);
        setMatch(matchData);

        // Load team players
        const [teamPlayers] = await getPlayersByTeam(activeTeamId!);
        setPlayers(teamPlayers || []);

        // Load lineup (if it exists)
        const [lineup] = await getFullLineupByMatch(matchId);
        if (lineup?.formation && lineup.players) {
          setFormation(lineup.formation);
          setLineupId(lineup.lineup_id);

          // Create position map
          const positionMap: { [key: string]: number | null } = {};
          formationSlots.forEach((pos) => {
            const found = lineup.players.find((p: any) => p.position === pos);
            positionMap[pos] = found ? found.player_id : null;
          });

          setStartingLineup(positionMap);
        }
      } catch (err) {
        Alert.alert('Error loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [matchId, activeTeamId]);

  // Create new lineup (only if one doesn't already exist)
  const handleFormationSelect = async (f: string) => {
    try {
     
      const [created] = await createLineup({
        team_id: activeTeamId!,
        match_id: matchId,
        formation: f,
      });

      if (!created?.id) throw new Error('Lineup not created');

      setLineupId(created.id);
      setFormation(f);

      // Reset lineup state
      const newLineup: { [key: string]: number | null } = {};
      formationSlots.forEach((pos) => (newLineup[pos] = null));
      setStartingLineup(newLineup);
    } catch (e) {
      Alert.alert('Could not create lineup');
    }
  };

  const handlePositionTap = (position: string) => {
    setSelectedPosition(position);
    setShowModal(true);
  };

  const handlePlayerSelect = async (player: TeamPlayer) => {
    try {
      if (!lineupId || !selectedPosition) return;

      await addPlayerToLineup({
        lineup_id: lineupId,
        player_id: player.id,
        position: selectedPosition,
      });

      setStartingLineup((prev) => ({
        ...prev,
        [selectedPosition]: player.id,
      }));
    } catch (e) {
      Alert.alert('Failed to assign player');
    } finally {
      setShowModal(false);
    }
  };

  if (loading) return <ActivityIndicator />;
  if (!match) return <Text>No match found</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Match vs {match.opponent}</Text>
      <Text>{new Date(match.match_date).toLocaleDateString()}</Text>

      {/* Formation Picker */}
      <Text style={styles.sectionTitle}>1. Select Formation</Text>
      {formationOptions.map((f) => (
        <TouchableOpacity key={f} onPress={() => handleFormationSelect(f)}>
          <Text style={[styles.formationOption, formation === f && styles.selectedFormation]}>{f}</Text>
        </TouchableOpacity>
      ))}

      {/* Lineup Assignment */}
      {formation && (
        <View>
          <Text style={styles.sectionTitle}>2. Assign Players</Text>
          {formationSlots.map((pos) => (
            <TouchableOpacity key={pos} onPress={() => handlePositionTap(pos)}>
              <Text>
                {pos}:{' '}
                {startingLineup[pos]
                  ? players.find((p) => p.id === startingLineup[pos])?.name
                  : 'Tap to assign'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Player Selection Modal */}
      <PlayersModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        players={players}
        onSelect={handlePlayerSelect}
      />
    </ScrollView>
  );
};

export default MatchDetailScreen;

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
  sectionTitle: { marginTop: 20, fontWeight: '600' },
  formationOption: { marginVertical: 8, fontSize: 16 },
  selectedFormation: { color: 'blue', fontWeight: 'bold' },
});
