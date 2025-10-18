import { useState, useEffect } from 'react';
import { MapView } from './components/MapView';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { AddReportModal } from './components/AddReportModal';
import { ReportList } from './components/ReportList';
import { Tutorial } from './components/Tutorial';
import { InfoBanner } from './components/InfoBanner';
import { useGeolocation } from './hooks/useGeolocation';
import { storageService } from './services/storageService';
import { isRunningStandalone } from './utils/pwa';
import type { Report } from './types';
import './App.css';

function App() {
  const { isDark } = useTheme();
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
  const [menuOpen, setMenuOpen] = useState(false);

  // Cerrar panel clima automáticamente al abrir el menú
  useEffect(() => {
    if (menuOpen) setShowWeatherPanel(false);
  }, [menuOpen]);
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

  const handleSaveReport = async (report: Report) => {
    storageService.saveReport(report);
    setReports([...reports, report]);
    // Guardar en servidor público
    let success = false;
    try {
      const res = await fetch('https://ecomap.saltacoders.com/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
      success = res.ok;
    } catch {
      success = false;
    }
    setTimeout(() => {
      alert(
        `Tu reporte se ha guardado localmente y ${success ? 'también se ha enviado al servidor público.' : 'no se pudo enviar al servidor público.'}\n\nADVERTENCIA: Los reportes enviados a https://ecomap.saltacoders.com/ son públicos y pueden ser vistos por cualquier usuario. No incluyas datos personales sensibles.`
      );
    }, 300);
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

  // Handlers para cerrar el panel de clima si se selecciona otra opción
  const handleAddReport = () => {
    setShowWeatherPanel(false);
    setClickedLocation(null);
    setIsAddModalOpen(true);
  };
  const handleToggleList = () => {
    setShowWeatherPanel(false);
    setIsListOpen(!isListOpen);
  };
  const handleShowHelp = () => {
    setShowWeatherPanel(false);
    localStorage.removeItem('ecomap_tutorial_seen');
    setShowTutorial(true);
  };
  const handleToggleEffects = () => {
    setShowWeatherPanel(false);
    setEffectsEnabled((v) => !v);
  };
  const handleToggleWeather = () => {
    setShowWeatherPanel((v) => !v);
  };

  const isStandalone = isRunningStandalone();

  return (
  <div className={`flex flex-col h-screen bg-gray-50 dark:bg-gray-900 ${isDark ? 'dark' : ''}`}> 
      {/* Tutorial */}
      {showTutorial && (
        <Tutorial onComplete={() => setShowTutorial(false)} />
      )}

      {/* Banner informativo - siempre disponible después del tutorial */}
      <InfoBanner />

      {/* Header */}
      <Header
  onAddReport={handleAddReport}
  onToggleList={handleToggleList}
  onShowHelp={handleShowHelp}
  onToggleWeather={handleToggleWeather}
  isWeatherOpen={showWeatherPanel}
  onToggleEffects={handleToggleEffects}
  effectsEnabled={effectsEnabled}
  menuOpen={menuOpen}
  setMenuOpen={setMenuOpen}
  isDark={isDark}
  toggleTheme={useTheme().toggleTheme}
      />

      {/* Panel clima solo si el menú no está abierto */}
      {showWeatherPanel && !menuOpen && (
        <div
          className="fixed left-2 top-16 z-[2000] w-[320px] max-w-[90vw]"
          style={{ pointerEvents: 'auto' }}
        >
          <InfoBanner />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {/* Estado de geolocalización */}
        {loading && (
          <div className="absolute top-8 left-2 z-[900] bg-white/90 dark:bg-gray-800/90 backdrop-blur px-2 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-1 pointer-events-auto min-w-[120px] max-w-[60vw]">
            <span className="text-sm">📍</span>
            <p className="text-[10px] text-gray-700 dark:text-gray-300 truncate">
              Obteniendo ubicación...
            </p>
          </div>
        )}

        {error && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[900] bg-white/95 dark:bg-gray-800/95 backdrop-blur px-2 py-1 rounded-full shadow-md border border-gray-200 dark:border-gray-700 flex items-center gap-1 pointer-events-auto min-w-[120px] max-w-[60vw]">
            <span className="text-sm">ℹ️</span>
            <p className="text-[10px] text-gray-700 dark:text-gray-300 truncate max-w-[40vw]">
              {error}
            </p>
            <button
              onClick={refreshLocation}
              className="text-[10px] bg-blue-600 hover:bg-blue-700 text-white px-1 py-0.5 rounded-full font-medium transition-colors"
              title="Reintentar ubicación"
            >
              Reintentar
            </button>
            <button
              onClick={() => {
                // Forzar mostrar datos ambientales de la ubicación por defecto
              }}
              className="text-[10px] bg-gray-600 hover:bg-gray-700 text-white px-1 py-0.5 rounded-full font-medium transition-colors"
              title="Usar datos aquí"
            >
              Ver datos
            </button>
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
          isDark={isDark}
        />

        {/* Botón PWA - Instalar aplicación */}
        {!isStandalone && deferredPrompt && (
          <button
            onClick={handleInstallClick}
            className="absolute top-4 right-4 z-[1000] bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2 font-semibold"
            title="Instalar EcoMap como aplicación"
          >
            <span className="text-xl">📱</span>
            <span className="hidden sm:inline">Instalar App</span>
          </button>
        )}

        {/* Mensaje para usuarios con la app instalada */}
        {isStandalone && (
          <div className="absolute top-4 right-4 z-[1000] bg-blue-900/90 text-white px-4 py-2 rounded-lg shadow-lg max-w-xs text-sm font-medium">
            <span className="block mb-1">✔️ Estás usando EcoMap como app instalada.</span>
            <span>Recomendamos ingresar siempre desde la app instalada, ya que está optimizada para mejor experiencia y uso de recursos.</span>
          </div>
        )}

        {/* Botones flotantes */}
        <button
          onClick={() => setShowStreetView(!showStreetView)}
          className={`absolute bottom-4 left-4 z-[1000] map-control-btn ${
            showStreetView 
              ? 'bg-green-500 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
          }`}
          title={showStreetView ? "Ocultar Street View" : "Mostrar Street View"}
        >
          <span className="text-lg">📷</span>
        </button>

        {/* Botón flotante para refrescar ubicación */}
        {location && (
          <button
            onClick={refreshLocation}
            className="absolute bottom-4 left-16 z-[1000] map-control-btn bg-white dark:bg-gray-800"
            title="Actualizar ubicación"
          >
            <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
