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
    const res = await fetch(`${API_URL}?action=get_points`);
    const data = await res.json().catch(() => ({ points: [] }));
    console.log('📥 Reportes recibidos:', data);
    return data;
  },
};
