import db from '../config/database.js';

export const Employee = {
  // Get all users (without passwords)
  findAll: async () => {
    const [rows] = await db.query(
      `SELECT id, email, firstName, lastName, role, isActive, lastLogin, createdAt, updatedAt
       FROM users
       ORDER BY createdAt DESC`,
    );
    return rows;
  },

  // Get single user by ID (without password)
  findById: async (id) => {
    const [rows] = await db.query(
      `SELECT id, email, firstName, lastName, role, isActive, lastLogin, createdAt, updatedAt
       FROM users WHERE id = ?`,
      [id],
    );
    return rows.length > 0 ? rows[0] : null;
  },

  // Update user name/role
  updateUser: async (id, data) => {
    const { firstName, lastName, role } = data;
    const fields = [];
    const values = [];

    if (firstName !== undefined) { fields.push('firstName = ?'); values.push(firstName); }
    if (lastName !== undefined)  { fields.push('lastName = ?');  values.push(lastName); }
    if (role !== undefined)      { fields.push('role = ?');      values.push(role); }

    if (fields.length === 0) return false;

    values.push(id);
    await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return true;
  },

  // Enable / Disable a user
  updateStatus: async (id, isActive) => {
    await db.query('UPDATE users SET isActive = ? WHERE id = ?', [isActive, id]);
  },

  // Count of active employees (for dashboard)
  getActiveCount: async () => {
    const [rows] = await db.query(
      "SELECT COUNT(*) as count FROM users WHERE isActive = TRUE AND role = 'employee'",
    );
    return rows[0].count;
  },
};
