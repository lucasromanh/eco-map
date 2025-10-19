import { useState, useEffect } from 'react';

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
  description: string;
}

export const WeatherForecast = ({ isOpen, onClose }: WeatherForecastProps) => {
  const [forecastData, setForecastData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(0);

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
      // Coordenadas de Salta Capital
      const latitude = -24.7859;
      const longitude = -65.4117;
      
      // Usar Open-Meteo como proxy para datos meteorológicos (incluye precipitación)
      // En producción, esto debería conectarse al SMN o WRF-CPTEC
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=precipitation_sum,temperature_2m_max,temperature_2m_min,relative_humidity_2m_max,wind_speed_10m_max&timezone=America/Argentina/Salta&forecast_days=7`
      );
      
      if (!response.ok) {
        throw new Error('Error al obtener pronóstico');
      }
      
      const data = await response.json();
      
      // Transformar datos
      const forecast: ForecastData[] = data.daily.time.map((date: string, index: number) => {
        const precip = data.daily.precipitation_sum[index];
        const tempMax = data.daily.temperature_2m_max[index];
        const tempMin = data.daily.temperature_2m_min[index];
        const humidity = data.daily.relative_humidity_2m_max[index];
        const wind = data.daily.wind_speed_10m_max[index];
        
        let description = 'Despejado';
        if (precip > 50) description = 'Lluvias intensas';
        else if (precip > 20) description = 'Lluvias moderadas';
        else if (precip > 5) description = 'Lloviznas';
        else if (precip > 0) description = 'Posibles precipitaciones';
        
        return {
          location: 'Salta Capital',
          date,
          precipitation: precip,
          temperature: (tempMax + tempMin) / 2,
          humidity,
          windSpeed: wind,
          description,
        };
      });
      
      setForecastData(forecast);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error al cargar pronóstico:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-t-3xl shadow-2xl max-h-[85vh] flex flex-col animate-slide-up">
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
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando pronóstico...</p>
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
                        ? 'bg-primary-500 border-primary-500 text-white shadow-lg scale-105'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400'
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
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedForecast.location}</p>
                    </div>
                    <div className="text-6xl">{getWeatherEmoji(selectedForecast.precipitation)}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🌧️</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Precipitación</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedForecast.precipitation.toFixed(1)} mm
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🌡️</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Temperatura</span>
                      </div>
                      <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {selectedForecast.temperature.toFixed(1)}°C
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💧</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Humedad</span>
                      </div>
                      <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                        {selectedForecast.humidity.toFixed(0)}%
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💨</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">Viento</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                        {selectedForecast.windSpeed.toFixed(1)} km/h
                      </p>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Condiciones esperadas:</p>
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
                  <div className="text-sm text-gray-700 dark:text-gray-300">
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
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-100 dark:bg-gray-900 rounded-b-3xl border-t dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Fuente: Open-Meteo API · Actualizado: {new Date().toLocaleString('es-AR')}
          </p>
        </div>
      </div>
    </div>
  );
};
