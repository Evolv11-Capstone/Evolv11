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
          <Text style={styles.title}>Select Player for {position}</Text>

          <FlatList
            data={players}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.playerBox}
                onPress={() => onAssign(position, item.id)}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Cancel</Text>
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  playerBox: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  closeButton: {
    marginTop: 16,
    alignSelf: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#007bff',
  },
});
