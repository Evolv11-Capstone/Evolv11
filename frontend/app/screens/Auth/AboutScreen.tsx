// screens/Auth/AboutScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Nike-inspired About screen showing Evolv11 mission and features
export default function AboutScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [minDelayPassed, setMinDelayPassed] = useState(false);
  
  const imageUrls = [
    'https://wallpaperaccess.com/full/563291.jpg',
    'https://e-scoutsoccer.com/wp-content/uploads/2021/07/the-organization-foto3.jpg',
    'https://i2-prod.mirror.co.uk/article8961715.ece/ALTERNATES/s1200b/Manchester-United-v-Stoke-City-Premier-League.jpg',
    'https://www.director11.com/wp-content/uploads/2024/08/Modelo-de-canteras-espanol-el-exito-de-desarrollar-talento.jpg'
  ];
  const totalImages = imageUrls.length;

  useEffect(() => {
    // Preload all images during loading screen
    imageUrls.forEach((url, index) => {
      Image.prefetch(url)
        .then(() => {
          console.log(`Image ${index + 1} preloaded successfully`);
          setImagesLoaded(prev => prev + 1);
        })
        .catch(() => {
          console.log(`Image ${index + 1} failed to preload, counting as loaded`);
          setImagesLoaded(prev => prev + 1);
        });
    });
  }, []);

  useEffect(() => {
    // Ensure minimum 700ms delay
    const timer = setTimeout(() => {
      setMinDelayPassed(true);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Fallback: Force loading to end after 3 seconds to prevent infinite loading
    const fallbackTimer = setTimeout(() => {
      console.log('Fallback triggered - forcing loading to end');
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, []);

  useEffect(() => {
    // Only hide loading when all images are loaded AND minimum delay has passed
    if (imagesLoaded >= totalImages && minDelayPassed) {
      console.log('All conditions met - hiding loading');
      setIsLoading(false);
    }
  }, [imagesLoaded, minDelayPassed]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#1a4d3a" />
          <Text style={styles.loadingText}>Uncovering our story...</Text>
          
        </View>
      </View>
    );
  }

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

        <View style={styles.imageContainerMission}>
          <Image
            source={{uri: imageUrls[0]}} // Mission image
            style={styles.missionImage}
            resizeMode="cover"
          />
        </View>
      </View>

      {/* Section Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerDot} />
        <View style={styles.dividerLine} />
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
              source={{uri: imageUrls[1]}} // Analytics image
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
              source={{uri: imageUrls[2]}} // Team management image
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
              source={{uri: imageUrls[3]}} // Talent development image
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f3f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#1a4d3a',
    marginTop: 16,
    fontWeight: '500',
  },
  loadingProgress: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontWeight: '400',
  },
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
    marginBottom: 15,
    letterSpacing: -0.5,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  missionText: {
    fontSize: 16.5,
    lineHeight: 26,
    color: '#374151',
    fontWeight: '400',
    marginBottom: 35,
    textAlign: 'left',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 30,
    paddingHorizontal: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d4b896',
    opacity: 0.6,
  },
  dividerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a4d3a',
    marginHorizontal: 16,
  },
  featureBlock: {
    marginBottom: 32,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  featureIcon: {
    width: 60,
    height: 60,
    marginTop: 32,
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
   imageContainerMission: {
    width: '100%',
    height: 200,
    borderRadius: 0,
    backgroundColor: '#e5e7eb',
    marginBottom: 8,
    overflow: 'hidden',
  },
  missionImage: {
    width: '100%',
    height: '100%',
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
