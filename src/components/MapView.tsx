import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Report, UserLocation, EnvironmentalData } from '../types';
import { DEFAULT_CENTER, DEFAULT_ZOOM, TILE_LAYERS, getCategoryInfo } from '../utils/constants';
import { formatCoordinates, formatDate } from '../utils/helpers';
import { environmentalService } from '../services/environmentalService';

// Helper para normalizar URLs de imágenes con fallback
const getImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) {
    return '';
  }
  
  // Si ya es una URL completa, usarla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // Si es base64, devolverla tal cual
  if (imageUrl.startsWith('data:')) {
    return imageUrl;
  }
  
  // Preferir el nuevo servidor
  const NEW_HOST = 'https://srv882-files.hstgr.io/ad0821ef897e0cb5/files/public_html/ecomap';
  
  if (imageUrl.startsWith('/uploads/')) {
    return `${NEW_HOST}${imageUrl}`;
  }
  
  // Si solo es el nombre del archivo, construir URL completa
  return `${NEW_HOST}/uploads/reportes/${imageUrl}`;
};

// Fix para los iconos de Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente para manejar el centro del mapa
function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

// Componente para manejar clics en el mapa
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

interface MapViewProps {
  reports: Report[];
  userLocation: UserLocation | null;
  onMapClick?: (lat: number, lng: number) => void;
  selectedReport?: Report | null;
  showStreetView?: boolean;
  showWeatherPanel?: boolean;
  effectsEnabled?: boolean;
  isDark?: boolean;
}

