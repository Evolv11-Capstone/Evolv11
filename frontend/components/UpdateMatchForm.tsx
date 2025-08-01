import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { updateMatch } from '../adapters/matchAdapters';

interface Match {
  id: number | string;
  opponent: string;
  team_score: number | null;
  opponent_score: number | null;
  match_date: string;
  season_id?: number;
}

interface UpdateMatchFormProps {
  visible: boolean;
  match: Match | null;
  onClose: () => void;
  onMatchUpdated: () => void;
}

const UpdateMatchForm = ({ visible, match, onClose, onMatchUpdated }: UpdateMatchFormProps) => {
  // Form state
  const [opponent, setOpponent] = useState('');
  const [goalsFor, setGoalsFor] = useState('');
  const [goalsAgainst, setGoalsAgainst] = useState('');
  const [matchDate, setMatchDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation
  const fadeAnim = new Animated.Value(0);

  // Pre-fill form when match changes
  useEffect(() => {
    if (match) {
      setOpponent(match.opponent);
      setGoalsFor(match.team_score?.toString() || '');
      setGoalsAgainst(match.opponent_score?.toString() || '');
      setMatchDate(new Date(match.match_date));
    }
  }, [match]);

  // Animate modal appearance
  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    // Reset form
    setOpponent('');
    setGoalsFor('');
    setGoalsAgainst('');
    setMatchDate(new Date());
    setShowDatePicker(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleUpdateMatch = async () => {
    if (!match) {
      Alert.alert('Error', 'No match data available.');
      return;
    }

    // Validation
    if (!opponent.trim()) {
      Alert.alert('Missing Field', 'Please enter the opponent team name.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedDate = matchDate.toISOString().split('T')[0];
      
      await updateMatch(Number(match.id), {
        opponent: opponent.trim(),
        team_score: Number(goalsFor) || 0,
        opponent_score: Number(goalsAgainst) || 0,
        match_date: formattedDate,
      });

      handleClose();
      onMatchUpdated();
      Alert.alert('Success', 'Match updated successfully!');
    } catch (error) {
      console.error('Error updating match:', error);
      Alert.alert('Error', 'Could not update match. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      setTempDate(selectedDate);
    }
  };

  const openDatePicker = () => {
    setTempDate(matchDate);
    setShowDatePicker(true);
  };

  const confirmDate = () => {
    setMatchDate(tempDate);
    setShowDatePicker(false);
  };

  const cancelDatePicker = () => {
    setShowDatePicker(false);
  };

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Match</Text>
            <View style={styles.modalSpacer} />
          </View>

          {/* Form */}
          <ScrollView style={styles.modalBody} contentContainerStyle={{ flexGrow: 1 }}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.formContainer}>
                {!match ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 16, color: '#666' }}>Loading match data...</Text>
                  </View>
                ) : (
                  <>
                    {/* Opponent Team */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Opponent Team</Text>
                      <TextInput
                        style={styles.input}
                        value={opponent}
                        onChangeText={setOpponent}
                        placeholder="Enter opponent team name"
                        placeholderTextColor="#666"
                        autoCapitalize="words"
                      />
                    </View>

                    {/* Match Date */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Match Date</Text>
                      <TouchableOpacity
                        style={styles.dateInput}
                        onPress={openDatePicker}
                      >
                        <Text style={[styles.dateText, { color: matchDate ? '#1a4d3a' : '#666' }]}>
                          {matchDate ? formatDateDisplay(matchDate) : 'Select match date'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Goals Row */}
                    <View style={styles.rowContainer}>
                      <View style={styles.inputGroupHalf}>
                        <Text style={styles.label}>Goals For</Text>
                        <TextInput
                          style={[styles.input, styles.inputHalf]}
                          value={goalsFor}
                          onChangeText={setGoalsFor}
                          placeholder="0"
                          keyboardType="numeric"
                          placeholderTextColor="#666"
                        />
                      </View>
                      <View style={styles.inputGroupHalf}>
                        <Text style={styles.label}>Goals Against</Text>
                        <TextInput
                          style={[styles.input, styles.inputHalf]}
                          value={goalsAgainst}
                          onChangeText={setGoalsAgainst}
                          placeholder="0"
                          keyboardType="numeric"
                          placeholderTextColor="#666"
                        />
                      </View>
                    </View>

                    {/* Update Button */}
                    <TouchableOpacity
                      style={[styles.updateButton, isSubmitting && styles.updateButtonDisabled]}
                      onPress={handleUpdateMatch}
                      disabled={isSubmitting}
                    >
                      <Text style={styles.updateButtonText}>
                        {isSubmitting ? 'Updating...' : 'Update Match'}
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </View>

        {/* Date Picker */}
        {showDatePicker && (
          <>
            {Platform.OS === 'ios' ? (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.datePickerModalOverlay}>
                  <View style={styles.datePickerContainer}>
                    <View style={styles.datePickerHeader}>
                      <TouchableOpacity onPress={cancelDatePicker}>
                        <Text style={styles.datePickerButton}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={styles.datePickerTitle}>Select Match Date</Text>
                      <TouchableOpacity onPress={confirmDate}>
                        <Text style={styles.datePickerButton}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      style={styles.datePicker}
                      minimumDate={new Date(1900, 0, 1)}
                      maximumDate={new Date(2100, 11, 31)}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    setMatchDate(selectedDate);
                  }
                  setShowDatePicker(false);
                }}
                minimumDate={new Date(1900, 0, 1)}
                maximumDate={new Date(2100, 11, 31)}
              />
            )}
          </>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges like rest of app
    width: '100%',
    maxWidth: 400,
    height: '70%',
    borderLeftWidth: 6, // Thicker accent border
    borderLeftColor: '#d4b896', // Evolv11 gold accent
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 1000,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#d4b896',
    backgroundColor: '#1a4d3a', // Evolv11 primary green
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  modalSpacer: {
    width: 20,
  },
  modalBody: {
    flex: 1,
    minHeight: 300,
  },
  formContainer: {
    padding: 24,
    flex: 1,
    backgroundColor: '#f5f3f0', // Light background like rest of app
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputGroupHalf: {
    flex: 1,
    marginHorizontal: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    marginHorizontal: -8,
  },
  label: {
    color: '#1a4d3a',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    borderWidth: 2,
    borderColor: '#d4b896',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 0, // Sharp edges
    fontSize: 16,
    color: '#1a4d3a',
    fontWeight: '600',
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputHalf: {
    flex: 1,
  },
  dateInput: {
    borderWidth: 2,
    borderColor: '#d4b896',
    backgroundColor: '#ffffff',
    padding: 16,
    minHeight: 52,
    justifyContent: 'center',
    borderRadius: 0, // Sharp edges
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: '600',
  },
  updateButton: {
    backgroundColor: '#1a4d3a',
    borderRadius: 0, // Sharp edges
    paddingVertical: 18,
    marginTop: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#1a4d3a',
  },
  updateButtonDisabled: {
    backgroundColor: '#666',
    borderColor: '#666',
    opacity: 0.7,
  },
  updateButtonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Date picker modal styles
  datePickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 0, // Sharp edges
    borderTopRightRadius: 0,
    paddingBottom: 24,
    borderTopWidth: 4,
    borderTopColor: '#d4b896',
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#d4b896',
    backgroundColor: '#1a4d3a',
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  datePickerButton: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  datePicker: {
    backgroundColor: '#ffffff',
  },
});

export default UpdateMatchForm;
