// Using MySQL with Sequelize or raw queries
import db from '../config/database.js';

console.log('✅ Users table ensured');

/** Normalize a raw DB row to the shape expected by controllers */
const normalize = (row) => {
  if (!row) return null;
  const nameParts = (row.name || '').split(' ');
  return {
    id: row.id,
    email: row.email,
    password: row.password_hash, // map password_hash → password
    firstName: nameParts[0] || '',
    lastName: nameParts.slice(1).join(' ') || '',
    role: row.role,
    status: row.status,
    isActive: row.status === 'active',
    lastLogin: row.updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const User = {
  // Find user by email
  findByEmail: async (email) => {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ? AND is_deleted = 0 LIMIT 1',
      [email],
    );
    return normalize(rows[0] || null);
  },

  // Find user by ID
  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM users WHERE id = ? AND is_deleted = 0 LIMIT 1', [
      id,
    ]);
    return normalize(rows[0] || null);
  },

  // Create a new user
  create: async (userData) => {
    const { email, password, firstName, lastName, role = 'employee' } = userData;
    const name = `${firstName} ${lastName}`.trim();
    const [result] = await db.query(
      `INSERT INTO users (name, email, password_hash, role, status, is_deleted)
       VALUES (?, ?, ?, ?, 'active', 0)`,
      [name, email, password, role],
    );
    return result.insertId;
  },

  // Update last login
  updateLastLogin: async (id) => {
    await db.query('UPDATE users SET updated_at = NOW() WHERE id = ?', [id]);
  },
};
