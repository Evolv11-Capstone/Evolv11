// screens/Auth/AboutScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Nike-inspired About screen showing Evolv11 mission and features
export default function AboutScreen({ navigation }: any) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1a4d3a" />
        </TouchableOpacity>
      </View>

      {/* Mission Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.missionText}>
          Evolving football through intelligent analytics and empowering every player, coach, and team to reach their full potential.
        </Text>
        
        <View style={styles.imageContainer}>
          <Image
            source={{uri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTV8fHNvY2NlcnxlbnwwfHwwfHx8MA%3D%3D'}} // User will add mission image here
            style={styles.featureImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What We Offer</Text>
        
        {/* Feature 1 */}
        <View style={styles.featureBlock}>
          <View style={styles.featureContent}>
            <View style={styles.featureIcon}>
              <Ionicons name="analytics" size={32} color="#1a4d3a" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Performance Analytics</Text>
              <Text style={styles.featureDescription}>
                Deep insights into player performance, match statistics, and growth tracking.
              </Text>
            </View>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={{uri: 'https://e-scoutsoccer.com/wp-content/uploads/2021/07/the-organization-foto3.jpg'}} // User will add analytics image here
              style={styles.featureImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Feature 2 */}
        <View style={styles.featureBlock}>
          <View style={styles.featureContent}>
            <View style={styles.featureIcon}>
              <Ionicons name="people" size={32} color="#1a4d3a" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Team Management</Text>
              <Text style={styles.featureDescription}>
                Comprehensive tools for coaches to manage teams, track progress, and plan strategies.
              </Text>
            </View>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={{uri: 'https://i2-prod.mirror.co.uk/article8961715.ece/ALTERNATES/s1200b/Manchester-United-v-Stoke-City-Premier-League.jpg'}} // User will add team management image here
              style={styles.featureImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Feature 3 */}
        <View style={styles.featureBlock}>
          <View style={styles.featureContent}>
            <View style={styles.featureIcon}>
              <Ionicons name="trophy" size={32} color="#1a4d3a" />
            </View>
            <View style={styles.featureTextContainer}>
              <Text style={styles.featureTitle}>Talent Development</Text>
              <Text style={styles.featureDescription}>
                Scout talent, identify potential, and nurture the next generation of football stars.
              </Text>
            </View>
          </View>
          <View style={styles.imageContainer}>
            <Image
              source={{uri: 'https://www.director11.com/wp-content/uploads/2024/08/Modelo-de-canteras-espanol-el-exito-de-desarrollar-talento.jpg'}} // User will add talent development image here
              style={styles.featureImage}
              resizeMode="cover"
            />
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Ready to Evolve?</Text>
        <Text style={styles.ctaSubtitle}>Join thousands of players and coaches already using Evolv11</Text>
        
        <TouchableOpacity 
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={16} color="#ffffff" style={styles.buttonIcon} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// Styles - Evolv11 Brand Colors & Nike-inspired Design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0', // Warm beige background matching logo
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 16,
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  missionText: {
    fontSize: 18,
    lineHeight: 26,
    color: '#374151',
    fontWeight: '400',
    marginBottom: 24,
    textAlign: 'left',
  },
  featureBlock: {
    marginBottom: 32,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  featureTextContainer: {
    flex: 1,
    paddingTop: 8,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a4d3a',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  featureDescription: {
    fontSize: 16,
    lineHeight: 22,
    color: '#6b7280',
    fontWeight: '400',
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: 0,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
    overflow: 'hidden',
  },
  featureImage: {
    width: '100%',
    height: '100%',
  },
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    paddingBottom: 120, // Extra padding to avoid tab bar
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginTop: 20,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  ctaSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: '400',
  },
  ctaButton: {
    backgroundColor: '#1a4d3a',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 0,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  ctaButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  buttonIcon: {
    marginLeft: 8,
  },
});
