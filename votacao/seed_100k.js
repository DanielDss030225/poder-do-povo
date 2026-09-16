const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Custom .env / .env.local parser
function loadEnv() {
  const files = ['.env.local', '.env'];
  for (const file of files) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const firstEq = trimmed.indexOf('=');
          if (firstEq !== -1) {
            const key = trimmed.slice(0, firstEq).trim();
            let val = trimmed.slice(firstEq + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  }
}

loadEnv();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Erro: DATABASE_URL não encontrada.');
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Conectando ao banco PostgreSQL Neon...');

    // 1. Garantir que as tabelas existam
    await pool.query(`
      CREATE TABLE IF NOT EXISTS personagens (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cargo VARCHAR(255) NOT NULL,
        descricao TEXT NOT NULL,
        foto_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS votos (
        id SERIAL PRIMARY KEY,
        personagem_id INTEGER NOT NULL REFERENCES personagens(id) ON DELETE CASCADE,
        nome_completo VARCHAR(255) NOT NULL,
        telefone VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Candidatos principais e adicionais
    const candidatosIniciais = [
      {
        nome: 'Flávio Bolsonaro',
        cargo: 'Candidato à Presidência',
        descricao: '# Conservadorismo, Liberdade e Progresso\n\n- Defesa da propriedade privada e segurança pública reforçada.\n- Redução de impostos e desregulamentação econômica.\n- Fortalecimento do agronegócio e inovação.',
        foto_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
      },
      {
        nome: 'Luiz Inácio Lula da Silva',
        cargo: 'Candidato à Presidência',
        descricao: '# Justiça Social, Combate à Fome e Desenvolvimento\n\n- Fortalecimento dos programas sociais e geração de empregos.\n- Investimento em educação pública e saúde universal.\n- Preservação ambiental e cooperação internacional.',
        foto_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
      },
      {
        nome: 'Renan Calheiros',
        cargo: 'Candidato ao Senado',
        descricao: '# Experiência, Diálogo e Defesa do Nordeste\n\n- Atuação no fortalecimento do pacto federativo.\n- Garantia de recursos para infraestrutura e saneamento básico.\n- Defesa dos direitos trabalhistas e reforma tributária justa.',
        foto_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80'
      },
      {
        nome: 'Mariana Souza',
        cargo: 'Candidata à Câmara dos Deputados',
        descricao: '# Sustentabilidade Urbana e Empreendedorismo\n\n- Incentivo a hortas comunitárias e reciclagem.\n- Microcrédito para mulheres empreendedoras.\n- Passe livre para estudantes.',
        foto_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
      },
      {
        nome: 'Roberto Mendes',
        cargo: 'Candidato a Governador',
        descricao: '# Inovação e Gestão Pública Eficiente\n\n- Transparência total nas contas públicas.\n- Parcerias público-privadas para infraestrutura.\n- Digitalização dos serviços governamentais.',
        foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      }
    ];

    console.log('Verificando/Inserindo candidatos...');
    for (const c of candidatosIniciais) {
      const check = await pool.query('SELECT id FROM personagens WHERE nome ILIKE $1', [`%${c.nome.split(' ')[0]}%`]);
      if (check.rowCount === 0) {
        await pool.query(
          `INSERT INTO personagens (nome, cargo, descricao, foto_url) VALUES ($1, $2, $3, $4)`,
          [c.nome, c.cargo, c.descricao, c.foto_url]
        );
      }
    }

    // Buscar IDs dos candidatos
    const resPersonagens = await pool.query('SELECT id, nome FROM personagens');
    const todosPersonagens = resPersonagens.rows;

    const flavio = todosPersonagens.find(p => p.nome.toLowerCase().includes('flávio') || p.nome.toLowerCase().includes('flavio')) || todosPersonagens[0];
    const lula = todosPersonagens.find(p => p.nome.toLowerCase().includes('lula')) || todosPersonagens[1] || todosPersonagens[0];
    const renan = todosPersonagens.find(p => p.nome.toLowerCase().includes('renan')) || todosPersonagens[2] || todosPersonagens[0];

    const outros = todosPersonagens.filter(p => p.id !== flavio.id && p.id !== lula.id && p.id !== renan.id);
    const outrosIds = outros.length > 0 ? outros.map(p => p.id) : [flavio.id];

    console.log('Candidatos identificados no banco:');
    console.log(`- Flávio (Target: 39.000 votos - 39%): ID ${flavio.id} (${flavio.nome})`);
    console.log(`- Lula (Target: 33.000 votos - 33%): ID ${lula.id} (${lula.nome})`);
    console.log(`- Renan (Target: 19.000 votos - 19%): ID ${renan.id} (${renan.nome})`);
    console.log(`- Outros (Target: 9.000 votos - 9%): IDs [${outrosIds.join(', ')}]`);

    console.log('\nLimpando votos anteriores...');
    await pool.query('TRUNCATE TABLE votos RESTART IDENTITY');

    console.log('\nGerando 100.000 votos em lote de alta performance...');

    const TOTAL_VOTOS = 100000;
    const VOTOS_FLAVIO = 39000; // 39%
    const VOTOS_LULA = 33000;   // 33%
    const VOTOS_RENAN = 19000;  // 19%
    const VOTOS_OUTROS = TOTAL_VOTOS - VOTOS_FLAVIO - VOTOS_LULA - VOTOS_RENAN; // 9.000 (9%)

    // 1. Inserir 39.000 votos para Flávio
    console.log(`Inserindo ${VOTOS_FLAVIO.toLocaleString('pt-BR')} votos para Flávio...`);
    await pool.query(`
      INSERT INTO votos (personagem_id, nome_completo, telefone, created_at)
      SELECT 
        $1,
        'Eleitor ' || s,
        '(' || (11 + (s % 89)) || ') 9' || LPAD((s % 100000000)::text, 8, '0'),
        NOW() - (s || ' seconds')::interval
      FROM generate_series(1, $2) s
    `, [flavio.id, VOTOS_FLAVIO]);

    // 2. Inserir 33.000 votos para Lula
    console.log(`Inserindo ${VOTOS_LULA.toLocaleString('pt-BR')} votos para Lula...`);
    await pool.query(`
      INSERT INTO votos (personagem_id, nome_completo, telefone, created_at)
      SELECT 
        $1,
        'Eleitor ' || (s + 39000),
        '(' || (11 + ((s + 39000) % 89)) || ') 9' || LPAD(((s + 39000) % 100000000)::text, 8, '0'),
        NOW() - (s || ' seconds')::interval
      FROM generate_series(1, $2) s
    `, [lula.id, VOTOS_LULA]);

    // 3. Inserir 19.000 votos para Renan
    console.log(`Inserindo ${VOTOS_RENAN.toLocaleString('pt-BR')} votos para Renan...`);
    await pool.query(`
      INSERT INTO votos (personagem_id, nome_completo, telefone, created_at)
      SELECT 
        $1,
        'Eleitor ' || (s + 72000),
        '(' || (11 + ((s + 72000) % 89)) || ') 9' || LPAD(((s + 72000) % 100000000)::text, 8, '0'),
        NOW() - (s || ' seconds')::interval
      FROM generate_series(1, $2) s
    `, [renan.id, VOTOS_RENAN]);

    // 4. Inserir 9.000 votos para os demais candidatos
    console.log(`Inserindo ${VOTOS_OUTROS.toLocaleString('pt-BR')} votos distribuídos entre os demais candidatos...`);
    await pool.query(`
      INSERT INTO votos (personagem_id, nome_completo, telefone, created_at)
      SELECT 
        ($1::integer[])[FLOOR(RANDOM() * ARRAY_LENGTH($1::integer[], 1) + 1)],
        'Eleitor ' || (s + 91000),
        '(' || (11 + ((s + 91000) % 89)) || ') 9' || LPAD(((s + 91000) % 100000000)::text, 8, '0'),
        NOW() - (s || ' seconds')::interval
      FROM generate_series(1, $2) s
    `, [outrosIds, VOTOS_OUTROS]);

    // Resumo final
    const resultado = await pool.query(`
      SELECT 
        p.nome,
        COUNT(v.id)::INTEGER AS total_votos,
        ROUND((COUNT(v.id)::numeric / 100000.0) * 100, 2) || '%' AS percentual
      FROM personagens p
      LEFT JOIN votos v ON p.id = v.personagem_id
      GROUP BY p.id, p.nome
      ORDER BY total_votos DESC
    `);

    console.log('\n========================================');
    console.log('   RESULTADO FINAL DOS 100.000 VOTOS    ');
    console.log('========================================');
    console.table(resultado.rows);

  } catch (err) {
    console.error('Erro ao popular banco de dados:', err);
  } finally {
    await pool.end();
  }
}

main();
