import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DocumentViewerProps {
  urlsString: string | null;
}

export default function DocumentViewer({ urlsString }: DocumentViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [imagenesVisibles, setImagenesVisibles] = useState<string[]>([]);

  useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setImagenesVisibles([]); 
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!urlsString) return null;

  const urls = urlsString.split(',').map(url => url.trim()).filter(url => url !== '');
  
  const getExtension = (url: string) => url.split('.').pop()?.toLowerCase() || '';
  const getFileName = (url: string) => url.split('/').pop() || 'archivo';

  const toggleImagen = (url: string) => {
    setImagenesVisibles(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]              
    );
  };

  const forzarDescarga = async (url: string, nombreArchivo: string) => {
    try {
      const response = await fetch(url);
      const blobUrl = window.URL.createObjectURL(await response.blob());
      const a = document.createElement('a');
      a.href = blobUrl; 
      a.download = nombreArchivo;
      document.body.appendChild(a); 
      a.click();
      a.remove(); 
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) { 
      alert('Error de red al intentar descargar el archivo.'); 
    }
  };

  const modalContent = (
    // 1. EL FONDO OSCURO: Es un bloque de 100vh que habilita el scroll general.
    // Usamos onWheel y onTouchMove para evitar que GSAP mueva la página principal.
    <div 
        className="fixed inset-0 z-[9999] bg-[#050A18]/90 backdrop-blur-sm overflow-y-auto custom-scroll"
        style={{ overscrollBehavior: 'none' }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
      <style>{`
        /* Scrollbar pegado al extremo derecho de la pantalla */
        ::-webkit-scrollbar { width: 10px; }
        ::-webkit-scrollbar-track { background: rgba(5, 10, 24, 0.9); }
        ::-webkit-scrollbar-thumb { background: rgba(0, 180, 216, 0.4); border-radius: 10px; border: 2px solid #050A18; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0, 180, 216, 0.8); }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>
      
      {/* 2. CONTENEDOR DE ESPACIADO: Reemplaza a "flex items-center" para evitar bugs de corte. 
          Da márgenes arriba y abajo, centrando horizontalmente con mx-auto */}
      <div className="min-h-full w-full py-10 px-4 flex flex-col justify-center items-center">
        
        {/* 3. LA CAJA DEL MODAL: Crece orgánicamente hacia abajo con su contenido */}
        <div className="mx-auto w-full max-w-4xl bg-[#0a142c] border border-white/10 rounded-3xl shadow-2xl relative h-auto">
          
          {/* Header "Pegajoso": Siempre visible en la parte superior de la pantalla aunque bajes */}
          <div className="sticky top-0 z-50 flex justify-between items-center p-5 sm:p-6 border-b border-white/5 bg-[#0a142c]/95 backdrop-blur-md rounded-t-3xl">
            <h3 className="text-sm font-heading text-gray-400 tracking-[0.3em] uppercase">
              Documentos Registrados
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-red-400 transition-all p-2 bg-white/5 hover:bg-red-400/10 rounded-full w-9 h-9 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {/* Cuerpo de la lista (Sin restricciones de altura, crece de forma natural) */}
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4">
              {urls.map((url, i) => {
                const extension = getExtension(url);
                const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);
                const isPdf = extension === 'pdf';
                const estaVisible = imagenesVisibles.includes(url);
                const nombreCorto = getFileName(url);

                return (
                  <div key={i} className="flex flex-col bg-[#0d1b3e]/40 border border-white/5 p-4 rounded-2xl transition-all">
                    
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className="w-12 h-12 flex items-center justify-center bg-[#050A18] rounded-xl border border-white/5 text-2xl shrink-0">
                          {isImg ? '🖼️' : isPdf ? '📕' : '📄'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-white text-sm font-bold truncate max-w-[200px] md:max-w-xs" title={nombreCorto}>
                            {nombreCorto}
                          </span>
                          <span className="text-[10px] text-gray-500 uppercase tracking-tighter">
                            Formato: {extension}
                          </span>
                        </div>
                      </div>

                      {/* Botones de Acción */}
                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        {isImg && (
                          <>
                            <button 
                              onClick={() => toggleImagen(url)}
                              className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 text-[10px] font-bold uppercase rounded-xl border transition-all ${
                                estaVisible 
                                  ? 'bg-upla-accent text-[#0a142c] border-upla-accent' 
                                  : 'bg-upla-accent/10 text-upla-accent border-upla-accent/20 hover:bg-upla-accent hover:text-[#0a142c]'
                              }`}
                            >
                              {estaVisible ? '👁️ Ocultar' : '👁️ Ver Imagen'}
                            </button>
                            <button 
                              onClick={() => forzarDescarga(url, nombreCorto)}
                              className="flex-1 sm:flex-none flex items-center justify-center px-6 py-2.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-[#0a142c] transition-all"
                            >
                              💾 Descargar
                            </button>
                          </>
                        )}

                        {isPdf && (
                          <a 
                            href={url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto flex items-center justify-center px-8 py-2.5 bg-upla-primary/20 text-white text-[10px] font-bold uppercase rounded-xl border border-upla-primary/30 hover:bg-upla-primary transition-all"
                          >
                            📕 Abrir PDF ↗
                          </a>
                        )}

                        {!isImg && !isPdf && (
                          <button 
                            onClick={() => forzarDescarga(url, nombreCorto)}
                            className="w-full sm:w-auto flex items-center justify-center px-8 py-2.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded-xl border border-emerald-500/20 hover:bg-emerald-500 hover:text-[#0a142c] transition-all"
                          >
                            📦 Descargar Archivo
                          </button>
                        )}
                      </div>
                    </div>

                    {/* IMAGEN: Sin restricciones extrañas, bloque simple que crece naturalmente */}
                    {isImg && estaVisible && (
                      <div className="mt-4 pt-4 border-t border-white/5 animate-fade">
                        <img 
                          src={url} 
                          alt="Vista previa" 
                          className="w-full h-auto block rounded-xl border border-white/10"
                        />
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)} 
        className="flex items-center gap-2 text-white text-[10px] font-bold tracking-[0.2em] uppercase group/btn hover:text-upla-accent transition-all"
      >
        DOCUMENTOS 
        <span className="bg-upla-primary/20 p-1.5 rounded-lg text-upla-accent group-hover:bg-upla-accent group-hover:text-[#0a142c] transition-all">→</span>
      </button>
      {isMounted && isOpen && createPortal(modalContent, document.body)}
    </>
  );
}