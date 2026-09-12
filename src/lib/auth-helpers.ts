import { createClient, createAdminClient } from '@/lib/supabase/server'
import { verifyParticipantSession } from '@/lib/security/pin'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function getUserRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const adminDb = createAdminClient()
  const { data: userData } = await adminDb
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  return userData?.role || null
}

export async function checkAdminAccess() {
  const role = await getUserRole()
  if (role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }
}

export async function checkJudgeOrAdminAccess() {
  const role = await getUserRole()
  if (role !== 'ADMIN' && role !== 'JUDGE') {
    throw new Error('Unauthorized')
  }
  return role
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const adminDb = createAdminClient()
  const { data: userData } = await adminDb
    .from('users')
    .select('id, name, username, role, active')
    .eq('id', user.id)
    .maybeSingle()

  return userData || null
}


export async function getParticipantSession(): Promise<{ teamId: string; teamName: string } | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('yec_participant_session')?.value
  
  if (!sessionCookie) return null

  const payload = await verifyParticipantSession(sessionCookie)
  if (!payload || typeof payload.teamId !== 'string') return null

  return {
    teamId: payload.teamId as string,
    teamName: (payload.teamName as string) || ''
  }
}


// Admin client using service_role key to bypass RLS (used for creating Judge accounts in Auth schema)
export function getAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
