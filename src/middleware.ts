import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  // Tạm thời bỏ qua middleware để debug
  return NextResponse.next()
  try {
    // Get session
    const { data: { session } } = await supabase.auth.getSession()

    // Public paths that don't require authentication
    const publicPaths = ['/login', '/auth/callback']
    const isPublicPath = publicPaths.some(path => 
      req.nextUrl.pathname.startsWith(path)
    )

    // API and static paths
    const isApiOrStatic = req.nextUrl.pathname.startsWith('/_next') || 
                         req.nextUrl.pathname.startsWith('/api')

    if (isApiOrStatic) {
      return res
    }

    // Redirect rules
    if (!session && !isPublicPath) {
      // Not logged in, trying to access protected route
      return NextResponse.redirect(new URL('/login', req.url))
    }

    if (session && isPublicPath) {
      // Logged in, trying to access public route
      return NextResponse.redirect(new URL('/web', req.url))
    }

  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow request to continue
    return res
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}