import { useState } from 'react';
import { API_BASE, API_TOKEN } from '@/config/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (endpoint: string, options: RequestInit = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    try {
      setLoading(true);
      setError(null);

      // Chuẩn hóa endpoint
      const normalizedEndpoint = endpoint.startsWith('http') 
        ? endpoint 
        : `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

      // Chuẩn bị headers
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${API_TOKEN || ''}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };

      // Add any additional headers from options
      if (options.headers) {
        Object.entries(options.headers).forEach(([key, value]) => {
          if (typeof value === 'string') {
            headers[key] = value;
          }
        });
      }

      // Nếu là FormData, không set Content-Type
      if (options.body instanceof FormData) {
        delete headers['Content-Type'];
      }

      const response = await fetch(normalizedEndpoint, {
        ...options,
        headers,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data.data || data;
      } else {
        return await response.text();
      }

    } catch (error: any) {
      clearTimeout(timeoutId);
      setError(error.message || 'Unknown error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Helper methods
  const get = (endpoint: string, options = {}) => 
    fetchData(endpoint, { ...options, method: 'GET' });
    
  const post = (endpoint: string, data: any, options = {}) => 
    fetchData(endpoint, { 
      ...options, 
      method: 'POST',
      body: JSON.stringify(data)
    });
    
  const put = (endpoint: string, data: any, options = {}) => 
    fetchData(endpoint, { 
      ...options, 
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
  const del = (endpoint: string, options = {}) => 
    fetchData(endpoint, { ...options, method: 'DELETE' });

  return { 
    fetchData, 
    get,
    post,
    put,
    delete: del,
    loading, 
    error 
  };
};