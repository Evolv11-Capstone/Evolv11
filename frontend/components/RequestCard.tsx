import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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

  // Status color
  const statusColor =
    status === 'approved'
      ? '#2d662d'
      : status === 'rejected'
      ? '#b00020'
      : '#888';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.roleBadge}>{safeRole}</Text>
      </View>
      <Text style={[styles.statusText, { color: statusColor }]}>
        Status: {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
      {status === 'pending' && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.approveButton} onPress={onApprove} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={onReject} activeOpacity={0.85}>
            <Text style={styles.buttonText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Styling
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    justifyContent: 'space-between',
  },
  userName: {
    fontWeight: '700',
    fontSize: 17,
    color: '#111',
    flex: 1,
  },
  roleBadge: {
    backgroundColor: '#f4f4f4',
    color: '#2d662d',
    fontWeight: '700',
    fontSize: 13,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginLeft: 10,
    overflow: 'hidden',
    letterSpacing: 0.5,
  },
  statusText: {
    fontStyle: 'italic',
    fontSize: 15,
    marginBottom: 12,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  approveButton: {
    backgroundColor: '#2d662d',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginRight: 6,
    shadowColor: '#2d662d',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  rejectButton: {
    backgroundColor: '#b00020',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#b00020',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
