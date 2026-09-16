import { NextResponse } from 'next/server';

const AUTH_TOKEN = 'authenticated_session_token_2026';

function validatePassword(inputPassword) {
  if (!inputPassword) return false;
  
  const targetPassword = 'Jks#030225';
  const cleanInput = inputPassword.trim();
  
  // 1. Direct match with target password
  if (cleanInput === targetPassword) return true;

  // 2. Check process.env.ADMIN_PASSWORD if set
  const envPassword = process.env.ADMIN_PASSWORD ? process.env.ADMIN_PASSWORD.trim() : '';
  if (envPassword) {
    // If env variable equals input
    if (cleanInput === envPassword) return true;
    // If env variable starts with input or contains target password
    if (envPassword.startsWith(targetPassword) || envPassword.startsWith(cleanInput)) return true;
  }

  return false;
}

// GET: Check authentication status
export async function GET(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const isAuthenticated = cookieHeader.includes(`admin_auth=${AUTH_TOKEN}`);
  return NextResponse.json({ authenticated: isAuthenticated });
}

// POST: Authenticate with password
export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (validatePassword(password)) {
      const response = NextResponse.json({ success: true, message: 'Autenticado com sucesso!' });
      
      // Set secure HTTP-only cookie
      response.cookies.set('admin_auth', AUTH_TOKEN, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 // 24 hours
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Senha incorreta. Acesso negado.' },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao processar autenticação.' },
      { status: 500 }
    );
  }
}

// DELETE: Logout
export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Sessão encerrada com sucesso.' });
  response.cookies.set('admin_auth', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0
  });
  return response;
}
