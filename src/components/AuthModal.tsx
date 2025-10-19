import { useState } from 'react';
import { authService } from '../services/authService';
import type { AuthUser } from '../services/authService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: AuthUser) => void;
}

export const AuthModal = ({ isOpen, onClose, onLogin }: Props) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '', telefono: '', direccion: '', edad: '', password: '', password2: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    const res = await authService.login(form.email, form.password);
    setLoading(false);
    if (res.ok && res.user) {
      authService.saveSession(res.user);
      onLogin(res.user);
      onClose();
    } else {
      setError('Email o contraseña incorrectos');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true); setError('');
    const res = await authService.register({
      nombre: form.nombre,
      apellido: form.apellido,
      email: form.email,
      telefono: form.telefono,
      direccion: form.direccion,
      edad: form.edad ? Number(form.edad) : undefined,
      password: form.password,
    });
    setLoading(false);
    if (res.ok) {
      setIsRegister(false);
      setError('¡Registrado! Ahora inicia sesión con tu email y contraseña.');
    } else {
      setError('Error al registrar usuario');
    }
  };

  return (
    <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 w-[90vw] max-w-sm relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" onClick={onClose} title="Cerrar">✖</button>
        <h2 className="text-lg font-bold mb-2 text-blue-700 dark:text-blue-300">{isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
        <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-3">
          {isRegister && (
            <>
              <input name="nombre" placeholder="Nombre" value={form.nombre} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              <input name="apellido" placeholder="Apellido" value={form.apellido} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" required />
              <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <input name="edad" placeholder="Edad" value={form.edad} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" type="number" min={0} />
            </>
          )}
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" required type="email" />
          <input name="password" placeholder="Contraseña" value={form.password} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" required type="password" />
          {isRegister && (
            <input name="password2" placeholder="Repetir contraseña" value={form.password2} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" required type="password" />
          )}
          <button type="submit" className="w-full py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-60" disabled={loading}>{loading ? 'Procesando...' : (isRegister ? 'Registrarme' : 'Entrar')}</button>
        </form>
        <div className="mt-3 text-xs text-center text-gray-500 dark:text-gray-400">
          {isRegister ? (
            <>
              ¿Ya tienes cuenta?{' '}
              <button className="underline" onClick={() => { setIsRegister(false); setError(''); }}>Inicia sesión</button>
            </>
          ) : (
            <>
              ¿No tienes cuenta?{' '}
              <button className="underline" onClick={() => { setIsRegister(true); setError(''); }}>Regístrate</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
