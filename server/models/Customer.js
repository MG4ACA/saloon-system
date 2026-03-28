import pool from '../config/database.js';

const Customer = {
  async findByPhone(phone) {
    const [rows] = await pool.query(
      'SELECT * FROM customers WHERE phone = ? AND is_deleted = 0 LIMIT 1',
      [phone]
    );
    return rows[0] || null;
  },

  async findAll(search = '') {
    const [rows] = await pool.query(
      `SELECT id, name, phone, email, visit_count AS visitCount, total_spent AS totalSpent
       FROM customers
       WHERE is_deleted = 0
         AND (phone LIKE ? OR name LIKE ?)
       ORDER BY name
       LIMIT 20`,
      [`%${search}%`, `%${search}%`]
    );
    return rows;
  },

  // Find customer by phone — if not found, create one
  async createOrFind(phone, name) {
    const existing = await this.findByPhone(phone);
    if (existing) return existing;

    const [result] = await pool.query(
      'INSERT INTO customers (phone, name) VALUES (?, ?)',
      [phone, name || 'Walk-in Customer']
    );
    return this.findByPhone(phone);
  },

  async create({ phone, name, email }) {
    const [result] = await pool.query(
      'INSERT INTO customers (phone, name, email) VALUES (?, ?, ?)',
      [phone, name, email || null]
    );
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    return rows[0];
  },
};

export default Customer;
