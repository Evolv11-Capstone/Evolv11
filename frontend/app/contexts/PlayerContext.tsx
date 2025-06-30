import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the Player type
export type Player = {
  firstName: string;
  lastName: string;
  nationality: string;
  age: string;
  position: string;
};

// Define the context type
type PlayerContextType = {
  player: Player | null;
  setPlayer: (player: Player) => void;
};

// Create the context
const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

// Hook to use context in any component
export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

// Provider component to wrap around the app
export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [player, setPlayer] = useState<Player | null>(null);
  return (
    <PlayerContext.Provider value={{ player, setPlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};
