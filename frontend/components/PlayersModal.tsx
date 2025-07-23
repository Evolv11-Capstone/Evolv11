// PlayersModal.tsx

import React from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { TeamPlayer } from '../types/playerTypes';

type Props = {
  visible: boolean;
  onClose: () => void;
  players: TeamPlayer[];
  onSelect: (player: TeamPlayer) => void; // 🔧 FIX: accept full player
};

const PlayersModal = ({ visible, onClose, players, onSelect }: Props) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Select a Player</Text>
          <FlatList
            data={players}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item)} // 🔧 send full player
                style={styles.item}
              >
                <Text>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default PlayersModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    maxHeight: '70%',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  item: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  closeButton: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#ccc',
    borderRadius: 6,
    alignItems: 'center',
  },
  closeText: {
    fontWeight: '600',
  },
});
