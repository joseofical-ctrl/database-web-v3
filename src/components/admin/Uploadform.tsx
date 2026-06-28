import { useState } from 'react';

const semanasPorUnidad: Record<string, number[]> = {
  "Unidad I": [1, 2, 3, 4],
  "Unidad II": [5, 6, 7, 8],
  "Unidad III": [9, 10, 11, 12],
  "Unidad IV": [13, 14, 15, 16]
};

export default function UploadForm() {
  const [unidad, setUnidad] = useState('');
  const [semana, setSemana] = useState('');
  const [titulo, setTitulo] = useState('');
  const [enlaces, setEnlaces] = useState(''); // Estado para el input de texto
  const [archivos, setArchivos] = useState<FileList | null>(null);
  const [estado, setEstado] = useState<'idle' | 'subiendo' | 'exito' | 'error'>('idle');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Validamos que al menos haya archivos o enlaces
    if (!unidad || !semana || (!archivos && !enlaces)) {
      setMensaje('Completa al menos la unidad, semana y archivos o enlaces.');
      setEstado('error');
      return;
    }

    setEstado('subiendo');
    setMensaje('Procesando datos...');

    const formData = new FormData();
    formData.append('unidad_semana', `${unidad} • Semana ${semana}`);
    formData.append('titulo', titulo);
    formData.append('enlaces', enlaces); // Enviamos el string al API
    
    if (archivos) {
      Array.from(archivos).forEach(file => {
        formData.append('archivos', file);
      });
    }

    try {
      const res = await fetch('/api/trabajos/crear', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setEstado('exito');
        setMensaje('¡Registro creado con éxito!');
        setTitulo('');
        setEnlaces('');
        setArchivos(null);
      } else {
        throw new Error(data.mensaje || 'Error al guardar');
      }
    } catch (error: any) {
      setEstado('error');
      setMensaje(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ... (Tu UI de mensajes de estado se mantiene igual) ... */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Unidad</label>
          <select value={unidad} onChange={(e) => {setUnidad(e.target.value); setSemana('');}} className="w-full bg-[#050A18] border border-upla-primary/30 rounded px-4 py-3 text-white" required>
            <option value="" disabled>Selecciona la Unidad</option>
            {Object.keys(semanasPorUnidad).map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Semana</label>
          <select value={semana} onChange={(e) => setSemana(e.target.value)} disabled={!unidad} className="w-full bg-[#050A18] border border-upla-primary/30 rounded px-4 py-3 text-white" required>
            <option value="" disabled>Selecciona la Semana</option>
            {unidad && semanasPorUnidad[unidad].map(num => <option key={num} value={num}>Semana {num}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Título</label>
        <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-full bg-[#050A18] border border-upla-primary/30 rounded px-4 py-3 text-white" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Enlaces Web (opcional)</label>
        <input type="url" value={enlaces} onChange={(e) => setEnlaces(e.target.value)} placeholder="https://github.com/..." className="w-full bg-[#050A18] border border-upla-primary/30 rounded px-4 py-3 text-white" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Archivos</label>
        <input type="file" multiple onChange={(e) => setArchivos(e.target.files)} className="w-full text-sm text-gray-400 file:bg-upla-primary file:text-white cursor-pointer" />
      </div>

      <button type="submit" disabled={estado === 'subiendo'} className="w-full bg-upla-primary hover:bg-upla-accent text-white font-bold py-4 rounded transition-colors">
        {estado === 'subiendo' ? 'PROCESANDO...' : 'SUBIR TRABAJO'}
      </button>
    </form>
  );
}