export interface Fountain {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  isOperational: boolean;
  distance?: string;
  rating?: number;
  isFree?: boolean;
  images?: string[];
  category?: string;
  userId?: string;
}
