// components/TacticalBoard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import type { TeamPlayer } from '../types/playerTypes';
import MiniPlayerCard from './MiniPlayerCard';
import BenchSelector from './BenchSelector';

type Props = {
  formation: string;
  lineup: { [pos: string]: number | null };
  bench: number[];
  players: TeamPlayer[];
  onTapPosition: (pos: string) => void;
  onUnassign: (pos: string, playerId: number) => void;
  onBenchSlotTap: (slot: string) => void;
  onPlayerTap: (player: TeamPlayer) => void;
  playersWithStats?: Set<number>; // Track players with submitted stats
  playerGoals?: Map<number, number>; // <-- Add this to track player goals
  playerAssists?: Map<number, number>; // <-- Add this to track player assists
};

const { width } = Dimensions.get('window');
const FIELD_WIDTH = width - 32;
const FIELD_HEIGHT = FIELD_WIDTH * 1.8; // Increased from 1.5 to 1.8 for longer field

// Coordinates for player positions on field by formation
const positionCoordinates: {
  [formation: string]: { [pos: string]: { top: string; left: string } };
} = {
  '4-4-2': {
    GK: { top: '95%', left: '47%' },
    LB: { top: '75%', left: '10%' },
    CB1: { top: '75%', left: '35%' },
    CB2: { top: '75%', left: '60%' },
    RB: { top: '75%', left: '85%' },
    LM: { top: '50%', left: '10%' },
    CM1: { top: '50%', left: '36%' },
    CM2: { top: '50%', left: '59%' },
    RM: { top: '50%', left: '85%' },
    ST1: { top: '25%', left: '32%' },
    ST2: { top: '25%', left: '62%' },
  },
  '4-3-3': {
    GK: { top: '95%', left: '47.5%' },
    LB: { top: '75%', left: '10%' },
    CB1: { top: '75%', left: '35%' },
    CB2: { top: '75%', left: '60%' },
    RB: { top: '75%', left: '85%' },
    CM1: { top: '50%', left: '23.5%' },
    CM2: { top: '50%', left: '47.5%' },
    CM3: { top: '50%', left: '71%' },
    LW: { top: '25%', left: '17%' },
    ST: { top: '20%', left: '47.5%' },
    RW: { top: '25%', left: '80%' },
  },
};

const SLOT_WIDTH = 80;
const SLOT_HEIGHT = 70;
const SLOT_OFFSET_X = 8;
const SLOT_OFFSET_Y = -30;

