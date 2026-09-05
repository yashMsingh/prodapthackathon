import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/auth/callback'];
const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === 'true';
// The mock token we mint in lib/auth.ts createMockSession()
const MOCK_TOKEN_PREFIX = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public routes and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get('inboxai_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Mock mode: our synthetic token is always valid — skip real JWT check
  if (IS_MOCK && token.startsWith(MOCK_TOKEN_PREFIX)) {
    return NextResponse.next();
  }

  // Production: decode and check JWT expiry
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString()
    ) as { exp?: number };

    if (payload.exp && payload.exp * 1000 < Date.now()) {
      const res = NextResponse.redirect(new URL('/login', req.url));
      res.cookies.delete('inboxai_token');
      return res;
    }
  } catch {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
