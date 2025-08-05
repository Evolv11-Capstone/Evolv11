// screens/LandingScreen.tsx

import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Dimensions,
  Platform,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Modern Nike-inspired landing screen with Evolv11 branding
export default function LandingScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.fullScreenTouchable}
        onPress={() => navigation.navigate('AuthTabs', { screen: 'About' })}
        activeOpacity={1}
      >
        <ImageBackground
          source={require('../../../assets/images/stadiumEvolv11.png')}
          style={styles.backgroundImage}
          resizeMode="cover"
          imageStyle={styles.backgroundImageStyle}
        >
          <View style={styles.contentContainer}>
            {/* Main Logo Section */}
            <View style={styles.logoSection}>
              <Image
                source={{}} // User will add their logo image here
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>

        

            {/* Subtle Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Welcome to Evolv11 - Your football evolution starts here
              </Text>
            </View>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

// Styles - Evolv11 Brand Colors & Nike-inspired Design
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0',
  },
  fullScreenTouchable: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImageStyle: {
    transform: [{ translateX: -0 }, { translateY: 0}],
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%'
  },
  logoImage: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 300,
    maxHeight: 300,
    marginBottom: 100,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 25,
  },
  iconButton: {
    padding: 20,
    marginHorizontal: 12,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginTop: 50,
  },
  footer: {
    alignItems: 'center',
    marginBottom: -5,
  },
  footerText: {
    fontSize: 15,
    color: '#818896ff',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontWeight: '400',
    opacity: 0.8,
  },
  swipeHint: {
    position: 'absolute',
    right: 130,
    top: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 77, 58, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    pointerEvents: 'none', // Allow touches to pass through to parent
  },
  swipeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
