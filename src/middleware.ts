import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
debugger;
  // Lấy session từ cookie
  const {
    data: { session },
  } = await supabase.auth.getSession()
  console.log('supabase:',session);
  console.log('Middleware session:', session)
  console.log('Current path:', req.nextUrl.pathname)
  debugger;

  // Cho phép access static files và API routes
  if (req.nextUrl.pathname.startsWith('/_next') || 
      req.nextUrl.pathname.startsWith('/api')) {
    return res
  }

  // Nếu đã login mà vào trang login -> redirect to /web
  debugger;
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/web', req.url))
  }

  // Nếu chưa login và không phải trang login/callback -> redirect to login
  if (!session && 
      !req.nextUrl.pathname.startsWith('/login') && 
      !req.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}