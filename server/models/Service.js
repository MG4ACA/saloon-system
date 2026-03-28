import pool from '../config/database.js';

const Service = {
  async findAll(filters = {}) {
    const params = [];
    let where = 's.is_deleted = 0';

    if (filters.categoryId) {
      where += ' AND s.category_id = ?';
      params.push(filters.categoryId);
    }
    if (filters.isActive !== undefined) {
      where += ' AND s.is_active = ?';
      params.push(filters.isActive ? 1 : 0);
    }

    const [rows] = await pool.query(
      `SELECT
         s.*,
         sc.name AS categoryName,
         cr.commission_percentage AS commissionPercentage,
         cr.commission_fixed AS commissionFixed,
         cr.apply_after_discount AS applyAfterDiscount,
         CASE
           WHEN cr.commission_percentage IS NOT NULL THEN 'percentage'
           WHEN cr.commission_fixed IS NOT NULL THEN 'fixed'
           ELSE NULL
         END AS commissionType,
         COALESCE(cr.commission_percentage, cr.commission_fixed) AS commissionValue
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       LEFT JOIN commission_rules cr ON cr.service_id = s.id AND cr.is_active = 1
       WHERE ${where}
       ORDER BY sc.name, s.name`,
      params
    );
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT
         s.*,
         sc.name AS categoryName,
         cr.commission_percentage AS commissionPercentage,
         cr.commission_fixed AS commissionFixed,
         cr.apply_after_discount AS applyAfterDiscount,
         CASE
           WHEN cr.commission_percentage IS NOT NULL THEN 'percentage'
           WHEN cr.commission_fixed IS NOT NULL THEN 'fixed'
           ELSE NULL
         END AS commissionType,
         COALESCE(cr.commission_percentage, cr.commission_fixed) AS commissionValue
       FROM services s
       LEFT JOIN service_categories sc ON s.category_id = sc.id
       LEFT JOIN commission_rules cr ON cr.service_id = s.id AND cr.is_active = 1
       WHERE s.id = ? AND s.is_deleted = 0`,
      [id]
    );
    return rows[0] || null;
  },

  async create({ name, categoryId, description, duration, basePrice, locationId }) {
    const [result] = await pool.query(
      `INSERT INTO services (name, category_id, description, duration, base_price, location_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, categoryId, description || null, duration, basePrice, locationId || null]
    );
    return result.insertId;
  },

  async update(id, { name, categoryId, description, duration, basePrice }) {
    await pool.query(
      `UPDATE services
       SET name = ?, category_id = ?, description = ?, duration = ?, base_price = ?
       WHERE id = ? AND is_deleted = 0`,
      [name, categoryId, description || null, duration, basePrice, id]
    );
  },

  async setActive(id, isActive) {
    await pool.query(
      'UPDATE services SET is_active = ? WHERE id = ? AND is_deleted = 0',
      [isActive ? 1 : 0, id]
    );
  },
};

export default Service;
