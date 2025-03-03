export interface Game {
  id: number;
  name: string;
  gameplay_url: string;
  category_id: string;
  category_name?: string;
  game_source?: string;
  game_thumbnail?: string;
  game_desc?: string;
  game_instruction?: string;
  developer?: string;
  published_year?: number;
  meta_desc?: string;
  meta_title?: string;
  status: number;
} 