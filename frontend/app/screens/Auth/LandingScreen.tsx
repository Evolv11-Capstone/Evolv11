// screens/LandingScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

// Simple intro screen for unauthenticated users
export default function LandingScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to Evolv11</Text>
      <Text style={styles.paragraph}>
        Evolv11 is your all-in-one performance tracking and team management platform
        for competitive youth soccer.
      </Text>
      <Text style={styles.sectionTitle}>What Problems Do We Solve?</Text>
      <Text style={styles.bullet}>
        • Players lack a structured way to track individual performance and progress
      </Text>
      <Text style={styles.bullet}>
        • Coaches need tools to analyze match data and optimize team performance
      </Text>
      <Text style={styles.bullet}>
        • Scouts struggle to evaluate players without consistent data or game history
      </Text>
      <Text style={styles.paragraph}>
        By combining stat tracking, match insights, and transparent growth analytics,
        Evolv11 makes it easy to evolve your game.
      </Text>
      <Text style={styles.callToAction}>
        Ready to begin? Head over to the Register or Login tab to get started.
      </Text>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    textAlign: 'left',
    alignSelf: 'stretch',
    marginVertical: 4,
  },
  callToAction: {
    marginTop: 24,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
