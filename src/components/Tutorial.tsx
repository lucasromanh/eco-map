import { useState, useEffect } from 'react';

interface TutorialProps {
  onComplete: () => void;
}

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
  position?: 'center' | 'top' | 'bottom';
}

const tutorialSteps: TutorialStep[] = [
  {
    title: '¡Bienvenido a EcoMap! 🌍',
    description: 'Una app colaborativa para visualizar y reportar información ambiental en tu comunidad.',
    icon: '👋',
    position: 'center',
  },
  {
    title: 'Ubicación en Tiempo Real 📍',
    description: 'Permite el acceso a tu ubicación para centrar el mapa en tu posición actual. Si tienes problemas, asegúrate de que el GPS esté activado y que hayas dado permisos al navegador. También puedes hacer clic en cualquier punto del mapa para explorar.',
    icon: '🗺️',
    position: 'center',
  },
  {
    title: 'Datos Ambientales 🌡️',
    description: 'El panel flotante muestra temperatura, humedad, viento e índice UV en tiempo real de tu ubicación.',
    icon: '📊',
    position: 'top',
  },
  {
    title: 'Crear Reportes ➕',
    description: 'Haz clic en "Agregar" o toca cualquier punto del mapa para crear un reporte ambiental con foto.',
    icon: '📝',
    position: 'top',
  },
  {
    title: 'Ver Reportes 📋',
    description: 'Toca el botón de menú (☰) para ver todos los reportes guardados y navegar entre ellos.',
    icon: '📱',
    position: 'top',
  },
  {
    title: 'Street View 📷',
    description: 'Usa el botón de cámara para ver imágenes panorámicas gratuitas de KartaView de tu zona.',
    icon: '🔍',
    position: 'bottom',
  },
  {
    title: 'Vista Satélite 🛰️',
    description: 'Cambia entre vista de mapa y satélite con el botón en la esquina inferior derecha.',
    icon: '🌐',
    position: 'bottom',
  },
  {
    title: 'Modo Oscuro 🌙',
    description: 'Alterna entre modo claro y oscuro con el botón de sol/luna en el header.',
    icon: '✨',
    position: 'top',
  },
  {
    title: '¡Listo para empezar! 🎉',
    description: 'Comienza a explorar y ayuda a cuidar el medio ambiente reportando lo que observes.',
    icon: '💚',
    position: 'center',
  },
];

export const Tutorial = ({ onComplete }: TutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('ecomap_tutorial_seen', 'true');
    onComplete();
  };

  // El control de visibilidad lo maneja App.tsx

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const positionClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-20',
    bottom: 'items-end justify-center pb-20',
  };

  return (
    <div className="fixed inset-0 z-[3000] bg-black bg-opacity-70 backdrop-blur-sm flex transition-all duration-300">
      <div className={`w-full h-full flex ${positionClasses[step.position || 'center']} p-4`}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
          {/* Icono */}
          <div className="text-center mb-4">
            <div className="text-6xl mb-2 animate-bounce">{step.icon}</div>
          </div>

          {/* Contenido */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white dark:text-gray-100 mb-3">
              {step.title}
            </h2>
            <p className="text-white dark:text-gray-400 text-base leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Paso {currentStep + 1} de {tutorialSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 text-white dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                ← Anterior
              </button>
            )}
            
            {currentStep < tutorialSteps.length - 1 ? (
              <>
                <button
                  onClick={handleSkip}
                  className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-white dark:text-gray-400 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Saltar
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                >
                  Siguiente →
                </button>
              </>
            ) : (
              <button
                onClick={handleComplete}
                className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-lg"
              >
                ¡Comenzar! 🚀
              </button>
            )}
          </div>

          {/* Indicadores de puntos */}
          <div className="flex justify-center gap-2 mt-6">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-primary-600 w-6'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook para mostrar tutorial manualmente
export const useTutorial = () => {
  const showTutorial = () => {
    localStorage.removeItem('ecomap_tutorial_seen');
    window.location.reload();
  };

  return { showTutorial };
};
