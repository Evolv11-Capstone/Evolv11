import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the type of the user
export interface User {
  id: number;
  name: string;
  role: 'coach' | 'player' | 'scout';
  team_ids: number[];
  email: string;
  nationality: string;
  age: string;
}

// Context value type
interface UserContextType {
  user: User;
  setUser: (user: User) => void;
}

// Create the actual context
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Hook to consume context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>({
    id: 0,
    name: '',
    role: 'player',
    team_ids: [],
    email: '',
    nationality: '',
    age: '',
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

