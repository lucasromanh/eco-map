import { useState, useEffect } from 'react';
import { fetchCombinedWeather, getLocationWithRetry } from '../services/weatherService';

interface WeatherForecastProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ForecastData {
  location: string;
  date: string;
  precipitation: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection?: number; // ✨ Dirección del viento en grados (0-360)
  feelsLike?: number; // ✨ Sensación térmica (solo para día actual)
  description: string;
}

export const WeatherForecast = ({ isOpen, onClose }: WeatherForecastProps) => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [dataProvider, setDataProvider] = useState<string>('Open-Meteo'); // ✨ Almacenar proveedor de datos

  useEffect(() => {
    if (isOpen) {
      fetchForecastData();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const fetchForecastData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 📍 Obtener ubicación GPS ACTUAL del usuario con reintentos automáticos
      // useDefaultFallback=true para usar Córdoba, Argentina si falla todo
      const position = await getLocationWithRetry(2, true); // 2 reintentos + fallback

      // ⚠️ IMPORTANTE: Usar coordenadas COMPLETAS del GPS (5-6 decimales)
      // NO redondear, puede desplazar hasta 10km la ubicación
      const latitude = position.coords.latitude; // Valor completo
      const longitude = position.coords.longitude; // Valor completo
      
      console.log(`🌡️ Consultando pronóstico para: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      
      // 🌡️ Usar servicio combinado SMN + Open-Meteo para datos actuales
      const currentWeatherData = await fetchCombinedWeather(latitude, longitude);
      
      // 📝 Almacenar el proveedor de datos para mostrar en el footer
      setDataProvider(currentWeatherData.provider);
      
      console.log(`✅ Datos actuales obtenidos desde: ${currentWeatherData.provider}`);
      
      // 🔥 Timestamp único para evitar caché del service worker en PWA
      const timestamp = Date.now();
      
      // 🌡️ Obtener pronóstico extendido de 7 días desde Open-Meteo
      // NOTA: No usar 'models' con 'current', causa error 400
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m,wind_direction_10m&current_weather=true&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto&forecast_days=7&_=${timestamp}`;

      // ⚠️ NO usar headers Cache-Control, causa error CORS en Open-Meteo
      const response = await fetch(url, { cache: 'no-store' });
      
      if (!response.ok) {
        throw new Error('Error al obtener pronóstico');
      }
      
      const data = await response.json();
      
      // 📍 Obtener nombre de ubicación desde timezone (ej: "America/Argentina/Salta" → "Argentina Salta")
      const locationName = data.timezone ? data.timezone.split('/').slice(1).join(' ').replace(/_/g, ' ') : 'Tu ubicación';
      
      // 🌡️ Usar datos del servicio combinado para el día actual
      const currentTemp = currentWeatherData.temperature;
      const feelsLike = currentWeatherData.feelsLike ?? null; // ✨ Sensación térmica
      const windDirection = currentWeatherData.windDirection ?? null; // grados (0-360)
      
      console.log(`🌡️ Temperatura actual: ${currentTemp}°C | Sensación térmica: ${feelsLike}°C | Viento: ${currentWeatherData.windSpeed.toFixed(1)} km/h ${windDirection ? getWindDirection(windDirection) : ''} | Ubicación: ${locationName}`);
      
      // Transformar datos
      const forecast: ForecastData[] = data.daily.time.map((date: string, index: number) => {
        const precip = data.daily.precipitation_sum[index];
        const tempMax = data.daily.temperature_2m_max[index];
        const tempMin = data.daily.temperature_2m_min[index];
        const humidity = data.daily.relative_humidity_2m_mean[index]; // ✅ Promedio en vez de máximo
        const windMs = data.daily.wind_speed_10m_max[index]; // m/s desde API
        const wind = windMs * 3.6; // ✅ Convertir m/s → km/h (multiplicar por 3.6)
        
        // 🔥 Para el día actual (index 0), usar temperatura REAL si está disponible
        let temperature = (tempMax + tempMin) / 2; // Promedio por defecto
        if (index === 0 && currentTemp !== null) {
          temperature = currentTemp; // ✅ Temperatura ACTUAL del clima
        }
        
        let description = 'Despejado';
        if (precip > 50) description = 'Lluvias intensas';
        else if (precip > 20) description = 'Lluvias moderadas';
        else if (precip > 5) description = 'Lloviznas';
        else if (precip > 0) description = 'Posibles precipitaciones';
        
        return {
          location: locationName, // Nombre real de la ubicación
          date,
          precipitation: precip,
          temperature, // ✅ Temperatura ACTUAL para hoy, promedio para otros días
          humidity,
          windSpeed: wind,
          windDirection: index === 0 ? windDirection : undefined, // ✨ Dirección solo para hoy
          feelsLike: index === 0 ? feelsLike : undefined, // ✨ Sensación térmica solo para hoy
          description,
        };
      });
      
      setForecastData(forecast);
    } catch (err) {
      console.error('❌ Error al obtener pronóstico:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Error desconocido al obtener el pronóstico'
      );
      console.error('Error al cargar pronóstico:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // ✨ Convertir grados de viento a dirección cardinal
  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };

  const getWeatherEmoji = (precipitation: number) => {
    if (precipitation > 50) return '⛈️';
    if (precipitation > 20) return '🌧️';
    if (precipitation > 5) return '🌦️';
    if (precipitation > 0) return '☁️';
    return '☀️';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
  };

  const selectedForecast = forecastData[selectedDay];

  return (
    <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-gray-900 w-full max-w-2xl rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-t-3xl">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌦️</span>
            <div>
              <h3 className="font-bold text-xl">Pronóstico Extendido</h3>
              <p className="text-sm opacity-90">Modelo WRF-CPTEC / SMN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
              <p className="mt-4 text-gray-400">Cargando pronóstico...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <p className="font-bold text-red-800 dark:text-red-300">Error</p>
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && forecastData.length > 0 && (
            <>
              {/* Selector de días */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {forecastData.map((forecast, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedDay(index)}
                    className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all ${
                      selectedDay === index
                        ? 'bg-primary-600 border-primary-600 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 hover:border-primary-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-1">{getWeatherEmoji(forecast.precipitation)}</div>
                      <div className="text-xs font-semibold whitespace-nowrap">
                        {index === 0 ? 'Hoy' : index === 1 ? 'Mañana' : formatDate(forecast.date)}
                      </div>
                      <div className="text-xs mt-1">{forecast.precipitation.toFixed(0)}mm</div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Detalle del día seleccionado */}
              {selectedForecast && (
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                        {selectedDay === 0 ? 'Hoy' : selectedDay === 1 ? 'Mañana' : formatDate(selectedForecast.date)}
                      </h4>
                      <p className="text-sm text-gray-400">{selectedForecast.location}</p>
                      {/* 🌡️ Badge para indicar temperatura actual (solo día 0) */}
                      {selectedDay === 0 && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                          🌡️ TEMPERATURA ACTUAL
                        </span>
                      )}
                    </div>
                    <div className="text-6xl">{getWeatherEmoji(selectedForecast.precipitation)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🌧️</span>
                        <span className="text-sm text-gray-400">Precipitación</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedForecast.precipitation.toFixed(1)} mm
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🌡️</span>
                        <span className="text-sm text-gray-400">Temperatura</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {selectedForecast.temperature.toFixed(1)}°C
                      </p>
                      {/* ✨ Sensación térmica (solo para día actual) */}
                      {selectedDay === 0 && selectedForecast.feelsLike !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">
                          Sensación: <span className="font-semibold text-orange-500">{selectedForecast.feelsLike.toFixed(1)}°C</span>
                        </p>
                      )}
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💧</span>
                        <span className="text-sm text-gray-400">Humedad</span>
                      </div>
                      <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                        {selectedForecast.humidity.toFixed(0)}%
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💨</span>
                        <span className="text-sm text-gray-400">Viento</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-400">
                        {selectedForecast.windSpeed.toFixed(1)} km/h
                      </p>
                      {/* ✨ Dirección del viento (solo para día actual) */}
                      {selectedDay === 0 && selectedForecast.windDirection !== undefined && (
                        <p className="text-xs text-gray-400 mt-1">
                          Dirección: <span className="font-semibold">{getWindDirection(selectedForecast.windDirection)}</span> ({selectedForecast.windDirection}°)
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                    <p className="text-sm text-gray-400 mb-1">Condiciones esperadas:</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedForecast.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Info adicional */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                <div className="flex items-start gap-2">
                  <span className="text-xl">ℹ️</span>
                  <div className="text-sm text-gray-300">
                    <p className="font-semibold mb-1">Información del pronóstico</p>
                    <p className="text-xs">
                      Los datos se actualizan cada 6 horas. Para pronósticos oficiales, consultar el{' '}
                      <a
                        href="https://www.smn.gob.ar/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
                      >
                        Servicio Meteorológico Nacional (SMN)
                      </a>
                      .
                    </p>
                    <p className="text-xs mt-2">
                      Modelo: WRF-CPTEC (Centro de Previsão de Tempo e Estudos Climáticos)
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Nota informativa sobre fuentes de datos */}
          <div className="mt-4 bg-blue-900/20 border-l-4 border-blue-500 p-3 rounded">
            <div className="flex items-start gap-2">
              <span className="text-lg">🌡️</span>
              <div className="text-xs text-gray-300">
                <p className="font-semibold mb-1">Sobre los datos meteorológicos</p>
                <p>
                  📡 <strong>Datos actuales:</strong> Prioriza SMN Argentina (oficial), con Open-Meteo como respaldo.
                  <br />
                  📊 <strong>Pronóstico 7 días:</strong> Obtenido desde Open-Meteo API.
                  <br />
                  ℹ️ Los valores pueden diferir de otras aplicaciones según la fuente y modelo usado.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-100 dark:bg-gray-900 rounded-b-3xl border-t dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Fuente: {dataProvider} · Actualizado: {new Date().toLocaleString('es-AR')}
          </p>
        </div>
      </div>
    </div>
  );
};
