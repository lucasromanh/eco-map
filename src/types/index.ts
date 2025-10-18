// Tipos para los reportes ambientales
export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  latitude: number;
  longitude: number;
  imageUrl?: string;
  imageFile?: File;
  timestamp: number;
  userId?: string;
  _ts?: number; // timestamp de expiración local
}

export type ReportCategory = 
  | 'basural'
  | 'plaza'
  | 'zona-verde'
  | 'contaminacion'
  | 'deforestacion'
  | 'reciclaje'
  | 'agua'
  | 'otro';

export interface CategoryInfo {
  id: ReportCategory;
  label: string;
  icon: string;
  color: string;
}

// Tipos para datos ambientales
export interface EnvironmentalData {
  temperature?: number;
  humidity?: number;
  windSpeed?: number;
  airQuality?: number;
  precipitation?: number;
  uvIndex?: number;
  weatherCode?: number; // Open-Meteo weather_code
  cloudCover?: number; // Open-Meteo cloud_cover (%)
}

export type WeatherEffect = 'rain' | 'clouds' | 'fog' | 'snow' | 'clear' | 'thunder';


// Tipos para capas del mapa
export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: 'reports' | 'environmental' | 'satellite';
}

// Tipos para la ubicación del usuario
export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// Tipos para imágenes de Mapillary
export interface MapillaryImage {
  id: string;
  latitude: number;
  longitude: number;
  capturedAt: string;
  sequence: string;
  thumb_1024_url?: string;
  thumb_256_url?: string;
}

export interface MapillaryResponse {
  data: MapillaryImage[];
  links?: {
    next?: string;
  };
}
