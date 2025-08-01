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
            <Text style={[styles.buttonText, { color: '#ffffff' }]}>Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.rejectButton} onPress={onReject} activeOpacity={0.85}>
            <Text style={[styles.buttonText, { color: '#ff4444' }]}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Styling - Evolv11 Brand Colors & Nike-inspired Design
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 0, // Sharp edges for Nike-inspired design
    marginBottom: 16,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#1a4d3a',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  userName: {
    fontWeight: '700',
    fontSize: 18,
    color: '#1a4d3a',
    flex: 1,
    letterSpacing: -0.3,
  },
  roleBadge: {
    backgroundColor: '#f5f3f0',
    color: '#1a4d3a',
    fontWeight: '700',
    fontSize: 12,
    borderRadius: 0, // Sharp edges
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginLeft: 12,
    overflow: 'hidden',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: '#d4b896',
  },
  statusText: {
    fontSize: 16,
    marginBottom: 20,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  approveButton: {
    backgroundColor: '#1a4d3a',
    borderRadius: 0, // Sharp edges
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderTopWidth: 2,
    borderTopColor: '#76c893',
  },
  rejectButton: {
    backgroundColor: '#ffffff',
    borderRadius: 0, // Sharp edges
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderWidth: 2,
    borderColor: '#ff4444',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
