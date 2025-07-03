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
import NationalityDropdown from './NationalityDropdown'; // Import custom dropdown for nationalities
import { createNewUser } from '../adapters/userAdapters'; // Import backend adapter function

// Define allowed user roles
type UserRole = 'coach' | 'player' | 'scout';

// Define interface for form input data
interface NewUserInput {
  name: string;
  age: string; // Stored as string to match DB schema
  nationality: string; // This will be populated via dropdown (just the label)
  email: string;
  password: string;
  role: UserRole;
}

export default function CreateNewUser() {
  // Initialize form state with defaults
  const [userData, setUserData] = useState<NewUserInput>({
    name: '',
    age: '',
    nationality: '', // Will be set via dropdown
    email: '',
    password: '',
    role: 'player',
  });

  // Generic handler to update form state on input
  const handleChange = (field: keyof NewUserInput, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  // Form submit logic
  const handleSubmit = async () => {
    // Basic validation for required fields
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

    try {
      // Call adapter to POST data to backend
      const response = await createNewUser(userData);

      if (response.success) {
        Alert.alert('User created successfully!');
        // Optionally reset form or navigate away
      } else {
        Alert.alert('Something went wrong.');
      }
    } catch (error) {
      Alert.alert('Error creating user:', (error as Error).message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New User</Text>

       {/* Role Dropdown */}
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

      {/* Full Name Field */}
      {/* Label above the dropdown */}
            <Text style={styles.label}>Name:</Text>
      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={userData.name}
        onChangeText={(text) => handleChange('name', text)}
      />

      {/* Age Field */}
      {/* Label above the dropdown */}
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
      {/* Label above the dropdown */}
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
      {/* Label above the dropdown */}
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

// Basic styling
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
