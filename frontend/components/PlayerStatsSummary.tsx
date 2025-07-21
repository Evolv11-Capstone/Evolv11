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
   
    <Text style={styles.statLabel}>{label}: {value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    width: '100%',
    backgroundColor: '#ffffffff',
    borderRadius: 12,
    padding: 16,
    borderColor: '#250e00ff',
    borderWidth: 1,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '48%',
    backgroundColor: '#ffffffff',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#black',
  },
  statLabel: {
    fontSize: 13,
    color: '#000000',
    marginTop: 4,
  },
});

export default PlayerStatsSummary;
