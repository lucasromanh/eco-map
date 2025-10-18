import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { storageService } from '../services/storageService';

interface HeaderProps {
  onAddReport: () => void;
  onToggleList: () => void;
  onShowHelp?: () => void;
  onToggleWeather?: () => void;
  isWeatherOpen?: boolean;
  onToggleEffects?: () => void;
  effectsEnabled?: boolean;
  menuOpen?: boolean;
  setMenuOpen?: (open: boolean) => void;
  isDark?: boolean;
  toggleTheme?: () => void;
}

export const Header = ({ onAddReport, onToggleList, onShowHelp, onToggleWeather, isWeatherOpen, onToggleEffects, effectsEnabled, menuOpen, setMenuOpen, isDark, toggleTheme }: HeaderProps) => {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const isControlled = typeof menuOpen === 'boolean' && typeof setMenuOpen === 'function';
  const actualMenuOpen = isControlled ? menuOpen : internalMenuOpen;
  const setActualMenuOpen = isControlled ? setMenuOpen : setInternalMenuOpen;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 z-[1000] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🌍</div>
            <div>
              <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">EcoMap</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Cuidemos nuestro planeta</p>
            </div>
          </div>

          {/* Menú de acciones (dropdown único) */}
          <div className="relative">
            <button
              onClick={() => setActualMenuOpen(!actualMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              title="Opciones"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline text-sm">Opciones</span>
            </button>

            {actualMenuOpen && (
              <div className="absolute right-0 mt-2 w-72 z-[3000] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                <div className="py-1">
                  <button onClick={() => { if (toggleTheme) toggleTheme(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-yellow-100 dark:hover:bg-yellow-900 text-left">
                    <span>{isDark ? '🌞' : '🌙'}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{isDark ? 'Modo claro' : 'Modo oscuro'}</div>
                      <div className="text-xs text-gray-500">Tema de la aplicación</div>
                    </div>
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch('https://ecomap.saltacoders.com/');
                        const json = await res.text();
                        const ok = storageService.importReports(json);
                        alert(ok ? 'Datos cargados correctamente.' : 'Error al cargar datos.');
                      } catch {
                        alert('No se pudo cargar datos desde el servidor.');
                      }
                      setActualMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 flex items-center gap-3 hover:bg-blue-100 dark:hover:bg-blue-900 text-left"
                  >
                    <span>🔄</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Cargar datos</div>
                      <div className="text-xs text-gray-500">Importar reportes públicos</div>
                    </div>
                  </button>
                  {onToggleWeather && (
                    <button onClick={() => { onToggleWeather(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                      <span>🌦️</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{isWeatherOpen ? 'Ocultar clima' : 'Mostrar clima'}</div>
                        <div className="text-xs text-gray-500">Panel de datos ambientales</div>
                      </div>
                    </button>
                  )}

                  {onToggleEffects && (
                    <button onClick={() => { onToggleEffects(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                      <span>{effectsEnabled ? '🟢' : '⚪'}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{effectsEnabled ? 'Ocultar efectos' : 'Mostrar efectos'}</div>
                        <div className="text-xs text-gray-500">Overlay visual según clima</div>
                      </div>
                    </button>
                  )}

                  <button onClick={() => { onToggleList(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                    <span>🗂️</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Ver reportes</div>
                      <div className="text-xs text-gray-500">Listado de reportes guardados</div>
                    </div>
                  </button>

                  <button onClick={() => { onAddReport(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                    <span>➕</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Crear reporte</div>
                      <div className="text-xs text-gray-500">Agregar con foto y ubicación</div>
                    </div>
                  </button>

                  {toggleTheme && (
                    <button onClick={() => { if (toggleTheme) toggleTheme(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                      <span>{isDark ? '🌞' : '🌙'}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{isDark ? 'Modo claro' : 'Modo oscuro'}</div>
                        <div className="text-xs text-gray-500">Tema de la aplicación</div>
                      </div>
                    </button>
                  )}

                  {onShowHelp && (
                    <button onClick={() => { onShowHelp(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                      <span>❓</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Ayuda y tutorial</div>
                        <div className="text-xs text-gray-500">Cómo usar EcoMap</div>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
