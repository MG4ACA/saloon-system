// Run this from the project root: node fix_tasks_fk.js
import pool from './server/config/database.js';

try {
  // Check current FK constraint name
  const [cols] = await pool.query(`
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = 'salon_pos'
      AND TABLE_NAME = 'tasks'
      AND COLUMN_NAME = 'employee_id'
      AND REFERENCED_TABLE_NAME IS NOT NULL
  `);

  console.log('Existing FKs on employee_id:', cols);

  for (const c of cols) {
    const fkName = c.CONSTRAINT_NAME;
    const refTable = c.REFERENCED_TABLE_NAME || '(unknown)';
    console.log(`Dropping FK: ${fkName} (was → ${refTable})`);
    await pool.query(`ALTER TABLE tasks DROP FOREIGN KEY \`${fkName}\``);
  }

  // Re-add FK to users(id)
  await pool.query(`
    ALTER TABLE tasks
    ADD CONSTRAINT fk_tasks_employee_user
    FOREIGN KEY (employee_id) REFERENCES users(id)
  `);
  console.log('✅ FK fixed: tasks.employee_id → users(id)');
} catch (e) {
  console.error('Error:', e.message);
}

await pool.end();
process.exit(0);
