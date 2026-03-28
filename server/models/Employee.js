import db from '../config/database.js';

/** Map a raw users row to the camelCase shape expected by the frontend */
const normalize = (row) => {
  if (!row) return null;
  const parts = (row.name || '').split(' ');
  return {
    id: row.id,
    email: row.email,
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || '',
    role: row.role,
    isActive: row.status === 'active',
    status: row.status,
    lastLogin: row.updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const Employee = {
  // Get all users (without passwords)
  findAll: async () => {
    const [rows] = await db.query(
      `SELECT id, name, email, role, status, created_at, updated_at
       FROM users
       WHERE is_deleted = 0
       ORDER BY created_at DESC`,
    );
    return rows.map(normalize);
  },

  // Get single user by ID (without password)
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT id, name, email, role, status, created_at, updated_at
       FROM users WHERE id = ? AND is_deleted = 0`,
      [id],
    );
    return normalize(rows[0] || null);
  },

  // Update user name/role
  updateUser: async (id, data) => {
    const { firstName, lastName, role } = data;
    const fields = [];
    const values = [];

    if (firstName !== undefined || lastName !== undefined) {
      // Fetch current name to merge partial updates
      const [cur] = await db.query('SELECT name FROM users WHERE id = ?', [id]);
      const parts = (cur[0]?.name || '').split(' ');
      const newFirst = firstName !== undefined ? firstName : parts[0] || '';
      const newLast = lastName !== undefined ? lastName : parts.slice(1).join(' ');
      fields.push('name = ?');
      values.push(`${newFirst} ${newLast}`.trim());
    }
    if (role !== undefined) {
      fields.push('role = ?');
      values.push(role);
    }

    if (fields.length === 0) return false;

    values.push(id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return true;
  },

  // Enable / Disable a user
  updateStatus: async (id, isActive) => {
    const status = isActive ? 'active' : 'inactive';
    await db.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
  },

  // Count of active employees (for dashboard)
  getActiveCount: async () => {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE status = 'active' AND role = 'employee' AND is_deleted = 0",
    );
    return rows[0].count;
  },
};
