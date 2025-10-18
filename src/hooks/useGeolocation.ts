import { useState, useEffect } from 'react';
import type { UserLocation } from '../types';

interface GeolocationState {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
  });

  const getLocation = () => {
    if (!navigator.geolocation) {
      setState({
        location: null,
        error: 'La geolocalización no está soportada por tu navegador',
        loading: false,
      });
      return;
    }

    console.log('📍 Solicitando ubicación GPS...');

    const onSuccess = (position: GeolocationPosition) => {
      console.log('✅ GPS obtenido:', position.coords.latitude, position.coords.longitude);
      setState({
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        },
        error: null,
        loading: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      console.error('❌ Error GPS:', error.code, error.message);
      let errorMessage = 'Error al obtener la ubicación';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '❌ Permiso de ubicación denegado. Por favor, permite el acceso a tu ubicación en la configuración del navegador.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = '📡 Ubicación no disponible. Verifica tu conexión GPS o WiFi.';
          break;
        case error.TIMEOUT:
          errorMessage = '⏱️ Tiempo agotado al obtener ubicación GPS.';
          break;
      }

      setState({
        location: null,
        error: errorMessage,
        loading: false,
      });
    };

    // Obtener ubicación inicial con configuración optimizada
    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: false, // Cambiado a false para ser más rápido
      timeout: 10000, // 10 segundos
      maximumAge: 60000, // Acepta caché de hasta 60 segundos
    });
  };

  useEffect(() => {
    getLocation();
  }, []);

  const refreshLocation = () => {
    console.log('🔄 Refrescando ubicación GPS...');
    setState((prev) => ({ ...prev, loading: true }));
    getLocation();
  };

  return {
    location: state.location,
    error: state.error,
    loading: state.loading,
    refreshLocation,
  };
};
