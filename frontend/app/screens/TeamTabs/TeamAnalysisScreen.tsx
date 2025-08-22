import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

export default function TeamAnalysisScreen() {
  // Animation values for the three dots
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      const animationSequence = Animated.sequence([
        // Animate dot 1
        Animated.timing(dot1Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot1Opacity, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        // Animate dot 2
        Animated.timing(dot2Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot2Opacity, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        // Animate dot 3
        Animated.timing(dot3Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(dot3Opacity, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]);

      // Loop the animation
      Animated.loop(animationSequence).start();
    };

    animateDots();
  }, [dot1Opacity, dot2Opacity, dot3Opacity]);
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.title}>Team Analysis</Text>
        <Text style={styles.subtitle}>Advanced team insights and performance analytics</Text>
      </View>


        
        <Text style={styles.comingSoonTitle}>COMING SOON</Text>
          {/* Coming Soon Content */}
      <View style={styles.comingSoonContainer}>
        <View>
          <View style={styles.dotsContainer}>
            <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
            <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
            <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
          </View>
        </View>
        <Text style={styles.comingSoonDescription}>
          We're building advanced analytics to help you understand your team's performance patterns, 
          tactical strengths, and areas for improvement.
        </Text>
        
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.featureText}>Formation Analysis</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.featureText}>Performance Trends</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.featureText}>Tactical Insights</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={styles.bulletPoint} />
            <Text style={styles.featureText}>Team Comparisons</Text>
          </View>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>Development Progress</Text>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressPercentage}>75%</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0',
    paddingBottom: 100, // Space for tab bar
  },
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 8,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontWeight: '400',
    lineHeight: 22,
  },
  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },

  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 70,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 45, // Sharp square dots
    backgroundColor: '#1a4d3a',
    marginHorizontal: 4,
  },
  comingSoonTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1a4d3a',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 24,
    textTransform: 'uppercase',
  },
  comingSoonDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    fontWeight: '400',
  },
  featuresList: {
    alignSelf: 'stretch',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 0, // Sharp square bullet
    backgroundColor: '#1a4d3a',
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#1a4d3a',
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  progressContainer: {
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 0, // Sharp edges
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    width: '75%',
    height: '100%',
    backgroundColor: '#1a4d3a',
    borderRadius: 0, // Sharp edges
  },
  progressPercentage: {
    fontSize: 16,
    color: '#1a4d3a',
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});
