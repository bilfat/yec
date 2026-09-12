import { createClient } from '@supabase/supabase-js'
import { hashPin } from '../src/lib/security/pin'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vzcqovskvkeczrvpeqmx.supabase.co"
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Y3FvdnNrdmtlY3pydnBlcW14Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTIyMzMxOSwiZXhwIjoyMTA0Nzk5MzE5fQ.AfV2bbbIFWV6Sp3HfzZsCtFgnehIWTfExSYzc6PTQpg"

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  console.log('Adding pin_code column to teams table if not exists...')
  
  // Update existing teams to ensure they have a pin_code
  const { data: teams } = await supabase.from('teams').select('id, pin_code')

  if (teams) {
    for (const t of teams) {
      if (!t.pin_code) {
        const rawPin = Math.floor(100000 + Math.random() * 900000).toString()
        const pinHash = await hashPin(rawPin)
        console.log(`Updating team ${t.id} with pin_code: ${rawPin}...`)
        await supabase.from('teams').update({
          pin_code: rawPin,
          pin_hash: pinHash
        }).eq('id', t.id)
      }
    }
  }

  console.log('Schema check & update completed!')
}

run()
