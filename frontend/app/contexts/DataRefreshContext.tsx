import React, { createContext, useContext, useState, useCallback } from 'react';

interface DataRefreshContextType {
  refreshTrigger: number;
  triggerDashboardRefresh: () => void;
  triggerMatchCenterRefresh: () => void;
  triggerPlayersRefresh: () => void;
}

const DataRefreshContext = createContext<DataRefreshContextType | undefined>(undefined);

export const useDataRefresh = () => {
  const context = useContext(DataRefreshContext);
  if (!context) {
    throw new Error('useDataRefresh must be used within a DataRefreshProvider');
  }
  return context;
};

export const DataRefreshProvider = ({ children }: { children: React.ReactNode }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerDashboardRefresh = useCallback(() => {
    console.log('🔄 DataRefreshContext: Triggering dashboard refresh');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const triggerMatchCenterRefresh = useCallback(() => {
    console.log('🔄 DataRefreshContext: Triggering match center refresh');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  const triggerPlayersRefresh = useCallback(() => {
    console.log('🔄 DataRefreshContext: Triggering players refresh');
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <DataRefreshContext.Provider
      value={{
        refreshTrigger,
        triggerDashboardRefresh,
        triggerMatchCenterRefresh,
        triggerPlayersRefresh,
      }}
    >
      {children}
    </DataRefreshContext.Provider>
  );
};
