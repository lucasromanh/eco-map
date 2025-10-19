import { useState, useEffect } from 'react';
import { MapView } from './components/MapView';
import { useTheme } from './hooks/useTheme';
import { Header } from './components/Header';
import { AddReportModal } from './components/AddReportModal';
import { ReportList } from './components/ReportList';
import { Tutorial } from './components/Tutorial';
import { InfoBanner } from './components/InfoBanner';
import { UserProfile } from './components/UserProfile';
import { AdminPanel } from './components/AdminPanel';
import { StreetView } from './components/StreetView';
import { WeatherForecast } from './components/WeatherForecast';
import { useGeolocation } from './hooks/useGeolocation';
import { storageService } from './services/storageService';
import { isRunningStandalone } from './utils/pwa';
import { userService } from './services/userService';
import { AuthModal } from './components/AuthModal';
import { authService } from './services/authService';
import type { AuthUser } from './services/authService';
import type { Report } from './types';
import './App.css';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [clickedLocation, setClickedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showTutorial, setShowTutorial] = useState(true);
  // const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showWeatherPanel, setShowWeatherPanel] = useState(false);
  const [effectsEnabled, setEffectsEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('ecomap_show_effects');
      return saved === null ? true : saved !== 'false';
    } catch {
      return true;
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPwaNotice, setShowPwaNotice] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showStreetView, setShowStreetView] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  // Autenticación
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => authService.getSession());

  // Sincronizar perfil al cargar sesión existente
  useEffect(() => {
    if (user) {
      console.log('🔄 Usuario en sesión, sincronizando perfil:', user);
      userService.syncFromAuthUser(user);
    }
  }, [user]);

  // Handler para login exitoso
  const handleLogin = (u: AuthUser) => {
    setUser(u);
    setShowAuth(false);
    // Sincronizar perfil local con datos del backend
    userService.syncFromAuthUser(u);
  };

  // Handler para logout (no usado por ahora)
  // const handleLogout = () => {
  //   authService.clearSession();
  //   setUser(null);
  // };

  const { location } = useGeolocation();

  // Cerrar panel clima automáticamente al abrir el menú
  useEffect(() => {
    if (menuOpen) setShowWeatherPanel(false);
  }, [menuOpen]);

  useEffect(() => {
    try {
      localStorage.setItem('ecomap_show_effects', effectsEnabled ? 'true' : 'false');
    } catch {}
  }, [effectsEnabled]);

  // Escuchar eventos del Header para abrir Perfil y Administración
  useEffect(() => {
    const onOpenProfile = (_e: Event) => setShowProfile(true);
    const onOpenAdmin = (_e: Event) => setShowAdmin(true);
    window.addEventListener('ecomap_open_profile', onOpenProfile as EventListener);
    window.addEventListener('ecomap_open_admin', onOpenAdmin as EventListener);
    return () => {
      window.removeEventListener('ecomap_open_profile', onOpenProfile as EventListener);
      window.removeEventListener('ecomap_open_admin', onOpenAdmin as EventListener);
    };
  }, []);

  // Autocerrar aviso PWA a los 5s cuando estamos en modo standalone
  useEffect(() => {
    if (!isRunningStandalone()) return;
    setShowPwaNotice(true);
    const t = setTimeout(() => setShowPwaNotice(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Detectar evento de instalación PWA (deshabilitado por ahora)
  // useEffect(() => {
  //   const handler = (e: any) => {
  //     e.preventDefault();
  //     setDeferredPrompt(e);
  //   };
  //   window.addEventListener('beforeinstallprompt', handler);
  //   return () => window.removeEventListener('beforeinstallprompt', handler);
  // }, []);

  // const handleInstallClick = async () => {
  //   if (!deferredPrompt) {
  //     alert(
  //       'Para instalar EcoMap:\n\nEn Android/Chrome: Menú (⋮) → "Instalar aplicación"\n\nEn iPhone/Safari: Compartir (↗) → "Añadir a pantalla de inicio"'
  //     );
  //     return;
  //   }
  //   deferredPrompt.prompt();
  //   await deferredPrompt.userChoice;
  //   setDeferredPrompt(null);
  // };

  // Cargar reportes al iniciar (local + servidor)
  useEffect(() => {
    const loadReports = async () => {
      // 1. Cargar reportes locales
      const localReports = storageService.getReports();
      setReports(localReports);
      
      // 2. Cargar reportes aprobados del servidor (si no es localhost)
      const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isDevelopment) {
        try {
          const { reportService } = await import('./services/reportService');
          const response = await reportService.getApprovedPoints();
          
          // Adaptar para aceptar ambos formatos: objeto con 'points' o array directo
          const points = Array.isArray(response)
            ? response
            : Array.isArray(response.points)
              ? response.points
              : [];

          if (points.length > 0) {
            console.log('✅ Reportes del servidor cargados:', points.length);
            // Convertir reportes del servidor al formato local
                const serverReports: Report[] = points.map((p: Record<string, any>) => ({
              id: String(p.id),
              title: p.titulo || 'Sin título',
              description: p.descripcion || '',
              category: p.tipo || 'otro',
              latitude: parseFloat(p.lat),
              longitude: parseFloat(p.lng),
              imageUrl: p.imagen || undefined,
              userId: String(p.usuario_id),
              timestamp: p.fecha_creacion ? new Date(p.fecha_creacion).getTime() : Date.now(),
              status: 'approved' as const,
            }));
            // Combinar reportes locales y del servidor (evitar duplicados por ID)
            const allReports = [...localReports];
            serverReports.forEach((serverReport: Report) => {
              if (!allReports.some(r => r.id === serverReport.id)) {
                allReports.push(serverReport);
              }
            });
            setReports(allReports);
          }
        } catch (error) {
          console.error('❌ Error al cargar reportes del servidor:', error);
        }
      }
    };
    
    loadReports();
  }, []);

  // Utilidad: perfil completo (backend)
  const isProfileComplete = () => {
    const p = userService.getProfile();
    return !!(p && p.firstName?.trim() && p.lastName?.trim() && p.email?.trim());
  };

  // Refrescar reportes desde el servidor
  const handleRefreshReports = async () => {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isDevelopment) {
      // En desarrollo, solo recargar reportes locales
      const localReports = storageService.getReports();
      setReports(localReports);
      return;
    }

    try {
      console.log('🔄 Refrescando reportes...');
      const localReports = storageService.getReports();
      const { reportService } = await import('./services/reportService');
      const response = await reportService.getApprovedPoints();
      
      const points = Array.isArray(response)
        ? response
        : Array.isArray(response.points)
          ? response.points
          : [];

      if (points.length > 0) {
        console.log('✅ Reportes actualizados:', points.length);
        const serverReports: Report[] = points.map((p: Record<string, any>) => ({
          id: String(p.id),
          title: p.titulo || 'Sin título',
          description: p.descripcion || '',
          category: p.tipo || 'otro',
          latitude: parseFloat(p.lat),
          longitude: parseFloat(p.lng),
          imageUrl: p.imagen || undefined,
          userId: String(p.usuario_id),
          timestamp: p.fecha_creacion ? new Date(p.fecha_creacion).getTime() : Date.now(),
          status: 'approved' as const,
        }));
        
        const allReports = [...localReports];
        serverReports.forEach((serverReport: Report) => {
          if (!allReports.some(r => r.id === serverReport.id)) {
            allReports.push(serverReport);
          }
        });
        setReports(allReports);
      } else {
        setReports(localReports);
      }
    } catch (error) {
      console.error('❌ Error al refrescar reportes:', error);
    }
  };

  // Escuchar evento de reportes actualizados (cuando se aprueba desde admin)
  useEffect(() => {
    const handleReportsUpdated = () => {
      handleRefreshReports();
    };
    window.addEventListener('ecomap_reports_updated', handleReportsUpdated);
    return () => window.removeEventListener('ecomap_reports_updated', handleReportsUpdated);
  }, [handleRefreshReports]);

  const base64ToFile = (base64: string, filename: string, contentType = 'image/jpeg'): File | null => {
    try {
      const arr = base64.split(',');
      const bstr = atob(arr[arr.length - 1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], filename, { type: contentType });
    } catch {
      return null;
    }
  };

  // Guardar reporte (modificado)
  const handleSaveReport = async (report: Report) => {
    const isDevelopment =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const profile = userService.getProfile();
    if (!profile) {
      alert('Error: debes tener un perfil para guardar reportes.');
      return;
    }
    
    let success = false;
    let serverImageUrl = '';
    
    if (!isDevelopment) {
      try {
        const { reportService } = await import('./services/reportService');
        
        // Preparar imagen si existe
        let imageFile: File | undefined = undefined;
        if (report.imageFile instanceof File) {
          imageFile = report.imageFile;
        } else if (report.imageUrl && report.imageUrl.startsWith('data:')) {
          imageFile = base64ToFile(report.imageUrl, 'foto.jpg') || undefined;
        }

        // Enviar al backend
        const result = await reportService.addReport({
          usuario_id: profile.id,
          tipo: report.category || 'otro',
          titulo: report.title,
          descripcion: report.description || '',
          lat: report.latitude,
          lng: report.longitude,
          imagen: imageFile,
        });

        success = result.ok;
        serverImageUrl = result.file || result.imagen || '';
        console.log('✅ Reporte guardado en servidor:', result);
      } catch (error) {
        console.error('❌ Error al guardar en servidor:', error);
        success = false;
      }
    }
    
    // Actualizar reporte con URL del servidor si está disponible
    const withUser: Report = { 
      ...report, 
      userId: profile.id,
      imageUrl: serverImageUrl || report.imageUrl 
    };
    storageService.saveReport(withUser);
    setReports([...reports, withUser]);
    setTimeout(() => {
      if (isDevelopment) {
        alert(
          `✅ Tu reporte se ha guardado localmente.\n\n⚠️ MODO DESARROLLO: No se envió al servidor público porque estás en localhost.\n\nCuando despliegues la aplicación en producción, los reportes se enviarán automáticamente al servidor.`
        );
      } else {
        alert(
          `Tu reporte se ha guardado localmente y ${
            success
              ? 'también se ha enviado al servidor público.'
              : 'no se pudo enviar al servidor público.'
          }\n\nADVERTENCIA: Los reportes enviados a https://ecomap.saltacoders.com/ecomap/ son públicos y pueden ser vistos por cualquier usuario.`
        );
      }
    }, 300);
  };

  const handleDeleteReport = (id: string) => {
    storageService.deleteReport(id);
    setReports(reports.filter((r) => r.id !== id));
  };

  const handleMapClick = (lat: number, lng: number) => {
    setClickedLocation({ lat, lng });
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!isProfileComplete()) {
      alert('Debes completar tu perfil antes de crear un reporte.');
      setShowProfile(true);
      return;
    }
    setIsAddModalOpen(true);
  };

  const handleStartAddReport = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!isProfileComplete()) {
      alert('Debes completar tu perfil antes de crear un reporte.');
      setShowProfile(true);
      return;
    }
    setClickedLocation(null);
    setIsAddModalOpen(true);
  };

  return (
    <div
      className={`flex flex-col h-screen bg-gray-50 dark:bg-gray-900 ${isDark ? 'dark' : ''}`}
    >
      {/* Modal de login/registro */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onLogin={handleLogin}
      />

      {/* Cabecera */}
      <Header
        onAddReport={handleStartAddReport}
        onToggleList={() => setIsListOpen(true)}
        onToggleWeather={() => setShowWeatherPanel((v) => !v)}
        isWeatherOpen={showWeatherPanel}
        onToggleEffects={() => setEffectsEnabled((v) => !v)}
        effectsEnabled={effectsEnabled}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        isDark={isDark}
        toggleTheme={toggleTheme}
        reportCount={reports.length}
      />

      {/* Mapa */}
      <MapView
        reports={reports}
        userLocation={location}
        onMapClick={handleMapClick}
        selectedReport={selectedReport}
        showWeatherPanel={showWeatherPanel}
        effectsEnabled={effectsEnabled}
        isDark={isDark}
      />

      {/* Botón flotante de Street View - IZQUIERDA */}
      <button
        onClick={() => setShowStreetView(true)}
        className="fixed bottom-6 left-6 z-[1000] bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
        title="Ver Street View"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      </button>

      {/* Botón flotante de Pronóstico - CENTRO */}
      <button
        onClick={() => setShowForecast(true)}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[1000] bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110"
        title="Pronóstico Extendido"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
        </svg>
      </button>

      {/* Modales */}
      <AddReportModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveReport}
        userLocation={location}
        initialLocation={clickedLocation ?? undefined}
      />

      <ReportList
        reports={reports}
        isOpen={isListOpen}
        onClose={() => setIsListOpen(false)}
        onSelectReport={(r) => setSelectedReport(r)}
        onDeleteReport={handleDeleteReport}
        onRefresh={handleRefreshReports}
      />

      <UserProfile isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <AdminPanel isOpen={showAdmin} onClose={() => {
        setShowAdmin(false);
        // Refrescar reportes aprobados al cerrar el panel de admin
        (async () => {
          const { reportService } = await import('./services/reportService');
          const response = await reportService.getApprovedPoints();
          const points = Array.isArray(response)
            ? response
            : Array.isArray(response.points)
              ? response.points
              : [];
          if (points.length > 0) {
            const localReports = storageService.getReports();
            const serverReports = points.map((p: any) => ({
              id: String(p.id),
              title: p.titulo || 'Sin título',
              description: p.descripcion || '',
              category: p.tipo || 'otro',
              latitude: parseFloat(p.lat),
              longitude: parseFloat(p.lng),
              imageUrl: p.imagen || undefined,
              userId: String(p.usuario_id),
              timestamp: p.fecha_creacion ? new Date(p.fecha_creacion).getTime() : Date.now(),
              status: 'approved' as const,
            }));
            const allReports = [...localReports];
            serverReports.forEach((serverReport: Report) => {
              if (!allReports.some(r => r.id === serverReport.id)) {
                allReports.push(serverReport);
              }
            });
            setReports(allReports);
          }
        })();
      }} />

      {/* StreetView */}
      <StreetView
        location={location}
        isOpen={showStreetView}
        onClose={() => setShowStreetView(false)}
      />

      {/* Pronóstico meteorológico */}
      <WeatherForecast
        isOpen={showForecast}
        onClose={() => setShowForecast(false)}
      />

      {/* Tutorial, banners e info */}
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
      {showPwaNotice && <InfoBanner />}
    </div>
  );
}

export default App;
