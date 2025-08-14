// screens/PostAuth/AccountSettingsScreen.tsx

import React, { useState, useEffect, useCallback } from 'react'; 
// Import core React and hooks for state management

import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Image, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert,
  Modal,
  Platform
} from 'react-native'; 
// UI components for layout, display, and interactions

import * as ImagePicker from 'expo-image-picker';
// For selecting images from device library

import DropDownPicker from 'react-native-dropdown-picker';
// For position selection dropdown

import { Picker } from '@react-native-picker/picker';
// For height selection picker

import NationalityDropdown from '../../../components/NationalityDropdown';
// For nationality selection dropdown

import LogoutButton from '../../../components/LogoutButton'; 
// Import the logout component

import { useUser } from '../../contexts/UserContext'; 
// Import user context to access user information

import { calculateAge } from '../../../utils/dateUtils';
// Import utility function to calculate age from birthday

import { updateUser, updatePassword } from '../../../adapters/userAdapters';
// Import user update functions

import { uploadPlayerImage } from '../../../adapters/imageUploadAdapter';
// Import image upload function

function formatDate(dateString?: string) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

// Position options for players
const POSITION_OPTIONS = [
  { label: 'Goalkeeper (GK)', value: 'GK' },
  { label: 'Left Back (LB)', value: 'LB' },
  { label: 'Center Back (CB)', value: 'CB' },
  { label: 'Right Back (RB)', value: 'RB' },
  { label: 'Defensive Midfielder (CDM)', value: 'CDM' },
  { label: 'Central Midfielder (CM)', value: 'CM' },
  { label: 'Attacking Midfielder (CAM)', value: 'CAM' },
  { label: 'Left Midfielder (LM)', value: 'LM' },
  { label: 'Right Midfielder (RM)', value: 'RM' },
  { label: 'Left Winger (LW)', value: 'LW' },
  { label: 'Right Winger (RW)', value: 'RW' },
  { label: 'Striker (ST)', value: 'ST' },
];

// Height options for players (matching CreateNewUser.tsx)
const HEIGHT_OPTIONS = [
  { label: "Select height...", value: "" },
  { label: "5'0\" (152 cm)", value: "5'0\"" },
  { label: "5'1\" (155 cm)", value: "5'1\"" },
  { label: "5'2\" (157 cm)", value: "5'2\"" },
  { label: "5'3\" (160 cm)", value: "5'3\"" },
  { label: "5'4\" (163 cm)", value: "5'4\"" },
  { label: "5'5\" (165 cm)", value: "5'5\"" },
  { label: "5'6\" (168 cm)", value: "5'6\"" },
  { label: "5'7\" (170 cm)", value: "5'7\"" },
  { label: "5'8\" (173 cm)", value: "5'8\"" },
  { label: "5'9\" (175 cm)", value: "5'9\"" },
  { label: "5'10\" (178 cm)", value: "5'10\"" },
  { label: "5'11\" (180 cm)", value: "5'11\"" },
  { label: "6'0\" (183 cm)", value: "6'0\"" },
  { label: "6'1\" (185 cm)", value: "6'1\"" },
  { label: "6'2\" (188 cm)", value: "6'2\"" },
  { label: "6'3\" (191 cm)", value: "6'3\"" },
  { label: "6'4\" (193 cm)", value: "6'4\"" },
  { label: "6'5\" (196 cm)", value: "6'5\"" },
  { label: "6'6\" (198 cm)", value: "6'6\"" },
  { label: "6'7\" (201 cm)", value: "6'7\"" },
  { label: "6'8\" (203 cm)", value: "6'8\"" },
];

