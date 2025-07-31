import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createSeason } from '../adapters/seasonAdapters';

interface SeasonFormProps {
  activeTeamId: number | null;
  onSeasonCreated: () => void;
}

const SeasonForm = ({ activeTeamId, onSeasonCreated }: SeasonFormProps) => {
  const [seasonName, setSeasonName] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() + 3)));
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Temporary state for date picker (only committed on "Done")
  const [tempStartDate, setTempStartDate] = useState<Date>(new Date());
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());

  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    // Only update temporary state, don't auto-close or commit changes
    if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      setTempStartDate(selectedDate);
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    // Only update temporary state, don't auto-close or commit changes
    if (selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
      setTempEndDate(selectedDate);
    }
  };

  const openStartDatePicker = () => {
    // Initialize temp state with current value
    setTempStartDate(startDate);
    setShowStartDatePicker(true);
  };

  const openEndDatePicker = () => {
    // Initialize temp state with current value
    setTempEndDate(endDate);
    setShowEndDatePicker(true);
  };

  const confirmStartDate = () => {
    // Commit the temporary date and close picker
    setStartDate(tempStartDate);
    setShowStartDatePicker(false);
  };

  const confirmEndDate = () => {
    // Commit the temporary date and close picker
    setEndDate(tempEndDate);
    setShowEndDatePicker(false);
  };

  const cancelStartDatePicker = () => {
    // Close picker without saving changes
    setShowStartDatePicker(false);
  };

  const cancelEndDatePicker = () => {
    // Close picker without saving changes
    setShowEndDatePicker(false);
  };

  const handleCreateSeason = async () => {
    if (!seasonName.trim() || !startDate || !endDate) {
      Alert.alert('Missing Fields', 'Please fill in all fields.');
      return;
    }

    if (startDate >= endDate) {
      Alert.alert('Invalid Dates', 'Start date must be before end date.');
      return;
    }

    setLoading(true);

    try {
      if (activeTeamId === null) {
        Alert.alert('Error', 'No active team selected.');
        setLoading(false);
        return;
      }

      const seasonData = {
        team_id: activeTeamId,
        name: seasonName.trim(),
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      };

      const [data, error] = await createSeason(seasonData);
      
      if (error) {
        Alert.alert('Error', error.message || 'Could not create season.');
        setLoading(false);
        return;
      }

      // Clear form
      setSeasonName('');
      setStartDate(new Date());
      setEndDate(new Date(new Date().setMonth(new Date().getMonth() + 3)));
      
      onSeasonCreated();
      Alert.alert('Success', 'Season created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not create season.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <Text style={styles.formTitle}>Create New Season</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Season Name</Text>
        <TextInput
          style={styles.input}
          value={seasonName}
          onChangeText={setSeasonName}
          placeholder="e.g., Spring 2025"
          placeholderTextColor="#666"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Start Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={openStartDatePicker}
        >
          <Text style={[styles.dateText, { color: startDate ? '#1a4d3a' : '#666' }]}>
            {startDate ? formatDateDisplay(startDate) : 'Select start date'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>End Date</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={openEndDatePicker}
        >
          <Text style={[styles.dateText, { color: endDate ? '#1a4d3a' : '#666' }]}>
            {endDate ? formatDateDisplay(endDate) : 'Select end date'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.seasonCreateButton}
        onPress={handleCreateSeason}
        disabled={loading}
      >
        <Text style={styles.seasonCreateButtonText}>
          {loading ? 'Creating...' : 'Create Season'}
        </Text>
      </TouchableOpacity>

      {/* Date Pickers with proper modal presentation and temporary state */}
      {showStartDatePicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showStartDatePicker}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={cancelStartDatePicker}>
                      <Text style={styles.datePickerButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>Select Start Date</Text>
                    <TouchableOpacity onPress={confirmStartDate}>
                      <Text style={styles.datePickerButton}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempStartDate}
                    mode="date"
                    display="spinner"
                    onChange={handleStartDateChange}
                    style={styles.datePicker}
                    minimumDate={new Date(1900, 0, 1)}
                    maximumDate={new Date(2100, 11, 31)}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={tempStartDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                // For Android, commit immediately since it uses native dialog
                if (selectedDate) {
                  setStartDate(selectedDate);
                }
                setShowStartDatePicker(false);
              }}
              minimumDate={new Date(1900, 0, 1)}
              maximumDate={new Date(2100, 11, 31)}
            />
          )}
        </>
      )}

      {showEndDatePicker && (
        <>
          {Platform.OS === 'ios' ? (
            <Modal
              visible={showEndDatePicker}
              transparent={true}
              animationType="slide"
            >
              <View style={styles.modalOverlay}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={cancelEndDatePicker}>
                      <Text style={styles.datePickerButton}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.datePickerTitle}>Select End Date</Text>
                    <TouchableOpacity onPress={confirmEndDate}>
                      <Text style={styles.datePickerButton}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={tempEndDate}
                    mode="date"
                    display="spinner"
                    onChange={handleEndDateChange}
                    style={styles.datePicker}
                    minimumDate={new Date(1900, 0, 1)}
                    maximumDate={new Date(2100, 11, 31)}
                  />
                </View>
              </View>
            </Modal>
          ) : (
            <DateTimePicker
              value={tempEndDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                // For Android, commit immediately since it uses native dialog
                if (selectedDate) {
                  setEndDate(selectedDate);
                }
                setShowEndDatePicker(false);
              }}
              minimumDate={new Date(1900, 0, 1)}
              maximumDate={new Date(2100, 11, 31)}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 16,
    marginHorizontal: 20,
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

  formTitle: {
    color: '#1a4d3a',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
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

  seasonCreateButton: {
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
  
  seasonCreateButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Date picker modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  datePickerContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingBottom: 20,
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
  },
});

export default SeasonForm;
