import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import NationalityDropdown from './NationalityDropdown'; // Custom dropdown for country selection
import { createNewUser } from '../adapters/userAdapters'; // Adapter for backend API
import { NewUserInput, ApiResponse } from '../types/userTypes'; // Shared types for input and response

export default function CreateNewUser() {
  // Initialize form state with default values
  const [userData, setUserData] = useState<NewUserInput>({
    name: '',
    age: '',
    nationality: '',
    email: '',
    password: '',
    role: 'player', // Default to player
  });

  // Generic function to update form state when inputs change
  const handleChange = (field: keyof NewUserInput, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  // Submit handler that validates and sends form data
  const handleSubmit = async () => {
    // Simple validation check
    if (
      !userData.name ||
      !userData.age ||
      !userData.email ||
      !userData.password ||
      !userData.nationality
    ) {
      Alert.alert('Please fill out all required fields.');
      return;
    }

    // Call the adapter to send the request
    const [data, error]: [ApiResponse | null, Error | null] = await createNewUser(userData);

    // Handle response
    if (error) {
      Alert.alert('Error creating user:', error.message);
    } else if (data?.success) {
      Alert.alert('User created successfully!');
      // Optionally clear form or redirect
    } else {
      Alert.alert('Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New User</Text>

      {/* Role Picker */}
      <Text style={styles.label}>Role:</Text>
      <Picker
        selectedValue={userData.role}
        onValueChange={(value) => handleChange('role', value)}
        style={styles.picker}
      >
        <Picker.Item label="Player" value="player" />
        <Picker.Item label="Coach" value="coach" />
        <Picker.Item label="Scout" value="scout" />
      </Picker>

      {/* Name Field */}
      <Text style={styles.label}>Name:</Text>
      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={userData.name}
        onChangeText={(text) => handleChange('name', text)}
      />

      {/* Age Field */}
      <Text style={styles.label}>Age:</Text>
      <TextInput
        placeholder="Age"
        keyboardType="numeric"
        style={styles.input}
        value={userData.age}
        onChangeText={(text) => handleChange('age', text)}
      />

      {/* Nationality Dropdown */}
      <NationalityDropdown
        onSelect={(selectedNationality) =>
          handleChange('nationality', selectedNationality)
        }
      />

      {/* Email Field */}
      <Text style={styles.label}>Email:</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={userData.email}
        onChangeText={(text) => handleChange('email', text)}
      />

      {/* Password Field */}
      <Text style={styles.label}>Password:</Text>
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={userData.password}
        onChangeText={(text) => handleChange('password', text)}
      />

      {/* Submit Button */}
      <Button title="Create User" onPress={handleSubmit} />
    </View>
  );
}

// Styling
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
});
