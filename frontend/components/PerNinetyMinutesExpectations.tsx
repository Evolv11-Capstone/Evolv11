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

const PerNinetyMinutesExpectations: React.FC<Props> = ({ stats }) => {
  // Calculate per-90-minute expectations
  const calculatePer90 = (value: number, minutes: number): string => {
    if (minutes === 0) return '0.0';
    const per90 = (value / minutes) * 90;
    return per90.toFixed(1);
  };

  const expectedGoalsPer90 = calculatePer90(stats.goals, stats.minutesPlayed);
  const expectedAssistsPer90 = calculatePer90(stats.assists, stats.minutesPlayed);
  const expectedChancesPerMatch = calculatePer90(stats.chancesCreated, stats.minutesPlayed);
  const expectedTacklesPer90 = calculatePer90(stats.tackles, stats.minutesPlayed);
  const expectedInterceptionsPer90 = calculatePer90(stats.interceptions, stats.minutesPlayed);

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <ExpectationStat 
          label="Expected Goals/90" 
          value={expectedGoalsPer90} 
          unit="goals"
        />
        <ExpectationStat 
          label="Expected Assists/90" 
          value={expectedAssistsPer90} 
          unit="assists"
        />
        <ExpectationStat 
          label="Expected Chances/90" 
          value={expectedChancesPerMatch} 
          unit="chances"
        />
        <ExpectationStat 
          label="Expected Tackles/90" 
          value={expectedTacklesPer90} 
          unit="tackles"
        />
        <ExpectationStat 
          label="Expected Interceptions/90" 
          value={expectedInterceptionsPer90} 
          unit="Interceptions"
        />
        <ExpectationStat 
          label="Total Minutes" 
          value={stats.minutesPlayed.toString()} 
          unit="mins"
        />
      </View>
    </View>
  );
};

const ExpectationStat = ({ 
  label, 
  value, 
  unit 
}: { 
  label: string; 
  value: string; 
  unit: string;
}) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statUnit}>{unit}</Text>
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
    borderLeftColor: '#2c5530', // Slightly different green for distinction
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
    color: '#2c5530',
    marginBottom: 2,
    letterSpacing: -0.5,
  },
  statUnit: {
    fontSize: 12,
    color: '#2c5530',
    fontWeight: '500',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '400',
    letterSpacing: -0.1,
  },
});

export default PerNinetyMinutesExpectations;
