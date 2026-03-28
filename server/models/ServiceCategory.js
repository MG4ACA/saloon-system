import pool from '../config/database.js';

const ServiceCategory = {
  async findAll() {
    const [rows] = await pool.query(
      `SELECT sc.*, COUNT(s.id) AS serviceCount
       FROM service_categories sc
       LEFT JOIN services s ON s.category_id = sc.id AND s.is_deleted = 0
       WHERE sc.is_deleted = 0
       GROUP BY sc.id
       ORDER BY sc.name`
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM service_categories WHERE id = ? AND is_deleted = 0',
      [id]
    );
    return rows[0] || null;
  },

  async findByName(name, excludeId = null) {
    let sql = 'SELECT id FROM service_categories WHERE LOWER(name) = LOWER(?) AND is_deleted = 0';
    const params = [name];
    if (excludeId) { sql += ' AND id != ?'; params.push(excludeId); }
    const [rows] = await pool.query(sql, params);
    return rows[0] || null;
  },

  async create({ name, description, locationId }) {
    const [result] = await pool.query(
      'INSERT INTO service_categories (name, description, location_id) VALUES (?, ?, ?)',
      [name, description || null, locationId || null]
    );
    return this.findById(result.insertId);
  },

  async update(id, { name, description }) {
    await pool.query(
      'UPDATE service_categories SET name = ?, description = ? WHERE id = ? AND is_deleted = 0',
      [name, description || null, id]
    );
    return this.findById(id);
  },

  async setActive(id, isActive) {
    await pool.query(
      'UPDATE service_categories SET is_deleted = ? WHERE id = ?',
      [isActive ? 0 : 1, id]
    );
  },
};

export default ServiceCategory;
