import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess, getAdminClient } from '@/lib/auth-helpers'

export async function GET() {
  try {
    await checkAdminAccess()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('users')
      .select('id, name, username, role, active, created_at')
      .eq('role', 'JUDGE')
      .order('created_at', { ascending: false })


    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await checkAdminAccess()
    const body = await request.json()

    const rawUsername = (body.username || '').trim()
    const name = (body.name || '').trim()
    const password = body.password || ''

    if (!rawUsername || !password || !name) {
      return NextResponse.json({ error: { code: 'INVALID_INPUT', message: 'Nama, username, dan password wajib diisi.' } }, { status: 400 })
    }

    // Determine email & username
    const email = rawUsername.includes('@') ? rawUsername : `${rawUsername}@yec.id`
    const username = rawUsername.includes('@') ? rawUsername.split('@')[0] : rawUsername

    // We use the admin client to bypass RLS and interact with auth API
    const adminAuthClient = getAdminClient()

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await adminAuthClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })

    if (authError) {
      return NextResponse.json({ error: { code: 'AUTH_ERROR', message: authError.message } }, { status: 400 })
    }
    const userId = authData.user.id

    // 2. Insert metadata into public.users
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        name,
        username,
        role: 'JUDGE',
        active: true
      })
      .select()
      .single()

    if (error) {
      // Rollback auth user creation if metadata fails
      await adminAuthClient.auth.admin.deleteUser(userId)
      return NextResponse.json({ error: { code: 'DB_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message: error.message || 'Terjadi kesalahan server.' } }, { status: 500 })
  }
}
