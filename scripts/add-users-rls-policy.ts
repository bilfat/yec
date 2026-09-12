import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Environment variables NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  console.log('Adding RLS select policy for public.users...')
  const query = `
    DO $$ 
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Enable read access for authenticated users'
      ) THEN
        CREATE POLICY "Enable read access for authenticated users" ON public.users FOR SELECT USING (true);
      END IF;
    END $$;
  `
  
  // Test reading users table with service role client to make sure data exists
  const { data, error } = await supabase.from('users').select('*')
  console.log('Current Users in DB:', data, 'Error:', error)
}

run()
