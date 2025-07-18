import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

// Define prop types explicitly
export interface RequestCardProps {
  id: number;
  userName: string;
  role: string;
  status: string;
  onApprove: () => void;
  onReject: () => void;
}

// Component to display and manage a join request card
export default function RequestCard({
  id,
  userName,
  role,
  status,
  onApprove,
  onReject,
}: RequestCardProps) {
  // Fallback to empty string if role is undefined/null
  const safeRole = role ? role.toUpperCase() : '';

  return (
    <View style={styles.card}>
      {/* Display requester name and role */}
      <Text style={styles.text}>
        {userName} ({safeRole})
      </Text>

      {/* Show status (approved/rejected/pending) */}
      <Text style={styles.statusText}>Status: {status}</Text>

      {/* Only render buttons if status is still pending */}
      {status === 'pending' && (
        <View style={styles.buttonContainer}>
          <Button title="Approve" onPress={onApprove} />
          <View style={{ width: 10 }} />
          <Button title="Reject" color="red" onPress={onReject} />
        </View>
      )}
    </View>
  );
}

// Styling
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f2f2f2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontWeight: '600',
    marginBottom: 4,
  },
  statusText: {
    fontStyle: 'italic',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
});
