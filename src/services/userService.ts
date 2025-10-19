import type { UserProfile, AdminAccount, Report } from '../types';

const USER_KEY = 'ecomap_user_profile_v1';
const DEVICE_ID_KEY = 'ecomap_device_id_v1';
const ADMINS_KEY = 'ecomap_admins_v1';

// 🌐 URL de la API - Detecta automáticamente si estás en local o producción
const API_URL = (typeof window !== 'undefined'
  ? `${window.location.origin}/api.php`
  : 'https://ecomap.saltacoders.com/api.php');

// Detectar si estamos en desarrollo local
const IS_DEVELOPMENT = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

console.log(`🌍 Modo: ${IS_DEVELOPMENT ? 'DESARROLLO' : 'PRODUCCIÓN'}`);
console.log(`📡 API URL: ${API_URL}`);

// Generar un ID único para el dispositivo (una sola vez)
function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export const userService = {
  getDeviceId(): string {
    return getOrCreateDeviceId();
  },

  getProfile(): UserProfile | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  },

  saveProfile(profile: UserProfile) {
    const deviceId = this.getDeviceId();
    const profileWithDevice = { ...profile, deviceId };
    localStorage.setItem(USER_KEY, JSON.stringify(profileWithDevice));
    window.dispatchEvent(new CustomEvent('ecomap_profile_updated'));
  },

  updateProfile(updates: Partial<UserProfile>) {
    const cur = this.getProfile();
    if (!cur) return;
    const next: UserProfile = { ...cur, ...updates, updatedAt: Date.now() } as UserProfile;
    this.saveProfile(next);
  },

  clearProfile() {
    localStorage.removeItem(USER_KEY);
  },

  hasProfile(): boolean {
    return this.getProfile() !== null;
  },

  // 🔄 Sincronizar datos del backend con el perfil local
  syncFromAuthUser(authUser: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    telefono?: string;
    direccion?: string;
    edad?: number;
    foto_perfil?: string;
  }) {
    console.log('🔄 Sincronizando perfil desde backend:', authUser);
    const existing = this.getProfile();
    const profile: UserProfile = {
      id: authUser.id,
      firstName: authUser.nombre,
      lastName: authUser.apellido,
      email: authUser.email,
      phone: authUser.telefono || existing?.phone || '',
      address: authUser.direccion || existing?.address || '',
      age: authUser.edad || existing?.age,
      avatarUrl: authUser.foto_perfil || existing?.avatarUrl || '',
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      status: 'active',
    };
    console.log('💾 Guardando perfil local:', profile);
    this.saveProfile(profile);
  },

  /* ==================== 🌐 BACKEND METHODS ==================== */

  /** 📤 Subir foto de perfil al backend */
  async uploadProfileImage(userId: number, file: File) {
    // 🧪 Modo desarrollo: Solo simular en local
    if (IS_DEVELOPMENT) {
      console.log('🧪 [DEV] Simulando subida de imagen de perfil...');
      const fakeUrl = URL.createObjectURL(file);
      this.updateProfile({ avatarUrl: fakeUrl });
      return { 
        ok: true, 
        url: fakeUrl,
        message: '✅ [DEV] Imagen cargada localmente'
      };
    }

    // 🌐 Modo producción: Subir al servidor
    const form = new FormData();
    form.append('action', 'upload_profile_image');
    form.append('usuario_id', String(userId));
    form.append('imagen', file);

    try {
      console.log('📤 Subiendo imagen de perfil al servidor...');
      const res = await fetch(API_URL, {
        method: 'POST',
        body: form,
      });
      const data = await res.json();
      console.log('📥 Respuesta del servidor:', data);
      
      if (data.ok && data.url) {
        // Actualiza el perfil local con la nueva URL
        this.updateProfile({ avatarUrl: data.url });
      }
      return data;
    } catch (err) {
      console.error('❌ Error al subir imagen de perfil:', err);
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  },

  /** 📝 Actualizar datos del usuario en la base de datos */
  async updateUserProfile(userId: number, updates: Partial<UserProfile>) {
    // 🧪 Modo desarrollo: Solo actualizar local
    if (IS_DEVELOPMENT) {
      console.log('🧪 [DEV] Simulando actualización de perfil...');
      this.updateProfile(updates);
      return { 
        ok: true, 
        user: this.getProfile(),
        message: '✅ [DEV] Perfil actualizado localmente'
      };
    }

    // 🌐 Modo producción: Sincronizar con el servidor
    const body = {
      id: userId,
      nombre: updates.firstName,
      apellido: updates.lastName,
      email: updates.email,
      telefono: updates.phone,
      direccion: updates.address,
      edad: updates.age,
    };

    try {
      console.log('📤 Actualizando perfil en el servidor...');
      const res = await fetch(`${API_URL}?action=update_user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log('📥 Respuesta del servidor:', data);
      
      if (data.ok && data.user) {
        // Sincroniza perfil local actualizado
        this.syncFromAuthUser(data.user);
      }
      return data;
    } catch (err) {
      console.error('❌ Error al actualizar usuario:', err);
      return { ok: false, error: 'NETWORK_ERROR' };
    }
  },
};

/* ============================================================
   👮 ADMIN SERVICE
   En desarrollo: Login local con credenciales hardcoded
   En producción: Se conecta al backend real
   ============================================================ */
export const adminService = {
  login(username: string, password: string): boolean {
    // 🧪 Modo desarrollo: Login local sin backend
    if (IS_DEVELOPMENT) {
      console.log('🧪 [DEV] Login de admin local');
      if (username === 'lucasromanh' && password === 'catalinaromanteamo') {
        const list = this.getAdmins();
        if (!list.find((a) => a.username === username)) {
          list.push({ username, createdAt: Date.now() });
          localStorage.setItem(ADMINS_KEY, JSON.stringify(list));
        }
        localStorage.setItem('ecomap_admin_logged', username);
        return true;
      }
      return false;
    }

    // 🌐 Modo producción: Usar adminService real (importado desde adminService.ts)
    console.log('⚠️ En producción, usa adminService.login() del archivo adminService.ts');
    // Por ahora, permitir login local también en producción para pruebas
    if (username === 'lucasromanh' && password === 'catalinaromanteamo') {
      localStorage.setItem('ecomap_admin_logged', username);
      return true;
    }
    return false;
  },
  
  logout() {
    localStorage.removeItem('ecomap_admin_logged');
  },
  
  current(): string | null {
    return localStorage.getItem('ecomap_admin_logged');
  },
  
  getAdmins(): AdminAccount[] {
    try {
      return JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]');
    } catch {
      return [];
    }
  },
  
  addAdmin(username: string) {
    const list = this.getAdmins();
    if (!list.find((a) => a.username === username)) {
      list.push({ username, createdAt: Date.now() });
      localStorage.setItem(ADMINS_KEY, JSON.stringify(list));
    }
  },
  
  removeAdmin(username: string) {
    const list = this.getAdmins().filter((a) => a.username !== username);
    localStorage.setItem(ADMINS_KEY, JSON.stringify(list));
  },
};

/* ============================================================
   🧹 MODERACIÓN LOCAL
   En desarrollo: Usa localStorage
   En producción: Podría conectarse al backend
   ============================================================ */
export const moderationService = {
  listReports(): Report[] {
    try {
      return JSON.parse(localStorage.getItem('ecomap_reports') || '[]');
    } catch {
      return [];
    }
  },
  
  deleteReport(id: string) {
    try {
      const list = JSON.parse(localStorage.getItem('ecomap_reports') || '[]');
      const filtered = list.filter((r: Report) => r.id !== id);
      localStorage.setItem('ecomap_reports', JSON.stringify(filtered));
      window.dispatchEvent(new StorageEvent('storage', { key: 'ecomap_reports' }));
    } catch {}
  },
};
