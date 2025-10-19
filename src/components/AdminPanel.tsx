import { useEffect, useState } from 'react';
import { moderationService, userService } from '../services/userService';
import { adminService as backendAdminService } from '../services/adminService';
import type { Report, UserProfile } from '../types';
import { formatCoordinates } from '../utils/helpers';

interface Props { isOpen: boolean; onClose: () => void; }

type Tab = 'reports' | 'users' | 'admins';

export const AdminPanel = ({ isOpen, onClose }: Props) => {
  const [logged, setLogged] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<Tab>('reports');
  const [reports, setReports] = useState<Report[]>([]);
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  // Admins locales (demo)
  const profile = userService.getProfile();
  const admins = profile ? [{ username: profile.firstName, createdAt: Date.now() }] : [];

  useEffect(() => {
    if (!isOpen) return;
    // Cargar usuarios desde backend
    backendAdminService.getUsers().then(data => {
      if (Array.isArray(data.users)) setAllUsers(data.users);
    });
    // Cargar reportes aprobados y pendientes desde backend
    backendAdminService.getPendingReports().then(data => {
      if (Array.isArray(data.reports)) setPendingReports(data.reports);
    });
    // Cargar reportes locales (demo)
    setReports(moderationService.listReports());
  }, [isOpen]);

  // Aprobar reporte (debe estar fuera del useEffect)
  const approveReport = async (id: string) => {
    const res = await backendAdminService.approveReport(id);
    if (res.ok) {
      alert('Reporte aprobado');
      // Actualizar lista de pendientes
      const data = await backendAdminService.getPendingReports();
      if (Array.isArray(data.reports)) setPendingReports(data.reports);
    } else {
      alert('Error al aprobar el reporte');
    }
  };

  // Fetch addresses for reports
  useEffect(() => {
    if (tab !== 'reports' || reports.length === 0) return;
    reports.forEach(r => {
      if (!addresses[r.id]) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${r.latitude}&lon=${r.longitude}`)
          .then(res => res.json())
          .then(data => {
            setAddresses(prev => ({ ...prev, [r.id]: data.display_name || 'Dirección no disponible' }));
          })
          .catch(() => {
            setAddresses(prev => ({ ...prev, [r.id]: 'Dirección no disponible' }));
          });
      }
    });
  }, [tab, reports, addresses]);

  const onLogin = () => {
    // Demo local, solo cambia estado
    setLogged(username);
    setUsername(''); setPassword('');
  };

  const onLogout = () => { setLogged(null); };

  const deleteReport = (id: string) => {
    moderationService.deleteReport(id);
    setReports(moderationService.listReports());
  };

  // Demo: no se pueden agregar/eliminar admins desde frontend
  const addAdmin = () => alert('Función no disponible en demo');
  const removeAdmin = (u: string) => alert('Función no disponible en demo');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[3500] bg-white dark:bg-gray-800 overflow-y-auto">
      {/* Header fijo */}
      <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Panel de administración</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Gestión y moderación de contenido</p>
          </div>
          <button onClick={onClose} className="px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors">← Volver</button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
          {!logged ? (
            <div className="max-w-md mx-auto mt-12 bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="mb-4 text-center">
                <div className="text-4xl mb-2">🛡️</div>
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Acceso restringido</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Solo para administradores</div>
              </div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Usuario</label>
              <input className="w-full mb-3 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={username} onChange={e=>setUsername(e.target.value)} placeholder="Usuario" />
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
              <input type="password" className="w-full mb-4 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" />
              <button onClick={onLogin} className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors">Ingresar</button>
              <div className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">Demo: lucasromanh / catalinaromanteamo</div>
            </div>
          ) : (
            <div>
              <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                <div className="text-xs text-gray-500 dark:text-gray-400">Sesión: <span className="font-semibold text-gray-700 dark:text-gray-200">{logged}</span></div>
              </div>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex gap-2">
                  <button onClick={()=>setTab('reports')} className={`px-3 py-1.5 text-sm rounded ${tab==='reports'?'bg-primary-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Reportes</button>
                  <button onClick={()=>setTab('users')} className={`px-3 py-1.5 text-sm rounded ${tab==='users'?'bg-primary-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Usuarios</button>
                  <button onClick={()=>setTab('admins')} className={`px-3 py-1.5 text-sm rounded ${tab==='admins'?'bg-primary-600 text-white':'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>Admins</button>
                </div>
                <button onClick={onLogout} className="px-3 py-1.5 text-sm rounded bg-red-600 hover:bg-red-700 text-white transition-colors">Cerrar sesión</button>
              </div>

              {tab==='reports' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  {pendingReports.map(r => {
                    const user = allUsers.find(u => u.id === r.userId);
                    const userName = user ? `${user.firstName} ${user.lastName}` : 'Usuario desconocido';
                    return (
                      <div key={r.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-start justify-between mb-2">
                          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 flex-1">{r.title || 'Reporte'}</div>
                          <button onClick={()=>approveReport(r.id)} className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex-shrink-0">Aprobar</button>
                          <button onClick={()=>deleteReport(r.id)} className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex-shrink-0">Eliminar</button>
                        </div>
                        {r.imageUrl && <img src={r.imageUrl} alt={r.title} className="w-full h-32 object-cover rounded mb-2" />}
                        <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{r.description}</div>
                        <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <span>👤</span>
                            <span className="font-medium">{userName}</span>
                          </div>
                          <div className="flex items-start gap-1">
                            <span className="flex-shrink-0">📍</span>
                            <span className="break-all">{formatCoordinates(r.latitude, r.longitude)}</span>
                          </div>
                          {addresses[r.id] && (
                            <div className="flex items-start gap-1">
                              <span className="flex-shrink-0">🗺️</span>
                              <span className="line-clamp-2">{addresses[r.id]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {pendingReports.length===0 && <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">No hay reportes pendientes.</div>}
                </div>
              )}

              {tab==='users' && (
                <div className="mt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">Usuarios registrados en el sistema</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {allUsers.map(u => (
                      <div key={u.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                        <div className="flex items-start gap-3 mb-3">
                          <img src={u.foto_perfil || u.avatarUrl || 'https://via.placeholder.com/48?text=U'} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{u.nombre || u.firstName} {u.apellido || u.lastName}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{u.email}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{u.telefono || u.phone || 'sin teléfono'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{u.direccion || u.address || ''}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">Edad: {u.edad || u.age || '-'}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">Editar</button>
                          <button className="flex-1 px-2 py-1 text-xs bg-yellow-500 text-white rounded" onClick={()=>alert('Usuario bloqueado (demo)')}>Bloquear</button>
                        </div>
                      </div>
                    ))}
                    {allUsers.length===0 && <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">Sin usuarios.</div>}
                  </div>
                </div>
              )}

              {tab==='admins' && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Administradores ({admins.length})</div>
                    <button onClick={addAdmin} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">+ Agregar admin</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {admins.map(a => (
                      <div key={a.username} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{a.username}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Creado: {new Date(a.createdAt).toLocaleDateString()}</div>
                        </div>
                        <button onClick={()=>removeAdmin(a.username)} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors">Eliminar</button>
                      </div>
                    ))}
                    {admins.length===0 && <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">Sin administradores.</div>}
                  </div>
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
