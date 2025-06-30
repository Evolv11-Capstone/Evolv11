import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePlayer } from '../app/contexts/PlayerContext';
import PlayerCard from './PlayerCard';

// This screen displays the player card after creation
export default function PlayerHub() {
  const { player } = usePlayer();

  // If no player yet, show a message
  if (!player) {
    return (
      <View style={styles.center}>
        <Text>No player data yet. Create one in the first tab.</Text>
      </View>
    );
  }

  // If player exists, show the card with default stats
  return (
    <View style={styles.center}>
      <PlayerCard
        firstName={player.firstName}
        lastName={player.lastName}
        nationality={player.nationality}
        position={player.position}
        overall={50}
        shooting={50}
        passing={50}
        dribbling={50}
        defense={50}
        physical={50}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
});
