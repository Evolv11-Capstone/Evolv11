import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
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
import { uploadPlayerImage } from '../../../adapters/imageUploadAdapter'; // ✅ import image upload logic
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
  });

  const [imageUri, setImageUri] = useState<string | null>(null);

  const handleChange = (field: keyof NewUserInput, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  // 🖼️ Select image from gallery
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
      !userData.nationality
    ) {
      Alert.alert('Missing Fields', 'Please fill out all required fields.');
      return;
    }

    try {
      let imageUrl = '';

      // ✅ Upload image first (only if role is 'player')
      if (userData.role === 'player' && imageUri) {
        const [url, error] = await uploadPlayerImage(imageUri);
        if (error || !url) {
          Alert.alert('Upload Failed', error?.message || 'Could not upload player image');
          return;
        }
        imageUrl = url;
      }

      // 📝 Combine form data with optional image URL
      const finalUserData = {
        ...userData,
        image_url: imageUrl || undefined,
      };

      const [data, error]: [ApiResponse | null, Error | null] = await registerUser(finalUserData);

      if (error) {
        Alert.alert('Registration Failed', error.message);
        return;
      }

      if (data?.success) {
        Alert.alert('Success', 'User created successfully!');
        setUser(data.user); // Will trigger navigation
      } else {
        Alert.alert('Unexpected Error', 'Something went wrong.');
      }
    } catch (err: any) {
      Alert.alert('Server Error', err.message || 'Failed to register user.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.avoider}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create New User</Text>

        <Text style={styles.label}>Role:</Text>
        <Picker
          selectedValue={userData.role}
          onValueChange={(value) => handleChange('role', value)}
          style={styles.picker}
        >
          <Picker.Item label="Player" value="player" />
          <Picker.Item label="Coach" value="coach" />
        </Picker>

        <Text style={styles.label}>Name:</Text>
        <TextInput
          placeholder="Full Name"
          style={styles.input}
          value={userData.name}
          onChangeText={(text) => handleChange('name', text)}
        />

        <Text style={styles.label}>Age:</Text>
        <TextInput
          placeholder="Age"
          keyboardType="numeric"
          style={styles.input}
          value={userData.age}
          onChangeText={(text) => handleChange('age', text)}
        />

        <NationalityDropdown
          onSelect={(selectedNationality) =>
            handleChange('nationality', selectedNationality)
          }
        />

        <Text style={styles.label}>Email:</Text>
        <TextInput
          placeholder="Email"
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          value={userData.email}
          onChangeText={(text) => handleChange('email', text)}
        />

        <Text style={styles.label}>Password:</Text>
        <TextInput
          placeholder="Password"
          style={styles.input}
          secureTextEntry
          value={userData.password}
          onChangeText={(text) => handleChange('password', text)}
        />

        {/* Only show image picker if role is player */}
        {userData.role === 'player' && (
          <>
            <Text style={styles.label}>Upload Player Photo:</Text>
            <Button title="Choose Image" onPress={pickImage} />
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={styles.imagePreview}
              />
            )}
          </>
        )}

        <View style={{ marginTop: 20 }}>
          <Button title="Create User" onPress={handleSubmit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  avoider: { flex: 1 },
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 12,
    borderRadius: 8,
    padding: 10,
  },
  picker: {
    marginBottom: 16,
    backgroundColor: '#f1f1f1',
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '500',
  },
  imagePreview: {
    width: 100,
    height: 100,
    marginTop: 10,
    borderRadius: 8,
    alignSelf: 'center',
  },
});
