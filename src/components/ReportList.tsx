import type { Report } from '../types';
import { getCategoryInfo } from '../utils/constants';
import { formatDate, truncateText, formatCoordinates } from '../utils/helpers';
import { getUnifiedImageUrl } from '../utils/imageHelpers';
import { userService } from '../services/userService';
import { reportService } from '../services/reportService';
import { useState } from 'react';

interface ReportListProps {
  reports: Report[];
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (report: Report) => void;
  onDeleteReport: (id: string) => void;
  onRefresh?: () => void;
}

export const ReportList = ({
  reports,
  isOpen,
  onClose,
  onSelectReport,
  onDeleteReport,
  onRefresh,
}: ReportListProps) => {
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;

  const sortedReports = [...reports].sort((a, b) => b.timestamp - a.timestamp);

  // Función para eliminar reporte con validación de usuario
  const handleDeleteReport = async (reportId: string) => {
    const user = userService.getProfile();
    if (!user) {
      alert('⚠️ Debes iniciar sesión para eliminar un reporte');
      return;
    }

    const isAdmin = !!localStorage.getItem('adminUser');
    const res = await reportService.deleteReport(String(reportId), String(user.id), isAdmin);

    if (res.ok) {
      alert('✅ Reporte eliminado correctamente');
      onDeleteReport(reportId); // Actualizar UI local
      onRefresh?.(); // Refrescar desde backend
    } else {
      const errorMsg = res.error === 'UNAUTHORIZED_DELETE' 
        ? '❌ Solo puedes eliminar tus propios reportes'
        : '❌ Error al eliminar el reporte';
      alert(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] overflow-hidden">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Panel lateral */}
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-gray-900 shadow-2xl overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 z-10">
          <div className="flex justify-between items-center gap-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-100">
                Reportes
              </h2>
              <p className="text-sm text-gray-400">
                {reports.length} {reports.length === 1 ? 'reporte' : 'reportes'}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={async () => {
                  if (onRefresh) {
                    setLoading(true);
                    try {
                      // 🧹 Limpiar caché del Service Worker antes de refrescar (fix para Safari iOS)
                      if ('caches' in window) {
                        const cacheNames = await caches.keys();
                        await Promise.all(
                          cacheNames.map(cacheName => caches.delete(cacheName))
                        );
                        console.log('🧹 Caché del SW limpiado');
                      }
                      await onRefresh();
                    } finally {
                      setLoading(false);
                    }
                  }
                }}
                disabled={loading || !onRefresh}
                className={`px-2 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                title="Refrescar reportes (limpia caché)"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 01-8 8z" />
                  </svg>
                )}
                Refrescar
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Lista de reportes */}
        <div className="p-4 space-y-3">
          {sortedReports.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌍</div>
              <p className="text-gray-400">
                No hay reportes aún
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                ¡Sé el primero en agregar uno!
              </p>
            </div>
          ) : (
            sortedReports.map((report) => {
              const categoryInfo = getCategoryInfo(report.category);
              
              return (
                <div
                  key={report.id}
                  className="card hover:shadow-lg cursor-pointer transition-all duration-200"
                  onClick={() => {
                    onSelectReport(report);
                    onClose();
                  }}
                >
                  {/* Imagen si existe */}
                  {report.imageUrl && (
                    <img
                      src={getUnifiedImageUrl(report.imageUrl)}
                      alt={report.title}
                      crossOrigin="anonymous"
                      className="w-full h-32 object-cover rounded-lg mb-3"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        console.warn('❌ Error cargando imagen:', target.src);

                        const newHost = 'https://srv882-files.hstgr.io/ad0821ef897e0cb5/files/public_html/ecomap';
                        const oldHost = 'https://ecomap.saltacoders.com';

                        if (!target.dataset.fallbackAttempted) {
                          target.dataset.fallbackAttempted = 'true';
                          if (target.src.includes('srv882-files')) {
                            target.src = target.src.replace(newHost, oldHost);
                          } else {
                            target.src = target.src.replace(oldHost, newHost);
                          }
                        } else {
                          target.style.display = 'none';
                        }
                      }}
                    />
                  )}

                  {/* Contenido */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xl">{categoryInfo?.icon}</span>
                        <h3 className="font-semibold text-gray-100">
                          {report.title}
                        </h3>
                      </div>
                      
                      <p className="text-sm text-gray-400 mb-2">
                        {truncateText(report.description, 100)}
                      </p>

                      <div className="flex items-center space-x-2 flex-wrap">
                        <span
                          className="text-xs px-2 py-1 rounded font-medium"
                          style={{
                            backgroundColor: categoryInfo?.color + '20',
                            color: categoryInfo?.color,
                          }}
                        >
                          {categoryInfo?.label}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(report.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        📍 {formatCoordinates(report.latitude, report.longitude)}
                      </p>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('¿Estás seguro de eliminar este reporte?')) {
                          handleDeleteReport(report.id);
                        }
                      }}
                      className="ml-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Eliminar reporte"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
