// Servicio de autenticación y registro de usuario EcoMap (PHP backend)

const API_URL = (typeof window !== 'undefined'
  ? `${window.location.origin}/api.php`
  : 'https://ecomap.saltacoders.com/api.php');

export interface AuthUser {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  direccion?: string;
  edad?: number;
  foto_perfil?: string;
}

export const authService = {
  async register(user: {
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    direccion?: string;
    edad?: number;
    password: string;
  }) {
    const res = await fetch(`${API_URL}?action=register_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    const data = await res.json().catch(() => ({}));
    // Normalizar
    const userObj: AuthUser | undefined = data.user || (data.id ? {
      id: String(data.id),
      nombre: data.nombre || user.nombre,
      apellido: data.apellido || user.apellido,
      email: data.email || user.email,
      telefono: data.telefono,
      direccion: data.direccion,
      edad: data.edad,
      foto_perfil: data.foto_perfil,
    } : undefined);
    return { ok: !!userObj || !!data.ok || !!data.success, user: userObj, raw: data };
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_URL}?action=login_user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    const userObj: AuthUser | undefined = data.user || (data.id || data.user_id ? {
      id: String(data.id || data.user_id),
      nombre: data.nombre || '',
      apellido: data.apellido || '',
      email: data.email || email,
      telefono: data.telefono,
      direccion: data.direccion,
      edad: data.edad,
      foto_perfil: data.foto_perfil,
    } : undefined);
    return { ok: !!userObj || !!data.ok || !!data.success, user: userObj, raw: data };
  },

  saveSession(user: AuthUser) {
    localStorage.setItem('ecomap_user', JSON.stringify(user));
  },
  getSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem('ecomap_user');
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  clearSession() {
    localStorage.removeItem('ecomap_user');
  },

  // Subir foto de perfil al servidor
  async uploadProfileImage(usuarioId: string, file: File) {
    const fd = new FormData();
    fd.append('action', 'upload_profile_image');
    fd.append('usuario_id', String(usuarioId));
    fd.append('imagen', file);

    const res = await fetch(API_URL, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    console.log('📸 Upload profile image response:', data);
    return data; // { ok: true, url: 'https://.../uploads/perfiles/xxx.jpg' }
  },
};
