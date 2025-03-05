import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Kiểm tra xem có phải là service worker hoặc các tài nguyên tĩnh không
  return NextResponse.next()
  if (
    req.nextUrl.pathname.startsWith('/_next') || 
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/static') ||
    req.nextUrl.pathname === '/favicon.ico' ||
    req.nextUrl.pathname === '/sw.js' ||
    req.nextUrl.pathname.includes('workbox-') ||
    req.nextUrl.pathname.includes('.js.map')
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  try {
    // Get session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Log cookies để debug
    console.log('Cookies:', req.cookies.toString());
    console.log('Session:', session ? 'exists' : 'not found');

    // Public paths that don't require authentication
    const publicPaths = ['/login', '/auth/callback']
    const isPublicPath = publicPaths.some(path => 
      req.nextUrl.pathname === path || req.nextUrl.pathname.startsWith(path)
    )

    // Thêm debug log
    console.log('Path:', req.nextUrl.pathname);
    console.log('Is public path:', isPublicPath);

    // Redirect rules
    if (!session && !isPublicPath) {
      // Not logged in, trying to access protected route
      console.log('Redirecting to login');
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (session && isPublicPath && req.nextUrl.pathname === '/login') {
      // Logged in, trying to access login page
      console.log('Redirecting to dashboard');
      return NextResponse.redirect(new URL('/web', req.url))
    }

    // Nếu đã đăng nhập và truy cập root path
    if (session && req.nextUrl.pathname === '/') {
      console.log('Redirecting from root to dashboard');
      return NextResponse.redirect(new URL('/web', req.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow request to continue
    return res
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}