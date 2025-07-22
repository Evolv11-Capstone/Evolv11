// Updated MatchDetailScreen.tsx to use PlayersModal
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
import { getPlayersByTeam } from '../../../adapters/teamAdapters';
import { createLineup, addPlayerToLineup } from '../../../adapters/lineupAdapters';
import PlayersModal, { Player } from '../../../components/PlayersModal';
import type { RouteProp } from '@react-navigation/native';

// ... existing type definitions (MatchDetailRouteParams, Match)

const formationSlots = ['GK', 'LB', 'CB1', 'CB2', 'RB', 'CM1', 'CM2', 'CM3', 'LW', 'ST', 'RW'];

const MatchDetailScreen = () => {
  const { user } = useUser();
  const { activeTeamId } = useActiveTeam();
  const route = useRoute<RouteProp<{ params: { matchId: number } }, 'params'>>();
  const { matchId } = route.params;

  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);
  const [formation, setFormation] = useState<string | null>(null);
  const [lineupId, setLineupId] = useState<number | null>(null);
  const [startingLineup, setStartingLineup] = useState<{ [position: string]: number | null }>({});
  const [bench, setBench] = useState<number[]>([]);
  const [playerPickerVisible, setPlayerPickerVisible] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  const formationOptions = ['4-3-3', '4-4-2', '3-5-2', '3-4-3'];

  useEffect(() => {
    const fetchMatch = async () => {
      setLoading(true);
      const [data, error] = await getMatchById(matchId);
      if (!error) setMatch(data);
      setLoading(false);
    };
    fetchMatch();
  }, [matchId]);

  const handleFormationSelect = async (formation: string) => {
    setFormation(formation);
    const emptyLineup: { [pos: string]: number | null } = {};
    formationSlots.forEach((pos) => (emptyLineup[pos] = null));
    setStartingLineup(emptyLineup);
    const [data, error] = await createLineup({ team_id: activeTeamId, match_id: matchId, formation });
    if (!error) setLineupId(data.id);
  };

  const handlePositionPress = async (position: string) => {
    setSelectedPosition(position);
    const [players, error] = await getPlayersByTeam(activeTeamId);
    if (!error) {
      setAvailablePlayers(players);
      setPlayerPickerVisible(true);
    }
  };

  const handlePlayerSelect = async (playerId: number) => {
    if (!selectedPosition || !lineupId) return;
    setStartingLineup((prev) => ({ ...prev, [selectedPosition]: playerId }));
    setPlayerPickerVisible(false);
    await addPlayerToLineup({ lineup_id: lineupId, player_id: playerId, position: selectedPosition });
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#000" /><Text>Loading match...</Text></View>;
  if (!match) return <View style={styles.center}><Text>Match not found.</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Match vs {match.opponent}</Text>
      <Text style={styles.subtitle}>{new Date(match.match_date).toLocaleDateString()}</Text>
      <Text style={styles.score}>{match.team_score ?? '-'} - {match.opponent_score ?? '-'}</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Select Formation</Text>
        <View style={styles.formationContainer}>
          {formationOptions.map((f) => (
            <TouchableOpacity key={f} style={[styles.formationButton, formation === f && styles.formationSelected]} onPress={() => handleFormationSelect(f)}>
              <Text style={styles.formationText}>{f}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {formation && <Text style={styles.confirmedText}>Selected: {formation}</Text>}
      </View>

      {formation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Assign Players to Formation</Text>
          {formationSlots.map((position) => (
            <TouchableOpacity key={position} style={styles.slotRow} onPress={() => handlePositionPress(position)}>
              <Text style={styles.slotLabel}>{position}:</Text>
              <Text style={styles.slotValue}>
                {startingLineup[position] ? availablePlayers.find((p) => p.id === startingLineup[position])?.name || 'Assigned' : 'Tap to assign'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {formation && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Bench</Text>
          {bench.length === 0 ? <Text style={styles.placeholder}>No players assigned to bench.</Text> : bench.map((id) => {
            const player = availablePlayers.find((p) => p.id === id);
            return <Text key={id} style={styles.slotValue}>{player?.name}</Text>;
          })}
        </View>
      )}

      {/* PlayersModal as reusable component */}
      <PlayersModal
        visible={playerPickerVisible}
        position={selectedPosition}
        players={availablePlayers}
        onClose={() => setPlayerPickerVisible(false)}
        onSelect={handlePlayerSelect}
      />
    </ScrollView>
  );
};

export default MatchDetailScreen;
