import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Define props for type safety
type PlayerCardProps = {
  firstName: string;
  lastName: string;
  nationality: string;
  position: string;
  overall: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
};

export default function PlayerCard({
  firstName,
  lastName,
  nationality,
  position,
  overall,
  shooting,
  passing,
  dribbling,
  defense,
  physical,
}: PlayerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const matchesPlayed = 14;
  const coachGrade = 8.2;

  return (
    <TouchableOpacity style={styles.card} onPress={() => setIsExpanded(!isExpanded)}>
      {/* Top left: Rating, position, flag */}
      <View style={styles.headerOverlay}>
        <Text style={styles.rating}>{overall}</Text>
        <Text style={styles.position}>{position}</Text>
        <Text style={styles.flag}>{nationality}</Text>
      </View>

      {/* Placeholder for image */}
      <View style={styles.imagePlaceholder}>
        <Text style={{ color: '#888' }}>[Player Image]</Text>
      </View>

      {/* Name */}
      <Text style={styles.name}>{firstName} {lastName}</Text>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statRow}>
          <Text style={styles.stat}>PAC {physical}</Text>
          <Text style={styles.stat}>SHO {shooting}</Text>
          <Text style={styles.stat}>PAS {passing}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.stat}>DRI {dribbling}</Text>
          <Text style={styles.stat}>DEF {defense}</Text>
          <Text style={styles.stat}>PHY {physical}</Text>
        </View>
      </View>

      {/* Expanded info */}
      {isExpanded && (
        <View style={styles.extraInfo}>
          <Text>Matches Played: {matchesPlayed}</Text>
          <Text>Coach Grade: {coachGrade} / 10</Text>
          <Text>Recent Form: 🔼</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200, // Slightly smaller
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    padding: 16,
    alignItems: 'center',
    elevation: 6, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginVertical: 12,
  },
  headerOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    alignItems: 'flex-start',
  },
  rating: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
  },
  position: {
    fontSize: 14,
    color: '#444',
    marginTop: 2,
  },
  flag: {
    fontSize: 16,
    marginTop: 2,
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: '#e1e1e1',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 36,
    marginBottom: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  statsGrid: {
    width: '100%',
    marginBottom: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 1,
  },
  stat: {
    fontSize: 13,
    fontWeight: '500',
  },
  extraInfo: {
    marginTop: 10,
    alignItems: 'flex-start',
  },
});

