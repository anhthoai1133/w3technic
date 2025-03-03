export interface Extension {
  id: number;
  name: string;
  version?: string;
  url: string;
  website_url: string;
  status: string;
  description?: string;
  last_updated?: string;
  users?: number;
} 