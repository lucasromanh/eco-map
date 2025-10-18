import { useState, useEffect } from 'react';
import { MapView } from './components/MapView';
import { Header } from './components/Header';
import { AddReportModal } from './components/AddReportModal';
import { ReportList } from './components/ReportList';
import { Tutorial } from './components/Tutorial';
import { InfoBanner } from './components/InfoBanner';
import { useGeolocation } from './hooks/useGeolocation';
import { storageService } from './services/storageService';
import type { Report } from './types';
import './App.css';

function App() {
  const [reports, setReports] = useState<Report[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showStreetView, setShowStreetView] = useState(false);
  const [showWeatherPanel, setShowWeatherPanel] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ecomap_show_effects');
      return saved === null ? true : saved !== 'false';
    } catch { return true; }
  });
  useEffect(() => {
    try { localStorage.setItem('ecomap_show_effects', effectsEnabled ? 'true' : 'false'); } catch {}
  }, [effectsEnabled]);
  
  const { location, error, loading, refreshLocation } = useGeolocation();

  // Detectar evento de instalación PWA
  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback: mostrar instrucciones manuales
      alert('Para instalar EcoMap:\n\nEn Android/Chrome: Menú (⋮) → "Instalar aplicación"\n\nEn iPhone/Safari: Compartir (↗) → "Añadir a pantalla de inicio"');
      return;
    }

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  // Cargar reportes al iniciar
  useEffect(() => {
    const loadedReports = storageService.getReports();
    setReports(loadedReports);
  }, []);

  const handleSaveReport = (report: Report) => {
    storageService.saveReport(report);
    setReports([...reports, report]);
  };

  const handleDeleteReport = (id: string) => {
    storageService.deleteReport(id);
    setReports(reports.filter((r) => r.id !== id));
  };

  const handleMapClick = (lat: number, lng: number) => {
    setClickedLocation({ lat, lng });
    setIsAddModalOpen(true);
  };

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    setIsListOpen(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tutorial */}
      {showTutorial && (
        <Tutorial onComplete={() => setShowTutorial(false)} />
      )}

      {/* Banner informativo - siempre disponible después del tutorial */}
      <InfoBanner />

      {/* Header */}
      <Header
        onAddReport={() => {
          setClickedLocation(null);
          setIsAddModalOpen(true);
        }}
        onToggleList={() => setIsListOpen(!isListOpen)}
        onShowHelp={() => {
          localStorage.removeItem('ecomap_tutorial_seen');
          setShowTutorial(true);
        }}
        onToggleWeather={() => setShowWeatherPanel((v) => !v)}
        isWeatherOpen={showWeatherPanel}
        onToggleEffects={() => setEffectsEnabled((v) => !v)}
        effectsEnabled={effectsEnabled}
      />

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Estado de geolocalización */}
        {loading && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              📍 Obteniendo ubicación...
            </p>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700 px-5 py-3 rounded-lg shadow-lg max-w-md">
            <div className="flex items-start space-x-2">
              <span className="text-lg">ℹ️</span>
              <div className="flex-1">
                <p className="text-sm text-blue-900 dark:text-blue-100 mb-2">
                  {error}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={refreshLocation}
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-medium transition-colors"
                  >
                    🔄 Reintentar
                  </button>
                  <button
                    onClick={() => {
                      // Forzar mostrar datos ambientales de la ubicación por defecto
                    }}
                    className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded font-medium transition-colors"
                  >
                    📍 Ver datos aquí
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mapa */}
        <MapView
          reports={reports}
          userLocation={location}
          onMapClick={handleMapClick}
          selectedReport={selectedReport}
          showStreetView={showStreetView}
          showWeatherPanel={showWeatherPanel}
          effectsEnabled={effectsEnabled}
        />

        {/* Botón PWA - Instalar aplicación */}
        <button
          onClick={handleInstallClick}
          className="absolute top-4 right-4 z-[1000] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 font-semibold"
          title="Instalar EcoMap como aplicación"
        >
          <span className="text-xl">📱</span>
          <span className="hidden sm:inline">Instalar App</span>
        </button>

        {/* Botones flotantes */}
        <button
          onClick={() => setShowStreetView(!showStreetView)}
          className={`absolute bottom-4 left-4 z-[1000] p-4 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 ${
            showStreetView 
              ? 'bg-green-500 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          title={showStreetView ? "Ocultar Street View" : "Mostrar Street View"}
        >
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📷</span>
            <span className="hidden sm:inline text-sm font-medium">
              Street View
            </span>
          </div>
        </button>

        {/* Botón flotante para refrescar ubicación */}
        {location && (
          <button
            onClick={refreshLocation}
            className="absolute bottom-24 left-4 z-[1000] p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
            title="Actualizar ubicación"
          >
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}
      </main>

      {/* Modales */}
      <AddReportModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setClickedLocation(null);
        }}
        onSave={handleSaveReport}
        userLocation={location}
        initialLocation={clickedLocation || undefined}
      />

      <ReportList
        reports={reports}
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        onSelectReport={handleSelectReport}
        onDeleteReport={handleDeleteReport}
      />
    </div>
  );
}

export default App;
