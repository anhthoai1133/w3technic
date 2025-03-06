// Đảm bảo sử dụng NEXT_PUBLIC_API_URL cho tất cả API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// Đảm bảo URL không có trailing slash
const API_BASE = API_BASE_URL.replace(/\/$/, '');

// Thêm prefix /api vào tất cả các endpoints
export const API_ENDPOINTS = {
  // Websites
  websites: `${API_BASE}/api/websites`,
  website: (id: number) => `${API_BASE}/api/websites/${id}`,
  
  // Games
  games: `${API_BASE}/api/games`,
  game: (id: number) => `${API_BASE}/api/games/${id}`,
  
  // Errors
  errors: `${API_BASE}/api/errors`,
  error: (id: number) => `${API_BASE}/api/errors/${id}`,
  
  // Extensions
  extensions: `${API_BASE}/api/extensions`,
  extension: (id: number) => `${API_BASE}/api/extensions/${id}`,
  
  // Categories
  categories: `${API_BASE}/api/categories`,
  category: (id: number) => `${API_BASE}/api/categories/${id}`,
  
  // Files
  files: `${API_BASE}/api/files`,
  file: (id: string) => `${API_BASE}/api/files/${id}`,
  
  // Logs
  logs: `${API_BASE}/api/logs`,
  log: (id: number) => `${API_BASE}/api/logs/${id}`,
  
  // System logs
  systemLogs: `${API_BASE}/api/system-logs`,
  
  // Cloudarcade JSON
  cloudarcadeJson: `${API_BASE}/api/cloudarcade-json`,
};