import { useState } from 'react';

// Replicamos tu estructura de unidades y semanas
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
  const [archivos, setArchivos] = useState<FileList | null>(null);
  const [estado, setEstado] = useState<'idle' | 'subiendo' | 'exito' | 'error'>('idle');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!unidad || !semana || !archivos || archivos.length === 0) {
      setMensaje('Por favor, completa todos los campos requeridos.');
      setEstado('error');
      return;
    }

    setEstado('subiendo');
    setMensaje('Subiendo archivos a Cloudinary y guardando en Base de Datos...');

    // Usamos FormData porque estamos enviando archivos físicos
    const formData = new FormData();
    formData.append('week', `${unidad} • Semana ${semana}`);
    formData.append('title', titulo);
    
    // Añadimos todos los archivos seleccionados
    Array.from(archivos).forEach(file => {
      formData.append('archivos', file);
    });

    try {
      // Hacemos la petición a nuestra nueva API de Astro
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setEstado('exito');
        setMensaje('¡Trabajo subido y registrado correctamente!');
        // Limpiamos el formulario
        setTitulo('');
        setArchivos(null);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error: any) {
      setEstado('error');
      setMensaje(error.message || 'Error al conectar con el servidor.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {estado !== 'idle' && (
        <div className={`p-4 rounded-md text-sm font-bold ${
          estado === 'exito' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 
          estado === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 
          'bg-upla-accent/20 text-upla-accent border border-upla-accent/50 animate-pulse'
        }`}>
          {mensaje}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Selector de Unidad */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Unidad</label>
          <select 
            value={unidad} 
            onChange={(e) => {
              setUnidad(e.target.value);
              setSemana(''); // Resetea la semana al cambiar de unidad
            }}
            className="w-full bg-[#050A18] border border-upla-primary/30 rounded px-4 py-3 text-white focus:outline-none focus:border-upla-accent"
            required
          >
            <option value="" disabled>Selecciona la Unidad</option>
            {Object.keys(semanasPorUnidad).map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>

        {/* Selector de Semana */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Semana</label>
          <select 
            value={semana} 
            onChange={(e) => setSemana(e.target.value)}
            disabled={!unidad}
            className="w-full bg-[#050A18] border border-upla-primary/30 rounded px-4 py-3 text-white focus:outline-none focus:border-upla-accent disabled:opacity-50"
            required
          >
            <option value="" disabled>Selecciona la Semana</option>
            {unidad && semanasPorUnidad[unidad].map(num => (
              <option key={num} value={num}>Semana {num}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Título del Trabajo</label>
        <input 
          type="text" 
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Ej: Normalización de Base de Datos"
          className="w-full bg-[#050A18] border border-upla-primary/30 rounded px-4 py-3 text-white focus:outline-none focus:border-upla-accent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Archivos (Imágenes, PDFs, SQL)</label>
        <div className="border-2 border-dashed border-upla-primary/40 rounded-lg p-6 text-center hover:border-upla-accent transition-colors bg-[#050A18]/50">
          <input 
            type="file" 
            multiple 
            onChange={(e) => setArchivos(e.target.files)}
            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-upla-primary file:text-white hover:file:bg-upla-accent cursor-pointer"
            required
          />
          {archivos && (
            <p className="mt-3 text-xs text-upla-accent font-bold">
              {archivos.length} archivo(s) seleccionado(s)
            </p>
          )}
        </div>
      </div>

      <button 
        type="submit" 
        disabled={estado === 'subiendo'}
        className="w-full bg-upla-primary hover:bg-upla-accent text-white font-bold py-4 rounded tracking-wider transition-colors disabled:opacity-50 mt-4"
      >
        {estado === 'subiendo' ? 'PROCESANDO CARGA...' : 'SUBIR TRABAJO'}
      </button>
    </form>
  );
}