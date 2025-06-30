import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { usePlayer } from '../app/contexts/PlayerContext';

// Simple player creation form
export default function CreateNewPlayer() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationality, setNationality] = useState('');
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('');

  const { setPlayer } = usePlayer();

  const handleSubmit = () => {
    // Validate required fields
    if (!firstName || !lastName || !nationality || !age || !position) {
      Alert.alert('All fields are required!');
      return;
    }

    // Update context
    setPlayer({ firstName, lastName, nationality, age, position });
    Alert.alert('Player created!', 'Go to the PlayerHub tab to see the card.');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create New Player</Text>
      <TextInput style={styles.input} placeholder="First Name" value={firstName} onChangeText={setFirstName} />
      <TextInput style={styles.input} placeholder="Last Name" value={lastName} onChangeText={setLastName} />
      <TextInput style={styles.input} placeholder="Nationality" value={nationality} onChangeText={setNationality} />
      <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="numeric" />
      <TextInput style={styles.input} placeholder="Primary Position (e.g., ST, CM)" value={position} onChangeText={setPosition} />
      <Button title="Create Player" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#fff', alignItems: 'stretch' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, alignSelf: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 12, borderRadius: 8 },
});
