// Servicio de administración para EcoMap

const BASE_URL = window.location.origin;

export const adminService = {
  async getUsers() {
    const res = await fetch(`${BASE_URL}/usuarios.php?action=list`);
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  },
  async getPendingReports() {
    const res = await fetch(`${BASE_URL}/puntos.php?action=list_pending`);
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  },
  async approveReport(reportId: string) {
    const fd = new FormData();
    fd.append('action', 'approve');
    fd.append('id', String(reportId));
    const res = await fetch(`${BASE_URL}/puntos.php`, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    return data;
  },
  async deleteReport(reportId: string) {
    const fd = new FormData();
    fd.append('action', 'delete');
    fd.append('id', String(reportId));
    const res = await fetch(`${BASE_URL}/puntos.php`, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    return data;
  }
};
