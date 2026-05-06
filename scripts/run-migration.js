// ============================================================
// FlowDay – Manual Migration Runner
// Jalankan migrasi SQL langsung ke Supabase
// ============================================================

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration(migrationFile) {
  console.log(`\n🔄 Running migration: ${migrationFile}`)
  
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`)
    return false
  }
  
  const sql = fs.readFileSync(migrationPath, 'utf8')
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })
    
    if (error) {
      // Fallback: try direct query if RPC not available
      console.log('⚠️  RPC method not available, trying direct query...')
      
      // Split SQL by semicolons and execute each statement
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'))
      
      for (const statement of statements) {
        const { error: queryError } = await supabase.rpc('exec', { 
          query: statement 
        })
        
        if (queryError) {
          console.error(`❌ Error executing statement:`, queryError)
          console.error(`Statement: ${statement.substring(0, 100)}...`)
          return false
        }
      }
    }
    
    console.log(`✅ Migration completed: ${migrationFile}`)
    return true
  } catch (err) {
    console.error(`❌ Error running migration:`, err.message)
    return false
  }
}

async function main() {
  const migrationFile = process.argv[2] || '012_add_practicum_to_subjects.sql'
  
  console.log('🚀 FlowDay Migration Runner')
  console.log(`📁 Migration file: ${migrationFile}`)
  
  const success = await runMigration(migrationFile)
  
  if (success) {
    console.log('\n✨ Migration completed successfully!')
  } else {
    console.log('\n❌ Migration failed. Please run manually via Supabase Dashboard.')
    console.log('📝 Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/editor')
    process.exit(1)
  }
}

main()
