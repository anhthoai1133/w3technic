export const mockWebsites = [
  {
    id: 1,
    name: "Run 3",
    url: "https://run3.pro",
    game_url: "https://run3.pro/game/",
    icon: "https://run3.pro/icon.png",
    status: 1,
    index_status: 1,
    category_id: 1,
    category_name: "Action",
    extensions: [
      "https://extension1.com",
      "https://extension2.com"
    ],
    is_featured: true
  },
  {
    id: 2,
    name: "Basketball Stars",
    url: "https://basketball-stars.app",
    game_url: "https://basketball-stars.app/game/",
    icon: "https://basketball-stars.app/icon.png",
    status: 1,
    index_status: 1,
    category_id: 3,
    category_name: "Sports",
    extensions: [],
    is_featured: false
  },
  // Thêm các website mock khác...
];

export const mockGames = [
  {
    id: 1,
    name: "Basketball Stars",
    gameplay_url: "https://basketball-stars.app/game/",
    category_name: "Sports",
    game_thumbnail: "https://retrobowl.me/wp-content/uploads/2023/08/fav.png",
    published_year: 2023,
    status: 1
  },
  {
    id: 2,
    name: "Run 3",
    gameplay_url: "https://run3.pro/game/",
    category_name: "Action",
    game_thumbnail: "https://run3.pro/thumb.png",
    published_year: 2023,
    status: 1
  },
  // Thêm các game mock khác...
];

export const mockExtensions = [
  {
    id: 1,
    name: "Extension 1",
    version: "1.0.0",
    status: "Active",
    last_updated: "2024-03-15",
    website_url: "https://website1.com",
    url: "https://extension1.com",
    users: 1000
  },
  {
    id: 2,
    name: "Extension 2",
    version: "2.1.0",
    status: "Active", 
    last_updated: "2024-03-14",
    website_url: "https://website2.com",
    url: "https://extension2.com",
    users: 2000
  },
  // Thêm các extension mock khác...
];

export const mockCategories = [
  { id: 1, name: "Action" },
  { id: 2, name: "Adventure" },
  { id: 3, name: "Sports" },
  { id: 4, name: "Strategy" },
  { id: 5, name: "Puzzle" },
  { id: 6, name: "Racing" },
  { id: 7, name: "Simulation" },
  { id: 8, name: "RPG" },
  { id: 9, name: "Arcade" },
  { id: 10, name: "Casual" }
]; 