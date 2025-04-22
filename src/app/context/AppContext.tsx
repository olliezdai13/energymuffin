'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  hasCredentials: boolean;
  customerId: number | null;
  setHasCredentials: (value: boolean) => void;
  setCustomerId: (value: number | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [hasCredentials, setHasCredentials] = useState(false);
  const [customerId, setCustomerId] = useState<number | null>(null);

  return (
    <AppContext.Provider value={{
      hasCredentials,
      customerId,
      setHasCredentials,
      setCustomerId,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
} 