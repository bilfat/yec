import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username dan password wajib diisi.' }, { status: 400 })
    }

    const cookieStore = await cookies()
    let response = NextResponse.json({ success: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Determine email format
    const cleanUsername = username.trim()
    const primaryEmail = cleanUsername.includes('@') ? cleanUsername : `${cleanUsername}@yec.id`

    // Attempt 1: Try primary email
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: primaryEmail,
      password,
    })

    // Attempt 2: Fallback for custom emails if username was entered without '@'
    if (authError && !cleanUsername.includes('@')) {
      const fallbackEmail = 'yec2026@gmail.com'
      const fallbackRes = await supabase.auth.signInWithPassword({
        email: fallbackEmail,
        password,
      })
      if (!fallbackRes.error && fallbackRes.data.user) {
        authData = fallbackRes.data
        authError = null
      }
    }

    if (authError || !authData?.user) {
      return NextResponse.json({ success: false, error: 'Username atau password salah.' }, { status: 401 })
    }

    // Fetch user role from public.users table using service role client to bypass RLS
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    let role = 'ADMIN' // Default fallback if admin user

    if (serviceKey) {
      const adminClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        serviceKey,
        {
          cookies: {
            getAll() { return [] },
            setAll() {}
          }
        }
      )
      const { data: userData } = await adminClient
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .maybeSingle()

      if (userData?.role) {
        role = userData.role
      }
    }

    const redirectUrl = role === 'JUDGE' ? '/juri/dashboard' : '/admin/dashboard'

    return NextResponse.json({
      success: true,
      data: {
        userId: authData.user.id,
        role,
        redirectUrl
      }
    }, {
      headers: response.headers
    })

  } catch (error: any) {
    console.error('Login API error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server.' }, { status: 500 })
  }
}
