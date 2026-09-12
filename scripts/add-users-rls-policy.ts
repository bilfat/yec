import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vzcqovskvkeczrvpeqmx.supabase.co"
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3FvdnNrdmtlY3pydnBlcW14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTIyMzMxOSwiZXhwIjoyMTA0Nzk5MzE5fQ.AfV2bbbIFWV6Sp3HfzZsCtFgnehIWTfExSYzc6PTQpg"

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
