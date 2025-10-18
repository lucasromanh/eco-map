import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Report, UserLocation, EnvironmentalData } from '../types';
import { DEFAULT_CENTER, DEFAULT_ZOOM, TILE_LAYERS, getCategoryInfo } from '../utils/constants';
import { formatCoordinates, formatDate } from '../utils/helpers';
import { environmentalService } from '../services/environmentalService';

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
}

export const MapView = ({
  reports,
  userLocation,
  onMapClick,
  selectedReport,
  showStreetView = false,
}: MapViewProps) => {
  const [center, setCenter] = useState<[number, number]>(DEFAULT_CENTER);
  const [environmentalData, setEnvironmentalData] = useState<EnvironmentalData | null>(null);
  const [showSatellite, setShowSatellite] = useState(false);

  // Actualizar centro cuando el usuario se mueve
  useEffect(() => {
    if (userLocation) {
      setCenter([userLocation.latitude, userLocation.longitude]);
      
      // Obtener datos ambientales
      environmentalService
        .getEnvironmentalData(userLocation.latitude, userLocation.longitude)
        .then((data) => {
          setEnvironmentalData(data);
        })
        .catch(() => {
          // Error silencioso
        });
    } else {
      // Si no hay ubicación, mostrar datos del centro por defecto
      environmentalService
        .getEnvironmentalData(DEFAULT_CENTER[0], DEFAULT_CENTER[1])
        .then((data) => {
          setEnvironmentalData(data);
        })
        .catch(() => {
          // Error silencioso
        });
    }
  }, [userLocation]);

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
        
        <TileLayer
          url={showSatellite ? TILE_LAYERS.satellite.url : TILE_LAYERS.openStreetMap.url}
          attribution={showSatellite ? TILE_LAYERS.satellite.attribution : TILE_LAYERS.openStreetMap.attribution}
        />

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
                    src={report.imageUrl}
                    alt={report.title}
                    className="w-full h-32 object-cover rounded-lg"
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

      {/* Panel de información ambiental flotante */}
      {environmentalData && envScore && (
        <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-xs border-2 border-primary-400 dark:border-primary-600">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 rounded-t-xl">
            <h3 className="font-bold text-base flex items-center gap-2">
              <span className="text-xl">🌡️</span>
              Datos Ambientales en Tiempo Real
            </h3>
            <p className="text-xs opacity-90 mt-1">
              {userLocation ? '📍 Tu ubicación actual' : '📍 Centro del mapa'}
            </p>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <span className="text-lg">🌡️</span> Temperatura
              </span>
              <span className="font-bold text-lg text-primary-600 dark:text-primary-400">
                {environmentalData.temperature?.toFixed(1)}°C
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <span className="text-lg">💧</span> Humedad
              </span>
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {environmentalData.humidity?.toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <span className="text-lg">💨</span> Viento
              </span>
              <span className="font-bold text-lg text-gray-700 dark:text-gray-300">
                {environmentalData.windSpeed?.toFixed(1)} km/h
              </span>
            </div>
            {environmentalData.uvIndex !== undefined && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
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
            </div>
          </div>
        </div>
      )}

      {/* Botón para alternar vista satélite */}
      <button
        onClick={() => setShowSatellite(!showSatellite)}
        className="absolute bottom-24 right-4 z-[1000] p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow"
        title={showSatellite ? 'Vista de mapa' : 'Vista satélite'}
      >
        {showSatellite ? '🗺️' : '🛰️'}
      </button>

      {/* Street View integrado - solo visible cuando showStreetView es true */}
      {showStreetView && (
        <div className="absolute bottom-0 left-0 right-0 h-64 z-[500] bg-gray-900 border-t-4 border-green-500 animate-fade-in">
          <iframe
            src={
              userLocation
                ? `https://www.mapillary.com/embed?map_style=Mapillary%20light&image_key=&x=${userLocation.longitude}&y=${userLocation.latitude}&z=17&style=photo`
                : `https://www.mapillary.com/embed?map_style=Mapillary%20light&image_key=&x=-58.3816&y=-34.6037&z=17&style=photo`
            }
            className="w-full h-full border-0"
            allowFullScreen
            allow="geolocation"
            title="Mapillary Street View"
          />
          <div className="absolute top-2 left-2 bg-white/90 dark:bg-gray-800/90 px-3 py-1 rounded-lg text-xs font-medium">
            📷 Street View (Mapillary)
          </div>
        </div>
      )}
    </div>
  );
};
