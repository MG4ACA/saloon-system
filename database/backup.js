/**
 * DB Backup Script — run with: npm run backup
 * Dumps salon_pos database to backups/salon_pos_YYYY-MM-DD_HH-mm.sql
 * Requires mysqldump to be available in PATH (ships with MySQL).
 */
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backupsDir = path.join(__dirname, '..', 'backups');

// Ensure backups directory exists
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

const now = new Date();
const pad = (n) => String(n).padStart(2, '0');
const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
const filename  = `salon_pos_${timestamp}.sql`;
const filepath  = path.join(backupsDir, filename);

const host     = process.env.DB_HOST     || 'localhost';
const user     = process.env.DB_USER     || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME     || 'salon_pos';

const passArg = password ? `--password="${password}"` : '--no-defaults';

try {
  console.log(`📦 Starting backup of database: ${database}`);

  const cmd = `mysqldump -h ${host} -u ${user} ${password ? `--password="${password}"` : ''} ${database}`;

  const output = execSync(cmd, { encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 });
  fs.writeFileSync(filepath, output, 'utf-8');

  const sizeKb = (fs.statSync(filepath).size / 1024).toFixed(1);
  console.log(`✅ Backup saved: backups/${filename} (${sizeKb} KB)`);
  process.exit(0);
} catch (err) {
  console.error('❌ Backup failed:', err.message);
  console.error('   Make sure mysqldump is installed and in your PATH.');
  process.exit(1);
}
