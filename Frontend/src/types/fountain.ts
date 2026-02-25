export interface Fountain {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
  isOperational: boolean;
  distance?: string;
  rating?: number;
  isFree?: boolean;
  imageUrl?: string;
  images?: string[];
  category?: string;
}
