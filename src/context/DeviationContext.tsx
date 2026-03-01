import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the deviation data from the API
interface DeviationData {
  batchId: string;
  parameter: string;
  recordedValue: number;
  limitValue: number;
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
  status: 'OPEN' | 'CLOSED';
  isClosed: boolean;
}

// Extended deviation type for frontend use (includes id and timestamp)
export interface Deviation extends DeviationData {
  id: string;
  createdAt: string;
}

interface ToastNotification {
  id: string;
  message: string;
  severity: 'CRITICAL' | 'MAJOR';
}

interface DeviationContextType {
  deviations: Deviation[];
  unreadCount: number;
  toasts: ToastNotification[];
  removeToast: (id: string) => void;
}

const DeviationContext = createContext<DeviationContextType | undefined>(undefined);

export const DeviationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [deviations, setDeviations] = useState<Deviation[]>([]);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const unreadCount = deviations.filter(d => d.status === 'OPEN').length;

  useEffect(() => {
    const fetchDeviation = async () => {
      try {
        const response = await fetch('http://localhost:9500/api/deviations/simulateData');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: DeviationData = await response.json();

        const newDeviation: Deviation = {
          ...data,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };

        setDeviations(prev => [newDeviation, ...prev]);

        if (data.severity === 'CRITICAL' || data.severity === 'MAJOR') {
          const newToast: ToastNotification = {
            id: crypto.randomUUID(),
            message: `${data.severity} Deviation: ${data.parameter} is ${data.recordedValue}`,
            severity: data.severity,
          };
          setToasts(prev => [...prev, newToast]);
        }
      } catch (error) {
        console.error("Failed to fetch deviation data:", error);
      }
    };

    const intervalId = setInterval(fetchDeviation, 60000);

    // Fetch immediately on mount
    fetchDeviation();

    return () => clearInterval(intervalId);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <DeviationContext.Provider value={{ deviations, unreadCount, toasts, removeToast }}>
      {children}
    </DeviationContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDeviation = () => {
  const context = useContext(DeviationContext);
  if (context === undefined) {
    throw new Error('useDeviation must be used within a DeviationProvider');
  }
  return context;
};
