import axios from 'axios';
import type { EnvironmentalData } from '../types';

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

export const environmentalService = {
  /**
   * Obtiene datos ambientales para una ubicación específica
   */
  async getEnvironmentalData(
    latitude: number,
    longitude: number
  ): Promise<EnvironmentalData> {
    try {
      const response = await axios.get(OPEN_METEO_API, {
        params: {
          latitude,
          longitude,
          current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,uv_index',
          timezone: 'auto',
        },
      });

      const current = response.data.current;

      return {
        temperature: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        precipitation: current.precipitation,
        uvIndex: current.uv_index,
      };
    } catch (error) {
      console.error('Error fetching environmental data:', error);
      throw error;
    }
  },

  /**
   * Calcula un índice de calidad ambiental simple basado en los datos
   */
  calculateEnvironmentalScore(data: EnvironmentalData): {
    score: number;
    label: string;
    color: string;
  } {
    let score = 100;

    // Deducir puntos por condiciones adversas
    if (data.temperature && (data.temperature > 35 || data.temperature < 5)) {
      score -= 20;
    }
    if (data.humidity && (data.humidity > 80 || data.humidity < 20)) {
      score -= 15;
    }
    if (data.windSpeed && data.windSpeed > 30) {
      score -= 10;
    }
    if (data.uvIndex && data.uvIndex > 8) {
      score -= 15;
    }

    // Determinar etiqueta y color
    let label = 'Excelente';
    let color = '#22c55e'; // green-500

    if (score < 90) {
      label = 'Bueno';
      color = '#84cc16'; // lime-500
    }
    if (score < 70) {
      label = 'Moderado';
      color = '#eab308'; // yellow-500
    }
    if (score < 50) {
      label = 'Malo';
      color = '#f97316'; // orange-500
    }
    if (score < 30) {
      label = 'Muy Malo';
      color = '#ef4444'; // red-500
    }

    return { score: Math.max(0, score), label, color };
  },
};
