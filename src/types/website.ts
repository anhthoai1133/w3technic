export interface Website {
  id: number;
  name: string;
  url: string;
  game_url?: string;
  icon?: string;
  status: number;
  index_status: number;
  category_id: string;
  category_name?: string;
  is_featured: boolean;
  extensions?: string[];
  description?: string;
}

export interface Extension {
  id: number;
  url: string;
  website_id: number;
}

export interface Category {
  id: string;
  name: string;
} 