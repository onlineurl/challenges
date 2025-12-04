import { useMemo } from 'react';
import { useMockData } from './useMockData';
import { supabaseService } from '../services/supabaseService';
import type { IDataService } from '../services/IDataService';

const useMock = process.env.VITE_USE_MOCK_DATA === 'true';

export function useDataService(): IDataService {
  const mockDataService = useMockData();

  const dataService = useMemo(() => {
    if (useMock) {
      console.log("Using Mock Data Service");
      return mockDataService;
    } else {
      console.log("Using Supabase Data Service");
      // In a real app with auth, you might pass a token here
      return supabaseService;
    }
  }, [mockDataService]);

  return dataService;
}
