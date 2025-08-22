// components/MiniPlayerCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import countries from 'i18n-iso-countries';
import type { TeamPlayer } from '../types/playerTypes';
import GoalsIcon from './GoalsIcon';
import AssistIcon from './AssistIcon';

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

type Props = {
  player: TeamPlayer;
  onPress: () => void;
  onLongPress?: () => void;
  hasStatsSubmitted?: boolean;
  goalsScored?: number; // <-- Add this for goal count display
  assistsCount?: number; // <-- Add this for assist count display
};

const MiniPlayerCard: React.FC<Props> = ({ 
  player, 
  onPress, 
  onLongPress, 
  hasStatsSubmitted = false, 
  goalsScored = 0,
  assistsCount = 0
}) => {
  console.log('⚽ MiniPlayerCard:', player.name, { goalsScored, hasStatsSubmitted });
  
  const {
    name,
    nationality,
    image_url,
    overall_rating,
    shooting,
    passing,
    dribbling,
    defense,
    physical,
  } = player;

  const validImage =
    image_url && image_url.startsWith('http')
      ? image_url
      : 'https://www.pngkit.com/png/detail/799-7998601_profile-placeholder-person-icon.png';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      {/* Rating */}
      <View style={styles.ratingContainer}>
        <Text style={styles.ratingText}>{overall_rating ?? 0}</Text>
      </View>

      {/* Goals Icon (floating above card if player scored) */}
      {goalsScored > 0 && (
        <View style={styles.goalsContainer}>
          <GoalsIcon goalCount={goalsScored} size={18} />
        </View>
      )}

      {/* Assists Icon (floating above card if player assisted) */}
      {assistsCount > 0 && (
        <View style={styles.assistsContainer}>
          <AssistIcon assistCount={assistsCount} size={18} />
        </View>
      )}

      {/* Stats Submitted Checkmark */}
      {hasStatsSubmitted && (
        <View style={styles.checkmarkContainer}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      )}

      {/* Player Image */}
      <Image source={{ uri: validImage }} style={styles.image} />

      {/* Name */}
      <Text style={styles.name} numberOfLines={1}>
        {name.toUpperCase()}
      </Text>

      {/* Stats Row 1 */}
      <View style={styles.statsGrid}>
        <Stat label="SHO" value={shooting ?? 0} />
        <Stat label="PAS" value={passing ?? 0} />
        <Stat label="DRI" value={dribbling ?? 0} />
      </View>

      {/* Stats Row 2 */}
      <View style={styles.statsGrid}>
        <Stat label="DEF" value={defense ?? 0} />
        <Stat label="PHY" value={physical ?? 0} />
      </View>
    </TouchableOpacity>
  );
};

// Subcomponent for a stat box
const Stat = ({ label, value }: { label: string; value: number }) => (
  <View style={styles.stat}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges for Nike aesthetic
    borderWidth: 2,
    borderColor: '#d4b896',
    paddingVertical: 10,
    paddingHorizontal: 8,
    width: 85,
    height: 140, // Increased from 120 to 140
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
    overflow: 'visible', // Allow floating elements to extend beyond card
  },
  ratingContainer: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#1a4d3a',
    borderRadius: 0, // Sharp edges
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 22,
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  ratingText: {
    fontSize: 9,
    fontWeight: '900', // Ultra-bold Nike typography
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#32C759', // Nike green for success
    borderRadius: 0, // Sharp edges
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  goalsContainer: {
    position: 'absolute',
    top: -8, // Position it to float above the card
    left: 32, // Position next to rating container with better spacing
    zIndex: 15, // Ensure it appears above the card and other elements
    // Allow the icon to extend beyond card boundaries
    overflow: 'visible',
  },
  assistsContainer: {
    position: 'absolute',
    top: -8, // Position it to float above the card
    right: 32, // Position on the right side of the card
    zIndex: 15, // Ensure it appears above the card and other elements
    // Allow the icon to extend beyond card boundaries
    overflow: 'visible',
  },
  checkmark: {
    fontSize: 11,
    fontWeight: '900',
    color: '#ffffff',
    lineHeight: 12,
  },
  image: {
    width: 34, // Increased from 32 to 34
    height: 34, // Increased from 32 to 34
    borderRadius: 0, // Sharp edges
    borderWidth: 2,
    borderColor: '#1a4d3a',
    marginBottom: 5, // Increased margin
    backgroundColor: '#f5f3f0',
    marginTop: 12, // Increased to account for taller card
  },
  name: {
    fontSize: 9, // Increased from 8 to 9
    fontWeight: '900', // Ultra-bold
    color: '#1a4d3a',
    marginBottom: 5, // Increased margin for better spacing
    textAlign: 'center',
    letterSpacing: 0.2,
    lineHeight: 11, // Increased line height
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 3, // Increased margin
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 7, // Increased from 6 to 7
    color: '#666',
    fontWeight: '700', // Bold for Nike aesthetic
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 10, // Increased from 8 to 10
    fontWeight: '900', // Ultra-bold
    color: '#1a4d3a',
    marginTop: 1,
  },
});

export default MiniPlayerCard;
