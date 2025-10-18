import type { Report } from '../types';

const STORAGE_KEY = 'ecomap_reports';

export const storageService = {
  /**
   * Obtiene todos los reportes almacenados
   */
  getReports(): Report[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
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
      reports.push(report);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (error) {
      console.error('Error saving report:', error);
      throw error;
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
