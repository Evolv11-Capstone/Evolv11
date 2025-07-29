import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  stats: {
    goals: number;
    assists: number;
    saves: number;
    tackles: number;
    interceptions: number;
    chancesCreated: number;
    minutesPlayed: number;
    coachRating: number;
  };
};

const PlayerStatsSummary: React.FC<Props> = ({ stats }) => {
  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <Stat label="Goals" value={stats.goals} />
        <Stat label="Assists" value={stats.assists} />
        <Stat label="Saves" value={stats.saves} />
        <Stat label="Tackles" value={stats.tackles} />
        <Stat label="Interceptions" value={stats.interceptions} />
        <Stat label="Chances Created" value={stats.chancesCreated} />
        <Stat label="Minutes Played" value={stats.minutesPlayed} />
        <Stat label="Coach Rating" value={stats.coachRating} />
      </View>
    </View>
  );
};

const Stat = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges for Nike-inspired design
    padding: 0,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    padding: 16,
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
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    letterSpacing: -0.1,
  },
});

export default PlayerStatsSummary;
