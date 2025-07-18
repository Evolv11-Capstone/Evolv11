import React, { useState } from 'react'; // Import React and state hook
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native'; // Native UI components

import { Picker } from '@react-native-picker/picker'; // Role picker input

import { useNavigation } from '@react-navigation/native'; // Navigation hook
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Type for typed navigation

import NationalityDropdown from '../../../components/NationalityDropdown'; // Custom nationality selector
import { registerUser } from '../../../adapters/authAdapters'; // API call to register user
import { NewUserInput, ApiResponse } from '../../../types/userTypes'; // Form and response types
import { RootStackParamList } from '../../../types/navigationTypes'; // Root navigator types
import { useUser } from '../../contexts/UserContext'; // ✅ Import user context

// Define typed navigation prop for stack navigation
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export default function CreateNewUser() {
  const navigation = useNavigation<NavigationProp>(); // Initialize typed navigation
  const { setUser } = useUser(); // ✅ Access setUser from context

  // Initialize form state
  const [userData, setUserData] = useState<NewUserInput>({
    name: '',
    age: '',
    nationality: '',
    email: '',
    password: '',
    role: 'player', // Default role is player
  });

  // Update form state for each input field
  const handleChange = (field: keyof NewUserInput, value: string) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
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
      // Send POST request to register the user
      const [data, error]: [ApiResponse | null, Error | null] =
        await registerUser(userData);

      // Handle registration error
      if (error) {
        Alert.alert('Registration Failed', error.message);
        return;
      }

      // If successful, notify user and set user context
      if (data?.success) {
        Alert.alert('Success', 'User created successfully!');
        setUser(data.user); // ✅ Trigger post-auth navigation via UserContext
      } else {
        Alert.alert('Unexpected Error', 'Something went wrong.');
      }
    } catch (err: any) {
      Alert.alert('Server Error', err.message || 'Failed to register user.');
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
        {/*<Picker.Item label="Scout" value="scout" />*/ /* Uncomment if you add scout role */}
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

// Local styles for layout and UI
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
