import React from 'react';
import { View, Text, Modal, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import type { TeamPlayer } from '../types/playerTypes';

// ✅ Fix: Define all props being passed from MatchDetailScreen
type Props = {
  position: string | null;
  players: TeamPlayer[];
  onAssign: (position: string, playerId: number) => Promise<void>;
  onClose: () => void;
};
const PlayerAssignmentBoard: React.FC<Props> = ({ position, players, onAssign, onClose }) => {
  if (!position) return null;

  return (
    <Modal visible transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>SELECT PLAYER FOR {position.toUpperCase()}</Text>

          <FlatList
            data={players}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.playerBox}
                onPress={() => onAssign(position, item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{item.name.toUpperCase()}</Text>
                  <View style={styles.playerDetails}>
                    <Text style={styles.position}>{item.position || 'N/A'}</Text>
                    <Text style={styles.rating}>{item.overall_rating || 0}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <Text style={styles.closeText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PlayerAssignmentBoard;

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Subtle dark overlay
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
    maxHeight: '75%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: '700', // Reduced from ultra-bold
    marginBottom: 24,
    textAlign: 'center',
    color: '#1a4d3a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  playerBox: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#ffffff',
    marginBottom: 4,
    borderRadius: 0,
    borderLeftWidth: 2,
    borderLeftColor: '#1a4d3a',
  },
  playerInfo: {
    flexDirection: 'column',
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600', // Reduced weight
    color: '#1a4d3a',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  playerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  position: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  rating: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a4d3a',
    backgroundColor: '#f5f3f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0,
    minWidth: 32,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 24,
    paddingVertical: 12,
    backgroundColor: '#1a4d3a',
    borderRadius: 0,
    alignItems: 'center',
  },
  closeText: {
    fontSize: 14,
    fontWeight: '600', // Reduced from ultra-bold
    color: '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
