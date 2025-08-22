// components/BackToTeamTabsButton.tsx

/**
 * Minimalistic "Back to Team Tabs" navigation button component
 * 
 * Features:
 * - Icon-only chevron design for clean headers
 * - Respects active team context (navigates to current team or fallback)
 * - Accessibility compliant (44x44 touch target, proper labels)
 * - Haptic feedback for better UX
 * - Theme-aware colors
 * 
 * Usage:
 * Add to any detail screen's header via navigation options:
 * 
 * ```tsx
 * // Navigate back to Players tab
 * options={{
 *   headerLeft: () => <BackToTeamTabsButton destination="Players" />
 * }}
 * 
 * // Navigate back to Match Center tab
 * options={{
 *   headerLeft: () => <BackToTeamTabsButton destination="Match Center" />
 * }}
 * 
 * // Navigate back to Growth Insights tab
 * options={{
 *   headerLeft: () => <BackToTeamTabsButton destination="Growth Insights" />
 * }}
 * ```
 * 
 * Or use inline with custom navigation:
 * ```tsx
 * <BackToTeamTabsButton onPress={() => customNavigation()} />
 * ```
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useActiveTeam } from '../app/contexts/ActiveTeamContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

interface BackToTeamTabsButtonProps {
  /**
   * Optional custom navigation action. If not provided, navigates back to TeamTabsNavigator
   */
  onPress?: () => void;
  /**
   * Specific destination within TeamTabs navigator
   * - 'Dashboard': Navigate to Dashboard tab
   * - 'Players': Navigate to Players tab  
   * - 'Match Center': Navigate to Match Center tab
   * - 'Growth Insights': Navigate to Growth Insights tab
   * - 'Team Analysis': Navigate to Team Analysis tab
   * - undefined: Navigate to Dashboard (default)
   */
  destination?: 'Dashboard' | 'Players' | 'Match Center' | 'Growth Insights' | 'Team Analysis';
  /**
   * Icon size in pixels
   */
  iconSize?: number;
  /**
   * Icon color (defaults to theme-aware color)
   */
  iconColor?: string;
  /**
   * Whether to show haptic feedback on press
   */
  hapticFeedback?: boolean;
}

export default function BackToTeamTabsButton({
  onPress,
  destination = 'Dashboard',
  iconSize = 24,
  iconColor = '#1a4d3a',
  hapticFeedback = true,
}: BackToTeamTabsButtonProps = {}) {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { activeTeamId, activeTeamName } = useActiveTeam();

  // Create dynamic accessibility label based on destination
  const getAccessibilityLabel = () => {
    switch (destination) {
      case 'Players': return 'Back to Players';
      case 'Match Center': return 'Back to Match Center';
      case 'Growth Insights': return 'Back to Growth Insights';
      case 'Team Analysis': return 'Back to Team Analysis';
      case 'Dashboard':
      default: return 'Back to Dashboard';
    }
  };

  const handlePress = async () => {
    // Haptic feedback for better UX
    if (hapticFeedback) {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        // Haptics might not be available on all devices
        console.log('Haptic feedback not available');
      }
    }

    if (onPress) {
      onPress();
      return;
    }

    try {
      // Navigate back to TeamTabsNavigator root while preserving active team
      if (activeTeamId && activeTeamName) {
        // If we have an active team, navigate to the specified destination tab
        navigation.navigate('TeamTabs', { 
          screen: destination,
          initial: false 
        });
      } else {
        // Fallback to ActiveClubsScreen if no active team
        navigation.navigate('PostAuthTabs', { 
          screen: 'ActiveClubs' 
        });
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to simple goBack if navigation fails
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        Alert.alert('Navigation Error', 'Unable to navigate back. Please try again.');
      }
    }
  };

  return (
    <TouchableOpacity
      style={styles.backButton}
      onPress={handlePress}
      activeOpacity={0.6}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      accessibilityRole="button"
      accessibilityLabel={getAccessibilityLabel()}
      accessibilityHint={`Navigate back to the ${destination?.toLowerCase() || 'dashboard'} section`}
    >
      <ChevronLeft 
        size={iconSize} 
        color={iconColor} 
        strokeWidth={2}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    // Minimum 44x44 touch target for accessibility
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginLeft: 4, // Slight spacing from edge
    borderRadius: 8, // Subtle rounding
    // No background or borders for minimal aesthetic
  },
});
