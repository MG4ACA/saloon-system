import dotenv from 'dotenv';
import fs from 'fs';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  let connection;
  try {
    // Connect to MySQL without specifying a database (so CREATE DATABASE IF NOT EXISTS works)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true, // required for schema files with multiple statements
    });

    console.log('📡 Connected to MySQL');

    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Run the whole schema as multi-statement query
    await connection.query(schemaSql);

    // ── Post-migration fixes ──────────────────────────────────────────────────
    // Fix tasks.employee_id FK: ensure it references users(id), not employees(id).
    // CREATE TABLE IF NOT EXISTS does not ALTER existing tables, so we fix it here.
    try {
      const [fks] = await connection.query(`
        SELECT CONSTRAINT_NAME
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'tasks'
          AND COLUMN_NAME = 'employee_id'
          AND REFERENCED_TABLE_NAME = 'employees'
      `);
      for (const fk of fks) {
        await connection.query(`ALTER TABLE tasks DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
        await connection.query(`
          ALTER TABLE tasks
          ADD CONSTRAINT fk_tasks_employee_user
          FOREIGN KEY (employee_id) REFERENCES users(id)
        `);
        console.log('🔧 Fixed tasks.employee_id FK → users(id)');
      }
    } catch (fkErr) {
      // Ignore if already correct
    }
    // ─────────────────────────────────────────────────────────────────────────

    console.log('✨ Database migration completed successfully!');
    console.log('✅ All tables created / verified.');
    await connection.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (connection) await connection.end();
    process.exit(1);
  }
};

runMigrations();

