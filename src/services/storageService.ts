import type { Report } from '../types';

const STORAGE_KEY = 'ecomap_reports';
const EXPIRATION_MONTHS = 9;
const MS_PER_MONTH = 30 * 24 * 60 * 60 * 1000;

export const storageService = {
  /**
   * Obtiene todos los reportes almacenados
   */
  getReports(): Report[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      const now = Date.now();
      // Los reportes se guardan con campo _ts
      let reports: any[] = JSON.parse(data);
      // Filtrar reportes expirados
      reports = reports.filter(r => !r._ts || (now - r._ts) < EXPIRATION_MONTHS * MS_PER_MONTH);
      // Si hubo expirados, actualizar storage
      if (reports.length !== JSON.parse(data).length) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
      }
      return reports;
    } catch (error) {
      console.error('Error reading reports from storage:', error);
      return [];
    }
  },

  /**
   * Guarda un nuevo reporte
   */
  saveReport(report: Report): void {
    try {
      const reports = this.getReports();
      // Guardar timestamp de creación
      reports.push({ ...report, _ts: Date.now() });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
    }
  },
  /**
   * Exporta todos los reportes como JSON
   */
  exportReports(): string {
    const reports = this.getReports();
    return JSON.stringify(reports, null, 2);
  },

  /**
   * Importa reportes desde un JSON
   */
  importReports(json: string): boolean {
    try {
      const imported = JSON.parse(json);
      if (!Array.isArray(imported)) return false;
      // Filtrar duplicados por id
      const current = this.getReports();
      const ids = new Set(current.map(r => r.id));
      const merged = [...current];
      imported.forEach((r: any) => {
        if (r.id && !ids.has(r.id)) {
          merged.push({ ...r, _ts: r._ts || Date.now() });
        }
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Actualiza un reporte existente
   */
  updateReport(id: string, updates: Partial<Report>): void {
    try {
      const reports = this.getReports();
      const index = reports.findIndex((r) => r.id === id);
      if (index !== -1) {
        reports[index] = { ...reports[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
      }
    } catch (error) {
      console.error('Error updating report:', error);
      throw error;
    }
  },

  /**
   * Elimina un reporte
   */
  deleteReport(id: string): void {
    try {
      const reports = this.getReports();
      const filtered = reports.filter((r) => r.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting report:', error);
      throw error;
    }
  },

  /**
   * Obtiene reportes filtrados por categoría
   */
  getReportsByCategory(category: string): Report[] {
    const reports = this.getReports();
    return reports.filter((r) => r.category === category);
  },

  /**
   * Obtiene reportes cerca de una ubicación
   */
  getNearbyReports(
    latitude: number,
    longitude: number,
    radiusKm: number = 5
  ): Report[] {
    const reports = this.getReports();
    return reports.filter((report) => {
      const distance = this.calculateDistance(
        latitude,
        longitude,
        report.latitude,
        report.longitude
      );
      return distance <= radiusKm;
    });
  },

  /**
   * Calcula la distancia entre dos puntos en kilómetros usando la fórmula de Haversine
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  /**
   * Limpia todos los reportes
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  },
};
