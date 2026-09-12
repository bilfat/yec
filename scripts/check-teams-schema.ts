import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vzcqovskvkeczrvpeqmx.supabase.co"
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3FvdnNrdmtlY3pydnBlcW14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTIyMzMxOSwiZXhwIjoyMTA0Nzk5MzE5fQ.AfV2bbbIFWV6Sp3HfzZsCtFgnehIWTfExSYzc6PTQpg"

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  console.log('Checking teams table and updating existing teams with plaintext PINs if needed...')
  
  const { data: teams, error } = await supabase.from('teams').select('*')
  console.log('Existing teams:', teams, 'Error:', error)
}

run()
