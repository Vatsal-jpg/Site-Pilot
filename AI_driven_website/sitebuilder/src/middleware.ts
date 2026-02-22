import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token')?.value;

    const path = request.nextUrl.pathname;

    // Landing page and public routes — always allow through, no redirects
    if (path === '/' || path === '/login' || path === '/signup') {
        return NextResponse.next();
    }

    const isProtectedRoute =
        path.startsWith('/dashboard') ||
        path.startsWith('/onboarding') ||
        path.startsWith('/editor') ||
        path.startsWith('/styleguide');

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
