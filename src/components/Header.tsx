import { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { userService } from '../services/userService';

interface HeaderProps {
  onAddReport: () => void;
  onToggleList: () => void;
  onShowHelp?: () => void;
  onShowTutorial?: () => void;
  onToggleWeather?: () => void;
  isWeatherOpen?: boolean;
  onToggleEffects?: () => void;
  effectsEnabled?: boolean;
  menuOpen?: boolean;
  setMenuOpen?: (open: boolean) => void;
  reportCount?: number;
  onInstall?: () => void;
  showInstallButton?: boolean;
}

export const Header = ({ onAddReport, onToggleList, onShowHelp, onShowTutorial, onToggleWeather, isWeatherOpen, onToggleEffects, effectsEnabled, menuOpen, setMenuOpen, reportCount, onInstall, showInstallButton }: HeaderProps) => {
  // Cantidad de reportes guardados (refrescado al abrir menú y ante cambios en storage)
  const [storedCount, setStoredCount] = useState<number>(() => storageService.getReports().length);
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const isControlled = typeof menuOpen === 'boolean' && typeof setMenuOpen === 'function';
  const actualMenuOpen = isControlled ? menuOpen : internalMenuOpen;
  const setActualMenuOpen = isControlled ? setMenuOpen : setInternalMenuOpen;
  const displayedCount = typeof reportCount === 'number' ? reportCount : storedCount;

    // Estado del perfil del usuario
    const [userProfile, setUserProfile] = useState(() => userService.getProfile());

    // Escuchar actualizaciones del Service Worker
    useEffect(() => {
      if ('serviceWorker' in navigator) {
        // Listener para mensajes del Service Worker
        const handleSWMessage = (event: MessageEvent) => {
          console.log('📨 Mensaje del Service Worker:', event.data);
          if (event.data && event.data.type === 'NEW_VERSION_AVAILABLE') {
            console.log('🔔 Nueva versión disponible:', event.data.version);
            setUpdateAvailable(true);
            // Guardar en localStorage para persistir entre recargas
            localStorage.setItem('ecomap_update_available', 'true');
          }
        };

        navigator.serviceWorker.addEventListener('message', handleSWMessage);

        // Verificar si ya hay una actualización pendiente al cargar
        const updatePending = localStorage.getItem('ecomap_update_available');
        if (updatePending === 'true') {
          console.log('🔔 Actualización pendiente detectada al cargar');
          setUpdateAvailable(true);
        }

        // Verificar manualmente si hay un SW esperando
        navigator.serviceWorker.ready.then((registration) => {
          if (registration.waiting) {
            console.log('⏳ Service Worker esperando, notificando...');
            setUpdateAvailable(true);
            localStorage.setItem('ecomap_update_available', 'true');
          }

          // Listener para detectar cuando hay un SW nuevo esperando
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🆕 Nuevo Service Worker instalado y esperando');
                  setUpdateAvailable(true);
                  localStorage.setItem('ecomap_update_available', 'true');
                }
              });
            }
          });
        });

        return () => {
          navigator.serviceWorker.removeEventListener('message', handleSWMessage);
        };
      }
    }, []);

    // Actualizar perfil cuando cambia (desde UserProfile modal)
    useEffect(() => {
      const handleProfileUpdate = () => {
        console.log('🔄 Header: Actualizando perfil');
        const newProfile = userService.getProfile();
        console.log('👤 Header: Nuevo perfil:', newProfile);
        setUserProfile(newProfile);
      };
      
      // Actualizar al montar
      handleProfileUpdate();
      
      window.addEventListener('storage', handleProfileUpdate);
      window.addEventListener('ecomap_profile_updated', handleProfileUpdate);
      return () => {
        window.removeEventListener('storage', handleProfileUpdate);
        window.removeEventListener('ecomap_profile_updated', handleProfileUpdate);
      };
    }, []);

  // Actualizar contador al abrir el menú y cuando cambia storage (otro tab o acción)
  useEffect(() => {
    if (actualMenuOpen) {
      try { setStoredCount(storageService.getReports().length); } catch {}
    }
  }, [actualMenuOpen]);
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'ecomap_reports') {
        try { setStoredCount(storageService.getReports().length); } catch {}
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
  <header className="bg-gray-900 shadow-md border-b border-gray-700 z-[1000] relative">
      {/* Notificación de actualización disponible - FUERA del contenedor para que sea 100% ancho */}
      {updateAvailable && (
        <div className="bg-green-600 text-white py-3 px-4 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-xl">🔔</span>
            <div className="flex-1">
              <div className="text-sm font-bold">¡Nueva versión disponible!</div>
              <div className="text-xs opacity-90">Actualiza para ver los nuevos iconos</div>
            </div>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem('ecomap_update_available');
              window.location.reload();
            }}
            className="px-4 py-2 bg-white text-green-600 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors shadow-md whitespace-nowrap"
          >
            Actualizar
          </button>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
            {/* Logo, título y perfil */}
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🌍</div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-primary-400">EcoMap</h1>
                <p className="text-xs text-gray-400">Cuidemos nuestro planeta</p>
              </div>
              {userProfile && (
                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-600">
                  {userProfile.avatarUrl ? (
                    <img 
                      src={userProfile.avatarUrl} 
                      onError={(e) => (e.currentTarget.src = '/images/default_user.png')}
                      alt={`${userProfile.firstName} ${userProfile.lastName}`}
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary-400"
                    />
                  ) : (
                    <img 
                      src="/images/default_user.png"
                      alt="Usuario"
                      className="w-10 h-10 rounded-full object-cover border-2 border-primary-400"
                    />
                  )}
                  <div className="hidden sm:block">
                    <div className="text-sm font-semibold text-gray-100">
                      {userProfile.firstName} {userProfile.lastName}
                    </div>
                    <div className="text-xs text-gray-400">{userProfile.email}</div>
                  </div>
                </div>
              )}
          </div>

          {/* Menú de acciones (dropdown único) */}
          <div className="relative">
            <button
              onClick={() => setActualMenuOpen(!actualMenuOpen)}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex items-center gap-2"
              title="Opciones"
            >
              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline text-sm text-gray-300">Opciones</span>
            </button>

            {actualMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 z-[3000] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden text-gray-200">
                <div className="py-1">
                  {onToggleWeather && (
                    <button onClick={() => { onToggleWeather(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-800 text-left">
                      <span>🌦️</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{isWeatherOpen ? 'Ocultar clima' : 'Mostrar clima'}</div>
                        <div className="text-xs text-gray-400">Panel de datos ambientales</div>
                      </div>
                    </button>
                  )}

                  {onToggleEffects && (
                    <button onClick={() => { onToggleEffects(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-800 text-left">
                      <span>{effectsEnabled ? '🟢' : '⚪'}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{effectsEnabled ? 'Ocultar efectos' : 'Mostrar efectos'}</div>
                        <div className="text-xs text-gray-400">Overlay visual según clima</div>
                      </div>
                    </button>
                  )}

                  <button onClick={() => { onToggleList(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-800 text-left">
                    <span>🗂️</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Ver reportes</div>
                      <div className="text-xs text-gray-400">Listado de reportes guardados</div>
                    </div>
                  </button>

                  <button onClick={() => { onAddReport(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-800 text-left">
                    <span>➕</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Crear reporte</div>
                      <div className="text-xs text-gray-400">Agregar con foto y ubicación</div>
                    </div>
                  </button>

                  {showInstallButton && onInstall && (
                    <button onClick={() => { onInstall(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-green-900 text-left border-t border-b border-gray-700">
                      <span>📲</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-green-400">Instalar aplicación</div>
                        <div className="text-xs text-gray-400">Usar como app nativa</div>
                      </div>
                    </button>
                  )}

                  <button onClick={() => { window.dispatchEvent(new CustomEvent('ecomap_open_profile')); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-800 text-left">
                    <span>👤</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Mi perfil</div>
                      <div className="text-xs text-gray-400">Datos personales y foto</div>
                    </div>
                  </button>
                  <button onClick={() => { window.dispatchEvent(new CustomEvent('ecomap_open_admin')); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-800 text-left">
                    <span>🛡️</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Administración</div>
                      <div className="text-xs text-gray-400">Moderación y usuarios</div>
                    </div>
                  </button>


                  {typeof onShowTutorial === 'function' && (
                    <button onClick={() => { onShowTutorial(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-green-900 text-left">
                      <span>📚</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Tutorial</div>
                        <div className="text-xs text-gray-400">Tarjetas de uso</div>
                      </div>
                    </button>
                  )}
                  <button onClick={() => { if (onShowHelp) onShowHelp(); setShowHelp(true); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-blue-900 text-left">
                    <span>❓</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Ayuda</div>
                      <div className="text-xs text-gray-400">Contacto y soporte</div>
                    </div>
                  </button>
                  <div className="px-4 py-2 text-xs text-gray-400">Reportes guardados: {displayedCount}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal de Ayuda */}
      {showHelp && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/40">
          <div className="bg-gray-900 rounded-xl shadow-2xl p-6 w-[90vw] max-w-sm relative border border-gray-700">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-300" onClick={() => setShowHelp(false)} title="Cerrar">
              ✖
            </button>
            <h2 className="text-lg font-bold mb-2 text-blue-400">Contacto del desarrollador</h2>
            <div className="mb-2">
              <div className="font-semibold uppercase tracking-wide inline-block bg-gray-800 text-white px-2 py-1 rounded">LUCAS ROMAN</div>
              <div className="text-sm text-gray-300">Software Developer</div>
            </div>
            <div className="mb-4">
              <a href="mailto:lucas@saltacoders.com" className="text-blue-400 underline break-all" target="_blank" rel="noopener noreferrer">
                lucas@saltacoders.com
              </a>
          </div>
          </div>
        </div>
      )}
    </header>
  );
};
