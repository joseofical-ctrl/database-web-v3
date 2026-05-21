import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

// Diccionario para vincular Unidades con sus respectivas Semanas (Típico silabo de 17 semanas)
const SEMANAS_POR_UNIDAD: Record<string, string[]> = {
  'UNIDAD I': ['1', '2', '3', '4'],
  'UNIDAD II': ['5', '6', '7', '8'],
  'UNIDAD III': ['9', '10', '11', '12'],
  'UNIDAD IV': ['13', '14', '15', '16', '17']
};

export default function TrabajoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [modo, setModo] = useState<'crear' | 'editar'>('crear');
  const [cargando, setCargando] = useState(false);
  
  // Estado del formulario
  const [id, setId] = useState<string | null>(null);
  const [unidad, setUnidad] = useState('UNIDAD I');
  const [semana, setSemana] = useState('1');
  const [titulo, setTitulo] = useState('');
  const [archivos, setArchivos] = useState<FileList | null>(null);
  
  // Estados para la lógica de Edición
  const [archivosActuales, setArchivosActuales] = useState('');
  const [mantenerArchivos, setMantenerArchivos] = useState(true);

  useEffect(() => {
    setIsMounted(true);

    const handleOpen = (event: any) => {
      const { mode, data } = event.detail;
      setModo(mode);
      
      if (mode === 'editar' && data) {
        setId(data.id);
        const semNum = data.semana.replace(/\D/g, ''); 
        
        setUnidad(data.unidad);
        // Validar si la semana de la BD existe en el diccionario, si no, poner la primera de esa unidad
        const semanasValidas = SEMANAS_POR_UNIDAD[data.unidad] || SEMANAS_POR_UNIDAD['UNIDAD I'];
        setSemana(semanasValidas.includes(semNum) ? semNum : semanasValidas[0]);
        
        setTitulo(data.titulo);
        setArchivosActuales(data.archivos); // Mostrar al usuario qué archivos tiene ya cargados
        setMantenerArchivos(true); // Checkbox activado por defecto
      } else {
        // Limpiar para crear nuevo
        setId(null);
        setUnidad('UNIDAD I');
        setSemana('1');
        setTitulo('');
        setArchivos(null);
        setArchivosActuales('');
        setMantenerArchivos(true);
      }
      setIsOpen(true);
    };

    window.addEventListener('open-trabajo-modal', handleOpen);
    return () => window.removeEventListener('open-trabajo-modal', handleOpen);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Manejador dinámico: Cambiar Unidad actualiza automáticamente la Semana
  const handleUnidadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nuevaUnidad = e.target.value;
    setUnidad(nuevaUnidad);
    setSemana(SEMANAS_POR_UNIDAD[nuevaUnidad][0]); 
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      const formData = new FormData();
      if (id) formData.append('id', id);
      formData.append('unidad_semana', `${unidad} • Semana ${semana}`);
      formData.append('titulo', titulo);
      
      // Enviamos el flag de mantener archivos al backend
      formData.append('mantener_archivos', mantenerArchivos ? 'true' : 'false');
      
      if (archivos) {
        Array.from(archivos).forEach((file) => {
          formData.append('archivos', file);
        });
      }

      const endpoint = modo === 'crear' ? '/api/trabajos/crear' : `/api/trabajos/editar/${id}`;
      
      const respuesta = await fetch(endpoint, {
        method: modo === 'crear' ? 'POST' : 'PUT',
        body: formData 
      });
      
      const result = await respuesta.json();
      
      if (respuesta.ok && result.success) {
        setIsOpen(false);
        window.location.reload(); 
      } else {
        alert(result.mensaje || 'Ocurrió un error al guardar.');
      }
    } catch (err) {
      alert('Error de conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  if (!isMounted || !isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050A18]/95 backdrop-blur-md p-4 sm:p-6" style={{ overscrollBehavior: 'none' }}>
      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
      `}</style>

      <form onSubmit={handleSubmit} className="animate-slide-up relative bg-[#0a142c] p-8 md:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl w-full max-w-xl overflow-hidden">
        
        <button type="button" onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-red-400 bg-white/5 hover:bg-red-400/10 p-2.5 rounded-full transition-all z-20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>

        <div className="absolute -top-20 -left-20 w-64 h-64 bg-upla-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <h2 className="text-2xl font-black text-white mb-8 uppercase tracking-[0.2em] relative z-10 flex items-center gap-3">
          <span className="w-2 h-6 bg-upla-accent rounded-full inline-block"></span>
          {modo === 'crear' ? 'Subir Nuevo Trabajo' : 'Editar Registro'}
        </h2>

        <div className="space-y-5 relative z-10">
          
          {/* Fila de Selects Dinámicos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Unidad</label>
              <select 
                value={unidad} 
                onChange={handleUnidadChange} 
                className="w-full bg-[#050A18] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-upla-accent transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="UNIDAD I">UNIDAD I</option>
                <option value="UNIDAD II">UNIDAD II</option>
                <option value="UNIDAD III">UNIDAD III</option>
                <option value="UNIDAD IV">UNIDAD IV</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Semana</label>
              <select 
                value={semana} 
                onChange={(e) => setSemana(e.target.value)} 
                className="w-full bg-[#050A18] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-upla-accent transition-all font-medium appearance-none cursor-pointer"
              >
                {SEMANAS_POR_UNIDAD[unidad].map((sem) => (
                    <option key={sem} value={sem}>Semana {sem}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Título del Trabajo</label>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Práctica de Normalización..." className="w-full bg-[#050A18] border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-upla-accent transition-all font-medium" required />
          </div>

          <div className="bg-[#050A18] p-5 rounded-2xl border border-white/5">
            <label className="block text-[10px] font-black text-gray-500 mb-3 uppercase tracking-[0.2em]">
              {modo === 'editar' ? 'Archivos Adicionales' : 'Archivos (PDF, Imágenes)'}
            </label>
            
            {/* Si estamos en modo editar y hay archivos previos, mostramos el resumen y el Checkbox */}
            {modo === 'editar' && archivosActuales !== 'Sin archivos' && (
              <div className="mb-4 p-3 bg-[#0a142c] rounded-xl border border-white/5">
                <p className="text-[10px] text-gray-400 font-medium mb-2">Ya tienes subido: <span className="text-upla-accent font-bold">{archivosActuales}</span></p>
                <label className="flex items-center gap-2 cursor-pointer group w-fit">
                  <input 
                    type="checkbox" 
                    checked={mantenerArchivos} 
                    onChange={(e) => setMantenerArchivos(e.target.checked)} 
                    className="w-4 h-4 rounded accent-upla-accent cursor-pointer"
                  />
                  <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">
                    Conservar archivos existentes y sumar los nuevos
                  </span>
                </label>
              </div>
            )}

            <input 
              type="file" 
              multiple 
              onChange={(e) => setArchivos(e.target.files)} 
              className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-upla-primary/20 file:text-upla-accent hover:file:bg-upla-primary/30 file:cursor-pointer transition-all font-medium text-xs cursor-pointer" 
              required={modo === 'crear'} 
            />
          </div>

          <button type="submit" disabled={cargando} className="w-full bg-gradient-to-r from-upla-primary to-blue-600 hover:from-upla-accent hover:to-blue-500 text-white font-black py-4 rounded-2xl tracking-[0.2em] uppercase text-xs transition-all mt-6 shadow-xl hover:shadow-upla-accent/20 disabled:opacity-50">
            {cargando ? 'PROCESANDO...' : 'GUARDAR REGISTRO'}
          </button>
        </div>
      </form>
    </div>
  );

  return createPortal(modalContent, document.body);
} 