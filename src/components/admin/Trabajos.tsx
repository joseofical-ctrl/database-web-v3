import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const SEMANAS_POR_UNIDAD: Record<string, string[]> = {
  'UNIDAD I': ['1', '2', '3', '4'],
  'UNIDAD II': ['5', '6', '7', '8'],
  'UNIDAD III': ['9', '10', '11', '12'],
  'UNIDAD IV': ['13', '14', '15', '16', '17']
};

export default function TrabajoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [cargando, setCargando] = useState(false);
  
  const [unidad, setUnidad] = useState('UNIDAD I');
  const [semana, setSemana] = useState('1');
  const [titulo, setTitulo] = useState('');
  const [enlaceInput, setEnlaceInput] = useState('');
  const [archivos, setArchivos] = useState<FileList | null>(null);

  useEffect(() => {
    setIsMounted(true);
    const handleOpen = () => {
      setUnidad('UNIDAD I'); setSemana('1'); setTitulo(''); setArchivos(null); setEnlaceInput('');
      setIsOpen(true);
    };
    window.addEventListener('open-trabajo-modal', handleOpen);
    return () => window.removeEventListener('open-trabajo-modal', handleOpen);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      const formData = new FormData();
      formData.append('unidad_semana', `${unidad} • Semana ${semana}`);
      formData.append('titulo', titulo);
      formData.append('enlaces', enlaceInput);
      
      if (archivos) {
        Array.from(archivos).forEach((file) => {
          formData.append('archivos', file); // Mismo nombre que busca el backend
        });
      }

      const respuesta = await fetch('/api/trabajos/crear', {
        method: 'POST',
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#050A18]/95 p-4 backdrop-blur-md">
      <form onSubmit={handleSubmit} className="relative bg-[#0a142c] p-8 md:p-10 rounded-[2.5rem] border border-white/5 w-full max-w-xl shadow-2xl">
        <button type="button" onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-red-400 bg-white/5 p-2 rounded-full">✕</button>
        <h2 className="text-2xl text-white mb-6 uppercase font-black tracking-widest">Subir Trabajo</h2>
        
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-[10px] text-gray-500 mb-2 uppercase font-black">Unidad</label>
               <select value={unidad} onChange={e => {setUnidad(e.target.value); setSemana(SEMANAS_POR_UNIDAD[e.target.value][0])}} className="w-full bg-[#050A18] text-white p-4 rounded-xl border border-white/10 outline-none">
                 <option value="UNIDAD I">UNIDAD I</option>
                 <option value="UNIDAD II">UNIDAD II</option>
                 <option value="UNIDAD III">UNIDAD III</option>
                 <option value="UNIDAD IV">UNIDAD IV</option>
               </select>
            </div>
            <div>
               <label className="block text-[10px] text-gray-500 mb-2 uppercase font-black">Semana</label>
               <select value={semana} onChange={e => setSemana(e.target.value)} className="w-full bg-[#050A18] text-white p-4 rounded-xl border border-white/10 outline-none">
                 {SEMANAS_POR_UNIDAD[unidad].map(s => <option key={s} value={s}>Semana {s}</option>)}
               </select>
            </div>
           </div>
           
           <div>
              <label className="block text-[10px] text-gray-500 mb-2 uppercase font-black">Título</label>
              <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Práctica 01..." className="w-full bg-[#050A18] text-white p-4 rounded-xl border border-white/10 outline-none" required />
           </div>
           
           <div>
              <label className="block text-[10px] text-gray-500 mb-2 uppercase font-black">Enlace Web (Opcional)</label>
              <input type="url" value={enlaceInput} onChange={e => setEnlaceInput(e.target.value)} placeholder="https://github.com/..." className="w-full bg-[#050A18] text-white p-4 rounded-xl border border-white/10 outline-none" />
           </div>
           
           <div>
              <label className="block text-[10px] text-gray-500 mb-2 uppercase font-black">Archivo Físico (Opcional)</label>
              <input type="file" onChange={e => setArchivos(e.target.files)} className="w-full text-gray-400 p-4 border border-white/10 rounded-xl bg-white/5 file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:text-white file:px-4 file:py-2 file:text-xs file:font-bold cursor-pointer" />
           </div>

           <button type="submit" disabled={cargando} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-xl mt-6 tracking-widest disabled:opacity-50 transition-all">
             {cargando ? 'SUBIENDO...' : 'GUARDAR REGISTRO'}
           </button>
        </div>
      </form>
    </div>
  , document.body);
}