const TacticalBoard: React.FC<Props> = ({
  formation,
  lineup,
  bench,
  players,
  onTapPosition,
  onUnassign,
  onBenchSlotTap,
  onPlayerTap,
  playersWithStats = new Set(),
  playerGoals = new Map(),
  playerAssists = new Map(),
}) => {
  const coords = positionCoordinates[formation];

  if (!coords) {
    return <Text>Formation "{formation}" is not yet supported.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TACTICAL BOARD</Text>
      <Text style={styles.instructions}>
        TAP A SLOT TO ASSIGN • TAP PLAYER FOR STATS • LONG-PRESS TO REMOVE
      </Text>

      {/* Field */}
      <View style={styles.field}>
        {/* Visual pitch lines */}
        <View style={styles.centerLine} />
        <View style={styles.centerCircle} />
        <View style={styles.penaltyBoxLeft} />
        <View style={styles.penaltyBoxRight} />
        <View style={styles.goalBoxLeft} />
        <View style={styles.goalBoxRight} />
        <View style={styles.spotCenter} />
        <View style={styles.spotLeft} />
        <View style={styles.spotRight} />

        {/* Player positions */}
        {Object.entries(coords).map(([pos, coord]) => {
          const playerId = lineup[pos];
          const player = players.find((p) => p.id === playerId);

          const top =
            (coord.top.endsWith('%') ? (parseFloat(coord.top) / 100) * FIELD_HEIGHT : Number(coord.top)) +
            SLOT_OFFSET_Y;
          const left =
            (coord.left.endsWith('%') ? (parseFloat(coord.left) / 100) * FIELD_WIDTH : Number(coord.left)) +
            SLOT_OFFSET_X;

          return (
            <View
              key={pos}
              style={[
                styles.positionSlot,
                {
                  top: top - SLOT_HEIGHT / 2,
                  left: left - SLOT_WIDTH / 2,
                  width: SLOT_WIDTH,
                  height: SLOT_HEIGHT,
                },
              ]}
            >
              {player ? (
                <MiniPlayerCard
                  player={player}
                  onPress={() => onPlayerTap(player)}
                  onLongPress={() => onUnassign(pos, player.id)}
                  hasStatsSubmitted={playersWithStats.has(player.id)}
                  goalsScored={playerGoals.get(player.id) || 0}
                  assistsCount={playerAssists.get(player.id) || 0}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => onTapPosition(pos)}
                  style={styles.emptySlot}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emptyText}>{pos}</Text>
                  <Text style={styles.tapPrompt}>TAP</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      {/* Bench */}
      <BenchSelector
        bench={bench}
        players={players}
        onAssign={onBenchSlotTap}
        onRemove={onUnassign}
        playersWithStats={playersWithStats}
        playerGoals={playerGoals}
        playerAssists={playerAssists}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '900', // Ultra-bold Nike typography
    marginBottom: 12,
    color: '#1a4d3a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  instructions: {
    fontSize: 11,
    color: '#666',
    marginBottom: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  field: {
    width: FIELD_WIDTH,
    height: FIELD_HEIGHT,
    backgroundColor: '#2d5a3d', // Darker, more professional green
    borderRadius: 0, // Sharp edges for Nike aesthetic
    alignSelf: 'center',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#1a4d3a',
    overflow: 'visible', // Allow floating elements like GoalsIcon to appear above the field
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  positionSlot: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    width: SLOT_WIDTH,
    height: SLOT_HEIGHT,
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    borderColor: '#d4b896',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyText: {
    fontWeight: '900', // Ultra-bold
    fontSize: 12,
    color: '#1a4d3a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tapPrompt: {
    fontSize: 9,
    color: '#666',
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 2,
    textTransform: 'uppercase',
  },

  // Field lines - Nike-inspired clean lines
  centerLine: {
    position: 'absolute',
    left: 0,
    width: '100%',
    height: 3,
    backgroundColor: '#ffffff',
    top: '50%',
    marginTop: -1.5,
    opacity: 0.8,
  },
  centerCircle: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: FIELD_WIDTH * 0.28,
    height: FIELD_WIDTH * 0.28,
    borderRadius: (FIELD_WIDTH * 0.28) / 2,
    borderWidth: 3,
    borderColor: '#ffffff',
    marginLeft: -(FIELD_WIDTH * 0.28) / 2,
    marginTop: -(FIELD_WIDTH * 0.28) / 2,
    opacity: 0.8,
  },
  penaltyBoxLeft: {
    position: 'absolute',
    left: '25%',
    top: 0,
    width: FIELD_WIDTH * 0.5,
    height: FIELD_HEIGHT * 0.18,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    opacity: 0.8,
  },
  penaltyBoxRight: {
    position: 'absolute',
    left: '25%',
    bottom: 0,
    width: FIELD_WIDTH * 0.5,
    height: FIELD_HEIGHT * 0.18,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    opacity: 0.8,
  },
  goalBoxLeft: {
    position: 'absolute',
    left: '38%',
    top: 0,
    width: FIELD_WIDTH * 0.24,
    height: FIELD_HEIGHT * 0.08,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    opacity: 0.8,
  },
  goalBoxRight: {
    position: 'absolute',
    left: '38%',
    bottom: 0,
    width: FIELD_WIDTH * 0.24,
    height: FIELD_HEIGHT * 0.08,
    borderWidth: 3,
    borderColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    opacity: 0.8,
  },
  spotCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 12,
    height: 12,
    borderRadius: 0, // Sharp square spot
    backgroundColor: '#ffffff',
    marginLeft: -6,
    marginTop: -6,
    opacity: 0.9,
  },
  spotLeft: {
    position: 'absolute',
    top: FIELD_HEIGHT * 0.12 - 6,
    left: '50%',
    width: 12,
    height: 12,
    borderRadius: 0, // Sharp square spot
    backgroundColor: '#ffffff',
    marginLeft: -6,
    opacity: 0.9,
  },
  spotRight: {
    position: 'absolute',
    bottom: FIELD_HEIGHT * 0.12 - 6,
    left: '50%',
    width: 12,
    height: 12,
    borderRadius: 0, // Sharp square spot
    backgroundColor: '#ffffff',
    marginLeft: -6,
    opacity: 0.9,
  },
});

export default TacticalBoard;
