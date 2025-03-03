export interface Error {
  id: number;
  website_name: string;
  description: string;
  status: 'Pending' | 'Fixed';
  reported_date: string;
  fixed_date?: string;
}

export interface ErrorFormData {
  website: string;
  description: string;
  status: 'Pending' | 'Fixed';
} 