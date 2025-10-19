// Servicio de administración para EcoMap

const API_URL = (typeof window !== 'undefined'
  ? `${window.location.origin}/api.php`
  : 'https://ecomap.saltacoders.com/api.php');

export const adminService = {
  async getUsers() {
    const res = await fetch(`${API_URL}?action=get_users`);
    const data = await res.json().catch(() => ({ users: [] }));
    return data;
  },
  async getPendingReports() {
    const res = await fetch(`${API_URL}?action=get_pending_reports`);
    const data = await res.json().catch(() => ({ reports: [] }));
    return data;
  },
  async approveReport(reportId: string) {
    const fd = new FormData();
    fd.append('action', 'approve_report');
    fd.append('report_id', String(reportId));
    const res = await fetch(API_URL, { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));
    return data;
  }
};
