// Servicio de administración para EcoMap
// ======================================
// Autor: Lucas Román / 2025
// Gestión centralizada de administradores, usuarios y reportes
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

export const adminService = {
  /** 🔐 Iniciar sesión de administrador (usa tabla `administradores`) */
  async login(usuario: string, password: string): Promise<AdminLoginResponse> {
    try {
      const body = JSON.stringify({ usuario, password });
      const res = await fetch(`${API_URL}?action=admin_login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      const data = await res.json();

      if (data.ok && data.admin) {
        // Guardar sesión local
        localStorage.setItem('adminUser', JSON.stringify(data.admin));
      }
      return data;
    } catch {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  },

  /** 🚪 Cerrar sesión de administrador */
  logout() {
    localStorage.removeItem('adminUser');
  },

  /** 👤 Obtener el administrador actual desde localStorage */
  getCurrentAdmin() {
    const stored = localStorage.getItem('adminUser');
    return stored ? JSON.parse(stored) : null;
  },

  /** 📋 Obtener todos los usuarios registrados (con foto de perfil) */
  async getUsers() {
    try {
      const res = await fetch(`${API_URL}?action=get_users`);
      const data = await res.json();
      return data.ok && Array.isArray(data.usuarios) ? data.usuarios : [];
    } catch {
      return [];
    }
  },

  /** 🌎 Obtener reportes pendientes (solo los no aprobados) */
  async getPendingReports() {
    try {
      const res = await fetch(`${API_URL}?action=get_points&admin=1`);
      const data = await res.json();
      return data.ok && Array.isArray(data.puntos)
        ? data.puntos.filter((p: any) => String(p.aprobado) !== '1')
        : [];
    } catch {
      return [];
    }
  },

  /** ✅ Aprobar un reporte */
  async approveReport(id: string) {
    try {
      const form = new FormData();
      form.append('id', id);
      const res = await fetch(`${API_URL}?action=approve_point`, {
        method: 'POST',
        body: form
      });
      return await res.json();
    } catch {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  },

  /** ❌ Eliminar un reporte */
  async deleteReport(id: string) {
    try {
      const form = new FormData();
      form.append('id', id);
      const res = await fetch(`${API_URL}?action=delete_point`, {
        method: 'POST',
        body: form
      });
      return await res.json();
    } catch {
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  }
};
