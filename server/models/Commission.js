import pool from '../config/database.js';

const Commission = {
  /**
   * Calculate commission for a task.
   * Returns { commissionType, commissionValue, commissionAmount, discountAmount, effectivePrice, applyAfterDiscount }
   * If no commission rule exists: commissionAmount = 0.
   */
  async calculate(task) {
    // Load commission rule for this service
    const [rules] = await pool.query(
      `SELECT commission_percentage, commission_fixed, apply_after_discount
       FROM commission_rules
       WHERE service_id = ? AND is_active = 1
       LIMIT 1`,
      [task.service_id]
    );

    const price = Number(task.price) || 0;

    // Calculate discount amount
    let discountAmount = 0;
    if (task.discount_type === 'percentage' && task.discount_value) {
      discountAmount = price * (Number(task.discount_value) / 100);
    } else if (task.discount_type === 'fixed' && task.discount_value) {
      discountAmount = Number(task.discount_value);
    }
    const effectivePrice = Math.max(0, price - discountAmount);

    // No rule → LKR 0
    if (!rules.length) {
      return { commissionType: null, commissionValue: 0, commissionAmount: 0, discountAmount, effectivePrice, applyAfterDiscount: 1 };
    }

    const rule = rules[0];
    const applyAfterDiscount = !!rule.apply_after_discount;
    const base = applyAfterDiscount ? effectivePrice : price;

    let commissionType = null;
    let commissionValue = 0;
    let commissionAmount = 0;

    if (rule.commission_percentage != null) {
      commissionType = 'percentage';
      commissionValue = Number(rule.commission_percentage);
      commissionAmount = base * (commissionValue / 100);
    } else if (rule.commission_fixed != null) {
      commissionType = 'fixed';
      commissionValue = Number(rule.commission_fixed);
      commissionAmount = commissionValue;
    }

    return {
      commissionType,
      commissionValue,
      commissionAmount: Math.max(0, commissionAmount),
      discountAmount,
      effectivePrice,
      applyAfterDiscount: applyAfterDiscount ? 1 : 0,
    };
  },

  /**
   * Insert or update commission record for a task (idempotent).
   */
  async upsert(task, calc) {
    await pool.query(
      `INSERT INTO commissions
         (task_id, employee_id, service_id, task_price, discount_amount, effective_price,
          commission_type, commission_value, commission_amount, apply_after_discount)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         task_price         = VALUES(task_price),
         discount_amount    = VALUES(discount_amount),
         effective_price    = VALUES(effective_price),
         commission_type    = VALUES(commission_type),
         commission_value   = VALUES(commission_value),
         commission_amount  = VALUES(commission_amount),
         apply_after_discount = VALUES(apply_after_discount),
         updated_at         = NOW()`,
      [
        task.id,
        task.employee_id,
        task.service_id,
        task.price,
        calc.discountAmount,
        calc.effectivePrice,
        calc.commissionType,
        calc.commissionValue,
        calc.commissionAmount,
        calc.applyAfterDiscount,
      ]
    );
  },

  /**
   * Get monthly summary for an employee (total + per-service breakdown).
   */
  async getMonthly(employeeId, year, month) {
    const [rows] = await pool.query(
      `SELECT
         s.name AS serviceName,
         COUNT(c.id) AS taskCount,
         c.commission_type AS commissionType,
         c.commission_value AS commissionValue,
         SUM(c.commission_amount) AS totalEarned
       FROM commissions c
       JOIN services s ON s.id = c.service_id
       WHERE c.employee_id = ?
         AND YEAR(c.created_at) = ?
         AND MONTH(c.created_at) = ?
       GROUP BY c.service_id, c.commission_type, c.commission_value, s.name
       ORDER BY totalEarned DESC`,
      [employeeId, year, month]
    );
    return rows;
  },

  /**
   * Get monthly total summary (one-liner card).
   */
  async getMonthlySummary(employeeId, year, month) {
    const [rows] = await pool.query(
      `SELECT
         COUNT(*)                  AS taskCount,
         COALESCE(SUM(commission_amount), 0) AS totalEarned
       FROM commissions
       WHERE employee_id = ?
         AND YEAR(created_at) = ?
         AND MONTH(created_at) = ?`,
      [employeeId, year, month]
    );
    return rows[0];
  },
};

export default Commission;
