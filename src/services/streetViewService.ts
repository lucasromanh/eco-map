import axios from 'axios';
import type { MapillaryResponse } from '../types';

// Mapillary API - Necesitas crear una cuenta gratuita en https://www.mapillary.com/
// y obtener un token de acceso en https://www.mapillary.com/dashboard/developers
const MAPILLARY_API = 'https://graph.mapillary.com';
// Para desarrollo, usa un token demo o crea el tuyo
const ACCESS_TOKEN = 'MLY|your_token_here'; // Reemplazar con tu token

export const mapillaryService = {
  /**
   * Busca imágenes de Mapillary cerca de una ubicación
   */
  async searchImages(
    latitude: number,
    longitude: number,
    radius: number = 100 // metros
  ): Promise<MapillaryResponse> {
    try {
      // Crear un bbox (bounding box) alrededor del punto
      const latOffset = radius / 111000; // aproximadamente metros a grados
      const lonOffset = radius / (111000 * Math.cos(latitude * Math.PI / 180));

      const bbox = [
        longitude - lonOffset,
        latitude - latOffset,
        longitude + lonOffset,
        latitude + latOffset,
      ].join(',');

      const response = await axios.get(`${MAPILLARY_API}/images`, {
        params: {
          access_token: ACCESS_TOKEN,
          bbox,
          fields: 'id,geometry,captured_at,sequence,thumb_1024_url,thumb_256_url',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching Mapillary images:', error);
      // Retornar datos vacíos si falla
      return { data: [] };
    }
  },

  /**
   * Obtiene el visor de Mapillary para una imagen específica
   */
  getViewerUrl(imageId: string): string {
    return `https://www.mapillary.com/app/?pKey=${imageId}`;
  },

  /**
   * Genera URL para embeber el visor de Mapillary
   */
  getEmbedUrl(imageId: string): string {
    return `https://www.mapillary.com/embed?image_key=${imageId}`;
  },
};

// Alternativa: KartaView (anteriormente OpenStreetCam) - completamente gratuito
export const kartaViewService = {
  /**
   * Busca imágenes de KartaView cerca de una ubicación
   */
  async searchImages(
    latitude: number,
    longitude: number,
    radius: number = 100
  ) {
    try {
      // KartaView API es gratuita y no requiere token
      const response = await axios.get(
        'https://api.openstreetcam.org/2.0/photo/',
        {
          params: {
            lat: latitude,
            lng: longitude,
            radius: radius,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching KartaView images:', error);
      return { currentPageItems: [] };
    }
  },

  /**
   * Genera URL para ver una imagen en KartaView
   */
  getViewerUrl(sequenceId: string, sequenceIndex: number = 0): string {
    return `https://kartaview.org/details/${sequenceId}/${sequenceIndex}`;
  },
};