export const MapView = ({
  reports,
  userLocation,
  onMapClick,
  selectedReport,
  showStreetView = false,
  showWeatherPanel = true,
  effectsEnabled = true,
  isDark = false,
}: MapViewProps) => {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [showSatellite, setShowSatellite] = useState(false);
  const [preferCenter, setPreferCenter] = useState(false);

  // Actualizar centro cuando el usuario se mueve
  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [userLocation]);

  // Obtener datos ambientales según preferencia (GPS o centro del mapa)
  useEffect(() => {
    const coords: [number, number] = preferCenter
      ? center
      : (userLocation ? [userLocation.latitude, userLocation.longitude] : DEFAULT_CENTER);
    environmentalService
      .getEnvironmentalData(coords[0], coords[1])
      .then((data) => setEnvironmentalData(data))
      .catch(() => {/* silencioso */});
  }, [preferCenter, center, userLocation]);

  // Centrar en reporte seleccionado
  useEffect(() => {
    if (selectedReport) {
      setCenter([selectedReport.latitude, selectedReport.longitude]);
    }
  }, [selectedReport]);

  // Crear iconos personalizados para cada categoría
  const createCategoryIcon = (category: string) => {
    const categoryInfo = getCategoryInfo(category as any);
    
    return L.divIcon({
      html: `<div style="
        background-color: ${categoryInfo?.color || '#8b5cf6'};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">${categoryInfo?.icon || '📍'}</div>`,
      className: 'custom-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  };

  // Icono personalizado para la ubicación del usuario
  const userIcon = L.divIcon({
    html: `<div style="
      background: radial-gradient(circle, #3b82f6 0%, #2563eb 100%);
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
    "></div>`,
    className: 'user-location-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const envScore = environmentalData 
    ? environmentalService.calculateEnvironmentalScore(environmentalData)
    : null;

  const weatherInfo = environmentalService.weatherFromCode(
    environmentalData?.weatherCode,
    environmentalData?.cloudCover,
    environmentalData?.precipitation
  );
  const weatherOverlayClass = (() => {
    switch (weatherInfo.effect) {
      case 'rain':
        return 'rain';
      case 'clouds':
        return 'clouds';
      case 'fog':
        return 'fog';
      case 'snow':
        return 'snow';
      case 'thunder':
        return 'thunder';
      case 'clear':
        return 'clear';
      default:
        return '';
    }
  })();

  // Modo depuración: permite forzar un efecto visual
  const forcedEffect = (typeof window !== 'undefined' && window.localStorage)
    ? localStorage.getItem('ecomap_force_effect') || ''
    : '';
  // Toggle de efectos visuales (persistido)
  const finalOverlayClass = effectsEnabled ? (forcedEffect || weatherOverlayClass) : '';

  // Generar elementos distribuidos para el overlay
  const overlayCount = useMemo(() => {
    switch (finalOverlayClass) {
      case 'rain': return 50;
      case 'snow': return 70;
      case 'clouds': return 14;
      default: return 0; // fog/thunder/clear no requieren items
    }
  }, [finalOverlayClass]);

  const overlayItems = useMemo(() => {
    return Array.from({ length: overlayCount }).map((_, i) => {
      const x = (i * 0.123 + 0.37) % 1; // pseudo-aleatorio determinista
      const y = (i * 0.271 + 0.19) % 1;
      const scale = finalOverlayClass === 'clouds' ? (0.6 + ((i * 0.199) % 0.9)) : 1;
      const dur = finalOverlayClass === 'clouds' ? (40 + ((i * 7) % 30)) : undefined;
      const style: CSSProperties = {
        ["--x" as any]: String(x),
        ["--y" as any]: String(y),
        ["--scale" as any]: String(scale),
        ["--dur" as any]: dur ? `${dur}s` : undefined,
      };
      return <span key={i} className="wfx-item" style={style} />;
    });
  }, [overlayCount, finalOverlayClass]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        className="w-full h-full"
        zoomControl={true}
      >
        <MapController center={center} />
        <MapClickHandler onMapClick={onMapClick} />
        
        {/* Mostrar capa satelital o mapa normal según el estado */}
        {showSatellite ? (
          <TileLayer
            key="satellite"
            url={TILE_LAYERS.satellite.url}
            attribution={TILE_LAYERS.satellite.attribution}
            maxZoom={19}
          />
        ) : (
          <TileLayer
            key={isDark ? 'dark' : 'light'}
            url={isDark ? TILE_LAYERS.dark.url : TILE_LAYERS.openStreetMap.url}
            attribution={isDark ? TILE_LAYERS.dark.attribution : TILE_LAYERS.openStreetMap.attribution}
            maxZoom={19}
          />
        )}

        {/* Marcador de ubicación del usuario */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={userIcon}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-primary-600">Tu ubicación</h3>
                  <p className="text-sm text-gray-600">
                    {formatCoordinates(userLocation.latitude, userLocation.longitude)}
                  </p>
                  {environmentalData && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">
                        🌡️ Temperatura: <strong>{environmentalData.temperature?.toFixed(1)}°C</strong>
                      </p>
                      <p className="text-sm">
                        💧 Humedad: <strong>{environmentalData.humidity?.toFixed(0)}%</strong>
                      </p>
                      <p className="text-sm">
                        💨 Viento: <strong>{environmentalData.windSpeed?.toFixed(1)} km/h</strong>
                      </p>
                      {envScore && (
                        <div className="mt-2 p-2 rounded" style={{ backgroundColor: envScore.color + '20' }}>
                          <p className="text-xs font-semibold" style={{ color: envScore.color }}>
                            Índice Ambiental: {envScore.label} ({envScore.score}/100)
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
            
            {/* Círculo de precisión */}
            {userLocation.accuracy && (
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={userLocation.accuracy}
                pathOptions={{
                  fillColor: '#3b82f6',
                  fillOpacity: 0.1,
                  color: '#3b82f6',
                  weight: 1,
                }}
              />
            )}
          </>
        )}

        {/* Marcador fijo Salta Capital como punto de acceso cuando no hay ubicación */}
        {!userLocation && (
          <Marker position={DEFAULT_CENTER}>
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-primary-600">Salta Capital — Punto de acceso</h3>
                <p className="text-sm text-gray-600">Usa este punto para empezar a explorar y crear reportes.</p>
                <p className="text-xs text-gray-500 mt-1">📍 {formatCoordinates(DEFAULT_CENTER[0], DEFAULT_CENTER[1])}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de reportes */}
        {reports.map((report) => (
          <Marker
            key={report.id}
            position={[report.latitude, report.longitude]}
            icon={createCategoryIcon(report.category)}
          >
            <Popup maxWidth={300}>
              <div className="p-2">
                <h3 className="font-bold text-lg text-gray-900 mb-1">
                  {report.title}
                </h3>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-sm px-2 py-1 rounded" style={{
                    backgroundColor: getCategoryInfo(report.category)?.color + '20',
                    color: getCategoryInfo(report.category)?.color,
                  }}>
                    {getCategoryInfo(report.category)?.icon} {getCategoryInfo(report.category)?.label}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(report.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {report.description}
                </p>
                {report.imageUrl && (
                  <img
                    src={getImageUrl(report.imageUrl)}
                    alt={report.title}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      console.log('❌ Error cargando imagen en mapa:', target.src);
                      
                      // Intentar con el dominio alternativo como fallback
                      if (!target.dataset.fallbackAttempted && report.imageUrl) {
                        target.dataset.fallbackAttempted = 'true';
                        
                        const newHost = 'https://srv882-files.hstgr.io/ad0821ef897e0cb5/files/public_html/ecomap';
                        const oldHost = 'https://ecomap.saltacoders.com';
                        
                        // Si falló el servidor nuevo, probar con el viejo
                        if (target.src.includes('srv882-files.hstgr.io')) {
                          const path = target.src.replace(newHost, '');
                          target.src = `${oldHost}${path}`;
                          console.log('🔄 Intentando con servidor viejo:', target.src);
                        }
                        // Si falló el servidor viejo, probar con el nuevo
                        else if (target.src.includes('ecomap.saltacoders.com')) {
                          const path = target.src.replace(oldHost, '');
                          target.src = `${newHost}${path}`;
                          console.log('🔄 Intentando con servidor nuevo:', target.src);
                        }
                        // Si es relativa, probar ambos
                        else if (report.imageUrl.startsWith('/uploads/')) {
                          target.src = `${oldHost}${report.imageUrl}`;
                          console.log('🔄 Intentando con ruta relativa:', target.src);
                        } else if (!report.imageUrl.startsWith('http') && !report.imageUrl.startsWith('data:')) {
                          target.src = `${oldHost}/uploads/reportes/${report.imageUrl}`;
                          console.log('🔄 Intentando con nombre de archivo:', target.src);
                        } else {
                          console.log('⚠️ Fallback agotado, ocultando imagen');
                          target.style.display = 'none';
                        }
                      } else {
                        console.log('⚠️ Fallback agotado, ocultando imagen');
                        target.style.display = 'none';
                      }
                    }}
                  />
                )}
                <p className="text-xs text-gray-500 mt-2">
                  📍 {formatCoordinates(report.latitude, report.longitude)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay visual según clima */}
      {finalOverlayClass && (
        <>
          <div className={`weather-overlay ${finalOverlayClass}`}>
            {overlayItems}
          </div>
          {forcedEffect && (
            <div className="absolute bottom-2 right-2 z-[950] bg-black/60 text-white text-[11px] px-2 py-1 rounded-md">
              Efecto forzado: {forcedEffect}
            </div>
          )}
        </>
      )}

      {/* Panel de información ambiental flotante */}
      {showWeatherPanel && environmentalData && envScore && (
  <div className="absolute top-4 right-4 z-[1000] bg-white/95 dark:bg-gray-800 rounded-xl shadow-2xl max-w-xs border-2 border-primary-400 dark:border-primary-600 backdrop-blur-sm">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 rounded-t-xl">
            <h3 className="font-bold text-base flex items-center gap-2">
              <span className="text-xl">🌡️</span>
              Datos Ambientales en Tiempo Real
            </h3>
            <p className="text-xs opacity-90 mt-1">
              {userLocation ? '📍 Tu ubicación actual' : '📍 Centro del mapa'}
            </p>
            {environmentalData.observedAt && (
              <p className="text-[10px] opacity-80 mt-0.5">
                {environmentalData.source || 'Fuente desconocida'} · {new Date(environmentalData.observedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-800 dark:text-gray-400 flex items-center gap-1 font-medium">
                <span className="text-lg">{weatherInfo.emoji}</span> Estado
              </span>
              <span className="font-bold text-sm text-gray-900 dark:text-gray-200">
                {weatherInfo.label}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs py-1">
              <label className="text-gray-800 dark:text-gray-400 flex items-center gap-2 font-medium" title="Efectos visuales del clima sobre el mapa">
                <input type="checkbox" className="accent-green-600" checked={effectsEnabled} onChange={() => { /* controlado por Header/App */ }} />
                Efectos visuales (Header)
              </label>
              {forcedEffect && <span className="text-[10px] text-gray-500">forzado: {forcedEffect}</span>}
            </div>
            <div className="flex justify-between items-center text-xs py-1">
              <label className="text-gray-800 dark:text-gray-400 flex items-center gap-2 font-medium" title="Usar el centro del mapa para consultar los datos (útil si el GPS es impreciso)">
                <input
                  type="checkbox"
                  className="accent-green-600"
                  checked={preferCenter}
                  onChange={(e) => setPreferCenter(e.target.checked)}
                />
                Usar centro del mapa
              </label>
              <span className="text-[10px] text-gray-500">{preferCenter ? '📍 Centro' : (userLocation ? '📍 GPS' : '📍 Predeterminado')}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-800 dark:text-gray-400 flex items-center gap-1 font-medium">
                <span className="text-lg">🌡️</span> Temperatura
              </span>
              <span className="font-bold text-lg text-gray-900 dark:text-primary-400">
                {environmentalData.temperature?.toFixed(1)}°C
              </span>
            </div>
            {environmentalData.precipitation !== undefined && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-800 dark:text-gray-400 flex items-center gap-1 font-medium">
                  <span className="text-lg">🌧️</span> Precipitación
                </span>
                <span className="font-bold text-lg text-sky-600 dark:text-sky-400">
                  {environmentalData.precipitation?.toFixed(1)} mm
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-800 dark:text-gray-400 flex items-center gap-1 font-medium">
                <span className="text-lg">💧</span> Humedad
              </span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {environmentalData.humidity?.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-800 dark:text-gray-400 flex items-center gap-1 font-medium">
                <span className="text-lg">💨</span> Viento
              </span>
              <span className="font-bold text-lg text-gray-900 dark:text-gray-300">
                {environmentalData.windSpeed?.toFixed(1)} km/h
              </span>
            </div>
            {environmentalData.uvIndex !== undefined && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-800 dark:text-gray-400 flex items-center gap-1 font-medium">
                  <span className="text-lg">☀️</span> Índice UV
                </span>
                <span className="font-bold text-lg text-orange-600 dark:text-orange-400">
                  {environmentalData.uvIndex.toFixed(1)}
                </span>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="p-3 rounded-lg" style={{ backgroundColor: envScore.color + '25', borderLeft: `4px solid ${envScore.color}` }}>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                  Índice de Calidad Ambiental
                </p>
                <p className="text-sm font-bold" style={{ color: envScore.color }}>
                  {envScore.label} ({envScore.score}/100)
                </p>
              </div>
              <p className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">
                Fuente: Open‑Meteo. Puede diferir de otras apps por proveedor y hora de medición.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Botón para alternar vista satélite */}
      <button
        onClick={() => setShowSatellite(!showSatellite)}
        className="absolute bottom-4 right-4 z-[1000] map-control-btn bg-white dark:bg-gray-800"
        title={showSatellite ? 'Vista de mapa' : 'Vista satélite'}
      >
        <span className="text-lg">{showSatellite ? '🗺️' : '🛰️'}</span>
      </button>

      {/* Street View integrado - solo visible cuando showStreetView es true */}
      {showStreetView && (
        <div className="absolute bottom-0 left-0 right-0 h-64 z-[500] bg-gray-900 border-t-4 border-green-500 animate-fade-in">
          <iframe
            src={
              userLocation
                ? `https://www.google.com/maps?q=&layer=c&cbll=${userLocation.latitude},${userLocation.longitude}&cbp=12,0,0,0,0&z=17&output=svembed`
                : `https://www.google.com/maps?q=&layer=c&cbll=-24.7859,-65.4117&cbp=12,0,0,0,0&z=17&output=svembed`
            }
            className="w-full h-full border-0"
            allowFullScreen
            title="Google Street View"
          />
          <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-lg text-xs font-medium">
            📷 Street View (Google)
          </div>
        </div>
      )}
    </div>
  );
};
