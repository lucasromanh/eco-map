// Servicio de administración para EcoMap
// ======================================
// Autor: Lucas Román / 2025
// Gestión centralizada de administradores, usuarios y reportes
// Compatible con backend PHP actualizado (333 líneas)
// ======================================

const API_URL = 'https://ecomap.saltacoders.com/api.php';

interface AdminLoginResponse {
  ok: boolean;
  admin?: {
    id: number;
    nombre: string;
    usuario: string;
    email: string;
    rol: string;
  };
  error?: string;
}

interface APIResponse {
  ok: boolean;
  error?: string;
  [key: string]: any;
}

export const adminService = {
  /** 🔐 Iniciar sesión de administrador (usa tabla `administradores`) */
  async login(usuario: string, password: string): Promise<AdminLoginResponse> {
    try {
      const body = JSON.stringify({ usuario, password });
      const res = await fetch(`${API_URL}?action=admin_login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      const data = await res.json();

      if (data.ok && data.admin) {
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
      }
      return data;
    } catch (error) {
      console.error('Error en login:', error);
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  },

  /** 🚪 Cerrar sesión de administrador */
  logout() {
    localStorage.removeItem('adminUser');
  },

  /** 👤 Obtener el administrador actual desde localStorage */
  getCurrentAdmin() {
    try {
      const stored = localStorage.getItem('adminUser');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  /** 📋 Obtener todos los usuarios registrados (con foto de perfil) */
  async getUsers() {
    try {
      const res = await fetch(`${API_URL}?action=get_users`);
      const data = await res.json();
      if (data.ok && Array.isArray(data.usuarios)) {
        return data.usuarios;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return [];
    }
  },

  /** 🌍 Obtener TODOS los reportes (aprobados + pendientes, solo admin) */
  async getAllReports() {
    try {
      const res = await fetch(`${API_URL}?action=get_points&admin=1`);
      const data = await res.json();
      return data.ok && Array.isArray(data.puntos) ? data.puntos : [];
    } catch (error) {
      console.error('Error al obtener reportes:', error);
      return [];
    }
  },

  /** 🕓 Obtener reportes pendientes (no aprobados) */
  async getPendingReports() {
    try {
      const res = await fetch(`${API_URL}?action=get_pending_reports`);
      const data = await res.json();
      console.log('📥 Reportes pendientes recibidos:', data);
      if (data.ok && Array.isArray(data.puntos)) {
        console.log('🖼️ URLs de imágenes:', data.puntos.map((p: any) => p.imagen));
        return data.puntos;
      }
      return [];
    } catch (error) {
      console.error('Error al obtener reportes pendientes:', error);
      return [];
    }
  },

  /** ✅ Obtener reportes aprobados */
  async getApprovedReports() {
    try {
      const res = await fetch(`${API_URL}?action=get_approved_reports`);
      const data = await res.json();
      return data.ok && Array.isArray(data.puntos)
        ? data.puntos
        : [];
    } catch (error) {
      console.error('Error al obtener reportes aprobados:', error);
      return [];
    }
  },

  /** 🟢 Aprobar un reporte */
  async approveReport(id: string): Promise<APIResponse> {
    try {
      const form = new FormData();
      form.append('id', id);
      const res = await fetch(`${API_URL}?action=approve_point`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error al aprobar reporte:', error);
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  },

  /** 🔴 Eliminar un reporte */
  async deleteReport(id: string): Promise<APIResponse> {
    try {
      const form = new FormData();
      form.append('id', id);
      const res = await fetch(`${API_URL}?action=delete_point`, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error al eliminar reporte:', error);
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  },

  /** ♻️ Sincronizar cambios (útil para AdminPanel) */
  async refreshReports() {
    const [pending, approved] = await Promise.all([
      this.getPendingReports(),
      this.getApprovedReports(),
    ]);
    return {
      pending,
      approved,
      total: [...pending, ...approved],
    };
  },
};
