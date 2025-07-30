import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

type PlayerStats = {
  shooting: number;
  passing: number;
  dribbling: number;
  defense: number;
  physical: number;
};

type Props = {
  stats: PlayerStats;
};

const SpiderGraph: React.FC<Props> = ({ stats }) => {
  // Calculate prowess scores (weighted averages)
  const attackingProwess = stats.shooting; // Pure shooting for attacking
  const defensiveProwess = Math.round((stats.defense * 0.6 + stats.physical * 0.4)); // Defense weighted more
  const creativityProwess = Math.round((stats.passing * 0.6 + stats.dribbling * 0.4)); // Passing weighted more

  const prowessData = [
    { label: 'Attacking', value: attackingProwess, color: '#e74c3c', angle: 0 },
    { label: 'Creativity', value: creativityProwess, color: '#3498db', angle: 120 },
    { label: 'Defensive', value: defensiveProwess, color: '#9b59b6', angle: 240 },
  ];

  // Chart dimensions
  const chartSize = Math.min(width - 80, 250);
  const centerX = chartSize / 2;
  const centerY = chartSize / 2;
  const maxRadius = chartSize / 2 - 40;

  // Convert polar coordinates to cartesian
  const getCoordinates = (angle: number, radius: number) => {
    const radians = (angle - 90) * (Math.PI / 180); // -90 to start from top
    return {
      x: centerX + radius * Math.cos(radians),
      y: centerY + radius * Math.sin(radians),
    };
  };

  // Create the spider web background
  const createWebLines = (): React.ReactElement[] => {
    const lines: React.ReactElement[] = [];
    const webLevels = [20, 40, 60, 80, 100];
    
    // Concentric polygons (web rings)
    webLevels.forEach((level, index) => {
      const radius = (level / 100) * maxRadius;
      const points = prowessData.map(item => {
        const coords = getCoordinates(item.angle, radius);
        return `${coords.x},${coords.y}`;
      }).join(' ');
      
      lines.push(
        <View key={`web-${level}`} style={styles.webRing}>
          {/* Using simple View triangles to approximate polygon */}
          {prowessData.map((item, i) => {
            const coords = getCoordinates(item.angle, radius);
            return (
              <View
                key={`web-point-${level}-${i}`}
                style={[
                  styles.webPoint,
                  {
                    left: coords.x - 1,
                    top: coords.y - 1,
                  }
                ]}
              />
            );
          })}
        </View>
      );
    });

    // Radial lines from center to vertices
    prowessData.forEach((item, index) => {
      const endCoords = getCoordinates(item.angle, maxRadius);
      const lineLength = Math.sqrt(Math.pow(endCoords.x - centerX, 2) + Math.pow(endCoords.y - centerY, 2));
      const angle = Math.atan2(endCoords.y - centerY, endCoords.x - centerX) * (180 / Math.PI);
      
      lines.push(
        <View
          key={`radial-${index}`}
          style={[
            styles.radialLine,
            {
              left: centerX,
              top: centerY,
              width: lineLength,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: '0 50%',
            }
          ]}
        />
      );
    });

    return lines;
  };

  // Create the data polygon
  const createDataPolygon = () => {
    const dataPoints = prowessData.map(item => {
      const radius = (item.value / 100) * maxRadius;
      return getCoordinates(item.angle, radius);
    });

    // Create lines connecting the data points
    return dataPoints.map((point, index) => {
      const nextPoint = dataPoints[(index + 1) % dataPoints.length];
      const lineLength = Math.sqrt(Math.pow(nextPoint.x - point.x, 2) + Math.pow(nextPoint.y - point.y, 2));
      const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x) * (180 / Math.PI);
      
      return (
        <View
          key={`data-line-${index}`}
          style={[
            styles.dataLine,
            {
              left: point.x,
              top: point.y,
              width: lineLength,
              backgroundColor: prowessData[index].color,
              transform: [{ rotate: `${angle}deg` }],
              transformOrigin: '0 50%',
            }
          ]}
        />
      );
    });
  };

  // Create data points
  const createDataPoints = () => {
    return prowessData.map((item, index) => {
      const radius = (item.value / 100) * maxRadius;
      const coords = getCoordinates(item.angle, radius);
      
      return (
        <View
          key={`data-point-${index}`}
          style={[
            styles.dataPoint,
            {
              left: coords.x - 6,
              top: coords.y - 6,
              backgroundColor: item.color,
              borderColor: item.color,
            }
          ]}
        />
      );
    });
  };

  // Create labels
  const createLabels = () => {
    return prowessData.map((item, index) => {
      const labelRadius = maxRadius + 25;
      const coords = getCoordinates(item.angle, labelRadius);
      
      return (
        <View
          key={`label-${index}`}
          style={[
            styles.label,
            {
              left: coords.x - 40,
              top: coords.y - 15,
            }
          ]}
        >
          <Text style={[styles.labelText, { color: item.color }]}>{item.label}</Text>
          <Text style={styles.labelValue}>{item.value}</Text>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={[styles.chartContainer, { width: chartSize, height: chartSize }]}>
        {/* Web background */}
        <View style={styles.webContainer}>
          {createWebLines()}
        </View>
        
        {/* Data polygon */}
        <View style={styles.dataContainer}>
          {createDataPolygon()}
          {createDataPoints()}
        </View>
        
        {/* Labels */}
        <View style={styles.labelsContainer}>
          {createLabels()}
        </View>

        {/* Center point */}
        <View style={[styles.centerPoint, { left: centerX - 3, top: centerY - 3 }]} />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Player Prowess Breakdown</Text>
        <View style={styles.legendItems}>
          {prowessData.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}: {item.value}/100</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 0,
    padding: 20,
  },
  chartContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  webContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webRing: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webPoint: {
    position: 'absolute',
    width: 2,
    height: 2,
    backgroundColor: '#e0e0e0',
    borderRadius: 1,
  },
  radialLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dataContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dataLine: {
    position: 'absolute',
    height: 3,
    borderRadius: 1.5,
    opacity: 0.8,
  },
  dataPoint: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  labelsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  label: {
    position: 'absolute',
    width: 80,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 2,
  },
  labelValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a4d3a',
    textAlign: 'center',
  },
  centerPoint: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1a4d3a',
  },
  legend: {
    marginTop: 10,
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a4d3a',
    marginBottom: 12,
    textAlign: 'center',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
    color: '#1a4d3a',
    fontWeight: '500',
  },
});

export default SpiderGraph;
