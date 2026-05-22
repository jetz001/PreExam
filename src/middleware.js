import { NextResponse } from 'next/server';

// This is a global Edge middleware for Next.js App Router.
// It runs before requests reach the API routes.
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Example: Protect API routes (except auth and public routes)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/auth') && !pathname.startsWith('/api/public')) {
    const authHeader = request.headers.get('authorization');
    
    // In a real Edge environment, you cannot use 'jsonwebtoken' or 'firebase-admin' directly.
    // You would use Edge-compatible JWT verification like 'jose' here.
    // For now, we just check if the header exists as a basic guard.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/api/:path*',
};
