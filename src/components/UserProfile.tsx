import { useEffect, useState, useRef } from 'react';
import type { UserProfile as IUserProfile } from '../types';
import { userService } from '../services/userService';
import { fileToBase64 } from '../utils/helpers';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfile = ({ isOpen, onClose }: Props) => {
  const [profile, setProfile] = useState<IUserProfile | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const p = userService.getProfile();
    setProfile(p || {
      id: crypto.randomUUID(),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      age: undefined,
      avatarUrl: '',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: 'active',
    });
  }, [isOpen]);

  const save = async () => {
    if (!profile) return;
    if (!profile.firstName.trim() || !profile.lastName.trim() || !profile.email.trim()) {
      alert('Nombre, apellido y email son obligatorios');
      return;
    }
    setSaving(true);
    try {
      userService.saveProfile({ ...profile, updatedAt: Date.now() });
      alert('Perfil guardado');
      onClose();
    } finally { setSaving(false); }
  };

  const pickAvatar = () => fileRef.current?.click();
  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const b64 = await fileToBase64(f);
    setProfile((p) => p ? { ...p, avatarUrl: b64 } : p);
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 z-[3000] overflow-y-auto">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 animate-slide-up">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Perfil de usuario</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✖</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 flex items-center gap-4">
              <img src={profile.avatarUrl || 'https://via.placeholder.com/96?text=Foto'} alt="avatar" className="w-16 h-16 rounded-full object-cover border" />
              <div>
                <button onClick={pickAvatar} className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg">Cambiar foto</button>
                <input type="file" accept="image/*" ref={fileRef} onChange={onAvatarChange} className="hidden" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
              <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={profile.firstName} onChange={(e)=>setProfile({...profile, firstName:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido *</label>
              <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={profile.lastName} onChange={(e)=>setProfile({...profile, lastName:e.target.value})} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
              <input type="email" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={profile.email} onChange={(e)=>setProfile({...profile, email:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
              <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={profile.phone || ''} onChange={(e)=>setProfile({...profile, phone:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Edad</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={profile.age || ''} onChange={(e)=>setProfile({...profile, age: Number(e.target.value) || undefined})} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección</label>
              <input className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100" value={profile.address || ''} onChange={(e)=>setProfile({...profile, address:e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={save} disabled={saving} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-60">{saving ? 'Guardando...' : 'Guardar'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
