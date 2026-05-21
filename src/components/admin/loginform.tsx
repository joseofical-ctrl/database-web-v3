import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function LoginForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Escuchar el evento personalizado desde Astro para abrir el modal
  useEffect(() => {
    setIsMounted(true);
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-login-modal', handleOpen);
    
    return () => window.removeEventListener('open-login-modal', handleOpen);
  }, []);

  // Bloquear el scroll de la página de fondo cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // Limpiar campos al cerrar
      setUsuario('');
      setPassword('');
      setError('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setError('');
    
    // URL directa de tu backend en Railway
    const API_URL = 'https://database-backend-production-bcf7.up.railway.app';
    
    try {
      const respuesta = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: usuario, password: password })
      });
      
      const data = await respuesta.json();
      
      if (respuesta.ok && data.success) {
        window.location.href = '/admin/dashboard';
      } else {
        setError(data.mensaje || 'Credenciales incorrectas.');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  // Si no está montado o no está abierto, no renderiza nada
  if (!isMounted || !isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050A18]/95 backdrop-blur-md p-4 sm:p-6"
      style={{ overscrollBehavior: 'none' }}
    >
      <style>{`
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>

      <form onSubmit={handleSubmit} className="animate-scale-in relative bg-[#0a142c] p-10 rounded-[2.5rem] border border-white/5 shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Botón de cerrar (X) */}
        <button 
          type="button"
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-gray-500 hover:text-red-400 bg-white/5 hover:bg-red-400/10 p-2.5 rounded-full transition-all z-20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        {/* Efecto decorativo de luz */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-upla-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <h2 className="text-3xl font-black text-white mb-8 text-center uppercase tracking-[0.2em] relative z-10 mt-2">Acceso Admin</h2>
        
        {error && (
          <div className="relative z-10 bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-6 text-xs text-center font-bold uppercase tracking-widest animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-6 relative z-10">
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Usuario / Código</label>
            <input 
              type="text" 
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              className="w-full bg-[#050A18] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-upla-accent focus:ring-1 focus:ring-upla-accent transition-all duration-300 font-medium"
              placeholder="Ingrese su código..."
              required
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Contraseña</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#050A18] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-upla-accent focus:ring-1 focus:ring-upla-accent transition-all duration-300 font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={cargando}
            className="w-full bg-gradient-to-r from-upla-primary to-blue-600 hover:from-upla-accent hover:to-blue-500 text-white font-black py-4 rounded-2xl tracking-[0.2em] uppercase text-xs transition-all duration-300 mt-6 shadow-xl hover:shadow-upla-accent/20 disabled:opacity-50"
          >
            {cargando ? 'VALIDANDO...' : 'Ingresar al sistema'}
          </button>
        </div>
      </form>
    </div>
  );

  return createPortal(modalContent, document.body);
}