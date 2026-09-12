import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/auth-helpers'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAdminAccess()
    const { id } = await params
    const supabase = await createClient()

    // assignment_criteria will cascade delete
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
