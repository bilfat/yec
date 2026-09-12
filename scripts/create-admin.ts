import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_PASSWORD

if (!supabaseUrl || !serviceRoleKey || !initialPassword) {
  throw new Error('Environment variables NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and ADMIN_INITIAL_PASSWORD are required.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  const emails = ['yec2026@gmail.com', 'acarayec@yec.id']
  const password = initialPassword
  const name = 'Admin YEC 2026'

  for (const email of emails) {
    console.log(`Processing admin creation for email: ${email}...`)
    
    const { data: listData } = await supabase.auth.admin.listUsers()
    let existingUser = listData.users.find(u => u.email === email)
    let userId: string

    if (!existingUser) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name }
      })
      if (authError) {
        console.error(`Failed to create Auth User (${email}):`, authError)
        continue
      }
      userId = authData.user.id
      console.log(`Created Auth User (${email}) ID:`, userId)
    } else {
      userId = existingUser.id
      console.log(`Existing Auth User (${email}) ID:`, userId)
      await supabase.auth.admin.updateUserById(userId, { password })
    }

    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        name,
        username: email.split('@')[0],
        role: 'ADMIN',
        active: true
      })
      .select()

    if (error) {
      console.error('Error inserting into public.users:', error)
    } else {
      console.log(`SUCCESS! Admin account (${email}) ready:`, data)
    }
  }

  // Also ensure username 'acarayec' is in public.users mapped to the first account
  const { data: mainUser } = await supabase.from('users').select('id').eq('username', 'acarayec').maybeSingle()
  if (!mainUser) {
    const { data: listData } = await supabase.auth.admin.listUsers()
    const found = listData.users.find(u => u.email === 'yec2026@gmail.com')
    if (found) {
      await supabase.from('users').upsert({
        id: found.id,
        name,
        username: 'acarayec',
        role: 'ADMIN',
        active: true
      })
    }
  }
}

run()
