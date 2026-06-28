import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export default function LoginForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setIsMounted(true);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-login-modal', handleOpen);
    return () => window.removeEventListener('open-login-modal', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setUsuario('');
      setPassword('');
      setError('');
      formRef.current?.reset(); 
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    
    // Tu API URL
    const API_URL = 'https://database-backend-production-bcf7.up.railway.app';
    
    try {
      const respuesta = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: usuario, password: password })
      });
      
      const data = await respuesta.json();
      
      if (respuesta.ok && data.success) {
        formRef.current?.reset();
        setUsuario('');
        setPassword('');
        // El secreto para destruir el historial y que "Atrás" no funcione
        window.location.replace('/admin/dashboard');
      } else {
        setError(data.mensaje || 'Credenciales incorrectas.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  if (!isMounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050A18]/95 backdrop-blur-md p-4">
      <form ref={formRef} onSubmit={handleSubmit} className="relative bg-[#0a142c] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl w-full max-w-md">
        <button type="button" onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-red-400 bg-white/5 p-2.5 rounded-full">✕</button>
        <h2 className="text-3xl font-black text-white mb-8 text-center uppercase tracking-[0.2em] mt-2">Acceso Admin</h2>
        
        {error && (
          <div className="bg-red-500/10 text-red-400 p-4 rounded-2xl mb-6 text-xs text-center font-bold uppercase animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Usuario / Código</label>
            <input 
              type="text" 
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full bg-[#050A18] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none"
              placeholder="Ingrese su código..."
              required
              autoComplete="off"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#050A18] border border-white/10 rounded-2xl px-5 py-4 text-white outline-none"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={cargando} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl tracking-[0.2em] uppercase text-xs mt-6 disabled:opacity-50">
            {cargando ? 'VALIDANDO...' : 'Ingresar al sistema'}
          </button>
        </div>
      </form>
    </div>
  , document.body);
}