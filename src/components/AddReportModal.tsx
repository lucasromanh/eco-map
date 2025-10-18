import { useState, useRef, useEffect } from 'react';
import type { Report, ReportCategory, UserLocation } from '../types';
import { REPORT_CATEGORIES } from '../utils/constants';
import { generateId, compressImage, fileToBase64 } from '../utils/helpers';

interface AddReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: Report) => void;
  userLocation: UserLocation | null;
  initialLocation?: { lat: number; lng: number };
}

export const AddReportModal = ({
  isOpen,
  onClose,
  onSave,
  userLocation,
  initialLocation,
}: AddReportModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('otro');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  // Inputs separados para galería (sin capture) y cámara (con capture)
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(
    initialLocation
      ? { lat: initialLocation.lat, lng: initialLocation.lng }
      : userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : null
  );

  // Actualizar la ubicación si el usuario hace click en el mapa mientras el modal está abierto
  useEffect(() => {
    if (initialLocation && typeof initialLocation.lat === 'number' && typeof initialLocation.lng === 'number') {
      setLocation({ lat: initialLocation.lat, lng: initialLocation.lng });
    }
  }, [initialLocation?.lat, initialLocation?.lng]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setIsLoadingImage(false);
      return;
    }

    setIsLoadingImage(true);
    try {
      // Comprimir imagen
      const compressed = await compressImage(file);
      
      // Crear preview
      const preview = await fileToBase64(compressed);
      setImagePreview(preview);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error al procesar la imagen');
    } finally {
      setIsLoadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!location) {
      alert('⚠️ UBICACIÓN REQUERIDA\n\nNo se pudo obtener tu ubicación. Para crear un reporte debes:\n\n1. Permitir el acceso a la ubicación en tu navegador\n2. O hacer clic en un punto del mapa para seleccionar la ubicación manualmente\n\nLa ubicación es necesaria para registrar dónde ocurre el problema ambiental.');
      return;
    }

    setIsLoading(true);

    try {
      const report: Report = {
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        category,
        latitude: location.lat,
        longitude: location.lng,
        imageUrl: imagePreview || undefined,
        timestamp: Date.now(),
      };

      onSave(report);
      handleClose();
    } catch (error) {
      console.error('Error saving report:', error);
      alert('Error al guardar el reporte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setCategory('otro');
    setImagePreview('');
    onClose();
  };

  const triggerGalleryInput = () => {
    setIsLoadingImage(true);
    galleryInputRef.current?.click();
  };

  const takePicture = () => {
    // Abrir directamente la cámara usando el input con capture
    setIsLoadingImage(true);
    cameraInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
  <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Nuevo Reporte
            </h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 dark:hover:text-gray-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Ej: Basural en esquina de..."
                required
                maxLength={100}
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {REPORT_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-lg border-2 transition-all ${
                      category === cat.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-lg mb-0.5">{cat.icon}</div>
                    <div className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                      {cat.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-vertical"
                rows={4}
                placeholder="Describe lo que observaste..."
                required
                maxLength={1000}
                style={{ minHeight: 48, maxHeight: 180 }}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description.length}/500 caracteres
              </p>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Imagen (opcional)
              </label>
              {isLoadingImage && (
                <div className="mb-2 text-xs text-white bg-blue-500 dark:bg-blue-600 p-2 rounded flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Cargando imagen, por favor espera...</span>
                </div>
              )}
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={triggerGalleryInput}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Galería</span>
                </button>
                <button
                  type="button"
                  onClick={takePicture}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Cámara</span>
                </button>
              </div>
              {/* Input para galería (sin capture) */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              {/* Input para cámara (con capture) */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
              {imagePreview && (
                <div className="mt-2 relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Ubicación */}
            {location ? (
              <div className="text-xs text-white bg-green-600 dark:bg-green-700 p-3 rounded-lg">
                <div className="font-semibold mb-1">✅ Ubicación confirmada</div>
                <div className="flex items-start gap-2">
                  <span>📍</span>
                  <div>
                    <div>{location.lat.toFixed(5)}°, {location.lng.toFixed(5)}°</div>
                    <div className="text-[10px] mt-1 opacity-90">
                      {initialLocation ? 'Punto seleccionado en el mapa' : 'Tu ubicación actual (GPS)'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs text-white bg-orange-600 dark:bg-orange-700 p-3 rounded-lg">
                <div className="font-semibold mb-1">⚠️ Ubicación requerida</div>
                <div className="text-[10px] opacity-90">
                  Permite el acceso a tu ubicación o haz clic en un punto del mapa para seleccionar dónde ocurre el problema.
                </div>
                <button
                  type="button"
                  className="mt-3 bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 text-sm font-semibold shadow"
                  onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition(
                        (position) => {
                          // Actualiza el estado local de ubicación
                          setLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                          });
                        },
                        () => {
                          alert('No se pudo obtener la ubicación actual. Verifica los permisos.');
                        }
                      );
                    } else {
                      alert('La geolocalización no está soportada en este dispositivo.');
                    }
                  }}
                >
                  Usar mi ubicación actual
                </button>
              </div>
            )}

            {/* Botones */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading || !location}
              >
                {isLoading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
