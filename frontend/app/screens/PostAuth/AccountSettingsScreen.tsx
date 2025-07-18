// screens/PostAuth/AccountSettingsScreen.tsx

import React from 'react'; 
// Import core React to use JSX

import { View, Text, StyleSheet } from 'react-native'; 
// UI components: View for layout, Text for headers, StyleSheet for styling

import LogoutButton from '../../../components/LogoutButton'; 
// Import the logout component which encapsulates session clearing and navigation

// Screen component that shows user account settings
export default function AccountSettingsScreen() {
  return (
    <View style={styles.container}> 
      {/* Container to hold everything on screen */}
      
      <Text style={styles.title}>Account Settings</Text> 
      {/* Title header for the screen */}

      <LogoutButton /> 
      {/* Reusable button component that handles all logout logic */}
    </View>
  );
}

// Style definitions for layout and typography
const styles = StyleSheet.create({
  container: {
    flex: 1, // Take full vertical space
    padding: 24, // Add padding around content
    justifyContent: 'center', // Vertically center content
    alignItems: 'center', // Horizontally center content
  },
  title: {
    fontSize: 22, // Large title text
    fontWeight: 'bold', // Bold font
    marginBottom: 20, // Spacing below title
  },
});
