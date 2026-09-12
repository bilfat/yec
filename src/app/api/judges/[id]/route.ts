import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess, getAdminClient } from '@/lib/auth-helpers'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAdminAccess()
    const { id } = await params
    const body = await request.json()
    const supabase = await createClient()

    // Update metadata
    if (body.name || body.active !== undefined) {
      const updates: any = {}
      if (body.name) updates.name = body.name
      if (body.active !== undefined) updates.active = body.active

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        
      if (error) throw error
    }

    // Update password if provided
    if (body.password) {
      const adminAuthClient = getAdminClient()
      const { error: authError } = await adminAuthClient.auth.admin.updateUserById(id, {
        password: body.password
      })
      if (authError) throw authError
    }

    const { data: updatedJudge } = await supabase.from('users').select('*').eq('id', id).single()
    return NextResponse.json({ success: true, data: updatedJudge })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message: error.message || 'Terjadi kesalahan server.' } }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAdminAccess()
    const { id } = await params
    const adminAuthClient = getAdminClient()

    // Delete from Supabase Auth (this will cascade to public.users because of ON DELETE CASCADE in SQL)
    const { error } = await adminAuthClient.auth.admin.deleteUser(id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    return NextResponse.json({ error: { code: 'SERVER_ERROR', message: error.message || 'Terjadi kesalahan server.' } }, { status: 500 })
  }
}
