import { NextResponse } from 'next/server';
import { query, initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    
    // Fetch characters along with total vote count
    const result = await query(`
      SELECT 
        p.id, 
        p.nome, 
        p.cargo, 
        p.descricao, 
        p.foto_url, 
        p.created_at,
        COUNT(v.id)::INTEGER AS total_votos
      FROM personagens p
      LEFT JOIN votos v ON p.id = v.personagem_id
      GROUP BY p.id
      ORDER BY total_votos DESC, p.created_at DESC
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('API Personagens GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();
    const body = await request.json();
    const { nome, cargo, descricao, foto_url } = body;

    if (!nome || !cargo || !descricao) {
      return NextResponse.json(
        { success: false, error: 'Campos nome, cargo e descrição são obrigatórios.' },
        { status: 400 }
      );
    }

    const defaultFoto = foto_url && foto_url.trim() !== '' 
      ? foto_url 
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';

    const result = await query(
      `INSERT INTO personagens (nome, cargo, descricao, foto_url) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [nome.trim(), cargo.trim(), descricao.trim(), defaultFoto.trim()]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('API Personagens POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, nome, cargo, descricao, foto_url } = body;

    if (!id || !nome || !cargo || !descricao) {
      return NextResponse.json(
        { success: false, error: 'ID, nome, cargo e descrição são obrigatórios.' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE personagens 
       SET nome = $1, cargo = $2, descricao = $3, foto_url = $4 
       WHERE id = $5 
       RETURNING *`,
      [nome.trim(), cargo.trim(), descricao.trim(), foto_url ? foto_url.trim() : '', id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Personagem não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('API Personagens PUT error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID não informado.' }, { status: 400 });
    }

    const result = await query(`DELETE FROM personagens WHERE id = $1 RETURNING *`, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Personagem não encontrado.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Personagem excluído com sucesso.' });
  } catch (error) {
    console.error('API Personagens DELETE error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
