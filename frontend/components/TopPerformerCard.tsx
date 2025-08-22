import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

interface TopPerformerCardProps {
  title: string;
  playerName?: string;
  imageUrl?: string;
  statLabel: string;
  statValue?: number;
  playerId?: number;
  onPress?: (playerId: number) => void;
}

export default function TopPerformerCard({
  title,
  playerName,
  imageUrl,
  statLabel,
  statValue,
  playerId,
  onPress
}: TopPerformerCardProps) {
  const hasData = playerName && statValue !== undefined && statValue > 0;
  const isInteractive = hasData && playerId && onPress;

  const handlePress = () => {
    if (isInteractive) {
      onPress(playerId);
    }
  };

  const CardWrapper = isInteractive ? TouchableOpacity : View;

  return (
    <CardWrapper 
      style={[
        styles.performerCard,
        isInteractive ? styles.interactiveCard : null
      ]}
      onPress={isInteractive ? handlePress : undefined}
      activeOpacity={isInteractive ? 0.7 : 1}
    >
      <Text style={styles.performerLabel}>{title}</Text>
      
      {hasData ? (
        <View style={styles.performerInfo}>
          <View style={styles.playerImageContainer}>
            {imageUrl ? (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.playerImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>
                  {playerName.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.playerDetails}>
            <Text style={styles.performerName}>{playerName}</Text>
            <Text style={styles.performerStat}>
              {statValue} {statLabel.toLowerCase()}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.noDataContainer}>
          <View style={styles.placeholderImageSmall}>
            <Text style={styles.placeholderTextSmall}>?</Text>
          </View>
          <Text style={styles.noDataText}>No standout performer</Text>
        </View>
      )}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  performerCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 0,
    padding: 16,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#d4b896',
    marginBottom: 12,
    minHeight: 80,
  },
  interactiveCard: {
    backgroundColor: '#ffffff',
    shadowColor: '#1a4d3a',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  performerLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 14,
  },
  performerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerImageContainer: {
    marginRight: 16,
  },
  playerImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#1a4d3a',
  },
  placeholderImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1a4d3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  playerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  performerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  performerStat: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  noDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeholderImageSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeholderTextSmall: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9ca3af',
    fontStyle: 'italic',
    flex: 1,
  },
});
