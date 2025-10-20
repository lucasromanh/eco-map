import axios from 'axios';
import type { EnvironmentalData } from '../types';

const OPEN_METEO_API = 'https://api.open-meteo.com/v1/forecast';

export const environmentalService = {
  weatherFromCode(
    code?: number,
    cloudCover?: number,
    precipitation?: number
  ): { label: string; emoji: string; effect: 'rain' | 'clouds' | 'fog' | 'snow' | 'clear' | 'thunder' } {
    // Referencia: https://open-meteo.com/en/docs#api_form
    if (code === undefined || code === null) {
      // Fallback heurístico si no hay weather_code
      if ((precipitation || 0) > 0.2) return { label: 'Lluvia', emoji: '🌧️', effect: 'rain' };
      if ((cloudCover || 0) >= 70) return { label: 'Nublado', emoji: '☁️', effect: 'clouds' };
      if ((cloudCover || 0) >= 30) return { label: 'Parcialmente nublado', emoji: '⛅', effect: 'clouds' };
      return { label: 'Despejado', emoji: '☀️', effect: 'clear' };
    }
  if (code === 0) return { label: 'Despejado', emoji: '☀️', effect: 'clear' };
  if (code === 1) return { label: 'Mayormente despejado', emoji: '🌤️', effect: 'clouds' };
  if (code === 2) return { label: 'Parcialmente nublado', emoji: '⛅', effect: 'clouds' };
  if (code === 3) return { label: 'Nublado', emoji: '☁️', effect: 'clouds' };
    if ([45, 48].includes(code)) return { label: 'Niebla', emoji: '🌫️', effect: 'fog' };
    if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Llovizna', emoji: '🌦️', effect: 'rain' };
    if ([61, 63, 65, 66, 67].includes(code)) return { label: 'Lluvia', emoji: '🌧️', effect: 'rain' };
    if ([71, 73, 75, 77].includes(code)) return { label: 'Nieve', emoji: '❄️', effect: 'snow' };
    if ([80, 81, 82].includes(code)) return { label: 'Chaparrones', emoji: '🌧️', effect: 'rain' };
    if ([85, 86].includes(code)) return { label: 'Chaparrones de nieve', emoji: '❄️', effect: 'snow' };
    if ([95, 96, 99].includes(code)) return { label: 'Tormenta', emoji: '⛈️', effect: 'thunder' };
    return { label: 'Desconocido', emoji: '❓', effect: 'clear' };
  },
  /**
   * Obtiene datos ambientales para una ubicación específica
   * @param latitude - Latitud completa (sin redondear, 5-6 decimales)
   * @param longitude - Longitud completa (sin redondear, 5-6 decimales)
   */
  async getEnvironmentalData(
    latitude: number,
    longitude: number
  ): Promise<EnvironmentalData> {
    try {
      // ⚠️ IMPORTANTE: Enviar coordenadas COMPLETAS sin redondear
      // El redondeo puede desplazar la ubicación hasta 10km
      const response = await axios.get(OPEN_METEO_API, {
        params: {
          latitude: latitude, // Enviar valor completo del GPS
          longitude: longitude, // Enviar valor completo del GPS
          current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,uv_index,cloud_cover',
          temperature_unit: 'celsius',
          wind_speed_unit: 'kmh',
          precipitation_unit: 'mm',
          timezone: 'auto',
        },
        // 🔥 NO usar headers Cache-Control, causa error CORS en Open-Meteo
        // El cache: 'no-store' se maneja directamente en axios
      });

      const current = response.data.current;

      return {
        temperature: current.temperature_2m, // ✅ Usa temp actual, no mínima
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        precipitation: current.precipitation,
        weatherCode: current.weather_code,
        cloudCover: current.cloud_cover,
        uvIndex: current.uv_index,
        observedAt: current.time,
        source: 'Open-Meteo',
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
    if (data.precipitation && data.precipitation > 0.2) {
      score -= 10;
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
