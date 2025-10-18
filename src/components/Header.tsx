import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { storageService } from '../services/storageService';

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
  isDark?: boolean;
  toggleTheme?: () => void;
}

export const Header = ({ onAddReport, onToggleList, onShowHelp, onShowTutorial, onToggleWeather, isWeatherOpen, onToggleEffects, effectsEnabled, menuOpen, setMenuOpen, isDark, toggleTheme }: HeaderProps) => {
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
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


                  {typeof onShowTutorial === 'function' && (
                    <button onClick={() => { onShowTutorial(); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-green-100 dark:hover:bg-green-900 text-left">
                      <span>📚</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">Tutorial</div>
                        <div className="text-xs text-gray-500">Tarjetas de uso</div>
                      </div>
                    </button>
                  )}
                  <button onClick={() => { setShowHelp(true); setActualMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-blue-100 dark:hover:bg-blue-900 text-left">
                    <span>❓</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Ayuda</div>
                      <div className="text-xs text-gray-500">Contacto y soporte</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Modal de Ayuda */}
      {showHelp && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-[90vw] max-w-sm relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onClick={() => setShowHelp(false)} title="Cerrar">
              ✖
            </button>
            <h2 className="text-lg font-bold mb-2 text-blue-700 dark:text-blue-300">Contacto del desarrollador</h2>
            <div className="mb-2">
              <div className="font-semibold">Lucas Roman</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Software Developer</div>
            </div>
            <div className="mb-4">
              <a href="mailto:lucas@saltacoders.com" className="text-blue-600 dark:text-blue-400 underline break-all" target="_blank" rel="noopener noreferrer">
                lucas@saltacoders.com
              </a>
            </div>
            <div className="text-xs text-gray-500">¿Dudas, sugerencias o problemas? ¡Contáctame!</div>
          </div>
        </div>
      )}
    </header>
  );
};
