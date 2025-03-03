export const API_BASE_URL = 'https://api.mangaaz.org';

export const API_ENDPOINTS = {
  websites: '/websites',
  errors: {
    list: '/errors',
    create: '/errors',
    update: (id: number) => `/errors/${id}`,
    delete: (id: number) => `/errors/${id}`,
    search: '/errors/search'
  },
  extensions: '/extensions',
  games: '/games',
  cloudarcade: '/cloudarcade',
  categories: '/categories'
}; 