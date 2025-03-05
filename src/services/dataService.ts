"use client";

import { API_ENDPOINTS } from '@/config/api';
import * as mockData from '@/data/mockData';

// Sử dụng biến môi trường để kiểm soát việc sử dụng mockup
const USE_MOCK_DATA = true;

class DataService {
  private async apiCall(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }

  // Website methods
  async getWebsites() {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for websites:', mockData.websites);
      return mockData.websites;
    }
    
    try {
      return this.apiCall(API_ENDPOINTS.websites);
    } catch (error) {
      console.error('Error fetching websites:', error);
      return [];
    }
  }

  async getWebsite(id: number) {
    if (USE_MOCK_DATA) {
      return mockData.websites.find(website => website.id === id);
    }
    
    return this.apiCall(API_ENDPOINTS.website(id));
  }

  async createWebsite(data: any) {
    if (USE_MOCK_DATA) {
      const newId = Math.max(...mockData.websites.map(w => w.id)) + 1;
      const newWebsite = {
        id: newId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockData.websites.push(newWebsite);
      return newWebsite;
    }
    
    return this.apiCall(API_ENDPOINTS.websites, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWebsite(id: number, data: any) {
    if (USE_MOCK_DATA) {
      const index = mockData.websites.findIndex(w => w.id === id);
      if (index !== -1) {
        mockData.websites[index] = {
          ...mockData.websites[index],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return mockData.websites[index];
      }
      throw new Error('Website not found');
    }
    
    return this.apiCall(API_ENDPOINTS.website(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWebsite(id: number) {
    if (USE_MOCK_DATA) {
      const index = mockData.websites.findIndex(w => w.id === id);
      if (index !== -1) {
        mockData.websites.splice(index, 1);
        return { success: true };
      }
      throw new Error('Website not found');
    }
    
    return this.apiCall(API_ENDPOINTS.website(id), { method: 'DELETE' });
  }

  // Category methods
  async getCategories() {
    if (USE_MOCK_DATA) {
      return mockData.categories;
    }
    
    try {
      return this.apiCall(API_ENDPOINTS.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Extension methods
  async getExtensions() {
    if (USE_MOCK_DATA) {
      return mockData.extensions;
    }
    
    try {
      return this.apiCall(API_ENDPOINTS.extensions);
    } catch (error) {
      console.error('Error fetching extensions:', error);
      return [];
    }
  }

  async getExtension(id: number) {
    if (USE_MOCK_DATA) {
      return mockData.extensions.find(extension => extension.id === id);
    }
    
    return this.apiCall(API_ENDPOINTS.extension(id));
  }

  async createExtension(data: any) {
    if (USE_MOCK_DATA) {
      const newId = Math.max(...mockData.extensions.map(e => e.id)) + 1;
      const newExtension = {
        id: newId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockData.extensions.push(newExtension);
      return newExtension;
    }
    
    return this.apiCall(API_ENDPOINTS.extensions, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateExtension(id: number, data: any) {
    if (USE_MOCK_DATA) {
      const index = mockData.extensions.findIndex(e => e.id === id);
      if (index !== -1) {
        mockData.extensions[index] = {
          ...mockData.extensions[index],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return mockData.extensions[index];
      }
      throw new Error('Extension not found');
    }
    
    return this.apiCall(API_ENDPOINTS.extension(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteExtension(id: number) {
    if (USE_MOCK_DATA) {
      const index = mockData.extensions.findIndex(e => e.id === id);
      if (index !== -1) {
        mockData.extensions.splice(index, 1);
        return { success: true };
      }
      throw new Error('Extension not found');
    }
    
    return this.apiCall(API_ENDPOINTS.extension(id), { method: 'DELETE' });
  }

  // Logs methods
  async getLogs() {
    if (USE_MOCK_DATA) {
      return mockData.logs;
    }
    
    try {
      return this.apiCall(API_ENDPOINTS.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
  }

  // Errors methods
  async getErrors() {
    if (USE_MOCK_DATA) {
      return mockData.errors;
    }
    
    try {
      return this.apiCall(API_ENDPOINTS.errors);
    } catch (error) {
      console.error('Error fetching errors:', error);
      return [];
    }
  }

  // System logs methods
  async getSystemLogs() {
    if (USE_MOCK_DATA) {
      return mockData.logs.filter(log => log.source.includes('system') || !log.user_id);
    }
    
    try {
      return this.apiCall(API_ENDPOINTS.systemLogs);
    } catch (error) {
      console.error('Error fetching system logs:', error);
      return [];
    }
  }
  
  async deleteLog(id: number) {
    if (USE_MOCK_DATA) {
      const index = mockData.logs.findIndex(log => log.id === id);
      if (index !== -1) {
        mockData.logs.splice(index, 1);
        return { success: true };
      }
      throw new Error('Log not found');
    }
    
    return this.apiCall(API_ENDPOINTS.log(id), { method: 'DELETE' });
  }
  
  async clearLogs() {
    if (USE_MOCK_DATA) {
      Object.assign(mockData, { logs: [] });
      return { success: true };
    }
    
    return this.apiCall(API_ENDPOINTS.logs, { method: 'DELETE' });
  }

  // Games methods
  async getGames() {
    if (USE_MOCK_DATA) {
      console.log('Using mock data for games:', mockData.games);
      return mockData.games || [];
    }
    
    try {
      return await this.apiCall(API_ENDPOINTS.games);
    } catch (error) {
      console.error('Error fetching games:', error);
      return [];
    }
  }

  async getGame(id: number) {
    if (USE_MOCK_DATA) {
      return mockData.games?.find(game => game.id === id);
    }
    
    return this.apiCall(API_ENDPOINTS.game(id));
  }

  async createGame(data: any) {
    if (USE_MOCK_DATA) {
      const newId = Math.max(...(mockData.games?.map(g => g.id) || [0])) + 1;
      const newGame = {
        id: newId,
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      if (mockData.games) {
        Object.assign(mockData, { 
          games: [...mockData.games, newGame] 
        });
      } else {
        Object.assign(mockData, { games: [newGame] });
      }
      
      return newGame;
    }
    
    return this.apiCall(API_ENDPOINTS.games, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGame(id: number, data: any) {
    if (USE_MOCK_DATA && mockData.games) {
      const index = mockData.games.findIndex(g => g.id === id);
      if (index !== -1) {
        mockData.games[index] = {
          ...mockData.games[index],
          ...data,
          updated_at: new Date().toISOString(),
        };
        return mockData.games[index];
      }
      throw new Error('Game not found');
    }
    
    return this.apiCall(API_ENDPOINTS.game(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGame(id: number) {
    if (USE_MOCK_DATA && mockData.games) {
      const index = mockData.games.findIndex(g => g.id === id);
      if (index !== -1) {
        mockData.games.splice(index, 1);
        return { success: true };
      }
      throw new Error('Game not found');
    }
    
    return this.apiCall(API_ENDPOINTS.game(id), { method: 'DELETE' });
  }
}

export const dataService = new DataService(); 