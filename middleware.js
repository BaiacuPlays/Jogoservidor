import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  
  // Se alguém tentar acessar /api/serve-html, redireciona para /index.html
  if (url.pathname === '/api/serve-html') {
    url.pathname = '/index.html';
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/serve-html',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
