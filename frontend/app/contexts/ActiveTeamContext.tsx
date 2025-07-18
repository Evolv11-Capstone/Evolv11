import React, { createContext, useContext, useState, ReactNode } from 'react';

// Simple type for tracking the currently active team ID
interface ActiveTeamContextType {
  activeTeamId: number | null;
  setActiveTeamId: (teamId: number | null) => void;
}

// Create the context with an undefined fallback
const ActiveTeamContext = createContext<ActiveTeamContextType | undefined>(undefined);

// Provider to wrap app sections that need access to the active team
export const ActiveTeamProvider = ({ children }: { children: ReactNode }) => {
  const [activeTeamId, setActiveTeamId] = useState<number | null>(null); // No team selected by default

  return (
    <ActiveTeamContext.Provider value={{ activeTeamId, setActiveTeamId }}>
      {children}
    </ActiveTeamContext.Provider>
  );
};

// Custom hook to use the active team context
export const useActiveTeam = (): ActiveTeamContextType => {
  const context = useContext(ActiveTeamContext);
  if (!context) {
    throw new Error('useActiveTeam must be used within an ActiveTeamProvider');
  }
  return context;
};


