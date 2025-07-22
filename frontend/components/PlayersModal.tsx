// PlayersModal.tsx
// ✅ Reusable modal component to select a player from a list

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';

// Define the shape of a player
export type Player = {
  id: number;
  name: string;
};

// Props expected by the PlayersModal component
type PlayersModalProps = {
  visible: boolean; // Controls modal visibility
  position: string | null; // Position being assigned
  players: Player[]; // List of players to display
  onClose: () => void; // Callback to close modal
  onSelect: (playerId: number) => void; // Called when a player is selected
};

const PlayersModal: React.FC<PlayersModalProps> = ({
  visible,
  position,
  players,
  onClose,
  onSelect,
}) => {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Modal Title */}
        <Text style={styles.title}>Select Player for {position}</Text>

        {/* Scrollable List of Players */}
        <FlatList
          data={players}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.playerButton}
              onPress={() => onSelect(item.id)}
            >
              <Text style={styles.playerText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        {/* Cancel Button */}
        <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default PlayersModal;

// Styling for the modal
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  playerButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playerText: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  cancelText: {
    color: 'red',
    fontWeight: '500',
    fontSize: 16,
  },
});

// ... keep styles unchanged
