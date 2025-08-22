import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { User, CheckCircle, XCircle } from 'lucide-react-native';

// Define prop types explicitly
export interface RequestCardProps {
  id: number;
  userName: string;
  role: string;
  status: string;
  userImage?: string; // New prop for user's profile image
  onApprove: () => void;
  onReject: () => void;
}

// Component to display and manage a join request card
export default function RequestCard({
  id,
  userName,
  role,
  status,
  userImage,
  onApprove,
  onReject,
}: RequestCardProps) {
  // Loading states for buttons
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Fallback to empty string if role is undefined/null
  const safeRole = role ? role.toUpperCase() : '';

  // Handle approve with confirmation
  const handleApprove = () => {
    Alert.alert(
      'Approve Player?',
      `Are you sure you want to approve ${userName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            setIsApproving(true);
            try {
              await onApprove();
            } catch (error) {
              console.error('Error approving request:', error);
              // Note: Error handling is done in parent components
            } finally {
              setIsApproving(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Handle reject with confirmation
  const handleReject = () => {
    Alert.alert(
      'Reject Player?',
      `Are you sure you want to reject ${userName}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            setIsRejecting(true);
            try {
              await onReject();
            } catch (error) {
              console.error('Error rejecting request:', error);
              // Note: Error handling is done in parent components
            } finally {
              setIsRejecting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  // Status configuration
  const getStatusConfig = () => {
    switch (status) {
      case 'approved':
        return { color: '#16a34a', bgColor: '#dcfce7', text: 'Approved' };
      default:
        return { color: '#f59e0b', bgColor: '#fef3c7', text: 'Pending' };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={styles.card}>
      {/* Header Section with Profile */}
      <View style={styles.headerSection}>
        {/* Profile Image */}
        <View style={styles.avatarContainer}>
          {userImage ? (
            <Image source={{ uri: userImage }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={24} color="#9ca3af" strokeWidth={1.5} />
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userName}</Text>
          <View style={styles.metaRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{safeRole}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
              <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.text}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {status === 'pending' && (
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={[styles.approveButton, isApproving && styles.buttonDisabled]} 
            onPress={handleApprove} 
            activeOpacity={0.8}
            disabled={isApproving || isRejecting}
            accessibilityLabel={`Approve ${userName}'s request`}
          >
            {isApproving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <CheckCircle size={18} color="#ffffff" strokeWidth={2} />
            )}
            <Text style={styles.approveButtonText}>
              {isApproving ? 'Approving...' : 'Approve'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.rejectButton, isRejecting && styles.buttonDisabled]} 
            onPress={handleReject} 
            activeOpacity={0.8}
            disabled={isApproving || isRejecting}
            accessibilityLabel={`Reject ${userName}'s request`}
          >
            {isRejecting ? (
              <ActivityIndicator size="small" color="#dc2626" />
            ) : (
              <XCircle size={18} color="#dc2626" strokeWidth={2} />
            )}
            <Text style={styles.rejectButtonText}>
              {isRejecting ? 'Rejecting...' : 'Reject'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// Modern card styling with clean design
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  
  // Header Section
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  // Avatar Styles
  avatarContainer: {
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  
  // User Info Section
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  // Role Badge
  roleBadge: {
    backgroundColor: '#1a4d3a',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  
  // Status Badge
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  // Actions Section
  actionsSection: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  
  // Approve Button
  approveButton: {
    flex: 1,
    backgroundColor: '#1a4d3a',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#1a4d3a',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  approveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  // Reject Button
  rejectButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#dc2626',
    gap: 8,
  },
  rejectButtonText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  
  // Disabled button state
  buttonDisabled: {
    opacity: 0.6,
  },
});
