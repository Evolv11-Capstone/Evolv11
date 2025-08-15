// components/ChangePasswordModal.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';

import { updatePassword } from '../adapters/userAdapters';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  userId: number;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordModal({ visible, onClose, userId }: ChangePasswordModalProps) {
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handlePasswordChange = async () => {
    // Validate inputs
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      Alert.alert('Error', 'Please fill in all password fields.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters long.');
      return;
    }

    try {
      setIsSaving(true);

      const [response, error] = await updatePassword(userId, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to update password');
        return;
      }

      if (response?.success) {
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        Alert.alert('Success', 'Password updated successfully!');
        onClose();
      } else {
        Alert.alert('Error', 'Failed to update password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <Text style={styles.modalSubtitle}>Secure your account with a new password</Text>
          </View>
          
          {/* Form */}
          <View style={styles.modalForm}>
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Current Password</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Enter current password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={passwordData.currentPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
              />
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>New Password</Text>
              <TextInput
                style={styles.fieldInput}
                placeholder="Enter new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={passwordData.newPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
              />
            </View>
            
            <View style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>Confirm New Password</Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && styles.fieldInputError
                ]}
                placeholder="Confirm new password"
                placeholderTextColor="#9ca3af"
                secureTextEntry
                value={passwordData.confirmPassword}
                onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
              />
              {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
                <Text style={styles.errorText}>Passwords do not match</Text>
              )}
            </View>
          </View>
          
          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={[styles.primaryButton, isSaving && styles.disabledButton]} 
              onPress={handlePasswordChange}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {isSaving ? 'Updating...' : 'Update Password'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton} 
              onPress={handleClose}
              disabled={isSaving}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Styles - Nike-inspired design matching AccountSettingsScreen
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  modalHeader: {
    marginBottom: 32,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '400',
  },
  modalForm: {
    gap: 24,
    marginBottom: 32,
  },
  fieldContainer: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a4d3a',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fieldInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    paddingVertical: 16,
    paddingHorizontal: 0,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#e1dfdeff',
    backgroundColor: 'transparent',
  },
  fieldInputError: {
    borderBottomColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  modalActions: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#1a4d3a',
    paddingVertical: 18,
   
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,

    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  secondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  disabledButton: {
    opacity: 0.5,
  },
});
