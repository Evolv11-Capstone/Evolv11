import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import NationalityDropdown from '../../../components/NationalityDropdown';
import { registerUser } from '../../../adapters/authAdapters';
import { uploadPlayerImage } from '../../../adapters/imageUploadAdapter';
import { NewUserInput, ApiResponse } from '../../../types/userTypes';
import { RootStackParamList } from '../../../types/navigationTypes';
import { useUser } from '../../contexts/UserContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function CreateNewUser() {
  const navigation = useNavigation<NavigationProp>();
  const { setUser } = useUser();

  const [userData, setUserData] = useState<NewUserInput>({
    name: '',
    age: '',
    nationality: '',
    email: '',
    password: '',
    role: 'player',
    height: '',
    preferred_position: '',
  });

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof NewUserInput, value: string) => {
    setUserData((prev) => {
      const updated = { ...prev, [field]: value };
      
      // If changing role to coach, clear player-specific fields
      if (field === 'role' && value === 'coach') {
        updated.height = '';
        updated.preferred_position = '';
      }
      
      return updated;
    });
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Camera roll access is needed.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (
      !userData.name ||
      !userData.age ||
      !userData.email ||
      !userData.password ||
      !userData.nationality ||
      (userData.role === 'player' && (!userData.height || !userData.preferred_position))
    ) {
      Alert.alert('Missing Fields', 'Please fill out all required fields.');
      return;
    }

    try {
      setLoading(true);
      let imageUrl = '';

      if (userData.role === 'player' && imageUri) {
        const [url, error] = await uploadPlayerImage(imageUri);
        if (error || !url) {
          Alert.alert('Upload Failed', error?.message || 'Could not upload player image');
          setLoading(false);
          return;
        }
        imageUrl = url;
      }

      const finalUserData = {
        ...userData,
        image_url: imageUrl || undefined,
      };

      const [data, error]: [ApiResponse | null, Error | null] = await registerUser(finalUserData);

      if (error) {
        Alert.alert('Registration Failed', error.message);
        setLoading(false);
        return;
      }

      if (data?.success) {
        Alert.alert('Success', 'User created successfully!');
        setUser(data.user);
      } else {
        Alert.alert('Unexpected Error', 'Something went wrong.');
      }
    } catch (err: any) {
      Alert.alert('Server Error', err.message || 'Failed to register user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.avoider}
      >
        <ScrollView contentContainerStyle={styles.overlay}>
          <View style={styles.card}>
           

            <Text style={styles.title}>Join the Evolution</Text>
            <Text style={styles.subtitle}>Start your journey</Text>

            <Text style={styles.label}>Role</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={userData.role}
                onValueChange={(value) => handleChange('role', value)}
                style={Platform.OS === 'ios' ? styles.pickerIOS : styles.picker}
                itemStyle={Platform.OS === 'ios' ? styles.pickerItemIOS : undefined}
              >
                <Picker.Item label="Player" value="player" />
                <Picker.Item label="Coach" value="coach" />
              </Picker>
            </View>

            <Text style={styles.label}>Name</Text>
            <TextInput
              placeholder="Enter your full name"
              style={styles.input}
              value={userData.name}
              onChangeText={(text) => handleChange('name', text)}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Age</Text>
            <TextInput
              placeholder="Enter your age"
              keyboardType="numeric"
              style={styles.input}
              value={userData.age}
              onChangeText={(text) => handleChange('age', text)}
              placeholderTextColor="#9ca3af"
            />

            {userData.role === 'player' && (
              <>
                <Text style={styles.label}>Height</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={userData.height || ''}
                    onValueChange={(value) => handleChange('height', value)}
                    style={Platform.OS === 'ios' ? styles.pickerIOS : styles.picker}
                    itemStyle={Platform.OS === 'ios' ? styles.pickerItemIOS : undefined}
                  >
                    <Picker.Item label="Select height..." value="" />
                    <Picker.Item label="5'0&quot; (152 cm)" value="5'0&quot;" />
                    <Picker.Item label="5'1&quot; (155 cm)" value="5'1&quot;" />
                    <Picker.Item label="5'2&quot; (157 cm)" value="5'2&quot;" />
                    <Picker.Item label="5'3&quot; (160 cm)" value="5'3&quot;" />
                    <Picker.Item label="5'4&quot; (163 cm)" value="5'4&quot;" />
                    <Picker.Item label="5'5&quot; (165 cm)" value="5'5&quot;" />
                    <Picker.Item label="5'6&quot; (168 cm)" value="5'6&quot;" />
                    <Picker.Item label="5'7&quot; (170 cm)" value="5'7&quot;" />
                    <Picker.Item label="5'8&quot; (173 cm)" value="5'8&quot;" />
                    <Picker.Item label="5'9&quot; (175 cm)" value="5'9&quot;" />
                    <Picker.Item label="5'10&quot; (178 cm)" value="5'10&quot;" />
                    <Picker.Item label="5'11&quot; (180 cm)" value="5'11&quot;" />
                    <Picker.Item label="6'0&quot; (183 cm)" value="6'0&quot;" />
                    <Picker.Item label="6'1&quot; (185 cm)" value="6'1&quot;" />
                    <Picker.Item label="6'2&quot; (188 cm)" value="6'2&quot;" />
                    <Picker.Item label="6'3&quot; (191 cm)" value="6'3&quot;" />
                    <Picker.Item label="6'4&quot; (193 cm)" value="6'4&quot;" />
                    <Picker.Item label="6'5&quot; (196 cm)" value="6'5&quot;" />
                    <Picker.Item label="6'6&quot; (198 cm)" value="6'6&quot;" />
                    <Picker.Item label="6'7&quot; (201 cm)" value="6'7&quot;" />
                    <Picker.Item label="6'8&quot; (203 cm)" value="6'8&quot;" />
                  </Picker>
                </View>

                <Text style={styles.label}>Preferred Position</Text>
                <View style={styles.pickerWrapper}>
                  <Picker
                    selectedValue={userData.preferred_position || ''}
                    onValueChange={(value) => handleChange('preferred_position', value)}
                    style={Platform.OS === 'ios' ? styles.pickerIOS : styles.picker}
                    itemStyle={Platform.OS === 'ios' ? styles.pickerItemIOS : undefined}
                  >
                    <Picker.Item label="Select position..." value="" />
                    <Picker.Item label="Goalkeeper (GK)" value="GK" />
                    <Picker.Item label="Left Back (LB)" value="LB" />
                    <Picker.Item label="Center Back (CB)" value="CB" />
                    <Picker.Item label="Right Back (RB)" value="RB" />
                    <Picker.Item label="Defensive Midfielder (CDM)" value="CDM" />
                    <Picker.Item label="Left Midfielder (LM)" value="LM" />
                    <Picker.Item label="Center Midfielder (CM)" value="CM" />
                    <Picker.Item label="Right Midfielder (RM)" value="RM" />
                    <Picker.Item label="Attacking Midfielder (CAM)" value="CAM" />
                    <Picker.Item label="Left Winger (LW)" value="LW" />
                    <Picker.Item label="Right Winger (RW)" value="RW" />
                    <Picker.Item label="Striker (ST)" value="ST" />
                    <Picker.Item label="Center Forward (CF)" value="CF" />
                  </Picker>
                </View>
              </>
            )}

            <Text style={styles.label}>Nationality</Text>
            <NationalityDropdown
              onSelect={(selectedNationality) =>
                handleChange('nationality', selectedNationality)
              }
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={userData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Create a strong password"
              style={styles.input}
              secureTextEntry
              value={userData.password}
              onChangeText={(text) => handleChange('password', text)}
              placeholderTextColor="#9ca3af"
            />

            {userData.role === 'player' && (
              <>
                <Text style={styles.label}>Player Photo</Text>
                <TouchableOpacity style={styles.imageButton} onPress={pickImage} activeOpacity={0.85}>
                  <Text style={styles.imageButtonText}>
                    {imageUri ? 'Change Photo' : 'Upload Photo'}
                  </Text>
                </TouchableOpacity>
                {imageUri && (
                  <Image
                    source={{ uri: imageUri }}
                    style={styles.imagePreview}
                  />
                )}
              </>
            )}

            <TouchableOpacity
              style={[styles.submitButton, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.footerLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// Styles - Evolv11 Brand Colors & Nike-inspired Design
const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f5f3f0', // Warm beige background matching logo
    justifyContent: 'center',
  },
  avoider: { 
    flex: 1 
  },
  overlay: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 40,
    width: '100%',
    maxWidth: 420,
    alignItems: 'stretch',
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
    borderTopWidth: 4,
    borderTopColor: '#1a4d3a', // Dark green accent
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1a4d3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
  },
  brandName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a4d3a',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  brandTagline: {
    fontSize: 10,
    fontWeight: '500',
    color: '#d4b896', // Khaki/beige from logo
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a4d3a', // Dark green matching logo
    marginBottom: 6,
    letterSpacing: -0.5,
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: '#6b7280',
    marginBottom: 28,
    textAlign: 'left',
    lineHeight: 20,
  },
  label: {
    marginTop: 14,
    marginBottom: 6,
    fontWeight: '600',
    color: '#374151',
    fontSize: 13,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 15,
    color: '#111827',
    fontWeight: '400',
    marginBottom: 6,
  },
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
    color: '#111827',
    backgroundColor: 'transparent',
  },
  pickerIOS: {
    height: 100,
    width: '100%',
    color: '#111827',
    backgroundColor: 'transparent',
  },
  pickerItemIOS: {
    fontSize: 16,
    height: 100,
    color: '#111827',
  },
  imageButton: {
    backgroundColor: '#1a4d3a',
    borderRadius: 0,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 4,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  imageButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 8,
    marginBottom: 12,
    borderRadius: 0,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: '#1a4d3a', // Dark green from logo
    borderRadius: 0,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 16,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '400',
  },
  footerLink: {
    color: '#1a4d3a',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
