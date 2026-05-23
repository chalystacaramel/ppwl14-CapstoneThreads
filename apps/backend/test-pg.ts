import { Pool } from 'pg';
const p = new Pool({ 
  connectionString: 'postgresql://postgres:PPWL!12345@monorepo-db.cq56a8ueg13r.us-east-1.rds.amazonaws.com:5432/postgres',
  ssl: { rejectUnauthorized: false } 
});
const r = await p.query("SELECT datname FROM pg_database WHERE datistemplate = false");
console.log('Databases:', r.rows);
process.exit(0);