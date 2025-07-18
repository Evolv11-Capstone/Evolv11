import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { TeamPlayer } from '../types/playerTypes'; // Ensure TeamPlayer includes full attributes

// Props: receives a full player object
interface PlayerCardProps {
  player: TeamPlayer;
}

// PlayerCard component
export default function PlayerCard({ player }: PlayerCardProps) {
  return (
    <View style={styles.card}>
      {/* Optional image or placeholder */}
      <View style={styles.imageWrapper}>
        {player.image_url ? (
          <Image source={{ uri: player.image_url }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>{player.name[0]}</Text>
          </View>
        )}
      </View>

      {/* Player name and position */}
      <Text style={styles.name}>{player.name}</Text>
      <Text style={styles.position}>{player.position} | {player.nationality}</Text>

      {/* Overall rating */}
      <Text style={styles.ratingLabel}>Overall Rating</Text>
      <Text style={styles.overall}>{player.overall_rating}</Text>

      {/* Individual attributes */}
      <View style={styles.attributes}>
        <Text style={styles.attribute}>Shooting: {player.shooting}</Text>
        <Text style={styles.attribute}>Passing: {player.passing}</Text>
        <Text style={styles.attribute}>Dribbling: {player.dribbling}</Text>
        <Text style={styles.attribute}>Defense: {player.defense}</Text>
        <Text style={styles.attribute}>Stamina: {player.stamina}</Text>
      </View>
    </View>
  );
}

// Styles for the card layout
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 2,
  },
  imageWrapper: {
    marginBottom: 12,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  placeholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#cbd5e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  position: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  overall: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 16,
  },
  attributes: {
    alignItems: 'flex-start',
    width: '100%',
  },
  attribute: {
    fontSize: 14,
    paddingVertical: 2,
    color: '#334155',
  },
});
