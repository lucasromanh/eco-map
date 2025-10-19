import { useEffect } from 'react';
import type { UserLocation } from '../types';

interface StreetViewProps {
  location: UserLocation | null;
  isOpen: boolean;
  onClose: () => void;
}

export const StreetView = ({ location, isOpen, onClose }: StreetViewProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !location) return null;

  const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&location=${location.latitude},${location.longitude}&heading=0&pitch=0&fov=90`;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[1500] bg-white dark:bg-gray-800 shadow-2xl border-t-4 border-primary-500 transition-all duration-300 ease-in-out" style={{ height: '50vh', maxHeight: '500px' }}>
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-500 text-white">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📸</span>
          <div>
            <h3 className="font-bold text-lg">Street View</h3>
            <p className="text-xs opacity-90">Vista de calle - Google Maps</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors" title="Cerrar">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="w-full h-[calc(100%-60px)]">
        <iframe src={streetViewUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Google Street View" />
      </div>
    </div>
  );
};
