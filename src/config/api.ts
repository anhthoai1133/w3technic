const API_BASE_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const API_TOKEN = process.env.NEXT_PUBLIC_DIRECTUS_TOKEN || '';

export const API_ENDPOINTS = {
  websites: '/items/websites',
  games: '/items/games',
  categories: '/items/categories',
  extensions: '/items/extensions',
  error_logs: '/items/error_logs',
  files: '/files'
};

export { API_BASE_URL, API_TOKEN }; 