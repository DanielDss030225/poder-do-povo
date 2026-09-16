const AUTH_TOKEN = 'authenticated_session_token_2026';

export function isAuthorized(request) {
  const cookieHeader = request.headers.get('cookie') || '';
  return cookieHeader.includes(`admin_auth=${AUTH_TOKEN}`);
}