// Screen component that shows user account settings
export default function AccountSettingsScreen() {
  const { user, refreshUser } = useUser();
  
  // Editing states
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    height: user?.height || '',
    preferred_position: user?.preferred_position || '',
    nationality: user?.nationality || '',
    image_url: user?.image_url || ''
  });
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Dropdown states for position picker
  const [positionDropdownOpen, setPositionDropdownOpen] = useState(false);
  
  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        height: user.height || '',
        preferred_position: user.preferred_position || '',
        nationality: user.nationality || '',
        image_url: user.image_url || ''
      });
    }
  }, [user]);

  // Stable callback for nationality selection to prevent infinite loops
  const handleNationalitySelect = useCallback((selectedNationality: string) => {
    setEditedUser(prev => ({ ...prev, nationality: selectedNationality }));
  }, []);

  const handleImagePicker = async () => {
    try {
      // Request permission to access media library
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to update your profile image.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setIsUploadingImage(true);
        
        // Upload image to S3
        const [imageUrl, uploadError] = await uploadPlayerImage(result.assets[0].uri);
        
        if (uploadError || !imageUrl) {
          Alert.alert('Upload Failed', 'Failed to upload image. Please try again.');
          return;
        }

        // Update local state
        setEditedUser(prev => ({ ...prev, image_url: imageUrl }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      setIsSaving(true);

      // Prepare update data - only include fields that have actually changed
      const updateData: any = {};
      
      if (editedUser.name !== user.name && editedUser.name.trim() !== '') {
        updateData.name = editedUser.name.trim();
      }
      
      // Player-specific fields
      if (user.role === 'player') {
        if (editedUser.height !== user.height && editedUser.height !== '') {
          updateData.height = editedUser.height;
        }
        
        if (editedUser.preferred_position !== user.preferred_position && editedUser.preferred_position !== '') {
          updateData.preferred_position = editedUser.preferred_position;
        }
        
        if (editedUser.image_url !== user.image_url) {
          updateData.image_url = editedUser.image_url;
        }
      }
      
      // Nationality field for all users
      if (editedUser.nationality !== user.nationality && editedUser.nationality !== '') {
        updateData.nationality = editedUser.nationality;
      }

      // Check if we have any changes to save
      if (Object.keys(updateData).length === 0) {
        Alert.alert('No Changes', 'No changes were made to your profile.');
        setIsEditing(false);
        return;
      }

      console.log('Sending update data:', updateData);

      // Update user profile
      const [response, error] = await updateUser(user.id, updateData);
      
      if (error) {
        Alert.alert('Error', error.message || 'Failed to update profile');
        return;
      }

      if (response) {
        // Refresh user data in context
        await refreshUser();
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;

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

      const [response, error] = await updatePassword(user.id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to update password');
        return;
      }

      if (response?.success) {
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        Alert.alert('Success', 'Password updated successfully!');
      } else {
        Alert.alert('Error', 'Failed to update password');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditedUser({
        name: user.name || '',
        height: user.height || '',
        preferred_position: user.preferred_position || '',
        nationality: user.nationality || '',
        image_url: user.image_url || ''
      });
    }
    setIsEditing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>Profile</Text>
            <Text style={styles.pageSubtitle}>Manage your account</Text>
          </View>

          {user && (
            <>
              {/* Profile Card */}
              <View style={styles.profileCard}>
                
                {/* Player Image Section - Only for players */}
                {user.role === 'player' && (
                  <View style={styles.imageSection}>
                    <TouchableOpacity 
                      style={styles.imageContainer} 
                      onPress={isEditing ? handleImagePicker : undefined}
                      disabled={!isEditing || isUploadingImage}
                      activeOpacity={isEditing ? 0.8 : 1}
                    >
                      <View style={styles.imageWrapper}>
                        {editedUser.image_url ? (
                          <Image source={{ uri: editedUser.image_url }} style={styles.profileImage} />
                        ) : (
                          <View style={styles.placeholderImage}>
                            <Text style={styles.placeholderText}>Add Photo</Text>
                          </View>
                        )}
                        {isEditing && (
                          <View style={styles.imageOverlay}>
                            <Text style={styles.imageOverlayText}>
                              {isUploadingImage ? 'Uploading...' : 'Change Photo'}
                            </Text>
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                    
                    {/* Role Badge */}
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>PLAYER</Text>
                    </View>
                  </View>
                )}

                {/* Coach Header */}
                {user.role === 'coach' && (
                  <View style={styles.coachHeader}>
                    <View style={styles.coachIconContainer}>
                      <Text style={styles.coachIcon}>👨‍💼</Text>
                    </View>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>COACH</Text>
                    </View>
                  </View>
                )}

                {/* User Info Grid */}
                <View style={styles.infoGrid}>
                  
                  {/* Name Field */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Full Name</Text>
                    {isEditing ? (
                      <TextInput
                        style={styles.fieldInput}
                        value={editedUser.name}
                        onChangeText={(text) => setEditedUser(prev => ({ ...prev, name: text }))}
                        placeholder="Enter your full name"
                        placeholderTextColor="#9ca3af"
                      />
                    ) : (
                      <Text style={styles.fieldValue}>{user.name}</Text>
                    )}
                  </View>

                  {/* Email Field */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Email Address</Text>
                    <Text style={styles.fieldValue}>{user.email}</Text>
                    <Text style={styles.fieldNote}>Email cannot be changed</Text>
                  </View>

                  {/* Age Display */}
                  {user.birthday && (
                    <View style={styles.fieldContainer}>
                      <Text style={styles.fieldLabel}>Age</Text>
                      <Text style={styles.fieldValue}>{calculateAge(user.birthday)} years old</Text>
                    </View>
                  )}

                  {/* Player-specific fields */}
                  {user.role === 'player' && (
                    <>
                      {/* Height Field */}
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Height</Text>
                        {isEditing ? (
                          <View style={styles.pickerWrapper}>
                            <Picker
                              selectedValue={editedUser.height || ''}
                              onValueChange={(value) => setEditedUser(prev => ({ ...prev, height: value }))}
                              style={Platform.OS === 'ios' ? styles.pickerIOS : styles.picker}
                              itemStyle={Platform.OS === 'ios' ? styles.pickerItemIOS : undefined}
                            >
                              {HEIGHT_OPTIONS.map((option) => (
                                <Picker.Item 
                                  key={option.value} 
                                  label={option.label} 
                                  value={option.value} 
                                />
                              ))}
                            </Picker>
                          </View>
                        ) : (
                          <Text style={styles.fieldValue}>{user.height || 'Not specified'}</Text>
                        )}
                      </View>

                      {/* Position Field */}
                      <View style={styles.fieldContainer}>
                        <Text style={styles.fieldLabel}>Preferred Position</Text>
                        {isEditing ? (
                          <View style={styles.dropdownWrapper}>
                            <DropDownPicker
                              open={positionDropdownOpen}
                              value={editedUser.preferred_position}
                              items={POSITION_OPTIONS}
                              setOpen={setPositionDropdownOpen}
                              setValue={(callback) => {
                                const value = typeof callback === 'function' ? callback(editedUser.preferred_position) : callback;
                                setEditedUser(prev => ({ ...prev, preferred_position: value }));
                              }}
                              style={styles.dropdown}
                              dropDownContainerStyle={styles.dropdownContainer}
                              textStyle={styles.dropdownText}
                              placeholder="Select your position"
                              searchable={true}
                              searchPlaceholder="Search positions..."
                              placeholderStyle={styles.dropdownPlaceholder}
                              listMode="MODAL"
                              modalTitle="Select Position"
                              modalAnimationType="slide"
                            />
                          </View>
                        ) : (
                          <Text style={styles.fieldValue}>{user.preferred_position || 'Not specified'}</Text>
                        )}
                      </View>
                    </>
                  )}

                  {/* Nationality Field - Available for all users */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Nationality</Text>
                    {isEditing ? (
                      <NationalityDropdown
                        initialValue={editedUser.nationality}
                        onSelect={handleNationalitySelect}
                      />
                    ) : (
                      <Text style={styles.fieldValue}>{user.nationality || 'Not specified'}</Text>
                    )}
                  </View>

                  {/* Member Since */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.fieldLabel}>Member Since</Text>
                    <Text style={styles.fieldValue}>{formatDate(user.created_at)}</Text>
                  </View>

                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionSection}>
                {!isEditing ? (
                  <>
                    <TouchableOpacity 
                      style={styles.primaryButton} 
                      onPress={() => setIsEditing(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.primaryButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.secondaryButton} 
                      onPress={() => setIsChangingPassword(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.secondaryButtonText}>Change Password</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.editButtonGroup}>
                    <TouchableOpacity 
                      style={[styles.saveButton, isSaving && styles.disabledButton]} 
                      onPress={handleSaveProfile}
                      disabled={isSaving}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.saveButtonText}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.cancelButton} 
                      onPress={handleCancelEdit}
                      disabled={isSaving}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Logout Section */}
              <View style={styles.logoutSection}>
                <LogoutButton />
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={isChangingPassword}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsChangingPassword(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Change Password</Text>
              <Text style={styles.modalSubtitle}>Enter your current password and choose a new one</Text>
            </View>
            
            <View style={styles.modalForm}>
              <View style={styles.modalFieldContainer}>
                <Text style={styles.modalFieldLabel}>Current Password</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter current password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  value={passwordData.currentPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, currentPassword: text }))}
                />
              </View>
              
              <View style={styles.modalFieldContainer}>
                <Text style={styles.modalFieldLabel}>New Password</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  value={passwordData.newPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, newPassword: text }))}
                />
              </View>
              
              <View style={styles.modalFieldContainer}>
                <Text style={styles.modalFieldLabel}>Confirm New Password</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Confirm new password"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry
                  value={passwordData.confirmPassword}
                  onChangeText={(text) => setPasswordData(prev => ({ ...prev, confirmPassword: text }))}
                />
              </View>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalPrimaryButton, isSaving && styles.disabledButton]} 
                onPress={handlePasswordChange}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                <Text style={styles.modalPrimaryButtonText}>
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalSecondaryButton} 
                onPress={() => {
                  setIsChangingPassword(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                disabled={isSaving}
                activeOpacity={0.8}
              >
                <Text style={styles.modalSecondaryButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles - Nike-inspired Clean Design with Evolv11 Brand Colors
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  
  // Header Section
  headerSection: {
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'flex-start',
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1a4d3a',
    letterSpacing: -1,
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 16,
    color: '#757575',
    fontWeight: '400',
    letterSpacing: 0.2,
  },

  // Profile Card
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 8,
  },

  // Image Section
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  imageWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    color: '#1a4d3a',
    fontSize: 14,
    fontWeight: '500',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 70,
  },
  imageOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Role Badge
  roleBadge: {
    backgroundColor: '#1a4d3a',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },

  // Coach Header
  coachHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  coachIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  coachIcon: {
    fontSize: 48,
  },

  // Info Grid
  infoGrid: {
    gap: 24,
  },
  fieldContainer: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a4d3a',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    lineHeight: 24,
  },
  fieldInput: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000',
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#d4b896',
    backgroundColor: 'transparent',
  },
  fieldNote: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Dropdown Styling
  dropdownWrapper: {
    marginTop: 8,
  },
  dropdown: {
    borderColor: '#e0e0e0',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    minHeight: 48,
  },
  dropdownContainer: {
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  dropdownPlaceholder: {
    color: '#999',
    fontSize: 16,
  },

  // Picker Styling (for height selection)
  pickerWrapper: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'transparent',
    marginBottom: 6,
    overflow: Platform.OS === 'android' ? 'hidden' : 'visible',
  },
  picker: {
    height: 44,
    width: '100%',
    color: '#000',
    backgroundColor: 'transparent',
    fontSize: 16,
  },
  pickerIOS: {
    height: 100,
    width: '100%',
    color: '#000',
    backgroundColor: 'transparent',
  },
  pickerItemIOS: {
    fontSize: 16,
    height: 100,
    color: '#000',
  },

  // Action Section
  actionSection: {
    marginTop: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#1a4d3a',
    paddingVertical: 18,
    borderRadius: 100,
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
    borderRadius: 100,
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

  // Edit Button Group
  editButtonGroup: {
    flexDirection: 'row',
    gap: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor:'#1a4d3a',
    paddingVertical: 18,
    borderRadius: 100,
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
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },

  // Logout Section
  logoutSection: {
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },

  // Modal Styles
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
    color: '#000',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalForm: {
    gap: 20,
    marginBottom: 32,
  },
  modalFieldContainer: {
    gap: 8,
  },
  modalFieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalInput: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  modalActions: {
    gap: 16,
  },
  modalPrimaryButton: {
    backgroundColor: '#000',
    paddingVertical: 18,
    borderRadius: 100,
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
  modalPrimaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSecondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 18,
    borderRadius: 100,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  modalSecondaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },

  // Legacy styles for backward compatibility
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '400',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  playerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#e5e7eb',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    flex: 2,
    textAlign: 'right',
  },
  textInput: {
    flex: 2,
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'right',
    borderBottomWidth: 1,
    borderBottomColor: '#3b82f6',
    paddingVertical: 4,
  },
  editButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  passwordButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  editActions: {
    flexDirection: 'row',
    gap: 12,
  },
  buttonSection: {
    marginTop: 32,
    gap: 12,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  modalCancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#dc2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 18,
    backgroundColor: '#e0e0e0',
  },
});
