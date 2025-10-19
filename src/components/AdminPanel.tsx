import { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';

interface Props { isOpen: boolean; onClose: () => void; }

type Tab = 'reports' | 'users' | 'admins';

// Acciones demo para administración, disponibles para futuras integraciones
export const adminDemoActions = {
  addAdmin: () => alert('Función no disponible en demo'),
  // @ts-ignore
  removeAdmin: (_u: string) => alert('Función no disponible en demo')
};

export const AdminPanel = ({ isOpen, onClose }: Props) => {
  const [logged, setLogged] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState<Tab>('reports');
  const [pendingReports, setPendingReports] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  // Eliminados estados y variables locales innecesarios

  useEffect(() => {
    if (!isOpen) return;
    // Cargar usuarios y reportes pendientes desde backend
    adminService.getUsers().then(setAllUsers);
    adminService.getPendingReports().then(setPendingReports);
  }, [isOpen]);

  // Aprobar reporte (debe estar fuera del useEffect)
  const approveReport = async (id: string) => {
    const res = await adminService.approveReport(id);
    if (res.ok) {
      alert('Reporte aprobado');
      adminService.getPendingReports().then(setPendingReports);
    } else {
      alert('Error al aprobar el reporte');
    }
  };

  const deleteReport = async (id: string) => {
    const res = await adminService.deleteReport(id);
    if (res.ok) {
      alert('Reporte eliminado');
      adminService.getPendingReports().then(setPendingReports);
    } else {
      alert('Error al eliminar el reporte');
    }
  };

  // Fetch addresses for reports
  // Eliminado efecto de direcciones locales

  const onLogin = () => {
    // Demo local, solo cambia estado
    setLogged(username);
    setUsername(''); setPassword('');
  };

  const onLogout = () => { setLogged(null); };

  // Eliminada función de reportes locales

  // Demo: no se pueden agregar/eliminar admins desde frontend
  // Funciones demo para admins (no usadas pero disponibles para futuro
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const addAdmin = () => alert('Función no disponible en demo');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const removeAdmin = (u: string) => alert('Función no disponible en demo');
  // Demo: objeto de acciones de admin disponible para futuras integraciones
  // Puedes importar y usar adminDemoActions en otros archivos si lo necesitas

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
                  {/* Eliminada pestaña de admins */}
                </div>
                <button onClick={onLogout} className="px-3 py-1.5 text-sm rounded bg-red-600 hover:bg-red-700 text-white transition-colors">Cerrar sesión</button>
              </div>

              {tab==='reports' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                  {pendingReports.map(r => (
                    <div key={r.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 line-clamp-1 flex-1">{r.titulo || 'Reporte'}</div>
                        <button onClick={()=>approveReport(r.id)} className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 flex-shrink-0">Aprobar</button>
                        <button onClick={()=>deleteReport(r.id)} className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 flex-shrink-0">Eliminar</button>
                      </div>
                      <div className="mb-2">
                        <img
                          src={r.imagen && r.imagen !== 'null'
                            ? (r.imagen.startsWith('http') || r.imagen.includes('/uploads/reportes/')
                                ? r.imagen
                                : `/uploads/reportes/${r.imagen}`)
                            : 'https://via.placeholder.com/120x80?text=Sin+foto'}
                          className="w-full h-32 object-cover rounded bg-gray-200 dark:bg-gray-700"
                          alt={r.titulo}
                        />
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">{r.descripcion}</div>
                      <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <span>👤</span>
                          <span className="font-medium">
                            {(() => {
                              const user = allUsers.find(u => String(u.id) === String(r.usuario_id));
                              return user ? `${user.nombre} ${user.apellido}` : r.usuario_id;
                            })()}
                          </span>
                        </div>
                        <div className="flex items-start gap-1">
                          <span className="flex-shrink-0">📍</span>
                          <span className="break-all">{r.lat}, {r.lng}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
                          <img src={u.foto_perfil && u.foto_perfil !== 'null' ? u.foto_perfil : 'https://via.placeholder.com/48?text=U'} className="w-12 h-12 rounded-full object-cover flex-shrink-0 bg-gray-200 dark:bg-gray-700" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">{u.nombre} {u.apellido}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400 truncate">{u.email}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{u.telefono || 'sin teléfono'}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">{u.direccion || ''}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-500">Edad: {u.edad || '-'}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {allUsers.length===0 && <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">Sin usuarios.</div>}
                  </div>
                </div>
              )}

              {/* Eliminado panel de administradores */}
            </div>
          )}
      </div>
    </div>
  );
}
