// screens/Auth/LoginScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
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

  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof LoginInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async () => {
    if (!form.email || !form.password) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const [data, error]: [ApiResponse | null, Error | null] = await loginUser(form);

      if (error) {
        Alert.alert('Login Failed', error.message);
        setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.background}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.card}>
            

            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter your email"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="Enter your password"
              style={styles.input}
              secureTextEntry
              value={form.password}
              onChangeText={(text) => handleChange('password', text)}
              placeholderTextColor="#9ca3af"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.footerLink}>Join Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 40,
    width: '100%',
    maxWidth: 380,
    alignItems: 'stretch',
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 15,
    borderTopWidth: 4,
    borderTopColor: '#1a4d3a', // Dark green accent
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a4d3a', // Dark green matching logo
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    marginBottom: 32,
    textAlign: 'left',
    lineHeight: 22,
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
    color: '#374151',
    fontSize: 14,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderBottomColor: '#e5e7eb',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 0,
    fontSize: 16,
    color: '#111827',
    fontWeight: '400',
    marginBottom: 8,
  },
  inputFocused: {
    borderBottomColor: '#1a4d3a',
  },
  button: {
    backgroundColor: '#1a4d3a', // Dark green from logo
    borderRadius: 0,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
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
  brandSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1a4d3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1a4d3a',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: '500',
    color: '#d4b896', // Khaki/beige from logo
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: 4,
  },
});
