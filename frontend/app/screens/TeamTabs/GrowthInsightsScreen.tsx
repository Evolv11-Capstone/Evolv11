import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  TouchableOpacity 
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { getMatchesForTeam } from '../../../adapters/matchAdapters';
import { useActiveTeam } from '../../contexts/ActiveTeamContext';
import { useUser } from '../../contexts/UserContext';
import { TeamTabsParamList } from '../../../types/navigationTypes';

type GrowthInsightsNavigationProp = StackNavigationProp<TeamTabsParamList, 'GrowthInsights'>;

type Match = {
  id: number;
  opponent: string;
  team_score: number | null;
  opponent_score: number | null;
  match_date: string;
  season_id: number;
};

type MarkedDates = {
  [key: string]: {
    marked: boolean;
    dotColor: string;
    activeOpacity?: number;
    selected?: boolean;
    selectedColor?: string;
  };
};

export default function GrowthInsightsScreen() {
  const navigation = useNavigation<GrowthInsightsNavigationProp>();
  const { activeTeamId } = useActiveTeam();
  const { user } = useUser();
  
  const [matches, setMatches] = useState<Match[]>([]);
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');

  useEffect(() => {
    const loadMatches = async () => {
      if (!activeTeamId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [matchesResult, error] = await getMatchesForTeam(activeTeamId);

        if (error) {
          console.error('Error loading matches:', error);
          Alert.alert('Error', 'Failed to load match data');
          return;
        }

        const matchesData = matchesResult?.data || [];
        setMatches(matchesData);

        // Create marked dates for calendar
        const marked: MarkedDates = {};
        matchesData.forEach((match: Match) => {
          const dateKey = match.match_date.split('T')[0]; // Get YYYY-MM-DD format
          marked[dateKey] = {
            marked: true,
            dotColor: '#1a4d3a',
            activeOpacity: 0.7,
          };
        });
        setMarkedDates(marked);

      } catch (err) {
        console.error('Error in loadMatches:', err);
        Alert.alert('Error', 'Failed to load match data');
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [activeTeamId]);

  const handleDayPress = (day: DateData) => {
    const dateKey = day.dateString;
    setSelectedDate(dateKey);

    // Find match for selected date
    const matchForDate = matches.find(match => 
      match.match_date.split('T')[0] === dateKey
    );

    if (matchForDate) {
      // Navigate to feedback detail screen
      // Pass the user ID and let FeedbackDetailScreen resolve the player ID
      const userId = user?.id;
      
      if (!userId) {
        Alert.alert('Error', 'Unable to determine user information');
        return;
      }
      
      navigation.navigate('FeedbackDetail', {
        matchId: matchForDate.id,
        matchDate: matchForDate.match_date,
        opponent: matchForDate.opponent,
        // Don't pass playerId - let FeedbackDetailScreen resolve it from user_id
      });
    } else {
      Alert.alert(
        'No Match Found', 
        'There was no match on this date. Select a highlighted date to view your feedback.',
        [{ text: 'OK' }]
      );
    }
  };

  const getUpcomingMatches = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return matches
      .filter(match => new Date(match.match_date) >= today)
      .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
      .slice(0, 3);
  };

  const getRecentMatches = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return matches
      .filter(match => new Date(match.match_date) < today)
      .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
      .slice(0, 3);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a4d3a" />
        <Text style={styles.loadingText}>Loading your growth insights...</Text>
      </View>
    );
  }

  const upcomingMatches = getUpcomingMatches();
  const recentMatches = getRecentMatches();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Growth Insights</Text>
        <Text style={styles.subtitle}>
          Track your progress and view personalized feedback from each match
        </Text>
      </View>

      {/* Calendar */}
      <View style={styles.calendarCard}>
        <Text style={styles.sectionTitle}>Match Calendar</Text>
        <Text style={styles.calendarHint}>
          Tap on highlighted dates to view your match feedback and AI suggestions
        </Text>
        
        <Calendar
          style={styles.calendar}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#1a4d3a',
            selectedDayBackgroundColor: '#1a4d3a',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#1a4d3a',
            dayTextColor: '#333333',
            textDisabledColor: '#d9e1e8',
            dotColor: '#1a4d3a',
            selectedDotColor: '#ffffff',
            arrowColor: '#1a4d3a',
            monthTextColor: '#1a4d3a',
            indicatorColor: '#1a4d3a',
            textDayFontWeight: '500',
            textMonthFontWeight: '700',
            textDayHeaderFontWeight: '600',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: {
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: '#1a4d3a',
            },
          }}
          firstDay={1} // Start week on Monday
          showWeekNumbers={false}
          hideExtraDays={true}
        />
      </View>

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <View style={styles.matchesCard}>
          <Text style={styles.sectionTitle}>Recent Matches</Text>
          {recentMatches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchItem}
              onPress={() => handleDayPress({ dateString: match.match_date.split('T')[0] } as DateData)}
            >
              <View style={styles.matchInfo}>
                <Text style={styles.matchOpponent}>{match.opponent}</Text>
                <Text style={styles.matchDate}>
                  {new Date(match.match_date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.matchScore}>
                <Text style={styles.scoreText}>
                  {match.team_score ?? '-'} - {match.opponent_score ?? '-'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Upcoming Matches */}
      {upcomingMatches.length > 0 && (
        <View style={styles.matchesCard}>
          <Text style={styles.sectionTitle}>Upcoming Matches</Text>
          {upcomingMatches.map((match) => (
            <View key={match.id} style={styles.matchItem}>
              <View style={styles.matchInfo}>
                <Text style={styles.matchOpponent}>{match.opponent}</Text>
                <Text style={styles.matchDate}>
                  {new Date(match.match_date).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.upcomingBadge}>
                <Text style={styles.upcomingText}>Upcoming</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* No matches message */}
      {matches.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Matches Found</Text>
          <Text style={styles.emptyText}>
            Once your coach adds matches to the season, they'll appear here and you can view your personalized feedback.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f3f0',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f3f0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#1a4d3a',
    fontWeight: '500',
  },
  header: {
    padding: 20,
    backgroundColor: '#1a4d3a',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#d4b896',
    textAlign: 'center',
    lineHeight: 22,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 8,
  },
  calendarHint: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    lineHeight: 20,
  },
  calendar: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 0,
  },
  matchesCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchInfo: {
    flex: 1,
  },
  matchOpponent: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a4d3a',
    marginBottom: 4,
  },
  matchDate: {
    fontSize: 14,
    color: '#666666',
  },
  matchScore: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f3f0',
    borderRadius: 0,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a4d3a',
  },
  upcomingBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#d4b896',
    borderRadius: 0,
  },
  upcomingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a4d3a',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    marginHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
});
