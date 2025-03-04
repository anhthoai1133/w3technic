const API_BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'https://api.mangaaz.org';
const API_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || '0a8a72f639f007c1e36c38ef886330712ceff99f24edf9277a823b642d34e3d2';

// Đảm bảo URL không có trailing slash
export const API_BASE = API_BASE_URL?.replace(/\/$/, '');

// Chuẩn hóa API endpoints
export const API_ENDPOINTS = {
  // Website management
  websites: '/items/websites',
  website: (id: number) => `/items/websites/${id}`,
  
  // Game management
  games: '/items/games',
  game: (id: number) => `/items/games/${id}`,
  
  // Error management
  error_logs: '/items/error_logs',
  error_log: (id: number) => `/items/error_logs/${id}`,
  
  // Extension management
  extensions: '/items/extensions',
  extension: (id: number) => `/items/extensions/${id}`,
  
  // Categories
  categories: '/items/categories',
  category: (id: number) => `/items/categories/${id}`,
  
  // Files
  files: '/files',
  file: (id: string) => `/files/${id}`
};

export { API_TOKEN }; 