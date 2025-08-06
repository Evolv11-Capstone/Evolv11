// screens/PostAuth/AccountSettingsScreen.tsx

import React from 'react'; 
// Import core React to use JSX

import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView } from 'react-native'; 
// UI components: View for layout, Text for headers, StyleSheet for styling, SafeAreaView for safe area layout, Image for displaying images, ScrollView for scrollable content

import LogoutButton from '../../../components/LogoutButton'; 
// Import the logout component which encapsulates session clearing and navigation

import { useUser } from '../../contexts/UserContext'; 
// Import user context to access user information

function formatDate(dateString?: string) {
  if (!dateString) return 'Unknown';
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}
// Format date string to a more readable form

// Screen component that shows user account settings
export default function AccountSettingsScreen() {
  const { user } = useUser();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Account Settings</Text>
            <Text style={styles.subtitle}>Manage your profile information</Text>
          </View>
          
          {user && (
            <View style={styles.card}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{user.name}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{user.email}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Role</Text>
                <Text style={styles.infoValue}>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Text>
              </View>
              
              {user.role === 'player' && user.height && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Height</Text>
                  <Text style={styles.infoValue}>{user.height}</Text>
                </View>
              )}
              
              {user.role === 'player' && user.preferred_position && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Preferred Position</Text>
                  <Text style={styles.infoValue}>{user.preferred_position}</Text>
                </View>
              )}
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Joined</Text>
                <Text style={styles.infoValue}>{formatDate(user.created_at)}</Text>
              </View>
              
              <View style={styles.logoutSection}>
                <LogoutButton />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles - Evolv11 Brand Colors & Nike-inspired Design
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f3f0', // Warm beige background matching logo
  },
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    
  },
  header: {
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a4d3a', // Dark green matching logo
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6b7280',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 32,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderTopWidth: 3,
    borderTopColor: '#1a4d3a',
   
  },
  infoRow: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 16,
  },
  infoLabel: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 18,
    color: '#1a4d3a',
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  logoutSection: {
    marginTop: -35,
    alignItems: 'center',
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    marginBottom: 18,
    backgroundColor: '#e0e0e0',
  },
  logoutButton: {
    backgroundColor: '#1a4d3a',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 0,
    alignItems: 'center',
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
