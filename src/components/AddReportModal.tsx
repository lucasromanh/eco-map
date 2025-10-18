import { useState, useRef } from 'react';
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const location = initialLocation || (userLocation ? {
    lat: userLocation.latitude,
    lng: userLocation.longitude,
  } : null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Comprimir imagen
      const compressed = await compressImage(file);
      
      // Crear preview
      const preview = await fileToBase64(compressed);
      setImagePreview(preview);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error al procesar la imagen');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    if (!location) {
      alert('No se pudo obtener la ubicación. Por favor permite el acceso a la ubicación.');
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

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const takePicture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Aquí podrías implementar un componente de cámara más elaborado
      // Por simplicidad, usaremos el input de archivo que puede acceder a la cámara
      triggerFileInput();
      
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Error accessing camera:', error);
      triggerFileInput();
    }
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
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
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
                className="input-field"
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
                    className={`p-3 rounded-lg border-2 transition-all ${
                      category === cat.id
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
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
                className="input-field"
                rows={3}
                placeholder="Describe lo que observaste..."
                required
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">
                {description.length}/500 caracteres
              </p>
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Imagen (opcional)
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>Galería</span>
                </button>
                <button
                  type="button"
                  onClick={takePicture}
                  className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Cámara</span>
                </button>
              </div>
              <input
                ref={fileInputRef}
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
            {location && (
              <div className="text-xs text-gray-500 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                📍 {location.lat.toFixed(5)}°, {location.lng.toFixed(5)}°
              </div>
            )}

            {/* Botones */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 btn-secondary"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
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
