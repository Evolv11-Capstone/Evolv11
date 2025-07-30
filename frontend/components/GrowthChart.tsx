import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { getPlayerGrowthHistory } from '../adapters/moderateReviewsAdapter';

const { width } = Dimensions.get('window');

type GrowthSnapshot = {
  id: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
  coach_grade: number;
  overall_rating: number;
  match_date: string;
  opponent: string;
  created_at: string;
};

type Props = {
  playerId: number;
};

const GrowthChart: React.FC<Props> = ({ playerId }) => {
  const [snapshots, setSnapshots] = useState<GrowthSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching growth data for playerId:', playerId);
        
        const [data, fetchError] = await getPlayerGrowthHistory(playerId);
        
        console.log('📊 Growth API Response:', { data, fetchError });
        
        if (fetchError) {
          console.error('❌ Growth fetch error:', fetchError);
          console.error('❌ Full error object:', JSON.stringify(fetchError, null, 2));
          
          // Check if it's an authentication error
          if (fetchError.message?.includes('401') || fetchError.message?.includes('Unauthorized')) {
            setError('Authentication required. Please log in again.');
          } else {
            setError(`API Error: ${fetchError.message || fetchError}`);
          }
          return;
        }
        
        if (!data) {
          console.warn('⚠️ No data returned from growth API');
          setError('No data returned from server');
          return;
        }

        const history = data.data.growth_history || [];
        setSnapshots(history);
        
        if (history.length === 0) {
          console.log('📭 No snapshots found for player');
        }
        
      } catch (err) {
        console.error('💥 Error fetching growth data:', err);
        setError('Failed to load growth data');
      } finally {
        setLoading(false);
      }
    };

    fetchGrowthData();
  }, [playerId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading growth data...</Text>
      </View>
    );
  }

  if (error || snapshots.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>
          {error || 'No match history available yet'}
        </Text>
        <Text style={styles.noDataSubtext}>
          Player progression will appear after match statistics are recorded
        </Text>
      </View>
    );
  }

  // Calculate chart dimensions
  const chartHeight = 200;
  const chartPadding = 20;
  const labelsHeight = 80; // Space for match labels
  const totalHeight = chartHeight + labelsHeight;
  const availableWidth = width - 80; // Account for margins and padding
  const pointSpacing = Math.max(40, availableWidth / Math.max(snapshots.length - 1, 1));

  // Find min/max values for scaling
  const allValues = snapshots.flatMap(snapshot => [
    snapshot.shooting,
    snapshot.passing,
    snapshot.dribbling,
    snapshot.defense,
    snapshot.physical,
    snapshot.overall_rating
  ]);
  const minValue = Math.max(0, Math.min(...allValues) - 5);
  const maxValue = Math.min(100, Math.max(...allValues) + 5);
  const valueRange = maxValue - minValue;

  // Scale value to chart coordinates
  const scaleY = (value: number) => {
    const normalized = (value - minValue) / valueRange;
    return chartHeight - (normalized * (chartHeight - 2 * chartPadding)) - chartPadding;
  };

  // Generate SVG path for a stat line
  const generatePath = (statKey: keyof GrowthSnapshot) => {
    return snapshots
      .map((snapshot, index) => {
        const x = index * pointSpacing + chartPadding;
        const y = scaleY(snapshot[statKey] as number);
        return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');
  };

  // Create timeline with unique months
  const createTimeline = () => {
    const monthPositions: { month: string; position: number; year: string }[] = [];
    const seenMonths = new Set<string>();

    snapshots.forEach((snapshot, index) => {
      const date = new Date(snapshot.match_date);
      const monthYear = `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!seenMonths.has(monthYear)) {
        seenMonths.add(monthYear);
        monthPositions.push({
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          year: date.getFullYear().toString(),
          position: index * pointSpacing + chartPadding
        });
      }
    });

    return monthPositions;
  };

  const timeline = createTimeline();

  const statLines = [
    { key: 'overall_rating', color: '#1a4d3a', label: 'Overall', width: 3 },
    { key: 'shooting', color: '#e74c3c', label: 'Shooting', width: 2 },
    { key: 'passing', color: '#3498db', label: 'Passing', width: 2 },
    { key: 'dribbling', color: '#f39c12', label: 'Dribbling', width: 2 },
    { key: 'defense', color: '#9b59b6', label: 'Defense', width: 2 },
    { key: 'physical', color: '#2ecc71', label: 'Physical', width: 2 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={[styles.chartContainer, { 
          width: Math.max(availableWidth, snapshots.length * pointSpacing + 2 * chartPadding),
          height: totalHeight 
        }]}>
          {/* Chart Background */}
          <View style={[styles.chartBackground, { height: chartHeight }]}>
            {/* Grid lines and labels for every 10 points */}
            {[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(value => {
              if (value < minValue || value > maxValue) return null;
              const y = scaleY(value);
              return (
                <View key={value} style={[styles.gridLine, { top: y }]}>
                  <Text style={styles.gridLabel}>{value}</Text>
                </View>
              );
            })}
          </View>

          {/* Chart Lines - Using simple View-based approach */}
          <View style={[styles.linesContainer, { height: chartHeight }]}>
            {snapshots.map((snapshot, index) => {
              if (index === 0) return null;
              
              const prevSnapshot = snapshots[index - 1];
              const x = index * pointSpacing + chartPadding;
              const prevX = (index - 1) * pointSpacing + chartPadding;
              
              return statLines.map(stat => {
                const y = scaleY(snapshot[stat.key as keyof GrowthSnapshot] as number);
                const prevY = scaleY(prevSnapshot[stat.key as keyof GrowthSnapshot] as number);
                
                const lineLength = Math.sqrt(Math.pow(x - prevX, 2) + Math.pow(y - prevY, 2));
                const angle = Math.atan2(y - prevY, x - prevX) * (180 / Math.PI);
                
                return (
                  <View
                    key={`${stat.key}-${index}`}
                    style={[
                      styles.chartLine,
                      {
                        left: prevX,
                        top: prevY,
                        width: lineLength,
                        backgroundColor: stat.color,
                        height: stat.width,
                        transform: [{ rotate: `${angle}deg` }],
                        transformOrigin: '0 50%',
                      }
                    ]}
                  />
                );
              });
            })}
          </View>

          {/* Data Points */}
          {snapshots.map((snapshot, index) => (
            <View
              key={`point-${index}`}
              style={[
                styles.dataPoint,
                {
                  left: index * pointSpacing + chartPadding - 4,
                  top: scaleY(snapshot.overall_rating) - 4,
                }
              ]}
            />
          ))}

          {/* Timeline with unique months */}
          <View style={styles.timeline}>
            {/* Timeline base line */}
            <View style={styles.timelineBase} />
            
            {/* Timeline markers and labels */}
            {timeline.map((item, index) => (
              <View key={`timeline-${index}`} style={styles.timelineItemContainer}>
                {/* Vertical marker line */}
                <View 
                  style={[
                    styles.timelineMarker,
                    { left: item.position }
                  ]} 
                />
                
                {/* Month label */}
                <View 
                  style={[
                    styles.timelineLabel,
                    { left: item.position - 25 }
                  ]}
                >
                  <Text style={styles.timelineMonthText}>{item.month}</Text>
                  <Text style={styles.timelineYearText}>{item.year}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.legendContent}>
            {statLines.map(stat => (
              <View key={stat.key} style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: stat.color }]} />
                <Text style={styles.legendLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 0,
  },
  loadingText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 40,
  },
  noDataText: {
    textAlign: 'center',
    color: '#1a4d3a',
    fontSize: 18,
    fontWeight: '600',
    padding: 20,
    paddingBottom: 10,
  },
  noDataSubtext: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  chartContainer: {
    position: 'relative',
    marginVertical: 20,
    marginLeft: 40, // Add left margin for rating labels
    minHeight: 300, // Ensure enough space for chart + labels
  },
  chartBackground: {
    position: 'relative',
    backgroundColor: '#fafafa',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#f0f0f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridLabel: {
    position: 'absolute',
    left: -35,
    fontSize: 11,
    color: '#1a4d3a',
    width: 30,
    textAlign: 'right',
    fontWeight: '600',
    backgroundColor: '#ffffff',
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 2,
  },
  linesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  chartLine: {
    position: 'absolute',
    borderRadius: 1,
  },
  dataPoint: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1a4d3a',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  matchLabels: {
    position: 'absolute',
    top: 210, // Position just below the chart (chartHeight + 10)
    left: 0,
    right: 0,
    height: 80,
  },
  timeline: {
    position: 'absolute',
    top: 210, // Position just below the chart
    left: 0,
    right: 0,
    height: 60,
  },
  timelineBase: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: '#d4b896',
    borderRadius: 1,
  },
  timelineItemContainer: {
    position: 'absolute',
    top: 0,
    height: '100%',
  },
  timelineMarker: {
    position: 'absolute',
    top: 15,
    width: 2,
    height: 10,
    backgroundColor: '#1a4d3a',
    borderRadius: 1,
  },
  timelineLabel: {
    position: 'absolute',
    top: 28,
    width: 50,
    alignItems: 'center',
  },
  timelineMonthText: {
    fontSize: 12,
    color: '#1a4d3a',
    fontWeight: '700',
    textAlign: 'center',
  },
  timelineYearText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 1,
  },
  matchLabel: {
    position: 'absolute',
    width: 40,
    alignItems: 'center',
  },
  matchDateText: {
    fontSize: 10,
    color: '#1a4d3a',
    fontWeight: '600',
    textAlign: 'center',
    backgroundColor: '#f5f3f0',
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#d4b896',
    marginBottom: 2,
    minHeight: 18,
  },
  legend: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  legendContent: {
    flexDirection: 'row',
    paddingHorizontal: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendColor: {
    width: 16,
    height: 3,
    borderRadius: 1.5,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#1a4d3a',
    fontWeight: '500',
  },
});

export default GrowthChart;
