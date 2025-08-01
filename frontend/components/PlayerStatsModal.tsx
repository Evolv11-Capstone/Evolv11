import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import type { TeamPlayer } from '../types/playerTypes';
import { 
  submitPlayerMatchStats, 
  getPlayerMatchStats,
  type PlayerMatchStats,
  type PlayerStatsSubmission
} from '../adapters/moderateReviewsAdapter';

export type PlayerStatsModalProps = {
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
  player,
  matchId,
}) => {
  const [stats, setStats] = useState<PlayerMatchStats>({ ...defaultStats });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false); // Track if we're updating existing stats

  useEffect(() => {
    const loadExistingStats = async () => {
      if (visible && player?.id && matchId) {
        setLoading(true);
        try {
          // Try to load existing stats for this player and match
          const [existingStats, error] = await getPlayerMatchStats(player.id, matchId);
          
          if (existingStats && !error) {
            console.log('Loaded existing stats for player:', player.id, existingStats);
            setStats(existingStats);
            setIsUpdating(true);
          } else if (initialStats) {
            console.log('Using initial stats provided:', initialStats);
            setStats(initialStats);
            setIsUpdating(false);
          } else {
            console.log('No existing stats found, using defaults');
            setStats({ ...defaultStats, minutes_played: matchDuration });
            setIsUpdating(false);
          }
        } catch (error) {
          console.error('Error loading existing stats:', error);
          // Fall back to default stats
          setStats({ ...defaultStats, minutes_played: matchDuration });
        } finally {
          setLoading(false);
        }
      } else if (!visible) {
        // Reset stats when modal is closed
        setStats({ ...defaultStats });
        setIsUpdating(false);
        setLoading(false);
      }
    };

    loadExistingStats();
  }, [visible, player?.id, matchId, initialStats, matchDuration]);

  const handleIncrement = (key: keyof PlayerMatchStats) =>
    setStats((prev) => ({ ...prev, [key]: prev[key] + 1 }));

  const handleDecrement = (key: keyof PlayerMatchStats) =>
    setStats((prev) => ({ ...prev, [key]: Math.max(0, prev[key] - 1) }));

  const handleNumericInput = (key: keyof PlayerMatchStats, value: string) => {
    // Allow empty string while user is typing
    if (value === '') {
      setStats((prev) => ({ ...prev, [key]: 0 }));
      return;
    }
    
    const numValue = parseInt(value, 10);
    
    // If not a valid number, ignore the input
    if (isNaN(numValue)) {
      return;
    }
    
    // Validate ranges
    let validatedValue = numValue;
    if (key === 'minutes_played') {
      validatedValue = Math.max(0, Math.min(90, numValue));
    } else if (key === 'coach_rating') {
      validatedValue = Math.max(0, Math.min(100, numValue));
    }
    
    setStats((prev) => ({ ...prev, [key]: validatedValue }));
  };

  const handleSave = async () => {
    if (!player?.id || !matchId) {
      Alert.alert('Error', 'Missing player or match information');
      return;
    }

    setSaving(true);
    try {
      const statsSubmission: PlayerStatsSubmission = {
        player_id: player.id,
        match_id: matchId,
        ...stats,
      };

      const [result, error] = await submitPlayerMatchStats(statsSubmission);

      if (error || !result) {
        throw new Error(error?.message || 'Failed to save stats');
      }

      if (result.success) {
        const actionText = isUpdating ? 'updated' : 'saved';
        
        Alert.alert(
          `Stats ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}!`, 
          `${playerName}'s stats have been ${actionText}. Overall rating: ${result.data.previous_attributes.overall_rating} → ${result.data.new_attributes.overall_rating}`,
          [
            {
              text: 'OK',
              onPress: () => {
                onSave(stats); // Call the parent callback
                onClose(); // Close the modal
              }
            }
          ]
        );
      } else {
        throw new Error(result.message || 'Failed to save stats');
      }
    } catch (error: any) {
      console.error('Error saving stats:', error);
      Alert.alert('Error', error.message || 'Failed to save player stats');
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof PlayerMatchStats; label: string; condition?: boolean; section?: 'stats' | 'manual' }[] = [
    { key: 'goals', label: 'Goals', section: 'stats' },
    { key: 'assists', label: 'Assists', section: 'stats' },
    { key: 'saves', label: 'Saves', condition: position === 'GK', section: 'stats' },
    { key: 'tackles', label: 'Tackles', section: 'stats' },
    { key: 'interceptions', label: 'Interceptions', section: 'stats' },
    { key: 'chances_created', label: 'Chances Created', section: 'stats' },
    { key: 'minutes_played', label: 'Minutes Played', section: 'manual' },
    { key: 'coach_rating', label: 'Coach Rating', section: 'manual' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>
            {isUpdating ? 'Update' : 'Enter'} Match Stats for {playerName}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1a4d3a" />
              <Text style={styles.loadingText}>Loading existing stats...</Text>
            </View>
          ) : (
            <ScrollView>
              {/* Toggle-based Stats Section */}
              {fields
                .filter(({ condition, section }) => condition !== false && section === 'stats')
                .map(({ key, label }) => (
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
                ))}

              {/* Section Divider */}
              <View style={styles.sectionDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.sectionLabel}>Coach Evaluation</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Manual Input Section */}
              {fields
                .filter(({ condition, section }) => condition !== false && section === 'manual')
                .map(({ key, label }) => (
                  <View style={styles.row} key={key}>
                    <Text style={styles.label}>{label}</Text>
                    <View style={styles.numericInputContainer}>
                      <TextInput
                        style={styles.numericInput}
                        value={stats[key].toString()}
                        onChangeText={(value) => handleNumericInput(key, value)}
                        keyboardType="numeric"
                        placeholder={key === 'minutes_played' ? "0-90" : "0-100"}
                        placeholderTextColor="#999"
                        maxLength={key === 'minutes_played' ? 2 : 3}
                      />
                      <Text style={styles.inputHint}>
                        {key === 'minutes_played' ? 'Max: 90' : 'Max: 100'}
                      </Text>
                    </View>
                  </View>
                ))}
            </ScrollView>
          )}

          <View style={styles.buttonRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose} disabled={saving}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Pressable 
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]} 
              onPress={handleSave}
              disabled={saving || loading}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveText}>
                  {isUpdating ? 'Update Stats' : 'Save Stats'}
                </Text>
              )}
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
  numericInputContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  numericInput: {
    borderWidth: 1,
    borderColor: '#d4b896',
    borderRadius: 0, // Sharp edges
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 60,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#1a4d3a',
    backgroundColor: '#f5f3f0',
  },
  inputHint: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: -8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d4b896',
    opacity: 0.5,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1a4d3a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    paddingHorizontal: 8,
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  saveBtnDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },
});
