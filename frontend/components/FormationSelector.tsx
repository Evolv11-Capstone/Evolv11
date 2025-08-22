import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

// All supported football formations
const formations = [
  '4-3-3', '4-4-2', '3-5-2', '3-4-3', '4-2-3-1', '4-1-4-1', '4-5-1', '5-3-2', '5-4-1'
];

// Props expected by the component
type Props = {
  selected: string | null;
  onSelect: (formation: string) => void;
};

const FormationSelector: React.FC<Props> = ({ selected, onSelect }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>SELECT FORMATION</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {formations.map((formation) => (
          <TouchableOpacity
            key={formation}
            style={[
              styles.formationButton,
              selected === formation && styles.selected
            ]}
            onPress={() => onSelect(formation)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.buttonText,
              selected === formation && styles.selectedText
            ]}>
              {formation}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '900', // Ultra-bold Nike typography
    marginBottom: 16,
    color: '#1a4d3a',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scrollContainer: {
    paddingHorizontal: 4,
  },
  formationButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 0, // Sharp edges for Nike aesthetic
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#d4b896',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  selected: {
    backgroundColor: '#1a4d3a',
    borderColor: '#1a4d3a',
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#1a4d3a',
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: '900',
  },
});

export default FormationSelector;
