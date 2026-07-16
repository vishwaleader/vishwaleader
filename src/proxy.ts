import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const sessionCookie = request.cookies.get('vl_admin_session');
    const isAdminAuthenticated = sessionCookie?.value === 'authenticated';
    const { pathname, hostname } = request.nextUrl;

    // Check if we are on the main production domain
    const isProductionDomain = hostname === 'vishwaleader.com' || hostname === 'www.vishwaleader.com';

    // 1. Coming Soon Logic:
    // (Removed to serve main page on production domain)

    // 2. Admin Authentication Logic:
    // If the user is trying to access an admin page and is not authenticated,
    // redirect them to the admin login page.
    if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !isAdminAuthenticated) {
        const loginUrl = new URL('/admin/login', request.url);
        loginUrl.searchParams.set('redirected', 'true');
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};