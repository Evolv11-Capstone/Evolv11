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
  playersWithStats?: Set<number>; // <-- Add this to track players with submitted stats
};

const BenchSelector: React.FC<Props> = ({
  bench,
  players,
  maxSlots = 7,
  onAssign,
  onRemove,
  playersWithStats = new Set(),
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
              {player ? 
                `${player.name}${playersWithStats.has(player.id) ? ' ✓' : ''} (tap to remove)` : 
                'Tap to assign'
              }
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
    marginTop: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    color: '#1a4d3a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  slotBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 6,
    borderRadius: 0, // Sharp edges for Nike aesthetic
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  filled: {
    backgroundColor: '#f5f3f0', // Cream background
    borderColor: '#d4b896',
    borderLeftColor: '#1a4d3a',
  },
  empty: {
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    borderLeftColor: '#d4b896',
  },
  slotLabel: {
    fontWeight: '600',
    fontSize: 12,
    color: '#1a4d3a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  playerName: {
    fontSize: 13,
    marginTop: 4,
    color: '#666',
    fontWeight: '500',
  },
});
