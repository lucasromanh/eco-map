// ================================
// 🌦️ Servicio combinado SMN + Open-Meteo
// Prioridad: SMN Argentina (oficial) → Open-Meteo (respaldo)
// ================================

export interface WeatherData {
  provider: 'SMN Argentina' | 'Open-Meteo';
  location: string;
  temperature: number;
  humidity: number | null;
  description: string;
  windSpeed: number;
  precipitation: number;
  uvIndex: number;
  time: string;
  feelsLike?: number;
  windDirection?: number;
}

/**
 * 🌡️ Obtener datos meteorológicos combinados
 * @param lat - Latitud GPS completa (sin redondear)
 * @param lon - Longitud GPS completa (sin redondear)
 * @returns Datos del clima desde SMN (preferido) u Open-Meteo (respaldo)
 */
export async function fetchCombinedWeather(lat: number, lon: number): Promise<WeatherData> {
  console.log(`🌡️ Consultando clima para: ${lat.toFixed(6)}, ${lon.toFixed(6)}`);

  // 🔹 Paso 1: Consultar SMN Argentina (datos oficiales)
  try {
    console.log('📡 Intentando SMN Argentina...');
    const smnRes = await fetch('https://ws.smn.gob.ar/map_items/weather', { 
      cache: 'no-store' 
    });

    if (!smnRes.ok) throw new Error('SMN no disponible');
    const smnData = await smnRes.json();

    // Buscar estación más cercana a tu ubicación (distancia euclidiana)
    const smnStation = smnData
      .map((s: any) => ({
        ...s,
        dist: Math.sqrt(
          Math.pow(s.lat - lat, 2) + Math.pow(s.lon - lon, 2)
        ),
      }))
      .sort((a: any, b: any) => a.dist - b.dist)[0];

    if (smnStation && smnStation.temp !== undefined) {
      console.log(`✅ Usando datos SMN: ${smnStation.name} (${smnStation.temp}°C)`);
      return {
        provider: 'SMN Argentina',
        location: smnStation.name,
        temperature: smnStation.temp,
        humidity: smnStation.humedad ?? null,
        description: smnStation.weather?.description ?? 'Sin descripción',
        windSpeed: smnStation.wind_speed ?? 0,
        precipitation: 0, // SMN no provee este dato en tiempo real
        uvIndex: 0, // SMN no provee UV en esta API
        time: new Date().toLocaleTimeString('es-AR'),
      };
    }
  } catch (err) {
    console.warn('⚠️ Error con SMN Argentina:', err);
  }

  // 🔹 Paso 2: Si falla SMN, usar Open-Meteo (respaldo global)
  try {
    console.log('🌍 Usando Open-Meteo como respaldo...');
    const timestamp = Date.now();
    
    // 🔥 NO usar 'models' con 'current', causa error 400
    // Usar configuración estándar con hourly para datos actuales más precisos
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,wind_direction_10m,precipitation,weather_code&hourly=uv_index&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm&timezone=auto&forecast_days=1&_=${timestamp}`;

    // ⚠️ NO usar headers Cache-Control, causa error CORS en Open-Meteo
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Open-Meteo HTTP ${res.status}:`, errorText);
      throw new Error(`Open-Meteo error: ${res.status}`);
    }
    
    const data = await res.json();
    const current = data.current;
    
    // UV index viene del hourly, tomar el valor actual
    const currentHour = new Date().getHours();
    const uvIndex = data.hourly?.uv_index?.[currentHour] ?? 0;

    console.log(`✅ Usando Open-Meteo: ${current.temperature_2m}°C | Código clima: ${current.weather_code} | ${getWeatherDescription(current.weather_code)}`);

    return {
      provider: 'Open-Meteo',
      location: data.timezone?.replace(/_/g, ' ') ?? 'Ubicación actual',
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      description: getWeatherDescription(current.weather_code),
      windSpeed: current.wind_speed_10m, // Ya viene en km/h
      windDirection: current.wind_direction_10m,
      precipitation: current.precipitation ?? 0,
      uvIndex: uvIndex,
      feelsLike: current.apparent_temperature,
      time: new Date(current.time).toLocaleTimeString('es-AR'),
    };
  } catch (err) {
    console.error('❌ Error con Open-Meteo:', err);
    throw new Error('No se pudieron obtener datos meteorológicos.');
  }
}

/**
 * 🌤️ Convertir código del clima a descripción legible
 * Referencia: https://open-meteo.com/en/docs#weathervariables
 */
