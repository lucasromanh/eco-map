import type { UserProfile, AdminAccount, Report } from '../types';

const USER_KEY = 'ecomap_user_profile_v1';
const ADMINS_KEY = 'ecomap_admins_v1';

export const userService = {
  getProfile(): UserProfile | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) as UserProfile : null;
    } catch { return null; }
  },
  saveProfile(profile: UserProfile) {
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
  },
  updateProfile(updates: Partial<UserProfile>) {
    const cur = this.getProfile();
    if (!cur) return;
    const next: UserProfile = { ...cur, ...updates, updatedAt: Date.now() } as UserProfile;
    this.saveProfile(next);
  },
  clearProfile() { localStorage.removeItem(USER_KEY); },
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
