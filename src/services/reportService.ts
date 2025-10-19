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
      const res = await fetch(`${API_URL}?action=get_points`);
      const data = await res.json();

      let puntos = [];
      if (Array.isArray(data.puntos)) puntos = data.puntos;
      else if (Array.isArray(data.points)) puntos = data.points;
      else if (Array.isArray(data)) puntos = data;

      // 🔁 Reescribir URLs de imágenes si son relativas o con dominio viejo
      const HOST_URL = 'https://srv882-files.hstgr.io/ad0821ef897e0cb5/files/public_html/ecomap';
    interface PuntoRaw {
      imagen?: string;
      [key: string]: any;
    }

    interface PuntoProcessed extends PuntoRaw {
      imagen?: string;
    }

    puntos = (puntos as PuntoRaw[]).map((p): PuntoProcessed => ({
      ...p,
      imagen:
        p.imagen && !p.imagen.startsWith(HOST_URL)
        ? p.imagen.replace('https://ecomap.saltacoders.com', HOST_URL)
        : p.imagen,
    }));

      console.log('📥 Reportes procesados:', puntos.length);
      return puntos;
    } catch (err) {
      console.error('❌ Error al obtener puntos:', err);
      return [];
    }
  },
};
