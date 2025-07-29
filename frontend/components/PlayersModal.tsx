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
          <Text style={styles.title}>SELECT PLAYER</Text>
          <FlatList
            data={players}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => onSelect(item)}
                style={styles.item}
                activeOpacity={0.7}
              >
                <Text style={styles.playerName}>{item.name.toUpperCase()}</Text>
                <View style={styles.playerInfo}>
                  <Text style={styles.position}>{item.position || 'N/A'}</Text>
                  <Text style={styles.rating}>{item.overall_rating || 0}</Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.7}>
            <Text style={styles.closeText}>CLOSE</Text>
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
    backgroundColor: 'rgba(26, 77, 58, 0.8)', // Dark green overlay
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges for Nike aesthetic
    padding: 24,
    maxHeight: '70%',
    borderWidth: 3,
    borderColor: '#1a4d3a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '900', // Ultra-bold Nike typography
    marginBottom: 20,
    color: '#1a4d3a',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#d4b896',
    backgroundColor: '#f5f3f0',
    marginBottom: 8,
    borderRadius: 0, // Sharp edges
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '900', // Ultra-bold
    color: '#1a4d3a',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  playerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  position: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  rating: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1a4d3a',
    backgroundColor: '#d4b896',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 0, // Sharp edges
    minWidth: 32,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: '#1a4d3a',
    borderRadius: 0, // Sharp edges
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  closeText: {
    fontWeight: '900', // Ultra-bold
    color: '#ffffff',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
