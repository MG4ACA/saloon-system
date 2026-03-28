import dotenv from 'dotenv';
import fs from 'fs';
import mysql from 'mysql2/promise';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runMigrations = async () => {
  try {
    // Connect to MySQL without database first
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    });

    console.log('📡 Connected to MySQL');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf-8');

    // Split SQL statements
    const statements = schemaSql
      .split(';')
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    for (const statement of statements) {
      try {
        await connection.execute(statement);
        console.log('✅ Executed:', statement.substring(0, 50) + '...');
      } catch (err) {
        if (err.code !== 'ER_DUP_ENTRY' && err.code !== 'ER_TABLE_EXISTS_ERROR') {
          console.error('❌ Error:', err.message);
          throw err;
        }
      }
    }

    console.log('✨ Database migration completed successfully!');
    await connection.end();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigrations();
