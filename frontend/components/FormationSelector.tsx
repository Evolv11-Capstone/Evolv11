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
      <Text style={styles.title}>1. Select Formation</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {formations.map((formation) => (
          <TouchableOpacity
            key={formation}
            style={[
              styles.formationButton,
              selected === formation && styles.selected
            ]}
            onPress={() => onSelect(formation)}
          >
            <Text style={styles.buttonText}>{formation}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  formationButton: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  selected: {
    backgroundColor: '#007bff',
    borderColor: '#0056b3',
  },
  buttonText: {
    color: '#000',
    fontWeight: '500',
  },
});

export default FormationSelector;
