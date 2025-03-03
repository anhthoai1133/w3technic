import { mockGames, mockWebsites, mockExtensions } from '@/mocks/data';
import { API_ENDPOINTS } from '@/config/api';

const IS_MOCK = true; // Toggle between mock/real data

export const dataService = {
  // Games
  getGames: async () => {
    if (IS_MOCK) return mockGames;
    const response = await fetch(API_ENDPOINTS.games);
    return response.json();
  },

  // Websites
  getWebsites: async () => {
    if (IS_MOCK) return mockWebsites;
    const response = await fetch(API_ENDPOINTS.websites);
    return response.json();
  },

  // Extensions
  getExtensions: async () => {
    if (IS_MOCK) return mockExtensions;
    const response = await fetch(API_ENDPOINTS.extensions);
    return response.json();
  }
}; 