import type { UserProfile, AdminAccount, Report } from '../types';

const USER_KEY = 'ecomap_user_profile_v1';
const DEVICE_ID_KEY = 'ecomap_device_id_v1';
const ADMINS_KEY = 'ecomap_admins_v1';

// Generar un ID único para el dispositivo (se genera una sola vez)
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
      return raw ? JSON.parse(raw) as UserProfile : null;
    } catch { return null; }
  },
  saveProfile(profile: UserProfile) {
    // Asegurar que el perfil tenga el deviceId del dispositivo actual
    const deviceId = this.getDeviceId();
    const profileWithDevice = { ...profile, deviceId };
    localStorage.setItem(USER_KEY, JSON.stringify(profileWithDevice));
  },
  updateProfile(updates: Partial<UserProfile>) {
    const cur = this.getProfile();
    if (!cur) return;
    const next: UserProfile = { ...cur, ...updates, updatedAt: Date.now() } as UserProfile;
    this.saveProfile(next);
  },
  clearProfile() { localStorage.removeItem(USER_KEY); },
  // Verificar si hay un perfil guardado
  hasProfile(): boolean {
    return this.getProfile() !== null;
  },
};

export const adminService = {
  // Simple auth temporal (reemplazar con backend)
  login(username: string, password: string): boolean {
    if (username === 'lucasromanh' && password === 'catalinaromanteamo') {
      const list = this.getAdmins();
      if (!list.find(a => a.username === username)) {
        list.push({ username, createdAt: Date.now() });
        localStorage.setItem(ADMINS_KEY, JSON.stringify(list));
      }
      localStorage.setItem('ecomap_admin_logged', username);
      return true;
    }
    return false;
  },
  logout() { localStorage.removeItem('ecomap_admin_logged'); },
  current(): string | null { return localStorage.getItem('ecomap_admin_logged'); },
  getAdmins(): AdminAccount[] {
    try { return JSON.parse(localStorage.getItem(ADMINS_KEY) || '[]'); } catch { return []; }
  },
  addAdmin(username: string) {
    const list = this.getAdmins();
    if (!list.find(a => a.username === username)) {
      list.push({ username, createdAt: Date.now() });
      localStorage.setItem(ADMINS_KEY, JSON.stringify(list));
    }
  },
  removeAdmin(username: string) {
    const list = this.getAdmins().filter(a => a.username !== username);
    localStorage.setItem(ADMINS_KEY, JSON.stringify(list));
  },
};

// utilidades para moderar (placeholder hasta backend)
export const moderationService = {
  listReports(): Report[] {
    try { return JSON.parse(localStorage.getItem('ecomap_reports') || '[]'); } catch { return []; }
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
