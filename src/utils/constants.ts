import type { CategoryInfo, ReportCategory } from '../types';

export const REPORT_CATEGORIES: CategoryInfo[] = [
  {
    id: 'basural',
    label: 'Basural',
    icon: '🗑️',
    color: '#ef4444', // red-500
  },
  {
    id: 'plaza',
    label: 'Plaza',
    icon: '🌳',
    color: '#22c55e', // green-500
  },
  {
    id: 'zona-verde',
    label: 'Zona Verde',
    icon: '🌿',
    color: '#10b981', // emerald-500
  },
  {
    id: 'contaminacion',
    label: 'Contaminación',
    icon: '🏭',
    color: '#6b7280', // gray-500
  },
  {
    id: 'deforestacion',
    label: 'Deforestación',
    icon: '🪓',
    color: '#f59e0b', // amber-500
  },
  {
    id: 'reciclaje',
    label: 'Punto de Reciclaje',
    icon: '♻️',
    color: '#3b82f6', // blue-500
  },
  {
    id: 'agua',
    label: 'Cuerpo de Agua',
    icon: '💧',
    color: '#06b6d4', // cyan-500
  },
  {
    id: 'otro',
    label: 'Otro',
    icon: '📍',
    color: '#8b5cf6', // violet-500
  },
];

export const getCategoryInfo = (
  categoryId: ReportCategory
): CategoryInfo | undefined => {
  return REPORT_CATEGORIES.find((cat) => cat.id === categoryId);
};

// Coordenadas por defecto (Salta Capital, Argentina)
export const DEFAULT_CENTER: [number, number] = [-24.782126, -65.423198];
export const DEFAULT_ZOOM = 13;

// Configuración del mapa
export const MAP_CONFIG = {
  minZoom: 3,
  maxZoom: 19,
  zoomControl: true,
  attributionControl: true,
};

// URLs de tiles para diferentes capas
export const TILE_LAYERS = {
  openStreetMap: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  },
};
