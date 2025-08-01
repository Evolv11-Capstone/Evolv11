import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface TopPerformerCardProps {
  title: string;
  playerName?: string;
  imageUrl?: string;
  statLabel: string;
  statValue?: number;
}

export default function TopPerformerCard({
  title,
  playerName,
  imageUrl,
  statLabel,
  statValue
}: TopPerformerCardProps) {
  const hasData = playerName && statValue !== undefined && statValue > 0;

  return (
    <View style={styles.performerCard}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  performerCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 0,
    padding: 16,
    width: '48%',
    borderLeftWidth: 3,
    borderLeftColor: '#d4b896',
    marginBottom: 12,
    minHeight: 100,
  },
  performerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  performerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  playerImageContainer: {
    marginRight: 12,
  },
  playerImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#1a4d3a',
  },
  placeholderImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a4d3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  playerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  performerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 4,
    letterSpacing: -0.1,
  },
  performerStat: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
  },
  noDataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  placeholderImageSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  placeholderTextSmall: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
  noDataText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9ca3af',
    fontStyle: 'italic',
    flex: 1,
  },
});
