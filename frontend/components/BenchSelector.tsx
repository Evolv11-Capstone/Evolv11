import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { TeamPlayer } from '../types/playerTypes';

type Props = {
  bench: number[]; // Array of player IDs
  players: TeamPlayer[]; // All players on the team
  maxSlots?: number; // Default is 7
  onAssign: (position: string) => void;
  onRemove: (position: string, playerId: number) => void;
};

const BenchSelector: React.FC<Props> = ({
  bench,
  players,
  maxSlots = 7,
  onAssign,
  onRemove,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>3. Bench ({bench.length}/{maxSlots})</Text>

      {[...Array(maxSlots)].map((_, idx) => {
        const pos = `B${idx + 1}`; // Position keys like B1, B2...
        const playerId = bench[idx] ?? null;
        const player = players.find((p) => p.id === playerId);

        return (
          <TouchableOpacity
            key={pos}
            style={[
              styles.slotBox,
              player ? styles.filled : styles.empty,
            ]}
            onPress={() =>
              player ? onRemove(pos, player.id) : onAssign(pos)
            }
          >
            <Text style={styles.slotLabel}>{pos}</Text>
            <Text style={styles.playerName}>
              {player ? `${player.name} (tap to remove)` : 'Tap to assign'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BenchSelector;

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingVertical: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
  },
  slotBox: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  filled: {
    backgroundColor: '#e6ffe6',
    borderColor: '#28a745',
  },
  empty: {
    backgroundColor: '#f9f9f9',
    borderColor: '#bbb',
  },
  slotLabel: {
    fontWeight: '600',
    fontSize: 13,
    color: '#333',
  },
  playerName: {
    fontSize: 14,
    marginTop: 4,
    color: '#222',
  },
});
