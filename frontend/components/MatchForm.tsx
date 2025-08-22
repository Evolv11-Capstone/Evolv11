import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createMatch } from '../adapters/matchAdapters';
import { Season } from '../adapters/seasonAdapters';

interface MatchFormProps {
  visible: boolean;
  selectedSeason: Season | null;
  activeTeamId: number | null;
  onClose: () => void;
  onMatchCreated: () => void;
}

const MatchForm = ({ visible, selectedSeason, activeTeamId, onClose, onMatchCreated }: MatchFormProps) => {
  const [opponentTeam, setOpponentTeam] = useState('');
  const [goalsFor, setGoalsFor] = useState('');
  const [goalsAgainst, setGoalsAgainst] = useState('');
  const [matchDate, setMatchDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Temporary state for date picker (only committed on "Done")
  const [tempMatchDate, setTempMatchDate] = useState<Date>(new Date());

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    // Only update temporary state, don't auto-close or commit changes
    if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      setTempMatchDate(selectedDate);
    }
  };

  const openDatePicker = () => {
    // Initialize temp state with current value
    setTempMatchDate(matchDate);
    setShowDatePicker(true);
  };

  const confirmDate = () => {
    // Commit the temporary date and close picker
    setMatchDate(tempMatchDate);
    setShowDatePicker(false);
  };

  const cancelDatePicker = () => {
    // Close picker without saving changes
    setShowDatePicker(false);
  };

  const validateMatchDate = (date: Date): string | null => {
    if (!selectedSeason) return null;

    const seasonStart = new Date(selectedSeason.start_date);
    const seasonEnd = new Date(selectedSeason.end_date);
    
    // Normalize dates to compare only date parts (remove time components)
    const matchDate = new Date(date);
    matchDate.setHours(0, 0, 0, 0);
    seasonStart.setHours(0, 0, 0, 0);
    seasonEnd.setHours(0, 0, 0, 0);
    
    if (matchDate < seasonStart || matchDate > seasonEnd) {
      const formatDate = (d: Date) => d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return `Match date must be within the season's date range (${formatDate(seasonStart)} to ${formatDate(seasonEnd)}).`;
    }
    
    return null;
  };

  const handleCreateMatch = async () => {
    if (!opponentTeam || !matchDate) {
      Alert.alert('Missing Fields', 'Please fill in opponent team and match date.');
      return;
    }

    if (!selectedSeason) {
      Alert.alert('Error', 'No season selected.');
      return;
    }

    // Validate match date is within season bounds
    const dateValidationError = validateMatchDate(matchDate);
    if (dateValidationError) {
      Alert.alert('Invalid Match Date', dateValidationError);
      return;
    }

    setLoading(true);

    try {
      if (activeTeamId === null) {
        Alert.alert('Error', 'No active team selected.');
        return;
      }
      
      const formattedDate = matchDate.toISOString().split('T')[0];
      
      const [data, error] = await createMatch({
        team_id: activeTeamId,
        season_id: selectedSeason.id,
        opponent: opponentTeam,
        team_score: Number(goalsFor) || 0,
        opponent_score: Number(goalsAgainst) || 0,
        match_date: formattedDate,
      });

      if (error) {
        // Check if it's a season validation error and provide friendly message
        if (error.message && (
          error.message.includes('season bounds') || 
          error.message.includes('outside season bounds') ||
          error.message.includes('Season not found') ||
          error.message.includes('does not belong to')
        )) {
          const dateValidationError = validateMatchDate(matchDate);
          const friendlyMessage = dateValidationError || 
            `Match date must be within the season's date range.\n\nSeason: ${selectedSeason.name}\nAllowed dates: ${formatDateDisplay(new Date(selectedSeason.start_date))} to ${formatDateDisplay(new Date(selectedSeason.end_date))}\nSelected date: ${formatDateDisplay(matchDate)}`;
          
          Alert.alert(
            'Match Date Invalid', 
            friendlyMessage,
            [{ text: 'OK', style: 'default' }]
          );
        } else {
          Alert.alert('Error', error.message || 'Could not create match.');
        }
        return;
      }

      // Clear form and close modal
      clearForm();
      onClose();
      onMatchCreated();
      Alert.alert('Success', 'Match created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not create match.');
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setOpponentTeam('');
    setGoalsFor('');
    setGoalsAgainst('');
    setMatchDate(new Date());
    setShowDatePicker(false);
  };

  const handleClose = () => {
    clearForm();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={handleClose}
          >
            <Text style={styles.modalCloseText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Create Match for {selectedSeason?.name}</Text>
          <View style={styles.modalSpacer} />
        </View>

        <ScrollView style={styles.modalContent}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Opponent Team</Text>
                <TextInput
                  style={styles.input}
                  value={opponentTeam}
                  onChangeText={setOpponentTeam}
                  placeholder="Enter opponent team name"
                  placeholderTextColor="#666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Match Date</Text>
                <TouchableOpacity
                  style={[
                    styles.dateInput,
                    validateMatchDate(matchDate) && styles.dateInputError
                  ]}
                  onPress={openDatePicker}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dateText, { color: matchDate ? '#1a4d3a' : '#666' }]}>
                    {matchDate ? formatDateDisplay(matchDate) : 'Select match date'}
                  </Text>
                </TouchableOpacity>
                {validateMatchDate(matchDate) && (
                  <Text style={styles.validationError}>
                    {validateMatchDate(matchDate)}
                  </Text>
                )}
                {selectedSeason && (
                  <Text style={styles.seasonInfo}>
                    Season dates: {formatDateDisplay(new Date(selectedSeason.start_date))} to {formatDateDisplay(new Date(selectedSeason.end_date))}
                  </Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.inputHalf]}>
                  <Text style={styles.label}>Goals For</Text>
                  <TextInput
                    style={styles.input}
                    value={goalsFor}
                    onChangeText={setGoalsFor}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                  />
                </View>
                <View style={[styles.inputGroup, styles.inputHalf]}>
                  <Text style={styles.label}>Goals Against</Text>
                  <TextInput
                    style={styles.input}
                    value={goalsAgainst}
                    onChangeText={setGoalsAgainst}
                    placeholder="0"
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.createButton,
                  (loading || validateMatchDate(matchDate)) && styles.createButtonDisabled
                ]}
                onPress={handleCreateMatch}
                disabled={loading || !!validateMatchDate(matchDate)}
              >
                <Text style={styles.createButtonText}>
                  {loading ? 'Creating...' : 'Create Match'}
                </Text>
              </TouchableOpacity>

              {/* Date Picker with proper modal presentation and temporary state */}
              {showDatePicker && (
                <>
                  {Platform.OS === 'ios' ? (
                    <Modal
                      visible={showDatePicker}
                      transparent={true}
                      animationType="slide"
                    >
                      <View style={styles.modalOverlay}>
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
                          <View style={{ backgroundColor: '#ffffff', padding: 10 }}>
                            <DateTimePicker
                              value={tempMatchDate}
                              mode="date"
                              display="spinner"
                              onChange={handleDateChange}
                              style={[styles.datePicker, { backgroundColor: '#ffffff' }]}
                              minimumDate={selectedSeason ? new Date(selectedSeason.start_date) : new Date(1900, 0, 1)}
                              maximumDate={selectedSeason ? new Date(selectedSeason.end_date) : new Date(2100, 11, 31)}
                              textColor="#000000"
                              accentColor="#1a4d3a"
                            />
                          </View>
                        </View>
                      </View>
                    </Modal>
                  ) : (
                    <DateTimePicker
                      value={tempMatchDate}
                      mode="date"
                      display="default"
                      onChange={(event, selectedDate) => {
                        // For Android, commit immediately since it uses native dialog
                        if (selectedDate) {
                          setMatchDate(selectedDate);
                        }
                        setShowDatePicker(false);
                      }}
                      minimumDate={selectedSeason ? new Date(selectedSeason.start_date) : new Date(1900, 0, 1)}
                      maximumDate={selectedSeason ? new Date(selectedSeason.end_date) : new Date(2100, 11, 31)}
                    />
                  )}
                </>
              )}
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f3f0',
    zIndex: 1000,
  },

  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d4b896',
    backgroundColor: '#ffffff',
  },

  modalCloseButton: {
    padding: 8,
  },

  modalCloseText: {
    color: '#1a4d3a',
    fontSize: 18,
    fontWeight: '600',
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a4d3a',
    letterSpacing: -0.3,
  },

  modalSpacer: {
    width: 34,
  },

  modalContent: {
    flex: 1,
  },

  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  inputGroup: {
    marginBottom: 12,
  },

  label: {
    color: '#1a4d3a',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  input: {
    borderWidth: 1,
    borderColor: '#d4b896',
    backgroundColor: '#ffffff',
    padding: 12,
    marginVertical: 6,
    borderRadius: 0,
    fontSize: 16,
    color: '#1a4d3a',
    fontWeight: '500',
  },

  inputHalf: {
    flex: 1,
    marginHorizontal: 4,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  dateInput: {
    borderWidth: 1,
    borderColor: '#d4b896',
    backgroundColor: '#ffffff',
    padding: 12,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 0,
  },

  dateText: {
    color: '#1a4d3a',
    fontSize: 16,
    fontWeight: '500',
  },

  createButton: {
    backgroundColor: '#1a4d3a',
    borderRadius: 0,
    paddingVertical: 14,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },

  createButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  createButtonDisabled: {
    backgroundColor: '#999',
    opacity: 0.6,
  },

  // Date picker modal styles (matching SeasonForm)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 20,
    minHeight: 320,
  },

  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#d4b896',
  },

  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a4d3a',
    letterSpacing: -0.3,
  },

  datePickerButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a4d3a',
  },

  datePicker: {
    backgroundColor: '#ffffff',
    height: 250,
    width: '100%',
  },

  dateInputError: {
    borderColor: '#dc3545',
    borderWidth: 2,
  },

  validationError: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },

  seasonInfo: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default MatchForm;
