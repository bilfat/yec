import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // 1. Initialize Supabase Auth (for Admin & Judge)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { nextUrl } = request
  
  // Custom fetch to get the role from our public.users table if logged in
  let role: string | null = null
  if (user) {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (serviceKey) {
      const adminDb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
      const { data: userData } = await adminDb
        .from('users')
        .select('role')
        .eq('id', user.id)
        .maybeSingle()

      if (userData) {
        role = userData.role
      }
    }
  }

  const isLoggedIn = !!user

  // 2. Handle Participant Portal custom session (Cookie based)
  const isPortalRoute = nextUrl.pathname.startsWith('/portal')
  if (isPortalRoute) {
    const hasParticipantSession = request.cookies.has('yec_participant_session')
    if (!hasParticipantSession && nextUrl.pathname !== '/portal/login') {
      // Allow them to visit the portal login page, or protect sub-routes if they exist
    }
  }

  // 3. Admin Routes Protection
  const isAdminRoute = nextUrl.pathname.startsWith('/admin')
  if (isAdminRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  // 4. Judge Routes Protection
  const isJuriRoute = nextUrl.pathname.startsWith('/juri')
  if (isJuriRoute) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/login', nextUrl))
    }
    if (role !== 'JUDGE' && role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl))
    }
  }

  // 5. Redirect away from login if already logged in
  const isLoginPage = nextUrl.pathname === '/login'
  if (isLoggedIn && isLoginPage) {
    if (role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', nextUrl))
    } else if (role === 'JUDGE') {
      return NextResponse.redirect(new URL('/juri/dashboard', nextUrl))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images, svg, etc
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
