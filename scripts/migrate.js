import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const { Client } = pg

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const projectRef = 'kcgkvitrlshifybpqges'
const dbPassword = 'Kakapro453@'
const poolerHost = 'aws-0-ap-southeast-2.pooler.supabase.com'

async function run() {
  console.log('Connecting to Supabase database (Sydney pooler)...')

  // Port 5432 is Session pooler (ideal for DDL / migrations)
  // Port 6543 is Transaction pooler
  let client = new Client({
    host: poolerHost,
    port: 5432,
    user: `postgres.${projectRef}`,
    password: dbPassword,
    database: 'postgres',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  })

  try {
    await client.connect()
    console.log('Connected to Session Pooler (port 5432)!')
  } catch (err) {
    console.log(`Port 5432 failed (${err.message}), trying Transaction Pooler (port 6543)...`)
    client = new Client({
      host: poolerHost,
      port: 6543,
      user: `postgres.${projectRef}`,
      password: dbPassword,
      database: 'postgres',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    })
    await client.connect()
    console.log('Connected to Transaction Pooler (port 6543)!')
  }

  const migrationsDir = path.resolve(__dirname, '../supabase/migrations')
  const migrationFiles = [
    '20261006000001_phase3_personality_reports.sql',
    '20261006000002_phase4_learning_tutors_booking.sql',
    '20261006000003_phase5_payment_reviews_progress.sql'
  ]

  for (const filename of migrationFiles) {
    const filePath = path.join(migrationsDir, filename)
    console.log(`\n========================================`)
    console.log(`Applying migration: ${filename}`)
    console.log(`========================================`)
    const sql = fs.readFileSync(filePath, 'utf8')
    await client.query(sql)
    console.log(`-> Successfully executed ${filename}`)
  }

  console.log('\n========================================')
  console.log('Verifying created tables in public schema:')
  console.log('========================================')
  const resTables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `)
  for (const row of resTables.rows) {
    console.log(` [TABLE] public.${row.table_name}`)
  }

  console.log('\n========================================')
  console.log('Verifying functions created:')
  console.log('========================================')
  const resFuncs = await client.query(`
    SELECT routine_name 
    FROM information_schema.routines 
    WHERE routine_schema = 'public' 
    ORDER BY routine_name;
  `)
  for (const row of resFuncs.rows) {
    console.log(` [FUNCTION] public.${row.routine_name}()`)
  }

  console.log('\n========================================')
  console.log('Verifying Row Level Security status:')
  console.log('========================================')
  const resRls = await client.query(`
    SELECT tablename, rowsecurity 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    ORDER BY tablename;
  `)
  for (const row of resRls.rows) {
    console.log(` [RLS] ${row.tablename}: ${row.rowsecurity ? 'ENABLED' : 'DISABLED'}`)
  }

  await client.end()
  console.log('\nAll migrations completed successfully!')
}

run().catch((err) => {
  console.error('\nMigration failed with error:', err)
  process.exit(1)
})
