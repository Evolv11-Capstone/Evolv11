import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import type { TeamPlayer } from '../types/playerTypes';

export type PlayerMatchStats = {
  goals: number;
  assists: number;
  saves: number;
  tackles: number;
  interceptions: number;
  chances_created: number;
  minutes_played: number;
  coach_rating: number;
};

type PlayerStatsModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (stats: PlayerMatchStats) => void;
  initialStats?: PlayerMatchStats;
  playerName: string;
  position: string;
  matchDuration: number;
  player: TeamPlayer; // <-- Add this line (required)
  matchId: number;    // <-- Add this line (required)
};

const defaultStats = {
  goals: 0,
  assists: 0,
  saves: 0,
  tackles: 0,
  interceptions: 0,
  chances_created: 0,
  minutes_played: 0,
  coach_rating: 50,
};

const PlayerStatsModal: React.FC<PlayerStatsModalProps> = ({
  visible,
  onClose,
  onSave,
  initialStats,
  playerName,
  position,
  matchDuration,
}) => {
  const [stats, setStats] = useState<PlayerMatchStats>({ ...defaultStats });

  useEffect(() => {
    if (initialStats) {
      setStats(initialStats);
    } else {
      setStats({ ...defaultStats, minutes_played: matchDuration });
    }
  }, [initialStats, matchDuration]);

  const handleIncrement = (key: keyof PlayerMatchStats) =>
    setStats((prev) => ({ ...prev, [key]: prev[key] + 1 }));

  const handleDecrement = (key: keyof PlayerMatchStats) =>
    setStats((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));

  const fields: { key: keyof PlayerMatchStats; label: string; condition?: boolean }[] = [
    { key: 'goals', label: 'Goals' },
    { key: 'assists', label: 'Assists' },
    { key: 'saves', label: 'Saves', condition: position === 'GK' },
    { key: 'tackles', label: 'Tackles' },
    { key: 'interceptions', label: 'Interceptions' },
    { key: 'chances_created', label: 'Chances Created' },
    { key: 'minutes_played', label: 'Minutes Played' },
    { key: 'coach_rating', label: 'Coach Rating' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Match Stats for {playerName}</Text>
          <ScrollView>
            {fields.map(({ key, label, condition }) =>
              condition === false ? null : (
                <View style={styles.row} key={key}>
                  <Text style={styles.label}>{label}</Text>
                  <View style={styles.controls}>
                    <TouchableOpacity onPress={() => handleDecrement(key)}>
                      <Text style={styles.controlBtn}>–</Text>
                    </TouchableOpacity>
                    <Text style={styles.value}>{stats[key]}</Text>
                    <TouchableOpacity onPress={() => handleIncrement(key)}>
                      <Text style={styles.controlBtn}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )
            )}
          </ScrollView>

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={() => onSave(stats)}>
              <Text style={styles.saveText}>Save Stats</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PlayerStatsModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges for Nike aesthetic
    padding: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    color: '#1a4d3a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 14,
    flex: 1,
    color: '#1a4d3a',
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlBtn: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f5f3f0', // Cream background
    borderRadius: 0, // Sharp edges
    color: '#1a4d3a',
    minWidth: 36,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#d4b896',
  },
  value: {
    marginHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#1a4d3a',
    minWidth: 32,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    borderWidth: 1,
    borderColor: '#d4b896',
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#1a4d3a',
    paddingVertical: 12,
    borderRadius: 0, // Sharp edges
    alignItems: 'center',
  },
  saveText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
