import type { APIRoute } from 'astro';
import { pool } from '../../lib/db';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { codigo, password } = await request.json();

    // Consulta exacta a la tabla de usuarios de tu base de datos
    const query = 'SELECT * FROM usuarios WHERE codigo_usuario = $1';
    const result = await pool.query(query, [codigo]);

    // Si el usuario no existe en PostgreSQL
    if (result.rows.length === 0) {
      return new Response(
        JSON.stringify({ success: false, mensaje: 'El código de usuario no está registrado.' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const usuario = result.rows[0];

    // Validación de la contraseña (siguiendo la lógica directa de tu backend anterior)
    if (usuario.password !== password) {
      return new Response(
        JSON.stringify({ success: false, mensaje: 'La contraseña introducida es incorrecta.' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Autenticación exitosa
    return new Response(
      JSON.stringify({ success: true, mensaje: 'Autenticación exitosa.' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error en el endpoint de login:', error);
    return new Response(
      JSON.stringify({ success: false, mensaje: 'Error interno en el servidor de Base de Datos.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};