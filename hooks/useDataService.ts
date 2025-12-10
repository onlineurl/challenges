import { useMemo } from 'react';
import { useMockData } from './useMockData';
import { supabaseService } from '../services/supabaseService';
import type { IDataService } from '../services/IDataService';

const useMock = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export function useDataService(): IDataService {
  const mockDataService = useMockData();

  const dataService = useMemo(() => {
    if (useMock) {
      console.log("Using Mock Data Service");
      return mockDataService;
    } else {
      console.log("Using Supabase Data Service");
      return supabaseService;
    }
  }, [mockDataService]);

  return dataService;
}