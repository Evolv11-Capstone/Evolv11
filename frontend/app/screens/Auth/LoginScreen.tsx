// screens/Auth/LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from 'react-native';

// Adapter to log in a user
import { loginUser } from '../../../adapters/authAdapters';

// Types for login input and API response
import { LoginInput, ApiResponse } from '../../../types/userTypes';

// Navigation imports
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types/navigationTypes';

// Context to set user on login
import { useUser } from '../../contexts/UserContext';

// Define the navigation type
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { setUser } = useUser(); // Get setUser from context

  const [form, setForm] = useState<LoginInput>({
    email: '',
    password: '',
  });

  const handleChange = (field: keyof LoginInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    try {
      const [data, error]: [ApiResponse | null, Error | null] = await loginUser(form);

      if (error) {
        Alert.alert('Login Failed', error.message);
        return;
      }

      if (data?.success && data.user) {
        setUser(data.user); // ✅ Sets user in context and triggers PostAuthTabs
        Alert.alert('Success', 'Logged in successfully!');
      } else {
        Alert.alert('Login Error', 'Unexpected error occurred.');
      }
    } catch (err: any) {
      Alert.alert('Server Error', err.message || 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      {/* Email Field */}
      <Text style={styles.label}>Email:</Text>
      <TextInput
        placeholder="Email"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(text) => handleChange('email', text)}
      />

      {/* Password Field */}
      <Text style={styles.label}>Password:</Text>
      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        value={form.password}
        onChangeText={(text) => handleChange('password', text)}
      />

      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

// Styles
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
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '500',
  },
});
