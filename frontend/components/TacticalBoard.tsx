// components/TacticalBoard.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import type { TeamPlayer } from '../types/playerTypes';

type Props = {
  formation: string;
  lineup: { [pos: string]: number | null };
  bench?: number[];
  players: TeamPlayer[];
  onTapPosition: (pos: string) => void;
  onUnassign: (pos: string, playerId: number) => void;
};

const { width } = Dimensions.get('window');
const FIELD_WIDTH = width - 32;
const FIELD_HEIGHT = FIELD_WIDTH * 1.5;

// Map of standard positions to tactical field coordinates
const positionCoordinates: {
  [formation: string]: { [pos: string]: { top: string; left: string } };
} = {
  '4-4-2': {
    GK: { top: '90%', left: '47%' },
    LB: { top: '70%', left: '10%' },
    CB1: { top: '70%', left: '35%' },
    CB2: { top: '70%', left: '60%' },
    RB: { top: '70%', left: '85%' },
    LM: { top: '50%', left: '10%' },
    CM1: { top: '50%', left: '36%' },
    CM2: { top: '50%', left: '59%' },
    RM: { top: '50%', left: '85%' },
    ST1: { top: '25%', left: '32%' },
    ST2: { top: '25%', left: '62%' },
  },
  '4-3-3': {
    GK: { top: '90%', left: '49%' },
    LB: { top: '70%', left: '10%' },
    CB1: { top: '70%', left: '35%' },
    CB2: { top: '70%', left: '60%' },
    RB: { top: '70%', left: '85%' },
    CM1: { top: '50%', left: '27%' },
    CM2: { top: '50%', left: '49%' },
    CM3: { top: '50%', left: '71%' },
    LW: { top: '25%', left: '20%' },
    ST: { top: '20%', left: '49%' },
    RW: { top: '25%', left: '80%' },
  },
  // Add more as needed
};

const TacticalBoard: React.FC<Props> = ({
  formation,
  lineup,
  bench = [],
  players,
  onTapPosition,
  onUnassign,
}) => {
  const coords = positionCoordinates[formation];

  if (!coords) {
    return <Text>Formation "{formation}" not supported yet.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>2. Tactical Board</Text>

      {/* ⚽ Tactical Pitch */}
      <View style={styles.field}>
        {Object.entries(coords).map(([pos, coord]) => {
          const playerId = lineup[pos];
          const player = players.find((p) => p.id === playerId);
          return (
            <TouchableOpacity
              key={pos}
              onPress={() =>
                player ? onUnassign(pos, playerId!) : onTapPosition(pos)
              }
              style={[
                styles.positionButton,
                {
                  top: coord.top.endsWith('%')
                    ? (parseFloat(coord.top) / 100) * FIELD_HEIGHT
                    : Number(coord.top),
                  left: coord.left.endsWith('%')
                    ? (parseFloat(coord.left) / 100) * FIELD_WIDTH
                    : Number(coord.left),
                  transform: [{ translateX: -30 }, { translateY: -20 }],
                },
              ]}
            >
              <Text style={styles.positionLabel}>{pos}</Text>
              <Text style={styles.playerName}>
                {player ? player.name : 'Tap to assign'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 🪑 Bench Display */}
      <Text style={styles.benchLabel}>Bench</Text>
      <View style={styles.benchRow}>
        {[...Array(7)].map((_, idx) => {
          const pos = `B${idx + 1}`;
          const playerId = bench[idx];
          const player = players.find((p) => p.id === playerId);
          return (
            <TouchableOpacity
              key={pos}
              onPress={() =>
                player ? onUnassign(pos, playerId!) : onTapPosition(pos)
              }
              style={styles.benchSlot}
            >
              <Text style={styles.positionLabel}>{pos}</Text>
              <Text style={styles.playerName}>
                {player ? player.name : 'Tap to assign'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  field: {
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
    backgroundColor: '#3cba54',
    borderRadius: 12,
    position: 'relative',
    alignSelf: 'center',
  },
  positionButton: {
    position: 'absolute',
    width: 80,
    paddingVertical: 6,
    backgroundColor: '#ffffffdd',
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  benchLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  benchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
  },
  benchSlot: {
    width: '28%',
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
    marginVertical: 6,
    borderColor: '#aaa',
    borderWidth: 1,
  },
  positionLabel: {
    fontWeight: '700',
    fontSize: 12,
  },
  playerName: {
    fontSize: 11,
    textAlign: 'center',
  },
});

export default TacticalBoard;
