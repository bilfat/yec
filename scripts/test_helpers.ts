import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
let supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  try {
    const envFile = fs.readFileSync('.env.local', 'utf-8')
    envFile.split('\n').forEach(line => {
      const [k, v] = line.split('=')
      if (k?.trim() === 'NEXT_PUBLIC_SUPABASE_URL') supabaseUrl = v?.trim().replace(/^["']|["']$/g, '') || ''
      if (k?.trim() === 'SUPABASE_SERVICE_ROLE_KEY') supabaseKey = v?.trim().replace(/^["']|["']$/g, '') || ''
    })
  } catch (e) {}
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data: settings } = await supabase.from('competition_settings').select('*').limit(1).maybeSingle()
  console.log('settings:', settings)
  
  const content = settings?.announcement_content || ''
  if (content.includes('__SUBTHEME_DESC__')) {
    const jsonStr = content.split('__SUBTHEME_DESC__')[1]
    console.log('JSON STR:', jsonStr)
    console.log('Parsed:', JSON.parse(jsonStr))
  } else {
    console.log('No __SUBTHEME_DESC__ found in content:', content)
  }
}

run()
