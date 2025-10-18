import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

interface HeaderProps {
  onAddReport: () => void;
  onToggleList: () => void;
  onShowHelp?: () => void;
  onToggleWeather?: () => void;
  isWeatherOpen?: boolean;
  onToggleEffects?: () => void;
  effectsEnabled?: boolean;
}

export const Header = ({ onAddReport, onToggleList, onShowHelp, onToggleWeather, isWeatherOpen, onToggleEffects, effectsEnabled }: HeaderProps) => {
  const { isDark, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

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
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              title="Opciones"
            >
              <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span className="hidden sm:inline text-sm">Opciones</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-72 z-[1100] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                <div className="py-1">
                  {onToggleWeather && (
                    <button onClick={() => { onToggleWeather(); setMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                      <span>🌦️</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{isWeatherOpen ? 'Ocultar clima' : 'Mostrar clima'}</div>
                        <div className="text-xs text-gray-500">Panel de datos ambientales</div>
                      </div>
                    </button>
                  )}

                  {onToggleEffects && (
                    <button onClick={() => { onToggleEffects(); setMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                      <span>{effectsEnabled ? '🟢' : '⚪'}</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{effectsEnabled ? 'Ocultar efectos' : 'Mostrar efectos'}</div>
                        <div className="text-xs text-gray-500">Overlay visual según clima</div>
                      </div>
                    </button>
                  )}

                  <button onClick={() => { onToggleList(); setMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                    <span>🗂️</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Ver reportes</div>
                      <div className="text-xs text-gray-500">Listado de reportes guardados</div>
                    </div>
                  </button>

                  <button onClick={() => { onAddReport(); setMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                    <span>➕</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">Crear reporte</div>
                      <div className="text-xs text-gray-500">Agregar con foto y ubicación</div>
                    </div>
                  </button>

                  <button onClick={() => { toggleTheme(); setMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
                    <span>{isDark ? '🌞' : '🌙'}</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{isDark ? 'Modo claro' : 'Modo oscuro'}</div>
                      <div className="text-xs text-gray-500">Tema de la aplicación</div>
                    </div>
                  </button>

                  {onShowHelp && (
                    <button onClick={() => { onShowHelp(); setMenuOpen(false); }} className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-700 text-left">
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
