import React, { createContext, useContext, useEffect, useState } from 'react';
// React imports to manage global state via context

import AsyncStorage from '@react-native-async-storage/async-storage';
// For persisting user session locally on device

import { getSessionUser } from '../../adapters/authAdapters';
// Adapter to check session from backend (GET /api/auth/me)

import { ApiResponse, User } from '../../types/userTypes';
// Type definitions for API response and User object

// Type definition for the shape of our UserContext
interface UserContextType {
  user: User | null; // Currently authenticated user, or null if unauthenticated
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Setter for user state
  loading: boolean; // Whether we are still checking session/loading
  logout: () => void; // Logout method to clear session both server- and client-side
  refreshUser: () => Promise<void>; // Method to refresh user data from server
}

// Create a context with undefined initial value
const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook to access user context from any component
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Provider component to wrap the app and manage user state
export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // Holds current user
  const [loading, setLoading] = useState(true); // Controls whether we are still verifying session

  // Function to log user out: clears server session and local storage
  const logout = async () => {
    try {
      await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/logout`, {
        method: 'DELETE',
        credentials: 'include',
      }); // Clears session on server
    } catch (err) {
      console.error('Error logging out:', err);
    } finally {
      setUser(null); // Reset user in context
      await AsyncStorage.removeItem('evolv11_user'); // Remove from local storage
    }
  };

  // Function to refresh user data from server
  const refreshUser = async () => {
    try {
      const [data, error]: [ApiResponse | null, Error | null] = await getSessionUser();
      if (data?.success && data.user) {
        setUser(data.user);
        await AsyncStorage.setItem('evolv11_user', JSON.stringify(data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  // On mount, check if there is a valid session (either locally or from server)
  useEffect(() => {
    const initializeUser = async () => {
      try {
        // Check local storage first
        const cached = await AsyncStorage.getItem('evolv11_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          setUser(parsed); // Restore session from cache
        }

        // Then verify with backend if session is still valid
        const [data, error]: [ApiResponse | null, Error | null] = await getSessionUser();
        if (data?.success && data.user) {
          setUser(data.user); // Update user from server
          await AsyncStorage.setItem('evolv11_user', JSON.stringify(data.user)); // Sync cache
        } else {
          setUser(null); // Session invalid on server
          await AsyncStorage.removeItem('evolv11_user'); // Clear invalid cache
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setUser(null); // On error, treat as logged out
      } finally {
        setLoading(false); // We're done checking session
      }
    };

    initializeUser(); // Call the function
  }, []);

  // Wrap everything in the context provider and expose the values
  return (
    <UserContext.Provider value={{ user, setUser, loading, logout, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};
