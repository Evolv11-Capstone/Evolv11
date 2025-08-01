// components/AssistIcon.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  assistCount: number;
  size?: number;
};

const AssistIcon: React.FC<Props> = ({ assistCount, size = 18 }) => {
  if (assistCount <= 0) {
    return null;
  }

  return (
    <View style={[styles.iconContainer, { 
      top: -10, // Float above the card
      right: 10, // Position to the right side
    }]}>
      {/* Soccer Cleat Icon as the main element */}
      <MaterialCommunityIcons 
        name="shoe-cleat" 
        size={size + 3} 
        color="#d4b896" 
        style={styles.cleatIcon}
      />
      
      {/* Assist Count Badge overlaid on bottom-right */}
      <View style={[styles.badge, { 
        width: size * 0.7, 
        height: size * 0.7,
        borderRadius: size * 0.35,
        bottom: size * 0.6,
        right: -size * 0.35 
      }]}>
        <Text style={[styles.badgeText, { fontSize: size * 0.39 }]}>
          {assistCount}
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
    zIndex: 20, // High z-index to appear above everything
  },
  cleatIcon: {
    // Enhanced shadow for the icon to make it stand out
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  badge: {
    position: 'absolute',
    backgroundColor: '#1a4d3a', // Green for assist count (different from goals)
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

export default AssistIcon;
