import { useState, useEffect, useCallback } from 'react';
import { checkApiHealth } from '../services/api.js';

/**
 * Custom hook to monitor backend API connectivity state.
 */
export const useApiHealth = () => {
  const [healthState, setHealthState] = useState({
    connected: false,
    loading: true,
    data: null,
    error: null,
    lastChecked: null,
  });

  const checkStatus = useCallback(async () => {
    setHealthState((prev) => ({ ...prev, loading: true }));
    const result = await checkApiHealth();
    setHealthState({
      connected: result.connected,
      loading: false,
      data: result.data,
      error: result.error,
      lastChecked: new Date(),
    });
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    ...healthState,
    refresh: checkStatus,
  };
};
