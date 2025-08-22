// components/GoalsIcon.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

type Props = {
  goalCount: number;
  size?: number;
};

const GoalsIcon: React.FC<Props> = ({ goalCount, size = 18 }) => {
  if (goalCount <= 0) {
    return null;
  }

  return (
    <View style={[styles.iconContainer, { 
      top: -10, // Float above the card
      right: 20, // Position to the right of the card
    }]}>
      {/* Soccer Ball Icon as the main element */}
      <FontAwesome5 
        name="futbol" 
        size={size} 
        color="#d4b896" 
        style={styles.soccerBallIcon}
      />
      
      {/* Goal Count Badge overlaid on bottom-right */}
      <View style={[styles.badge, { 
        width: size * 0.7, 
        height: size * 0.7,
        borderRadius: size * 0.35,
        bottom: size * 0.6,
        right: -size * 0.35 
      }]}>
        <Text style={[styles.badgeText, { fontSize: size * 0.39 }]}>
          {goalCount}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20, // Increased z-index to appear above everything
  },
  soccerBallIcon: {
    // Enhanced shadow for the icon to make it stand out
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#1a4d3a', // Red for goal count
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 15,
    zIndex: 21, // Ensure badge appears above the icon
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 11,
    includeFontPadding: false,
    // Add subtle text shadow for better readability
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});

export default GoalsIcon;