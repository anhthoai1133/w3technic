"use client";

import { useState } from 'react';

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = async (url: string, options: RequestInit = {}) => {
    setLoading(true); 
    setError(null);
    
    try {
      // Thêm timeout để mô phỏng độ trễ mạng
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Nếu đang sử dụng mock data, trả về thành công giả lập
      if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
        return {
          ok: true,
          status: 200,
          json: async () => ({ success: true })
        } as Response;
      }
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API call error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const get = (url: string) => apiCall(url);
  const post = (url: string, data: any, options?: RequestInit) => 
    apiCall(url, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      ...options 
    });
  const put = (url: string, data: any) => 
    apiCall(url, { 
      method: 'PUT', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data) 
    });
  const del = (url: string) => 
    apiCall(url, { method: 'DELETE' });

  return {
    loading,
    error,
    get,
    post,
    put,
    delete: del
  };
}