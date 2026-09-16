const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_ont9XcUaqmV5@ep-winter-pine-acfzkbwc-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Testando conexão com Neon Database...');
    const res = await pool.query('SELECT NOW()');
    console.log('Conectado com sucesso! Horário do banco:', res.rows[0].now);

    // Criar tabelas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS personagens (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cargo VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        foto_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS votos (
        id SERIAL PRIMARY KEY,
        personagem_id INTEGER NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
        nome_completo VARCHAR(255) NOT NULL,
        telefone VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Tabelas verificadas com sucesso!');

    // Inserir dados de teste se a tabela estiver vazia
    const countRes = await pool.query('SELECT COUNT(*) FROM personagens');
    if (parseInt(countRes.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO personagens (nome, cargo, descricao, foto_url) VALUES
        (
          'Carlos Silva',
          'Líder Comunitário',
          '# Defensor da Saúde e Educação\n\nCarlos atua há mais de 15 anos no apoio a comunidades vulneráveis.\n\n### Principais propostas:\n- **Postos de saúde 24h** em todos os bairros.\n- **Iluminação LED** em praças e vias públicas.\n- **Capacitação de jovens** para o mercado de tecnologia.',
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
        ),
        (
          'Mariana Souza',
          'Coordenadora Social',
          '# Compromisso com o Futuro\n\nMariana lidera projetos de sustentabilidade urbana e empreendedorismo feminino.\n\n### Principais propostas:\n- **Hortas comunitárias** nos bairros periféricos.\n- **Crédito acessível** para pequenas empreendedoras.\n- **TRANSPORTE GRATUITO** para estudantes universitários.',
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
        ),
        (
          'Roberto Mendes',
          'Engenheiro Ambiental',
          '# Inovação e Sustentabilidade\n\nRoberto busca transformar a gestão de resíduos e promover energias limpas na cidade.\n\n### Principais metas:\n- Painéis solares em **escolas públicas**.\n- Coleta seletiva em **100% dos bairros**.\n- Criação do **Parque Ecológico Central**.',
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
        )
      `);
      console.log('Personagens de teste inseridos com sucesso!');
    }

  } catch (err) {
    console.error('Erro na conexão:', err);
  } finally {
    await pool.end();
  }
}

main();
