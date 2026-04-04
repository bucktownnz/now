import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const PROTECTED = ['/dashboard', '/manage', '/api/quotes']

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p))
  const isLoginPage = pathname === '/login'

  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon|.*\\.(?:png|ico|svg|webmanifest)).*)',
  ],
}
