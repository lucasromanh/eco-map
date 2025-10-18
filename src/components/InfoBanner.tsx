import { useState, useEffect } from 'react';

export const InfoBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    localStorage.setItem('ecomap_info_banner_seen', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[2000] max-w-2xl w-full px-4 animate-slide-down">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-5 relative border-4 border-primary-500">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl leading-none"
        >
          ×
        </button>
        
        <div className="pr-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-3 rounded-lg mb-4 -mx-2 -mt-2">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <span className="text-2xl">💡</span>
              ¿Cómo usar EcoMap?
            </h3>
          </div>
          
          <div className="space-y-3 text-sm">
            <div className="flex gap-3 items-start bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <span className="text-2xl">🌡️</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Panel derecho = Datos Ambientales AUTOMÁTICOS</p>
                <p className="text-gray-700 dark:text-gray-300 text-xs">
                  Temperatura, humedad, viento y UV en tiempo real de tu zona (API gratuita)
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <span className="text-2xl">📝</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Botón "Reportar" = TÚ creas reportes con fotos</p>
                <p className="text-gray-700 dark:text-gray-300 text-xs">
                  Para reportar basura, contaminación, zonas verdes, etc. con tu cámara
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <span className="text-2xl">📷</span>
              <div>
                <p className="font-semibold text-gray-900 dark:text-gray-100">Street View = Ver fotos panorámicas 360°</p>
                <p className="text-gray-700 dark:text-gray-300 text-xs">
                  Botón inferior izquierdo, imágenes gratuitas de KartaView (puede no haber en todas las zonas)
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="mt-4 w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            ¡Entendido! 👍
          </button>
        </div>
      </div>
    </div>
  );
};
