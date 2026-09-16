import { Pool } from 'pg';

const connectionString = 'postgresql://neondb_owner:npg_ont9XcUaqmV5@ep-winter-pine-acfzkbwc-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // console.log('Executed query', { text, duration, rows: res.rowCount });
  return res;
}

export async function initDb() {
  try {
    // Create personagens table
    await query(`
      CREATE TABLE IF NOT EXISTS personagens (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cargo VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        foto_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create votos table
    await query(`
      CREATE TABLE IF NOT EXISTS votos (
        id SERIAL PRIMARY KEY,
        personagem_id INTEGER NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
        nome_completo VARCHAR(255) NOT NULL,
        telefone VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Database tables verified/created successfully.');
  } catch (error) {
    console.error('Error initializing database tables:', error);
  }
}

export default pool;
