import pool from '../config/database.js';

const CommissionRule = {
  async findByServiceId(serviceId) {
    const [rows] = await pool.query(
      'SELECT * FROM commission_rules WHERE service_id = ? AND is_active = 1 LIMIT 1',
      [serviceId]
    );
    return rows[0] || null;
  },

  // Insert or update (1 rule per service)
  async upsertForService(serviceId, { commissionType, commissionValue, applyAfterDiscount }) {
    const existing = await this.findByServiceId(serviceId);
    if (existing) {
      await pool.query(
        `UPDATE commission_rules
         SET commission_percentage = ?, commission_fixed = ?, apply_after_discount = ?
         WHERE service_id = ?`,
        [
          commissionType === 'percentage' ? commissionValue : null,
          commissionType === 'fixed' ? commissionValue : null,
          applyAfterDiscount ? 1 : 0,
          serviceId,
        ]
      );
      return this.findByServiceId(serviceId);
    } else {
      const [result] = await pool.query(
        `INSERT INTO commission_rules
         (service_id, commission_percentage, commission_fixed, apply_after_discount)
         VALUES (?, ?, ?, ?)`,
        [
          serviceId,
          commissionType === 'percentage' ? commissionValue : null,
          commissionType === 'fixed' ? commissionValue : null,
          applyAfterDiscount ? 1 : 0,
        ]
      );
      return this.findByServiceId(serviceId);
    }
  },
};

export default CommissionRule;
