const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
const API_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN;

// Đảm bảo URL không có trailing slash
export const API_BASE = API_BASE_URL?.replace(/\/$/, '');

// Thêm prefix /api vào tất cả các endpoints
export const API_ENDPOINTS = {
  // Websites
  websites: `${API_BASE_URL}/websites`,
  website: (id: number) => `${API_BASE_URL}/websites/${id}`,
  
  // Games
  games: `${API_BASE_URL}/games`,
  game: (id: number) => `${API_BASE_URL}/games/${id}`,
  
  // Errors
  errors: `${API_BASE_URL}/errors`,
  error: (id: number) => `${API_BASE_URL}/errors/${id}`,
  
  // Extensions
  extensions: `${API_BASE_URL}/extensions`,
  extension: (id: number) => `${API_BASE_URL}/extensions/${id}`,
  
  // Categories
  categories: `${API_BASE_URL}/categories`,
  category: (id: number) => `${API_BASE_URL}/categories/${id}`,
  
  // Files
  files: `/api/files`,
  file: (id: string) => `/api/files/${id}`,
  
  // Logs
  logs: `${API_BASE_URL}/logs`,
  log: (id: number) => `${API_BASE_URL}/logs/${id}`,
  
  // System logs
  systemLogs: `${API_BASE_URL}/system-logs`,
  
  // Cloudarcade JSON
  cloudarcadeJson: `${API_BASE_URL}/cloudarcade-json`,
};

export { API_TOKEN };