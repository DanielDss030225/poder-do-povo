import { NextResponse } from 'next/server';
import { query, initDb } from '@/lib/db';

export async function GET() {
  try {
    await initDb();
    
    // Retrieve all votes with candidate details
    const result = await query(`
      SELECT 
        v.id,
        v.nome_completo,
        v.telefone,
        v.created_at,
        p.id AS personagem_id,
        p.nome AS personagem_nome,
        p.cargo AS personagem_cargo
      FROM votos v
      JOIN personagens p ON v.personagem_id = p.id
      ORDER BY v.created_at DESC
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('API Votos GET error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await initDb();
    const body = await request.json();
    const { personagem_id, nome_completo, telefone } = body;

    if (!personagem_id || !nome_completo || !telefone) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios: Personagem, Nome completo e Telefone.' },
        { status: 400 }
      );
    }

    // Clean phone number for validation (keep digits)
    const cleanPhone = telefone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Por favor, informe um número de telefone com DDD válido (mínimo 10 dígitos).' },
        { status: 400 }
      );
    }

    // Check if character exists
    const charCheck = await query(`SELECT id, nome FROM personagens WHERE id = $1`, [personagem_id]);
    if (charCheck.rowCount === 0) {
      return NextResponse.json({ success: false, error: 'Personagem não encontrado.' }, { status: 404 });
    }

    // Check if this phone has already voted for this specific candidate
    const existingVote = await query(
      `SELECT id FROM votos WHERE personagem_id = $1 AND REPLACE(REGEXP_REPLACE(telefone, '\\D', '', 'g'), '', '') = $2`,
      [personagem_id, cleanPhone]
    );

    if (existingVote.rowCount > 0) {
      return NextResponse.json(
        { success: false, error: `Este número de telefone (${telefone}) já registrou um voto para ${charCheck.rows[0].nome}.` },
        { status: 400 }
      );
    }

    // Register vote
    const result = await query(
      `INSERT INTO votos (personagem_id, nome_completo, telefone)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [personagem_id, nome_completo.trim(), telefone.trim()]
    );

    return NextResponse.json({
      success: true,
      message: `Voto computado com sucesso para ${charCheck.rows[0].nome}!`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('API Votos POST error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
