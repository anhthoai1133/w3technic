import { useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '@/config/api';
import { mockWebsites, mockGames, mockExtensions, mockCategories } from '@/mocks/data';

const api = axios.create({
  baseURL: API_BASE_URL
});

const MOCK_DATA: any = {
  '/websites': mockWebsites,
  '/games': mockGames,
  '/extensions': mockExtensions,
  '/categories': mockCategories
};

const IS_DEV = process.env.NODE_ENV === 'development';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (endpoint: string, options: any = {}) => {
    setLoading(true);
    setError(null);

    try {
      if (IS_DEV) {
        // Giả lập delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Trả về mock data tương ứng với endpoint
        const mockResponse = MOCK_DATA[endpoint];
        return mockResponse; // Trả về trực tiếp mock data, không cần .data
      }

      const response = await api(endpoint, options);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchData, loading, error };
} 