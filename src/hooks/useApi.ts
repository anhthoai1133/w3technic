import { useState } from 'react';
import { API_BASE_URL, API_TOKEN } from '@/config/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (endpoint: string, options: RequestInit = {}) => {
    try {
      setLoading(true);
      setError(null);

      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      // Xác định Content-Type dựa trên body
      let contentType = 'application/x-www-form-urlencoded';
      if (options.body) {
        if (options.body instanceof FormData) {
          // Không set Content-Type cho FormData để browser tự thêm boundary
          contentType = '';
        } else {
          contentType = 'application/json';
        }
      }

      const headers: HeadersInit = {
        'Authorization': `Bearer ${API_TOKEN}`,
      };

      // Chỉ thêm Content-Type nếu không phải FormData
      if (contentType) {
        headers['Content-Type'] = contentType;
      }

      const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const responseContentType = response.headers.get('content-type');
      if (responseContentType?.includes('application/json')) {
        const data = await response.json();
        return data.data || data;
      }

      return await response.text();

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch';
      setError(message);
      console.error('API Error:', message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { fetchData, loading, error };
}; 