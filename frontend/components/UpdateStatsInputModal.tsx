import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

export type UpdateStatsInputModalProps = {
  visible: boolean;
  onClose: () => void;
  onUpdateInput: () => void;
  playerName: string;
};

const UpdateStatsInputModal: React.FC<UpdateStatsInputModalProps> = ({
  visible,
  onClose,
  onUpdateInput,
  playerName,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>Stats Already Entered</Text>
          
          <Text style={styles.message}>
            Stats have already been entered for {playerName} in this match.
          </Text>
          
          <Text style={styles.submessage}>
            You can update the existing stats if needed.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelBtn} 
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.updateBtn} 
              onPress={onUpdateInput}
              activeOpacity={0.8}
            >
              <Text style={styles.updateText}>Update Input</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

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
    borderLeftWidth: 4,
    borderLeftColor: '#d4b896',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.3,
    textTransform: 'uppercase',
  },
  message: {
    fontSize: 16,
    color: '#1a4d3a',
    marginBottom: 12,
    lineHeight: 22,
    fontWeight: '500',
    textAlign: 'center',
  },
  submessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    borderRadius: 0, // Sharp edges
    borderWidth: 2,
    borderColor: '#d4b896',
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  updateBtn: {
    flex: 1,
    backgroundColor: '#1a4d3a',
    paddingVertical: 14,
    borderRadius: 0, // Sharp edges
    alignItems: 'center',
  },
  updateText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default UpdateStatsInputModal;
