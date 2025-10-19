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
  // Autenticación
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(() => authService.getSession());

  // Handler para login exitoso
  const handleLogin = (u: AuthUser) => {
    setUser(u);
    setShowAuth(false);
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

  // Cargar reportes al iniciar
  useEffect(() => {
    const loadedReports = storageService.getReports();
    setReports(loadedReports);
  }, []);

  // Utilidad: perfil completo (backend)
  const isProfileComplete = () => {
    const p = userService.getProfile();
    return !!(p && p.firstName?.trim() && p.lastName?.trim() && p.email?.trim());
  };

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
    const withUser: Report = { ...report, userId: profile.id };
    storageService.saveReport(withUser);
    setReports([...reports, withUser]);
    let success = false;
    if (!isDevelopment) {
      try {
        const formData = new FormData();
        formData.append('action', 'add_point');
        formData.append('usuario_id', String(profile.id));
        formData.append('lat', String(report.latitude));
        formData.append('lng', String(report.longitude));
        formData.append('descripcion', report.description || '');
        formData.append('categoria', report.category || '');
        // Imagen
        let fotoFile: File | null = null;
        if (report.imageFile instanceof File) {
          fotoFile = report.imageFile;
        } else if (report.imageUrl && report.imageUrl.startsWith('data:')) {
          fotoFile = base64ToFile(report.imageUrl, 'foto.jpg');
        }
        if (fotoFile) formData.append('foto', fotoFile);

        const apiBase = `${window.location.origin}/api.php`;
        const res = await fetch(`${apiBase}?action=add_point`, {
          method: 'POST',
          body: formData,
        });
        success = res.ok;
      } catch {
        success = false;
      }
    }
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
      />

      <UserProfile isOpen={showProfile} onClose={() => setShowProfile(false)} />
      <AdminPanel isOpen={showAdmin} onClose={() => setShowAdmin(false)} />

      {/* Tutorial, banners e info */}
      {showTutorial && <Tutorial onComplete={() => setShowTutorial(false)} />}
      {showPwaNotice && <InfoBanner />}
    </div>
  );
}

export default App;
