import { useState, useEffect } from 'react';
import type { UserLocation } from '../types';
import { kartaViewService } from '../services/streetViewService';

interface StreetViewProps {
  location: UserLocation | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StreetImage {
  id: string;
  lat: number;
  lng: number;
  sequenceId: string;
  sequenceIndex: number;
  thumbUrl: string;
}

export const StreetView = ({ location, isOpen, onClose }: StreetViewProps) => {
  const [images, setImages] = useState<StreetImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<StreetImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [radius, setRadius] = useState(100);

  useEffect(() => {
    if (isOpen && location) {
      loadImages();
    }
  }, [isOpen, location, radius]);

  const loadImages = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const response = await kartaViewService.searchImages(
        location.latitude,
        location.longitude,
        radius
      );

      const processedImages: StreetImage[] = (response.currentPageItems || [])
        .slice(0, 20)
        .map((item: any) => ({
          id: item.id || item.sequence_id + '_' + item.sequence_index,
          lat: item.lat,
          lng: item.lng,
          sequenceId: item.sequence_id,
          sequenceIndex: item.sequence_index || 0,
          thumbUrl: item.th_name 
            ? `https://kartaview.org/files/photo/${item.th_name}`
            : 'https://via.placeholder.com/400x300?text=No+Image',
        }));

      setImages(processedImages);
      
      if (processedImages.length > 0) {
        setSelectedImage(processedImages[0]);
      }
    } catch (error) {
      // Error silencioso
    } finally {
      setLoading(false);
    }
  };

  const openInKartaView = (image: StreetImage) => {
    const url = kartaViewService.getViewerUrl(image.sequenceId, image.sequenceIndex);
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] overflow-hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-4 md:inset-10 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Vista de Calle (Street View)
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Imágenes 360° de KartaView • Cobertura limitada según zona
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Radio de búsqueda:
            </label>
            <input
              type="range"
              min="50"
              max="500"
              step="50"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {radius}m
            </span>
            <button
              onClick={loadImages}
              disabled={loading}
              className="btn-primary"
            >
              🔄 Buscar
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col md:flex-row h-[calc(100%-140px)]">
          {/* Main viewer */}
          <div className="flex-1 bg-gray-900 relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Buscando imágenes cercanas...</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Radio: {radius}m • KartaView (gratuito)
                  </p>
                </div>
              </div>
            ) : images.length === 0 ? (
              <div className="absolute inset-0 flex flex-col">
                {/* Mapillary integrado */}
                <iframe
                  src={
                    location
                      ? `https://www.mapillary.com/embed?map_style=Mapillary%20streets&image_key=&x=${location.longitude}&y=${location.latitude}&z=17&style=photo`
                      : `https://www.mapillary.com/embed?map_style=Mapillary%20streets&image_key=&x=-58.3816&y=-34.6037&z=17&style=photo`
                  }
                  className="w-full h-full border-0"
                  allowFullScreen
                  title="Mapillary Street View"
                />
                
                {/* Info flotante arriba */}
                <div className="absolute top-4 left-4 right-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🌍</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        Vista de Calle (Mapillary)
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Plataforma gratuita • Click en las fotos para navegar
                      </p>
                    </div>
                    <button
                      onClick={loadImages}
                      className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-medium transition-colors"
                    >
                      🔍 Buscar KartaView
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={selectedImage?.thumbUrl}
                  alt="Street view"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x600?text=Imagen+no+disponible';
                  }}
                />
                {selectedImage && (
                  <button
                    onClick={() => openInKartaView(selectedImage)}
                    className="absolute bottom-4 right-4 btn-primary"
                  >
                    Ver en KartaView 🔗
                  </button>
                )}
              </>
            )}
          </div>

          {/* Thumbnail list */}
          {images.length > 0 && (
            <div className="w-full md:w-64 bg-gray-100 dark:bg-gray-900 overflow-y-auto p-2 space-y-2">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 px-2">
                {images.length} imágenes encontradas
              </p>
              {images.map((image) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImage(image)}
                  className={`w-full rounded-lg overflow-hidden transition-all ${
                    selectedImage?.id === image.id
                      ? 'ring-2 ring-primary-500 shadow-lg'
                      : 'hover:ring-2 hover:ring-gray-300'
                  }`}
                >
                  <img
                    src={image.thumbUrl}
                    alt={`Thumbnail ${image.id}`}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x150?text=No+Image';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        {!loading && images.length === 0 && (
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              💡 <strong>Tip:</strong> KartaView es una plataforma comunitaria gratuita. 
              Si no hay imágenes en tu zona, ¡puedes contribuir subiendo tus propias fotos!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
