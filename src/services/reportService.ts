// Servicio para manejar reportes con el backend

const API_URL = (typeof window !== 'undefined'
  ? `${window.location.origin}/api.php`
  : 'https://ecomap.saltacoders.com/api.php');

export interface ReportBackend {
  usuario_id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  lat: number;
  lng: number;
  imagen?: File;
}

export const reportService = {
  /**
   * Crear reporte con imagen → /uploads/reportes/
   */
  async addReport(r: ReportBackend) {
    const fd = new FormData();
    fd.append('action', 'add_point');
    fd.append('usuario_id', String(r.usuario_id));
    fd.append('tipo', r.tipo);
    fd.append('titulo', r.titulo);
    fd.append('descripcion', r.descripcion);
    fd.append('lat', String(r.lat));
    fd.append('lng', String(r.lng));
    if (r.imagen) fd.append('imagen', r.imagen);

    console.log('📤 Enviando reporte al backend...');
    const res = await fetch(API_URL, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    console.log('📥 Respuesta del backend:', data);
    return data; // { ok: true, file: 'https://.../uploads/reportes/xxx.jpg' }
  },

  /**
   * Obtener puntos aprobados
   */
  async getApprovedPoints() {
    console.log('📡 Obteniendo reportes aprobados...');
    try {
      const res = await fetch(`${API_URL}?action=get_points`, {
        method: 'GET',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      console.log('📥 Reportes recibidos:', data);

      if (Array.isArray(data.puntos)) return data.puntos;
      if (Array.isArray(data.points)) return data.points;
      if (Array.isArray(data)) return data;

      console.warn('⚠️ Formato inesperado en getApprovedPoints:', data);
      return [];
    } catch (err) {
      console.error('❌ Error al obtener puntos:', err);
      return [];
    }
  },

  /**
   * 🗑️ Eliminar un reporte
   * - Solo puede eliminarlo su autor (usuario_id)
   * - Los administradores pueden eliminar cualquiera si pasan admin=1
   */
  async deleteReport(reportId: string, usuarioId: string, isAdmin: boolean = false) {
    console.log(`🗑️ Eliminando reporte #${reportId} por usuario ${usuarioId}...`);
    const fd = new FormData();
    fd.append('action', 'delete_point');
    fd.append('id', reportId);
    fd.append('usuario_id', usuarioId);
    if (isAdmin) fd.append('admin', '1');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      console.log('📥 Respuesta del backend:', data);

      if (!data.ok) {
        console.warn('⚠️ No se pudo eliminar el reporte:', data.error || 'Error desconocido');
      }

      return data;
    } catch (err) {
      console.error('❌ Error eliminando reporte:', err);
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  },
};
