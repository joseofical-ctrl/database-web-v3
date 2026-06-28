import type { APIRoute } from 'astro';
import { pool } from '../../../lib/db';
import { v2 as cloudinary } from 'cloudinary';

// Asegúrate de tener estas variables en tu archivo .env
cloudinary.config({
  cloud_name: import.meta.env.CLOUDINARY_CLOUD_NAME,
  api_key: import.meta.env.CLOUDINARY_API_KEY,
  api_secret: import.meta.env.CLOUDINARY_API_SECRET,
});

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    
    const unidadSemana = formData.get('unidad_semana') as string;
    const titulo = formData.get('titulo') as string;
    const enlaces = formData.get('enlaces') as string || '';
    const archivos = formData.getAll('archivos') as File[];

    if (archivos.length === 0 && !enlaces) {
      return new Response(JSON.stringify({ success: false, mensaje: 'Debes incluir un archivo o un enlace.' }), { status: 400 });
    }

    let urlFinalArchivo = null;
    let pesoTotalMb = null;

    // LÓGICA DE SUBIDA FÍSICA A CLOUDINARY
    if (archivos.length > 0 && archivos[0].size > 0) {
      const file = archivos[0];
      pesoTotalMb = parseFloat((file.size / (1024 * 1024)).toFixed(2));
      
      // Convertimos el archivo a Buffer (es como Cloudinary lo lee desde Astro)
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Subimos usando un Stream de datos
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'trabajos_upla' }, 
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      }) as any;

      urlFinalArchivo = uploadResult.secure_url; // ¡Esta es la URL que va a tu Base de Datos!
    }

    // GUARDAR LOS TEXTOS Y LA URL EN POSTGRESQL (Supabase)
    const query = `
      INSERT INTO entregas (unidad_semana, titulo, enlaces, nombre_archivo, peso_mb, fecha_subida) 
      VALUES ($1, $2, $3, $4, $5, NOW())
    `;
    
    await pool.query(query, [unidadSemana, titulo, enlaces, urlFinalArchivo, pesoTotalMb]);
    
    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (e: any) {
    console.error("Error en subida:", e);
    return new Response(JSON.stringify({ success: false, mensaje: e.message }), { status: 500 });
  }
};