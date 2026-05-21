import pkg from 'pg';
const { Pool } = pkg;

// Configuración de la conexión a PostgreSQL en Railway
export const pool = new Pool({
  connectionString: import.meta.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para Railway
  }
});

// Función de prueba para verificar que la conexión funciona
export async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa a la base de datos:', res.rows[0]);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a la base de datos:', error);
    return false;
  }
}