function getWeatherDescription(code: number | undefined): string {
  if (code === undefined || code === null) return 'Condición desconocida';
  
  if (code === 0) return 'Despejado';
  if (code === 1) return 'Mayormente despejado';
  if (code === 2) return 'Parcialmente nublado';
  if (code === 3) return 'Nublado';
  if ([45, 48].includes(code)) return 'Niebla';
  if ([51, 53, 55, 56, 57].includes(code)) return 'Llovizna';
  if ([61, 63, 65, 66, 67].includes(code)) return 'Lluvia';
  if ([71, 73, 75, 77].includes(code)) return 'Nieve';
  if ([80, 81, 82].includes(code)) return 'Chaparrones';
  if ([85, 86].includes(code)) return 'Chaparrones de nieve';
  if ([95, 96, 99].includes(code)) return 'Tormenta';
  
  return 'Condición desconocida';
}

/**
 * 📍 Obtener ubicación GPS con reintentos automáticos
 * @param retries - Número de reintentos (por defecto 2)
 * @param useDefaultFallback - Usar ubicación por defecto si falla todo (opcional)
 * @returns Promise con la posición GPS
 */
export async function getLocationWithRetry(retries = 2, useDefaultFallback = false): Promise<GeolocationPosition> {
  // Verificar permisos antes de solicitar ubicación
  if ('permissions' in navigator) {
    try {
      const perm = await navigator.permissions.query({ name: 'geolocation' });
      if (perm.state === 'denied') {
        throw new Error('Permisos de ubicación denegados. Por favor, habilitá la ubicación en los ajustes del navegador.');
      }
    } catch (err) {
      console.warn('⚠️ No se pudo verificar permisos:', err);
    }
  }

  // Intentar obtener ubicación con reintentos
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`📍 Intento ${attempt + 1}/${retries + 1} de obtener ubicación GPS...`);
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocalización no disponible en este dispositivo'));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true, // GPS preciso
          timeout: 10000, // 10 segundos
          maximumAge: 0, // No usar caché
        });
      });

      console.log(`✅ Ubicación obtenida: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
      
      // Guardar última posición válida en localStorage
      try {
        localStorage.setItem('ecomap_last_position', JSON.stringify({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          timestamp: Date.now(),
        }));
      } catch {}

      return position;
    } catch (error: any) {
      console.warn(`⚠️ Error GPS (intento ${attempt + 1}):`, error);
      
      if (attempt < retries) {
        // Esperar 2 segundos antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Último intento fallido, intentar usar última posición conocida
        try {
          const lastPos = localStorage.getItem('ecomap_last_position');
          if (lastPos) {
            const { lat, lon, timestamp } = JSON.parse(lastPos);
            const ageMinutes = (Date.now() - timestamp) / 60000;
            
            // Ampliar ventana a 2 horas para mayor tolerancia
            if (ageMinutes < 120) {
              console.log(`ℹ️ Usando última ubicación conocida (${ageMinutes.toFixed(0)} min atrás)`);
              return {
                coords: {
                  latitude: lat,
                  longitude: lon,
                  accuracy: 0,
                  altitude: null,
                  altitudeAccuracy: null,
                  heading: null,
                  speed: null,
                },
                timestamp: timestamp,
              } as GeolocationPosition;
            }
          }
        } catch (fallbackErr) {
          console.warn('⚠️ No se pudo usar ubicación de fallback:', fallbackErr);
        }

        // Si todo falla, lanzar error descriptivo
        const errorCode = error?.code;
        
        // Si se permite fallback por defecto, usar ubicación de Argentina Central
        if (useDefaultFallback) {
          console.warn('⚠️ Usando ubicación predeterminada (Argentina Central)');
          return {
            coords: {
              latitude: -31.4135, // Córdoba, Argentina
              longitude: -64.1811,
              accuracy: 0,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null,
            },
            timestamp: Date.now(),
          } as GeolocationPosition;
        }
        
        if (errorCode === 1) {
          throw new Error('Permisos de ubicación denegados. Por favor, habilitá la ubicación en los ajustes del navegador.');
        } else if (errorCode === 2) {
          throw new Error('No se pudo determinar tu ubicación. Verificá que el GPS esté habilitado y que tengas buena señal.');
        } else if (errorCode === 3) {
          throw new Error('Tiempo de espera agotado al obtener ubicación. Intentá nuevamente.');
        } else {
          throw new Error('Error al obtener ubicación. Verificá los permisos del navegador.');
        }
      }
    }
  }

  throw new Error('No se pudo obtener la ubicación después de varios intentos.');
}
